# 📄 DOCUMENTO 6/11: SPARK_05_MAPAS.md

**Tamaño:** 17.5 KB | **Líneas:** 774
**Posición:** 6 de 11

⏩ **DOCUMENTO INTERMEDIO** - Continúa leyendo...

---

# 🗺️ Sistema de Mapas - Canvas Interactivo

**Módulo 5/8** - Canvas API, zonas, marcadores y navegación  
**Líneas en index.html:** 18155-30332

---

## 📋 CONTENIDO

1. [Vista General](#vista-general)
2. [MapController](#mapcontroller)
3. [Carga de Mapas](#carga-de-mapas)
4. [Zoom y Pan](#zoom-y-pan)
5. [Zonas Poligonales](#zonas-poligonales)
6. [Marcadores](#marcadores)
7. [Hit Detection](#hit-detection)

---

## 🎯 VISTA GENERAL

### Arquitectura de Mapas

```
SISTEMA DE MAPAS
├── Canvas Principal
│   ├── Capa 1: Imagen de fondo (plano)
│   ├── Capa 2: Zonas poligonales (transparentes)
│   ├── Capa 3: Marcadores de repuestos (pins)
│   └── Capa 4: Overlays temporales (highlight)
│
├── Controles
│   ├── Zoom In / Zoom Out
│   ├── Fit View (ajustar)
│   ├── Reset View
│   └── Pan con arrastre del mouse
│
└── Datos
    ├── mapas.json (2 mapas)
    ├── zonas.json (30 zonas)
    └── repuestos.ubicacionesMapa[] (coordenadas)
```

### HTML Base

```html
<!-- Línea 15600 en index.html -->
<div id="mapasContent" class="tab-content">
  <!-- Selector de mapas -->
  <div class="map-header">
    <select id="mapSelector" onchange="mapController.loadMap(this.value)">
      <option value="">Seleccionar mapa...</option>
      <!-- Opciones dinámicas -->
    </select>

    <div class="map-controls">
      <button onclick="mapController.zoomIn()">🔍 +</button>
      <button onclick="mapController.zoomOut()">🔍 -</button>
      <button onclick="mapController.fitView()">📐 Ajustar</button>
      <button onclick="mapController.resetView()">🔄 Reset</button>
    </div>
  </div>

  <!-- Canvas container -->
  <div id="mapContainer" class="map-container">
    <canvas id="mapCanvas"></canvas>
    
    <!-- Overlays (zonas seleccionadas, tooltips) -->
    <div id="mapOverlay" class="map-overlay"></div>
  </div>

  <!-- Panel lateral (lista de zonas) -->
  <div id="zonasPanel" class="zonas-panel">
    <h3>Zonas del mapa</h3>
    <div id="zonasList"></div>
  </div>
</div>
```

---

## 🎮 MAPCONTROLLER

### Objeto Principal

```javascript
// Línea 18155 en index.html
const mapController = {
  // Canvas y contexto
  canvas: null,
  ctx: null,
  
  // Estado del mapa
  currentMapId: null,
  currentMapImage: null,
  scale: 1,                    // Zoom actual
  offsetX: 0,                  // Pan X
  offsetY: 0,                  // Pan Y
  
  // Dimensiones
  canvasWidth: 1200,
  canvasHeight: 800,
  imageWidth: 0,
  imageHeight: 0,
  
  // Interacción
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  
  // Datos
  zonas: [],
  marcadores: [],
  
  // Opciones de renderizado
  showZones: true,
  showMarkers: true,
  showLabels: true,
  
  // Estado de selección
  selectedZone: null,
  hoveredZone: null
};
```

### Inicialización

```javascript
// Línea 18200 en index.html
async init() {
  // 1. Obtener canvas
  this.canvas = document.getElementById('mapCanvas');
  this.ctx = this.canvas.getContext('2d');
  
  // 2. Configurar tamaño
  this.resizeCanvas();
  
  // 3. Cargar datos
  await this.loadMapData();
  
  // 4. Registrar eventos
  this.setupEventListeners();
  
  // 5. Cargar primer mapa
  if (window.app.mapas.length > 0) {
    await this.loadMap(window.app.mapas[0].id);
  }
}
```

---

## 📥 CARGA DE MAPAS

### Función loadMap()

```javascript
// Línea 18300 en index.html
async loadMap(mapaId) {
  if (!mapaId) return;
  
  const mapa = window.app.mapas.find(m => m.id === mapaId);
  if (!mapa) {
    console.error('Mapa no encontrado:', mapaId);
    return;
  }

  // 1. Guardar ID actual
  this.currentMapId = mapaId;
  
  // 2. Cargar imagen
  await this.loadMapImage(mapa.imagePath);
  
  // 3. Cargar zonas del mapa
  this.zonas = window.app.zonas.filter(z => z.mapaId === mapaId);
  
  // 4. Cargar marcadores (repuestos en este mapa)
  this.marcadores = this.buildMarcadores(mapaId);
  
  // 5. Reset view
  this.resetView();
  
  // 6. Renderizar
  this.render();
  
  // 7. Actualizar UI
  this.updateZonasPanel();
}
```

### Cargar Imagen

```javascript
// Línea 18450 en index.html
async loadMapImage(imagePath) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      this.currentMapImage = img;
      this.imageWidth = img.width;
      this.imageHeight = img.height;
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.error('Error cargando imagen:', imagePath);
      reject(error);
    };
    
    // Cargar desde FileSystem o IndexedDB
    img.src = imagePath;
  });
}
```

### Construir Marcadores

```javascript
// Línea 18550 en index.html
buildMarcadores(mapaId) {
  const marcadores = [];
  
  window.app.repuestos.forEach(repuesto => {
    if (!repuesto.ubicacionesMapa) return;
    
    repuesto.ubicacionesMapa.forEach(ubicacion => {
      if (ubicacion.mapaId === mapaId) {
        marcadores.push({
          id: `${repuesto.id}_${ubicacion.zonaId}`,
          repuestoId: repuesto.id,
          repuestoNombre: repuesto.nombre,
          repuestoCodigo: repuesto.codSAP,
          x: ubicacion.coordenadas.x,
          y: ubicacion.coordenadas.y,
          zonaId: ubicacion.zonaId,
          tipo: 'repuesto'
        });
      }
    });
  });
  
  return marcadores;
}
```

---

## 🔍 ZOOM Y PAN

### Zoom In / Out

```javascript
// Línea 19200 en index.html
zoomIn() {
  const newScale = this.scale * 1.2;
  if (newScale > 5) return; // Máximo 5x
  
  this.setZoom(newScale);
}

zoomOut() {
  const newScale = this.scale / 1.2;
  if (newScale < 0.1) return; // Mínimo 0.1x
  
  this.setZoom(newScale);
}

setZoom(newScale) {
  // Calcular centro del viewport
  const centerX = this.canvasWidth / 2;
  const centerY = this.canvasHeight / 2;
  
  // Ajustar offset para zoom en el centro
  const scaleRatio = newScale / this.scale;
  
  this.offsetX = centerX - (centerX - this.offsetX) * scaleRatio;
  this.offsetY = centerY - (centerY - this.offsetY) * scaleRatio;
  
  this.scale = newScale;
  
  this.render();
}
```

### Pan con Mouse

```javascript
// Línea 19350 en index.html
setupPanEvents() {
  this.canvas.addEventListener('mousedown', (e) => {
    this.isDragging = true;
    this.dragStartX = e.clientX - this.offsetX;
    this.dragStartY = e.clientY - this.offsetY;
    this.canvas.style.cursor = 'grabbing';
  });

  this.canvas.addEventListener('mousemove', (e) => {
    if (!this.isDragging) return;
    
    this.offsetX = e.clientX - this.dragStartX;
    this.offsetY = e.clientY - this.dragStartY;
    
    this.render();
  });

  this.canvas.addEventListener('mouseup', () => {
    this.isDragging = false;
    this.canvas.style.cursor = 'grab';
  });

  // Zoom con rueda del mouse
  this.canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    if (e.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  });
}
```

### Pan To (Animado)

```javascript
// Línea 19500 en index.html
panTo(x, y, targetScale = null) {
  const duration = 500; // ms
  const startTime = Date.now();
  
  const startOffsetX = this.offsetX;
  const startOffsetY = this.offsetY;
  const startScale = this.scale;
  
  // Calcular offset final
  const targetOffsetX = this.canvasWidth / 2 - x * (targetScale || this.scale);
  const targetOffsetY = this.canvasHeight / 2 - y * (targetScale || this.scale);
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing (ease-in-out)
    const eased = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Interpolar
    this.offsetX = startOffsetX + (targetOffsetX - startOffsetX) * eased;
    this.offsetY = startOffsetY + (targetOffsetY - startOffsetY) * eased;
    
    if (targetScale) {
      this.scale = startScale + (targetScale - startScale) * eased;
    }
    
    this.render();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
}
```

### Fit View

```javascript
// Línea 19650 en index.html
fitView() {
  if (!this.currentMapImage) return;
  
  // Calcular escala para que quepa toda la imagen
  const scaleX = this.canvasWidth / this.imageWidth;
  const scaleY = this.canvasHeight / this.imageHeight;
  
  this.scale = Math.min(scaleX, scaleY) * 0.9; // 90% para margen
  
  // Centrar imagen
  this.offsetX = (this.canvasWidth - this.imageWidth * this.scale) / 2;
  this.offsetY = (this.canvasHeight - this.imageHeight * this.scale) / 2;
  
  this.render();
}

resetView() {
  this.scale = 1;
  this.offsetX = 0;
  this.offsetY = 0;
  this.fitView();
}
```

---

## 🔷 ZONAS POLIGONALES

### Estructura de Zona

```javascript
// Objeto guardado en zonas.json
{
  id: "zona_001",
  nombre: "Sala de Compresores",
  mapaId: "mapa_planta_principal",
  jerarquia: {
    plantaGeneral: "Planta Completa",
    areaGeneral: "Área de Compresores",
    subArea: "Sala Principal",
    sistemaEquipo: "Compresor Atlas Copco GA37",
    // ... hasta 8 niveles
  },
  points: [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 250 },
    { x: 100, y: 250 }
  ],
  color: "#3b82f6",
  equipos: ["compresor_ga37", "filtro_principal"]
}
```

### Dibujar Zonas

```javascript
// Línea 20500 en index.html
drawZones() {
  if (!this.showZones) return;
  
  this.zonas.forEach(zona => {
    if (!zona.points || zona.points.length < 3) return;
    
    this.ctx.save();
    
    // Aplicar transformación (zoom + pan)
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    
    // Dibujar polígono
    this.ctx.beginPath();
    this.ctx.moveTo(zona.points[0].x, zona.points[0].y);
    
    for (let i = 1; i < zona.points.length; i++) {
      this.ctx.lineTo(zona.points[i].x, zona.points[i].y);
    }
    
    this.ctx.closePath();
    
    // Estilo (transparente)
    const isSelected = this.selectedZone?.id === zona.id;
    const isHovered = this.hoveredZone?.id === zona.id;
    
    if (isSelected) {
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 3 / this.scale;
    } else if (isHovered) {
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      this.ctx.strokeStyle = '#60a5fa';
      this.ctx.lineWidth = 2 / this.scale;
    } else {
      this.ctx.fillStyle = zona.color + '20'; // 20% alpha
      this.ctx.strokeStyle = zona.color;
      this.ctx.lineWidth = 1 / this.scale;
    }
    
    this.ctx.fill();
    this.ctx.stroke();
    
    // Label en centro del polígono
    if (this.showLabels) {
      const center = this.getPolygonCenter(zona.points);
      this.drawZoneLabel(zona.nombre, center.x, center.y);
    }
    
    this.ctx.restore();
  });
}
```

### Calcular Centro de Polígono

```javascript
// Línea 20700 en index.html
getPolygonCenter(points) {
  let sumX = 0;
  let sumY = 0;
  
  points.forEach(p => {
    sumX += p.x;
    sumY += p.y;
  });
  
  return {
    x: sumX / points.length,
    y: sumY / points.length
  };
}
```

---

## 📍 MARCADORES

### Dibujar Marcadores

```javascript
// Línea 21500 en index.html
drawMarkers() {
  if (!this.showMarkers) return;
  
  this.marcadores.forEach(marcador => {
    this.ctx.save();
    
    // Aplicar transformación
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    
    // Dibujar pin (📍)
    const x = marcador.x;
    const y = marcador.y;
    const size = 20 / this.scale; // Tamaño fijo en screen space
    
    // Sombra
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    this.ctx.shadowBlur = 5 / this.scale;
    this.ctx.shadowOffsetY = 2 / this.scale;
    
    // Pin
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Outline
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2 / this.scale;
    this.ctx.stroke();
    
    // Label (nombre del repuesto)
    if (this.showLabels && this.scale > 0.5) {
      this.ctx.font = `${12 / this.scale}px Arial`;
      this.ctx.fillStyle = '#000000';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(marcador.repuestoNombre, x, y + size + 15 / this.scale);
    }
    
    this.ctx.restore();
  });
}
```

### Marcador Temporal (Highlight)

```javascript
// Línea 21700 en index.html
highlightPoint(x, y, duration = 2000) {
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;
    
    if (progress > 1) {
      this.render(); // Limpiar highlight
      return;
    }
    
    // Re-render con highlight
    this.render();
    
    // Dibujar círculo pulsante
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    
    const radius = 30 * (1 + progress * 0.5);
    const alpha = 1 - progress;
    
    this.ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
    this.ctx.lineWidth = 3 / this.scale;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.restore();
    
    requestAnimationFrame(animate);
  };
  
  animate();
}
```

---

## 🎯 HIT DETECTION

### Click en Canvas

```javascript
// Línea 22500 en index.html
setupClickEvents() {
  this.canvas.addEventListener('click', (e) => {
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // Convertir a coordenadas del mapa
    const mapX = (canvasX - this.offsetX) / this.scale;
    const mapY = (canvasY - this.offsetY) / this.scale;
    
    // 1. Verificar click en marcador
    const clickedMarker = this.hitTestMarker(mapX, mapY);
    if (clickedMarker) {
      this.handleMarkerClick(clickedMarker);
      return;
    }
    
    // 2. Verificar click en zona
    const clickedZone = this.hitTestZone(mapX, mapY);
    if (clickedZone) {
      this.handleZoneClick(clickedZone);
      return;
    }
    
    // 3. Click en vacío: deseleccionar
    this.selectedZone = null;
    this.render();
  });
}
```

### Hit Test Marcador

```javascript
// Línea 22650 en index.html
hitTestMarker(x, y) {
  const hitRadius = 15; // píxeles
  
  for (const marcador of this.marcadores) {
    const distance = Math.sqrt(
      Math.pow(x - marcador.x, 2) + 
      Math.pow(y - marcador.y, 2)
    );
    
    if (distance < hitRadius / this.scale) {
      return marcador;
    }
  }
  
  return null;
}
```

### Hit Test Zona (Point-in-Polygon)

```javascript
// Línea 22750 en index.html
hitTestZone(x, y) {
  for (const zona of this.zonas) {
    if (this.isPointInPolygon(x, y, zona.points)) {
      return zona;
    }
  }
  
  return null;
}

isPointInPolygon(x, y, points) {
  let inside = false;
  
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x, yi = points[i].y;
    const xj = points[j].x, yj = points[j].y;
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}
```

### Handlers

```javascript
// Línea 22900 en index.html
handleMarkerClick(marcador) {
  // Mostrar panel con info del repuesto
  const repuesto = window.app.repuestos.find(r => r.id === marcador.repuestoId);
  if (!repuesto) return;
  
  // Abrir modal o panel lateral
  window.app.mostrarDetalleRepuesto(repuesto.id);
}

handleZoneClick(zona) {
  // Seleccionar zona
  this.selectedZone = zona;
  this.render();
  
  // Actualizar panel lateral
  this.updateZonaInfo(zona);
}
```

---

## 🎨 RENDERIZADO COMPLETO

### Función render()

```javascript
// Línea 20100 en index.html
render() {
  // 1. Limpiar canvas
  this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  
  // 2. Fondo gris
  this.ctx.fillStyle = '#f3f4f6';
  this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  
  // 3. Dibujar imagen del mapa
  if (this.currentMapImage) {
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.currentMapImage, 0, 0);
    this.ctx.restore();
  }
  
  // 4. Dibujar zonas
  this.drawZones();
  
  // 5. Dibujar marcadores
  this.drawMarkers();
  
  // 6. Debug info (opcional)
  if (this.showDebug) {
    this.drawDebugInfo();
  }
}
```

---

## 📚 FUNCIONES CLAVE

### Top 10 Funciones de Mapas

| Función | Línea | Propósito |
|---------|-------|-----------|
| `loadMap()` | 18300 | Carga mapa completo |
| `render()` | 20100 | Renderiza canvas |
| `zoomIn() / zoomOut()` | 19200 | Control de zoom |
| `panTo()` | 19500 | Pan animado |
| `drawZones()` | 20500 | Dibuja polígonos |
| `drawMarkers()` | 21500 | Dibuja pins de repuestos |
| `hitTestZone()` | 22750 | Detecta click en zona |
| `hitTestMarker()` | 22650 | Detecta click en marcador |
| `highlightPoint()` | 21700 | Animación de highlight |
| `buildMarcadores()` | 18550 | Construye lista de marcadores |

---

**Continúa con:** [`SPARK_06_FLUJO_V601.md`](./SPARK_06_FLUJO_V601.md)


================================================================================

## ⏭️ SIGUIENTE: SPARK_06_FLUJO_V601.md

