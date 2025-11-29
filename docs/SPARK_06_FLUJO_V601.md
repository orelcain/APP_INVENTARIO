# 🎯 Flujo Guiado v6.0.1

**Módulo 6/8** - Sistema de navegación cross-tab en 3 fases  
**Líneas en index.html:** 48100-49800

---

## 📋 CONTENIDO

1. [Vista General](#vista-general)
2. [Las 3 Fases](#las-3-fases)
3. [Estados Automáticos](#estados-automáticos)
4. [Navegación Cross-Tab](#navegación-cross-tab)
5. [Paneles Flotantes](#paneles-flotantes)
6. [Validaciones](#validaciones)

---

## 🎯 VISTA GENERAL

### Concepto del Flujo v6.0.1

El flujo guiado es una **mejora introducida en v6.0.1** que permite al usuario crear y ubicar un repuesto de forma **continua y fluida** entre los 3 tabs principales.

**Problema que resuelve:**
- ❌ **Antes v6.0:** Usuario debía cambiar tabs manualmente y recordar en qué repuesto estaba trabajando
- ✅ **Ahora v6.0.1:** El sistema guía automáticamente al usuario por los 3 pasos

### Las 3 Fases del Flujo

```
FLUJO COMPLETO: Crear → Ubicar → Marcar
┌─────────────────────────────────────────────────────────────┐
│  FASE 1: Crear Repuesto (Tab Inventario)                    │
│  ┌──────────────────────────────────────────────┐           │
│  │ 1. Abrir modal de creación                   │           │
│  │ 2. Llenar datos básicos (código, nombre)     │           │
│  │ 3. Click en "Guardar y Continuar"            │           │
│  └──────────────────────────────────────────────┘           │
│                        ↓                                     │
│  FASE 2: Asignar Jerarquía (Tab Jerarquía)                 │
│  ┌──────────────────────────────────────────────┐           │
│  │ 4. Sistema abre Tab Jerarquía automáticamente│           │
│  │ 5. Mostrar panel flotante con repuesto       │           │
│  │ 6. Usuario selecciona ubicación (8 niveles)  │           │
│  │ 7. Click en "Continuar a Mapa"               │           │
│  └──────────────────────────────────────────────┘           │
│                        ↓                                     │
│  FASE 3: Marcar en Mapa (Tab Mapas)                        │
│  ┌──────────────────────────────────────────────┐           │
│  │ 8. Sistema abre Tab Mapas automáticamente    │           │
│  │ 9. Cargar mapa según jerarquía               │           │
│  │ 10. Usuario hace click en coordenadas        │           │
│  │ 11. Sistema guarda ubicación completa        │           │
│  └──────────────────────────────────────────────┘           │
│                        ↓                                     │
│  ✅ Repuesto creado con ubicación COMPLETA                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 LAS 3 FASES

### FASE 1: Crear Repuesto

```javascript
// Línea 48100 en index.html
async saveAndContinueToJerarquia() {
  // 1. Validar datos básicos
  const codSAP = document.getElementById('formCodSAP').value.trim();
  const nombre = document.getElementById('formNombre').value.trim();
  
  if (!codSAP || !nombre) {
    this.showToast('⚠️ Completa código y nombre', 'warning');
    return;
  }

  // 2. Crear repuesto en estado BORRADOR
  const nuevoRepuesto = {
    id: Date.now().toString(),
    codSAP: codSAP,
    nombre: nombre,
    categoria: 'Repuesto',
    cantidad: parseInt(document.getElementById('formCantidad')?.value) || 0,
    minimo: 5,
    ubicaciones: [],        // Vacío por ahora
    ubicacionesMapa: [],    // Vacío por ahora
    multimedia: this.currentMultimedia || [],
    estado_ubicacion: 'sin_ubicacion',  // Estado inicial
    progreso_flujo: '1/3',              // Fase 1 completa
    en_flujo_guiado: true,              // Flag para tracking
    fechaCreacion: new Date().toISOString()
  };

  // 3. Agregar a array
  this.repuestos.push(nuevoRepuesto);

  // 4. Guardar en FileSystem
  await this.guardarTodo();

  // 5. Cerrar modal
  this.cerrarModal();

  // 6. Guardar ID para continuar flujo
  this.currentFlowRepuestoId = nuevoRepuesto.id;

  // 7. Toast informativo
  this.showToast('✅ Repuesto creado. Asigna ubicación en jerarquía', 'info', 4000);

  // 8. Cambiar a tab Jerarquía
  setTimeout(() => {
    this.switchTab('jerarquia');
    this.mostrarPanelFlujoJerarquia(nuevoRepuesto.id);
  }, 500);
}
```

### FASE 2: Asignar Jerarquía

```javascript
// Línea 48350 en index.html
mostrarPanelFlujoJerarquia(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto) return;

  // 1. Crear panel flotante
  const panel = document.createElement('div');
  panel.id = 'panelFlujoJerarquia';
  panel.className = 'panel-flujo-flotante';
  
  panel.innerHTML = `
    <div class="panel-header">
      <h3>🎯 Paso 2/3: Asignar Jerarquía</h3>
      <button onclick="app.cerrarPanelFlujo()">&times;</button>
    </div>
    
    <div class="panel-body">
      <div class="repuesto-info">
        <strong>${repuesto.nombre}</strong>
        <span>${repuesto.codSAP}</span>
      </div>
      
      <div class="instrucciones">
        <p>📍 Selecciona la ubicación del repuesto en el árbol de jerarquía:</p>
        <ol>
          <li>Navega por las áreas y equipos</li>
          <li>Selecciona hasta 8 niveles</li>
          <li>Click en "Continuar a Mapa"</li>
        </ol>
      </div>
      
      <!-- Selector de jerarquía -->
      <div class="jerarquia-selector">
        ${this.renderJerarquiaSelector(repuesto.id)}
      </div>
      
      <div class="panel-actions">
        <button onclick="app.cancelarFlujo()" class="btn-secondary">
          Cancelar
        </button>
        <button onclick="app.continuarAMapa('${repuesto.id}')" class="btn-primary">
          Continuar a Mapa →
        </button>
      </div>
    </div>
  `;

  // 2. Agregar al DOM
  document.body.appendChild(panel);

  // 3. Fade in
  setTimeout(() => {
    panel.classList.add('visible');
  }, 10);
}
```

### Selector de Jerarquía Inline

```javascript
// Línea 48550 en index.html
renderJerarquiaSelector(repuestoId) {
  const niveles = [
    { key: 'plantaGeneral', label: 'Planta General' },
    { key: 'areaGeneral', label: 'Área General' },
    { key: 'subArea', label: 'Sub-Área' },
    { key: 'sistemaEquipo', label: 'Sistema/Equipo' },
    { key: 'subSistema', label: 'Sub-Sistema' },
    { key: 'componentePrincipal', label: 'Componente Principal' },
    { key: 'subComponente', label: 'Sub-Componente' },
    { key: 'elementoEspecifico', label: 'Elemento Específico' }
  ];

  return niveles.map((nivel, index) => `
    <div class="nivel-selector">
      <label>${index + 1}. ${nivel.label}</label>
      <input 
        type="text" 
        id="flujoNivel_${nivel.key}"
        placeholder="Ej: Área de Compresores"
        list="datalist_${nivel.key}">
      
      <datalist id="datalist_${nivel.key}">
        ${this.getOpcionesNivel(nivel.key).map(opcion => `
          <option value="${opcion}"></option>
        `).join('')}
      </datalist>
    </div>
  `).join('');
}
```

### Continuar a Mapa

```javascript
// Línea 48750 en index.html
async continuarAMapa(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto) return;

  // 1. Recopilar jerarquía del panel
  const ubicacion = {
    plantaGeneral: document.getElementById('flujoNivel_plantaGeneral')?.value.trim(),
    areaGeneral: document.getElementById('flujoNivel_areaGeneral')?.value.trim(),
    subArea: document.getElementById('flujoNivel_subArea')?.value.trim(),
    sistemaEquipo: document.getElementById('flujoNivel_sistemaEquipo')?.value.trim(),
    subSistema: document.getElementById('flujoNivel_subSistema')?.value.trim(),
    componentePrincipal: document.getElementById('flujoNivel_componentePrincipal')?.value.trim(),
    subComponente: document.getElementById('flujoNivel_subComponente')?.value.trim(),
    elementoEspecifico: document.getElementById('flujoNivel_elementoEspecifico')?.value.trim()
  };

  // 2. Validar al menos 3 niveles
  const nivelesCompletos = Object.values(ubicacion).filter(v => v).length;
  if (nivelesCompletos < 3) {
    this.showToast('⚠️ Completa al menos 3 niveles', 'warning');
    return;
  }

  // 3. Generar nodeId
  ubicacion.nodeId = this.generateNodeId(
    Object.entries(ubicacion)
      .filter(([k, v]) => v)
      .map(([k, v]) => ({ key: k, value: v }))
  );

  // 4. Guardar en repuesto
  repuesto.ubicaciones = [ubicacion];
  repuesto.estado_ubicacion = 'jerarquia_sola';
  repuesto.progreso_flujo = '2/3';

  // 5. Guardar
  await this.guardarTodo();

  // 6. Cerrar panel
  this.cerrarPanelFlujo();

  // 7. Buscar mapa asociado a jerarquía
  const mapaId = this.findMapaParaJerarquia(ubicacion);

  // 8. Toast
  this.showToast('✅ Jerarquía asignada. Marca ubicación en mapa', 'info', 4000);

  // 9. Cambiar a tab Mapas
  setTimeout(() => {
    this.switchTab('mapas');
    this.mostrarPanelFlujoMapa(repuestoId, mapaId);
  }, 500);
}
```

### FASE 3: Marcar en Mapa

```javascript
// Línea 49100 en index.html
mostrarPanelFlujoMapa(repuestoId, mapaId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto) return;

  // 1. Cargar mapa
  if (mapaId) {
    mapController.loadMap(mapaId);
  }

  // 2. Crear panel flotante
  const panel = document.createElement('div');
  panel.id = 'panelFlujoMapa';
  panel.className = 'panel-flujo-flotante';
  
  panel.innerHTML = `
    <div class="panel-header">
      <h3>🎯 Paso 3/3: Marcar en Mapa</h3>
      <button onclick="app.cerrarPanelFlujo()">&times;</button>
    </div>
    
    <div class="panel-body">
      <div class="repuesto-info">
        <strong>${repuesto.nombre}</strong>
        <span>${repuesto.codSAP}</span>
        <div class="ubicacion-actual">
          📍 ${repuesto.ubicaciones[0].areaGeneral} → ${repuesto.ubicaciones[0].sistemaEquipo}
        </div>
      </div>
      
      <div class="instrucciones">
        <p>🗺️ Haz click en el mapa para marcar la ubicación exacta del repuesto</p>
      </div>
      
      <div class="coordenadas-preview" id="coordenadasPreview">
        <em>Haz click en el mapa...</em>
      </div>
      
      <div class="panel-actions">
        <button onclick="app.volverAJerarquia('${repuestoId}')" class="btn-secondary">
          ← Volver a Jerarquía
        </button>
        <button 
          id="btnFinalizarFlujo"
          onclick="app.finalizarFlujo('${repuestoId}')" 
          class="btn-primary"
          disabled>
          Finalizar ✓
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  setTimeout(() => {
    panel.classList.add('visible');
  }, 10);

  // 3. Activar modo "selección de coordenadas"
  this.activarModoSeleccionCoordenadas(repuestoId);
}
```

### Modo Selección de Coordenadas

```javascript
// Línea 49350 en index.html
activarModoSeleccionCoordenadas(repuestoId) {
  // Cambiar cursor
  mapController.canvas.style.cursor = 'crosshair';

  // Handler temporal para click
  const clickHandler = (e) => {
    const rect = mapController.canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // Convertir a coordenadas del mapa
    const mapX = (canvasX - mapController.offsetX) / mapController.scale;
    const mapY = (canvasY - mapController.offsetY) / mapController.scale;

    // Guardar coordenadas temporales
    this.tempCoordenadas = { x: mapX, y: mapY };

    // Actualizar preview
    document.getElementById('coordenadasPreview').innerHTML = `
      <strong>Coordenadas seleccionadas:</strong><br>
      X: ${mapX.toFixed(2)}, Y: ${mapY.toFixed(2)}
    `;

    // Habilitar botón Finalizar
    document.getElementById('btnFinalizarFlujo').disabled = false;

    // Dibujar pin temporal
    mapController.drawTempMarker(mapX, mapY);
  };

  mapController.canvas.addEventListener('click', clickHandler);

  // Guardar handler para remover después
  this.currentClickHandler = clickHandler;
}
```

### Finalizar Flujo

```javascript
// Línea 49550 en index.html
async finalizarFlujo(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto || !this.tempCoordenadas) return;

  // 1. Crear ubicación en mapa
  const ubicacionMapa = {
    mapaId: mapController.currentMapId,
    zonaId: this.detectarZona(this.tempCoordenadas),
    coordenadas: {
      x: this.tempCoordenadas.x,
      y: this.tempCoordenadas.y
    },
    jerarquia: { ...repuesto.ubicaciones[0] }, // Copiar jerarquía
    fechaMarcado: new Date().toISOString()
  };

  // 2. Guardar en repuesto
  repuesto.ubicacionesMapa = [ubicacionMapa];
  repuesto.estado_ubicacion = 'completo';  // ✅ COMPLETO
  repuesto.progreso_flujo = '3/3';
  repuesto.en_flujo_guiado = false;  // Salir del flujo

  // 3. Guardar
  await this.guardarTodo();

  // 4. Remover listeners temporales
  if (this.currentClickHandler) {
    mapController.canvas.removeEventListener('click', this.currentClickHandler);
  }

  // 5. Restaurar cursor
  mapController.canvas.style.cursor = 'grab';

  // 6. Cerrar panel
  this.cerrarPanelFlujo();

  // 7. Re-renderizar mapa con nuevo marcador
  mapController.marcadores = mapController.buildMarcadores(mapController.currentMapId);
  mapController.render();

  // 8. Toast de éxito
  this.showToast('🎉 ¡Repuesto creado y ubicado exitosamente!', 'success', 5000);

  // 9. Limpiar estado temporal
  this.currentFlowRepuestoId = null;
  this.tempCoordenadas = null;

  // 10. Opcionalmente: volver a tab Inventario
  setTimeout(() => {
    this.switchTab('inventario');
    this.verRepuestoEnInventario(repuestoId); // Scroll y highlight
  }, 2000);
}
```

---

## 🔄 ESTADOS AUTOMÁTICOS

### Cálculo de Estado

```javascript
// Línea 48100 en index.html (compartida con otros módulos)
calcularEstadoUbicacion(repuesto) {
  const tieneJerarquia = repuesto.ubicaciones?.length > 0;
  const tieneMapa = repuesto.ubicacionesMapa?.length > 0;

  if (!tieneJerarquia && !tieneMapa) {
    return 'sin_ubicacion';     // ⚠️ Borrador
  }
  
  if (tieneJerarquia && !tieneMapa) {
    return 'jerarquia_sola';    // 🔶 Parcial
  }
  
  if (!tieneJerarquia && tieneMapa) {
    return 'mapa_solo';         // 🔶 Parcial (raro)
  }
  
  if (tieneJerarquia && tieneMapa) {
    return 'completo';          // ✅ Completo
  }
}

calcularProgresoFlujo(repuesto) {
  const estado = this.calcularEstadoUbicacion(repuesto);
  
  switch (estado) {
    case 'sin_ubicacion':
      return repuesto.en_flujo_guiado ? '1/3' : '0/3';
    case 'jerarquia_sola':
      return '2/3';
    case 'completo':
      return '3/3';
    default:
      return '0/3';
  }
}
```

### Badges Visuales

```javascript
// Usado en tarjetas del inventario
getBadgeHtml(repuesto) {
  const estado = this.calcularEstadoUbicacion(repuesto);
  
  const badges = {
    'sin_ubicacion': {
      color: '#f59e0b',
      icon: '⚠️',
      text: 'Borrador'
    },
    'jerarquia_sola': {
      color: '#3b82f6',
      icon: '🔶',
      text: 'Parcial (2/3)'
    },
    'completo': {
      color: '#10b981',
      icon: '✅',
      text: 'Completo'
    }
  };
  
  const badge = badges[estado];
  
  return `
    <div class="ubicacion-badge" style="background: ${badge.color};">
      ${badge.icon} ${badge.text}
    </div>
  `;
}
```

---

## 🔀 NAVEGACIÓN CROSS-TAB

### Función switchTab()

```javascript
// Línea 30850 en index.html
switchTab(tabName) {
  // 1. Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });

  // 2. Remover clase active de botones
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // 3. Mostrar tab seleccionado
  const selectedTab = document.getElementById(`${tabName}Content`);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }

  // 4. Activar botón
  const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }

  // 5. Actualizar estado
  this.currentTab = tabName;
  localStorage.setItem('lastTab', tabName);

  // 6. Trigger render del tab
  this.renderCurrentTab();
}
```

### Funciones de Navegación del Flujo

```javascript
// Línea 49750 en index.html

// Volver a Jerarquía desde Mapa
volverAJerarquia(repuestoId) {
  this.cerrarPanelFlujo();
  this.switchTab('jerarquia');
  
  setTimeout(() => {
    this.mostrarPanelFlujoJerarquia(repuestoId);
  }, 300);
}

// Cancelar flujo completo
cancelarFlujo() {
  const confirmar = confirm(
    '¿Cancelar el flujo guiado?\n\n' +
    'El repuesto quedará guardado pero sin ubicación completa.'
  );
  
  if (!confirmar) return;
  
  // Limpiar estado
  this.currentFlowRepuestoId = null;
  this.tempCoordenadas = null;
  
  // Cerrar panel
  this.cerrarPanelFlujo();
  
  // Volver a Inventario
  this.switchTab('inventario');
}

// Reanudar flujo interrumpido
reanudarFlujo(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto) return;
  
  const estado = this.calcularEstadoUbicacion(repuesto);
  
  if (estado === 'sin_ubicacion') {
    // Ir a fase 2
    this.switchTab('jerarquia');
    this.mostrarPanelFlujoJerarquia(repuestoId);
  } else if (estado === 'jerarquia_sola') {
    // Ir a fase 3
    this.switchTab('mapas');
    const mapaId = this.findMapaParaJerarquia(repuesto.ubicaciones[0]);
    this.mostrarPanelFlujoMapa(repuestoId, mapaId);
  } else {
    // Ya está completo
    this.showToast('✅ Este repuesto ya tiene ubicación completa', 'info');
  }
}
```

---

## 🎨 PANELES FLOTANTES

### Estilos CSS

```css
/* Línea 12500 en CSS embebido */
.panel-flujo-flotante {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 400px;
  max-height: calc(100vh - 120px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  
  /* Animación de entrada */
  opacity: 0;
  transform: translateX(50px);
  transition: all 0.3s ease;
}

.panel-flujo-flotante.visible {
  opacity: 1;
  transform: translateX(0);
}

.panel-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-body {
  padding: 20px;
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}

.repuesto-info {
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 16px;
}

.instrucciones {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  padding: 12px;
  margin-bottom: 16px;
}

.panel-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.nivel-selector {
  margin-bottom: 12px;
}

.nivel-selector label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 13px;
}

.nivel-selector input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
```

### Cerrar Panel

```javascript
// Línea 49900 en index.html
cerrarPanelFlujo() {
  const panel = document.getElementById('panelFlujoJerarquia') || 
                document.getElementById('panelFlujoMapa');
  
  if (panel) {
    panel.classList.remove('visible');
    
    setTimeout(() => {
      panel.remove();
    }, 300);
  }
}
```

---

## ✅ VALIDACIONES

### Validación de Jerarquía

```javascript
// Al menos 3 niveles obligatorios
validarJerarquia(ubicacion) {
  const nivelesCompletos = Object.values(ubicacion).filter(v => v && v.trim()).length;
  
  if (nivelesCompletos < 3) {
    this.showToast('⚠️ Completa al menos Planta, Área y Sistema', 'warning');
    return false;
  }
  
  return true;
}
```

### Validación de Coordenadas

```javascript
// Verificar que las coordenadas estén dentro del mapa
validarCoordenadas(x, y) {
  if (x < 0 || x > mapController.imageWidth ||
      y < 0 || y > mapController.imageHeight) {
    this.showToast('⚠️ Coordenadas fuera del mapa', 'warning');
    return false;
  }
  
  return true;
}
```

### Detectar Zona Automáticamente

```javascript
// Línea 49650 en index.html
detectarZona(coordenadas) {
  // Buscar zona que contenga las coordenadas
  const zona = window.app.zonas.find(z => {
    if (!z.points || z.points.length < 3) return false;
    return mapController.isPointInPolygon(coordenadas.x, coordenadas.y, z.points);
  });
  
  return zona?.id || null;
}
```

---

## 📚 FUNCIONES CLAVE

### Top 8 Funciones del Flujo v6.0.1

| Función | Línea | Propósito |
|---------|-------|-----------|
| `saveAndContinueToJerarquia()` | 48100 | Fase 1 → Fase 2 |
| `continuarAMapa()` | 48750 | Fase 2 → Fase 3 |
| `finalizarFlujo()` | 49550 | Completa flujo completo |
| `mostrarPanelFlujoJerarquia()` | 48350 | Panel fase 2 |
| `mostrarPanelFlujoMapa()` | 49100 | Panel fase 3 |
| `calcularEstadoUbicacion()` | 48100 | Calcula estado actual |
| `reanudarFlujo()` | 49850 | Continúa flujo interrumpido |
| `cancelarFlujo()` | 49800 | Cancela y limpia estado |

---

**Continúa con:** [`SPARK_07_FUNCIONES_TOP30.md`](./SPARK_07_FUNCIONES_TOP30.md)
