# 🚀 Guía Rápida para GitHub Copilot Spark - APP Inventario v6.0

**Fecha:** 27 de noviembre de 2025  
**Versión:** v6.0.1  
**Propósito:** Documentación completa para continuar desarrollo con IA

---

## 📋 ÍNDICE DE DOCUMENTACIÓN

Esta documentación está dividida en 5 módulos:

1. **GUIA_RAPIDA_SPARK.md** ← Estás aquí
   - Overview ejecutivo
   - Arquitectura general
   - Quick Start
   - Convenciones del proyecto

2. **MODELOS_DATOS.md**
   - Estructura completa de Repuesto
   - Estructura de Mapas y Zonas
   - Jerarquía de 8 niveles
   - LocalStorage y FileSystem

3. **FUNCIONES_CORE.md**
   - Clase InventarioCompleto (200+ funciones)
   - MapController
   - MapStorage
   - Funciones críticas con código

4. **SISTEMA_JERARQUIA_MAPAS.md**
   - Árbol visual de 8 niveles
   - Sistema dual (organizacional + genérico)
   - Canvas y zonas poligonales
   - Integración jerarquía-mapas

5. **FLUJO_TRABAJO_UI.md**
   - Sistema de flujo guiado v6.0.1
   - Navegación cross-tab
   - UI Components
   - Paneles flotantes

---

## 🎯 RESUMEN EJECUTIVO

### ¿Qué es esta aplicación?

**APP Inventario** es un sistema completo de gestión de inventario para planta industrial que permite:

- ✅ Crear y gestionar repuestos con multimedia
- ✅ Organizar en jerarquía de 8 niveles (Empresa → Área → Sistema → Detalle)
- ✅ Visualizar ubicaciones en mapas interactivos (Canvas)
- ✅ Asignar coordenadas exactas a cada repuesto
- ✅ Control de stock (cantidad, mínimo, óptimo)
- ✅ Exportar datos (PDF, Excel, CSV, ZIP)
- ✅ Sistema de backups automáticos

### Características Principales

| Característica | Descripción | Estado |
|----------------|-------------|--------|
| **CRUD Repuestos** | Crear, editar, eliminar, búsqueda | ✅ Completo |
| **Jerarquía Visual** | Árbol de 8 niveles con colores | ✅ Completo |
| **Mapas Canvas** | Zoom, pan, zonas, marcadores | ✅ Completo |
| **Multimedia** | Imágenes y documentos | ✅ Completo |
| **Flujo Guiado** | Crear → Jerarquía → Mapa | ✅ v6.0.1 |
| **Navegación Cross-Tab** | Ver en Jerarquía/Mapa | ✅ v6.0.1 |
| **FileSystem API** | Almacenamiento local | ✅ Completo |
| **Export** | PDF, Excel, CSV, ZIP | ⏳ Pendiente migración |

---

## 🏗️ ARQUITECTURA GENERAL

### Stack Tecnológico

```
┌─────────────────────────────────────────────┐
│           FRONTEND (Monolítico)             │
├─────────────────────────────────────────────┤
│  HTML5 (61,561 líneas)                      │
│  - Estructura completa en 1 archivo         │
│  - CSS embebido (14,000 líneas)             │
│  - JavaScript embebido (47,000 líneas)      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           ALMACENAMIENTO                     │
├─────────────────────────────────────────────┤
│  FileSystem Access API                       │
│  - inventario.json (repuestos)              │
│  - mapas.json (configuración mapas)         │
│  - zonas.json (áreas en mapas)              │
│  - imagenes/ (multimedia)                    │
│                                              │
│  LocalStorage                                │
│  - Estados UI (colapso/expansión)           │
│  - Configuración usuario                    │
│  - Cache temporal                            │
│                                              │
│  IndexedDB                                   │
│  - Blob URLs de imágenes                    │
│  - Cache de thumbnails                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           MÓDULOS EXTERNOS                   │
├─────────────────────────────────────────────┤
│  modules/hierarchy-sync.js                   │
│  modules/mapas-ui.js                         │
│  modules/map-enhancements.js                 │
│                                              │
│  styles/main.css                             │
│  styles/mapas-hierarchy.css                  │
│  styles/prototype-mapas.css                  │
└─────────────────────────────────────────────┘
```

### Arquitectura de Clases Principales

```javascript
// CLASE PRINCIPAL - index.html línea 30409
class InventarioCompleto {
  constructor() {
    // 70+ propiedades de estado
    this.repuestos = [];
    this.currentTab = 'inventario';
    this.currentPage = 1;
    this.itemsPerPage = 'auto';
    // ... más propiedades
  }
  
  // 200+ métodos organizados por categoría:
  // - CRUD: crear, editar, eliminar repuestos
  // - Navegación: cambiar tabs, paginación
  // - Jerarquía: árbol, búsqueda, filtros
  // - Mapas: canvas, zoom, pan, marcadores
  // - Multimedia: subir, optimizar, eliminar
  // - Búsqueda: filtros, autocompletado
  // - Export: PDF, Excel, CSV, ZIP
  // - UI: modals, toasts, lightbox
}

// CONTROLADOR DE MAPAS - index.html línea 18155
const mapController = {
  // Gestión de Canvas
  canvas: null,
  ctx: null,
  
  // Estado de transformación
  offsetX: 0,
  offsetY: 0,
  scale: 1.0,
  
  // Funciones principales:
  // - loadMap(id): Cargar mapa en canvas
  // - panTo(x, y): Centrar vista en coordenadas
  // - setZoom(level): Ajustar zoom
  // - handleMapClick(e): Gestión de clicks
  // - drawMarkers(): Dibujar marcadores
  // - drawZones(): Dibujar zonas poligonales
}

// ALMACENAMIENTO DE MAPAS - index.html línea 17319
class MapStorageService {
  constructor(fsManager) {
    this.fsManager = fsManager;
    this.state = {
      mapas: [],
      zonas: [],
      areas: []
    };
  }
  
  // Funciones principales:
  // - loadMapas(): Cargar desde FileSystem
  // - saveMapas(): Guardar en FileSystem
  // - createMap(): Crear nuevo mapa
  // - deleteMap(): Eliminar mapa
  // - syncAreas(): Sincronizar con jerarquía
}
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
d:\APP_INVENTARIO-2\
│
├── v6.0/                           ← VERSIÓN ACTUAL
│   ├── index.html                  ← ARCHIVO PRINCIPAL (61,561 líneas)
│   │   ├── CSS embebido (líneas 1-14,922)
│   │   ├── HTML (líneas 14,923-16,482)
│   │   └── JavaScript (líneas 16,483-61,561)
│   │
│   ├── modules/                    ← MÓDULOS EXTERNOS
│   │   ├── hierarchy-sync.js       ← Sincronización jerarquía
│   │   ├── mapas-ui.js            ← UI de mapas
│   │   └── map-enhancements.js    ← Mejoras de mapas
│   │
│   ├── styles/                     ← ESTILOS EXTERNOS
│   │   ├── main.css               ← Estilos principales
│   │   ├── mapas-hierarchy.css    ← Estilos jerarquía mapas
│   │   └── prototype-mapas.css    ← Estilos prototipo
│   │
│   ├── INVENTARIO_STORAGE/         ← DATOS
│   │   ├── inventario.json         ← 57 repuestos
│   │   ├── mapas.json             ← 2 mapas
│   │   ├── zonas.json             ← 30 zonas
│   │   ├── repuestos.json         ← (backup)
│   │   ├── imagenes/              ← 52 imágenes
│   │   │   └── mapas/             ← Imágenes de mapas
│   │   ├── backups/               ← Sistema de backups
│   │   │   ├── automaticos/
│   │   │   ├── fase3_cleanup/
│   │   │   ├── mapas/
│   │   │   └── zonas/
│   │   └── logs/                  ← (logs eliminados)
│   │
│   └── docs/                       ← DOCUMENTACIÓN
│       ├── GUIA_RAPIDA_SPARK.md   ← Este archivo
│       ├── MODELOS_DATOS.md
│       ├── FUNCIONES_CORE.md
│       ├── SISTEMA_JERARQUIA_MAPAS.md
│       ├── FLUJO_TRABAJO_UI.md
│       └── ... (más docs técnicos)
│
├── docs/                           ← DOCS GENERALES
│   ├── RELEASE_NOTES_v6.0.1.md
│   ├── IMPLEMENTACION_FLUJO_COMPLETO.md
│   └── ... (más docs)
│
└── README.md                       ← README principal
```

---

## 🚀 QUICK START

### 1. Abrir la Aplicación

```bash
# Opción A: Servidor local (recomendado)
cd d:\APP_INVENTARIO-2\v6.0
python -m http.server 8080

# Abrir navegador
http://localhost:8080/index.html
```

```bash
# Opción B: Abrir directamente
# Navegador → Abrir archivo → d:\APP_INVENTARIO-2\v6.0\index.html
```

### 2. Conectar FileSystem

```javascript
// La aplicación solicita permisos automáticamente
// O hacer click en: Configuración > "Activar FileSystem"

// Seleccionar carpeta:
d:\APP_INVENTARIO-2\v6.0\INVENTARIO_STORAGE\

// Verificar conexión:
console.log(window.fsManager.isFileSystemMode); // true
console.log(window.app.repuestos.length); // 57
```

### 3. Navegar por la Aplicación

```
┌──────────────────────────────────────────┐
│  TABS PRINCIPALES                        │
├──────────────────────────────────────────┤
│  1. INVENTARIO   → Ver repuestos (cards) │
│  2. JERARQUÍA    → Árbol de 8 niveles    │
│  3. MAPAS        → Canvas interactivo    │
│  4. ESTADÍSTICAS → Métricas y gráficos   │
│  5. VALORES      → Resumen económico     │
│  6. CONFIGURACIÓN→ FileSystem, export    │
└──────────────────────────────────────────┘
```

---

## 🎨 CONVENCIONES DEL PROYECTO

### Nomenclatura de IDs

#### IDs de Jerarquía (NodeIds)
```javascript
// Formato: nivel_índice1_índice2_...

"empresa_0"                    // Nivel 1: Empresa
"empresa_0_area_1"             // Nivel 2: Área
"empresa_0_area_1_subarea_2"   // Nivel 3: Sub-área
"empresa_0_area_1_subarea_2_sistema_3" // Nivel 4: Sistema

// IDs genéricos (áreas sin jerarquía)
"generic_root_area_0"          // Área genérica raíz
"generic_root_area_0_1"        // Sub-nivel genérico
```

#### IDs de Elementos
```javascript
// Formato: tipo_timestamp_sufijo

"rep_17613843384470"           // Repuesto
"mapa_1760411932641"           // Mapa
"zona_1761002703272"           // Zona
```

### Estados en LocalStorage

```javascript
// Estado de expansión del árbol de jerarquía
localStorage.getItem('jerarquia_expand_state')
// Formato: JSON { "empresa_0": true, "empresa_0_area_1": false, ... }

// Estado de expansión de listas de repuestos
localStorage.getItem('jerarquia_repuestos_expand_state')
// Formato: JSON { "empresa_0": true, ... }

// Configuración de usuario
localStorage.getItem('viewMode')           // 'auto' | 'mobile' | 'desktop'
localStorage.getItem('itemsPerPage')       // número o 'auto'
localStorage.getItem('currentJerarquiaPalette') // 'palette-visual'
```

### Delegación de Eventos

```html
<!-- data-action define la acción a ejecutar -->
<button data-action="edit" data-id="123">Editar</button>
<button data-action="delete" data-id="123">Eliminar</button>
<button data-action="ver-jerarquia" data-id="123">Ver en Jerarquía</button>

<script>
// Event listener delegado en contenedor padre
document.getElementById('listView').addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  
  const action = target.dataset.action;
  const id = target.dataset.id;
  
  switch(action) {
    case 'edit': app.editarRepuesto(id); break;
    case 'delete': app.eliminarRepuesto(id); break;
    case 'ver-jerarquia': app.verRepuestoEnJerarquia(id); break;
  }
});
</script>
```

### Sistema de Eventos Globales

```javascript
// EventTarget global para comunicación entre módulos
window.appEvents = new EventTarget();

// Emitir evento
window.appEvents.dispatchEvent(new CustomEvent('multimedia-changed', {
  detail: {
    repuestoId: 'rep_123',
    action: 'add',
    multimedia: [...],
    timestamp: Date.now()
  }
}));

// Escuchar evento
window.appEvents.addEventListener('multimedia-changed', (event) => {
  const { repuestoId, action, multimedia } = event.detail;
  console.log('Multimedia cambió:', repuestoId, action);
});
```

### Clases CSS por Convención

```css
/* Prefijos por categoría */

/* btn-* → Botones */
.btn-primary-cta    /* Call-to-action principal */
.btn-add-main       /* Botón agregar */
.btn-save-main      /* Botón guardar */

/* modal-* → Modales */
.modal-overlay      /* Fondo oscuro */
.modal-container    /* Contenedor modal */
.modal-header       /* Header con título */

/* jerarquia-* → Jerarquía */
.jerarquia-search-input
.jerarquia-config-container
.jerarquia-tree-container

/* visual-v2-* → Vista visual v2 */
.visual-v2-wrapper
.visual-v2-tree-container
.visual-v2-btn

/* map-* → Mapas */
.map-section-header-custom
.map-search-input
.map-category-filters

/* config-* → Configuración */
.config-section
.config-btn-full
.config-info-box
```

---

## 🔧 TECNOLOGÍAS CLAVE

### FileSystem Access API

```javascript
// Solicitar acceso a carpeta
async function activarModoFileSystem() {
  try {
    const dirHandle = await window.showDirectoryPicker({
      id: 'inventario-storage',
      mode: 'readwrite'
    });
    
    // Guardar handle en IndexedDB
    await fsManager.storeDirectoryHandle(dirHandle);
    
    // Cargar datos
    await fsManager.loadInventario();
    await fsManager.loadMapas();
    
    console.log('✅ FileSystem conectado');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Leer archivo
async function loadInventario() {
  const fileHandle = await dirHandle.getFileHandle('inventario.json');
  const file = await fileHandle.getFile();
  const text = await file.text();
  const data = JSON.parse(text);
  return data;
}

// Escribir archivo
async function saveInventario(data) {
  const fileHandle = await dirHandle.getFileHandle('inventario.json', {
    create: true
  });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}
```

### Canvas API (Mapas)

```javascript
// Inicializar canvas
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Cargar imagen de mapa
const img = new Image();
img.src = mapa.imagePath;
img.onload = () => {
  // Ajustar canvas al tamaño de la imagen
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Dibujar imagen
  ctx.drawImage(img, 0, 0);
  
  // Dibujar zonas encima
  drawZones(ctx, zonas);
  
  // Dibujar marcadores encima
  drawMarkers(ctx, marcadores);
};

// Transformación (zoom + pan)
function draw() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Aplicar transformación
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  
  // Dibujar contenido
  ctx.drawImage(img, 0, 0);
  drawZones(ctx, zonas);
  drawMarkers(ctx, marcadores);
  
  ctx.restore();
}

// Zoom con rueda del mouse
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  scale *= delta;
  draw();
});

// Pan con arrastre
let isDragging = false;
canvas.addEventListener('mousedown', () => isDragging = true);
canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    offsetX += e.movementX;
    offsetY += e.movementY;
    draw();
  }
});
canvas.addEventListener('mouseup', () => isDragging = false);
```

### LocalStorage para Estados UI

```javascript
// Guardar estado de expansión del árbol
function saveTreeState() {
  const state = {};
  document.querySelectorAll('.tree-node').forEach(node => {
    const id = node.dataset.nodeId;
    const isExpanded = !node.classList.contains('collapsed');
    state[id] = isExpanded;
  });
  localStorage.setItem('jerarquia_expand_state', JSON.stringify(state));
}

// Restaurar estado de expansión
function restoreTreeState() {
  const state = JSON.parse(localStorage.getItem('jerarquia_expand_state') || '{}');
  Object.entries(state).forEach(([nodeId, isExpanded]) => {
    const node = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (node) {
      if (isExpanded) {
        node.classList.remove('collapsed');
      } else {
        node.classList.add('collapsed');
      }
    }
  });
}
```

---

## 📊 FLUJO DE DATOS

### Diagrama de Flujo General

```
┌─────────────┐
│   USUARIO   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      UI (index.html)                    │
│  - Tabs (6 pestañas)                    │
│  - Modales (crear/editar)               │
│  - Lightbox (imágenes)                  │
│  - Toasts (notificaciones)              │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  InventarioCompleto (clase principal)   │
│  - repuestos[]                          │
│  - currentTab                           │
│  - currentPage                          │
│  - filteredRepuestos[]                  │
└──────┬──────────────────────────────────┘
       │
       ├──► MapController (canvas, zoom, pan)
       │
       ├──► MapStorageService (mapas, zonas)
       │
       └──► FileSystemManager (lectura/escritura)
              │
              ▼
       ┌──────────────────────┐
       │  INVENTARIO_STORAGE/ │
       │  - inventario.json   │
       │  - mapas.json        │
       │  - zonas.json        │
       │  - imagenes/         │
       └──────────────────────┘
```

### Flujo de Creación de Repuesto

```
1. Usuario click "Agregar Repuesto"
   ↓
2. Modal se abre (index.html línea 15879)
   ↓
3. Usuario llena formulario (7 pasos)
   - Step 1: Código SAP, nombre, categoría
   - Step 2: Área, equipo, sistema
   - Step 3: Cantidad, stock mínimo/óptimo
   - Step 4: Ubicaciones múltiples (jerarquía)
   - Step 5: Imágenes y documentos
   - Step 6: Datos técnicos
   - Step 7: Confirmación y guardado
   ↓
4. Click "Guardar y Asignar Jerarquía" (NUEVO v6.0.1)
   ↓
5. app.saveAndContinueToJerarquia()
   - Valida formulario
   - Crea objeto repuesto
   - Calcula estado_ubicacion
   - Agrega a app.repuestos[]
   - Guarda en FileSystem
   ↓
6. Transición a Tab Jerarquía
   ↓
7. Panel flotante se muestra
   ↓
8. Usuario selecciona nodo en árbol
   ↓
9. app.asignarRepuestoANodo()
   - Extrae ubicación desde nodeId
   - Agrega a repuesto.ubicaciones[]
   - Actualiza estado_ubicacion
   - Guarda en FileSystem
   ↓
10. Pregunta: "¿Continuar al mapa?"
    ↓ Sí
11. Transición a Tab Mapa
    ↓
12. Panel de asignación de mapa
    ↓
13. Usuario selecciona mapa
    ↓
14. Usuario hace click en canvas
    ↓
15. app.confirmarAsignacionMapa()
    - Crea objeto ubicacionMapa
    - Agrega a repuesto.ubicacionesMapa[]
    - Actualiza estado_ubicacion = "completo"
    - Guarda en FileSystem
    ↓
16. ✅ Repuesto completamente ubicado
```

---

## 🎯 CASOS DE USO PRINCIPALES

### Caso 1: Ver Repuesto en Jerarquía

```javascript
// Usuario hace click en "Ver en Jerarquía" en tarjeta
// Botón HTML:
<button 
  data-action="ver-jerarquia" 
  data-id="17613843384470">
  🌳 Ver en Jerarquía
</button>

// Función invocada:
app.verRepuestoEnJerarquia('17613843384470')

// Flujo interno:
// 1. Buscar repuesto por ID
const repuesto = app.repuestos.find(r => r.id === id);

// 2. Obtener primera ubicación
const ubicacion = repuesto.ubicaciones[0];

// 3. Construir nodeId desde ubicación
const nodeId = app.construirNodeIdDesdeUbicacion(ubicacion);
// → "empresa_0_area_1_subarea_2_sistema_3"

// 4. Cambiar a tab jerarquía
app.switchTab('jerarquia');

// 5. Colapsar todo el árbol
app.collapseAllNodes();

// 6. Expandir path hasta el nodo
app.expandPathToNode(nodeId);

// 7. Resaltar nodo con borde verde
const node = document.querySelector(`[data-node-id="${nodeId}"]`);
node.style.border = '3px solid #10b981';
node.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';

// 8. Scroll al nodo
node.scrollIntoView({ behavior: 'smooth', block: 'center' });

// 9. Mostrar toast
app.showToast(
  `📍 Navegando a: ${ubicacion.areaGeneral} → ${ubicacion.subArea} → ${ubicacion.sistemaEquipo}`,
  'success',
  4000
);
```

### Caso 2: Buscar en Jerarquía

```javascript
// Usuario escribe en input de búsqueda
<input 
  type="text" 
  class="jerarquia-search-input"
  placeholder="Buscar en jerarquía..."
  oninput="app.handleJerarquiaSearch(this.value)">

// Función invocada:
app.handleJerarquiaSearch(query)

// Flujo interno:
// 1. Construir índice de búsqueda (si no existe)
if (!app.jerarquiaSearchIndex) {
  app.buildJerarquiaSearchIndex();
}

// 2. Filtrar índice por query
const results = app.jerarquiaSearchIndex.filter(item => {
  const searchText = `${item.nombre} ${item.id}`.toLowerCase();
  return searchText.includes(query.toLowerCase());
});

// 3. Mostrar sugerencias
app.renderSearchSuggestions(results);

// 4. Usuario selecciona una sugerencia (click o Enter)
app.focusJerarquiaSearchResult(selectedResult)

// 5. Si es repuesto:
if (selectedResult.isRepuesto) {
  // Usar verRepuestoEnJerarquia
  app.verRepuestoEnJerarquia(selectedResult.id);
}

// 6. Si es nodo de jerarquía:
else {
  // Expandir hasta el nodo
  app.expandPathToNode(selectedResult.id);
  // Resaltar
  app.highlightNode(selectedResult.id);
}
```

### Caso 3: Crear Marcador en Mapa

```javascript
// Usuario hace click en canvas después de seleccionar repuesto
canvas.addEventListener('click', (e) => {
  app.handleMapClick(e);
});

// Función invocada:
app.handleMapClick(event)

// Flujo interno:
// 1. Verificar si hay flujo guiado activo
if (app.repuestoEnFlujo) {
  // Prioritario: flujo guiado v6.0.1
  const coords = app.convertScreenToMapCoords(event.clientX, event.clientY);
  app.colocarMarcadorEnMapa(coords);
  return;
}

// 2. Convertir coordenadas pantalla → mapa
const rect = canvas.getBoundingClientRect();
const screenX = event.clientX - rect.left;
const screenY = event.clientY - rect.top;

const mapX = (screenX - mapController.offsetX) / mapController.scale;
const mapY = (screenY - mapController.offsetY) / mapController.scale;

// 3. Verificar si hay repuesto seleccionado
if (app.currentRepuestoForMap) {
  // Crear marcador
  const marcador = {
    tipo: 'mapa',
    mapaId: mapController.currentMapId,
    coordenadas: { x: mapX, y: mapY },
    fechaAsignacion: new Date().toISOString()
  };
  
  // Agregar a repuesto
  const repuesto = app.repuestos.find(r => r.id === app.currentRepuestoForMap);
  if (!repuesto.ubicacionesMapa) repuesto.ubicacionesMapa = [];
  repuesto.ubicacionesMapa.push(marcador);
  
  // Guardar
  app.guardarTodo();
  
  // Redibujar mapa
  mapController.draw();
  
  // Toast
  app.showToast('✅ Marcador agregado', 'success');
}

// 4. Si no hay repuesto: detectar zona clickeada
else {
  const zona = mapController.detectZoneAtPoint(mapX, mapY);
  if (zona) {
    app.showZoneInfo(zona);
  }
}
```

---

## 🔍 DEBUGGING Y CONSOLA

### Variables Globales Útiles

```javascript
// Acceso a la aplicación
window.app              // Instancia de InventarioCompleto

// Datos principales
app.repuestos           // Array de 57 repuestos
app.repuestos.length    // 57

// Tab actual
app.currentTab          // 'inventario' | 'jerarquia' | 'mapa' | ...

// Paginación
app.currentPage         // Página actual (1-based)
app.itemsPerPage        // 'auto' | número
app.filteredRepuestos   // Repuestos filtrados

// FileSystem
window.fsManager                    // Gestor de FileSystem
fsManager.isFileSystemMode         // true | false
fsManager.directoryHandle          // Handle de carpeta

// Mapas
window.mapController               // Controlador de mapas
mapController.currentMapId         // ID del mapa actual
mapController.scale                // Nivel de zoom (1.0 = 100%)
mapController.offsetX              // Desplazamiento X
mapController.offsetY              // Desplazamiento Y

window.mapStorage                  // Almacenamiento de mapas
mapStorage.state.mapas             // Array de mapas
mapStorage.state.zonas             // Array de zonas

// Jerarquía
app.jerarquiaAnidada               // Objeto jerarquía anidada
app.jerarquiaAnidada.areas         // Array de áreas
app.jerarquiaSearchIndex           // Índice de búsqueda
```

### Comandos de Debugging

```javascript
// Ver repuesto específico
const rep = app.repuestos.find(r => r.nombre.includes('PARADA'));
console.log(rep);

// Ver todas las ubicaciones
app.repuestos.forEach(r => {
  if (r.ubicaciones && r.ubicaciones.length > 0) {
    console.log(r.nombre, '→', r.ubicaciones[0]);
  }
});

// Ver repuestos sin ubicación
const sinUbicacion = app.repuestos.filter(r => 
  !r.ubicaciones || r.ubicaciones.length === 0
);
console.log(`${sinUbicacion.length} repuestos sin ubicación`);

// Forzar guardado
await app.guardarTodo();

// Recargar datos desde FileSystem
await fsManager.loadInventario();
app.repuestos = JSON.parse(localStorage.getItem('inventario') || '[]');

// Ver estado de expansión del árbol
const state = JSON.parse(localStorage.getItem('jerarquia_expand_state') || '{}');
console.log('Nodos expandidos:', Object.keys(state).length);

// Expandir todos los nodos
app.expandAllNodes();

// Colapsar todos los nodos
app.collapseAllNodes();

// Ver mapas cargados
console.log(`${mapStorage.state.mapas.length} mapas`);
mapStorage.state.mapas.forEach(m => {
  console.log(`- ${m.name} (${m.width}x${m.height})`);
});

// Ver zonas de un mapa
const mapaId = 1760411932641;
const zonas = mapStorage.state.zonas.filter(z => z.mapId === mapaId);
console.log(`${zonas.length} zonas en mapa ${mapaId}`);

// Simular click en repuesto
const repId = '17613843384470';
app.verRepuestoEnJerarquia(repId);

// Forzar recálculo de estados
app.repuestos.forEach(r => {
  r.estado_ubicacion = app.calcularEstadoUbicacion(r);
  r.progreso_flujo = app.calcularProgresoFlujo(r);
});
app.renderInventario();
```

---

## 📚 PRÓXIMOS PASOS

### Para Copilot Spark

1. **Lee los otros módulos de documentación**
   - `MODELOS_DATOS.md` → Estructuras completas
   - `FUNCIONES_CORE.md` → Código de funciones
   - `SISTEMA_JERARQUIA_MAPAS.md` → Detalles técnicos
   - `FLUJO_TRABAJO_UI.md` → Features v6.0.1

2. **Familiarízate con el código**
   - Abre `index.html` en tu editor
   - Busca funciones mencionadas (Ctrl+F)
   - Revisa estructura de clases

3. **Experimenta en consola**
   - Abre DevTools (F12)
   - Prueba comandos de debugging
   - Inspecciona variables globales

4. **Identifica áreas de mejora**
   - Busca `TODO:` en el código
   - Revisa `PROBLEMAS CONOCIDOS` en docs
   - Lee issues/feature requests

### Características Pendientes

```
⏳ PENDIENTE MIGRACIÓN (desde v5.4.0)
- Export PDF con portada profesional
- Export Excel con múltiples hojas
- Export CSV para análisis
- Export ZIP con backup completo
- HTML móvil portable

🚧 EN DESARROLLO
- Modal de creación rápida de mapas
- Edición de zonas en flujo de mapa
- Soporte para múltiples mapas por repuesto
- Mover marcador después de colocar

💡 IDEAS FUTURAS
- Dashboard de repuestos ubicados
- Búsqueda por ubicación geográfica
- Historial de cambios de ubicación
- Sistema de alertas de stock
- API REST para integración externa
- PWA (Progressive Web App)
- Modo offline completo
```

---

## ✅ CHECKLIST DE LECTURA

Antes de comenzar desarrollo con Spark, verifica:

- [ ] He leído esta guía completa
- [ ] Entiendo la arquitectura monolítica (1 archivo)
- [ ] Conozco las 3 clases principales (InventarioCompleto, MapController, MapStorageService)
- [ ] Sé dónde están los datos (INVENTARIO_STORAGE/)
- [ ] He revisado la estructura de repuesto básica
- [ ] Entiendo el sistema de IDs de jerarquía
- [ ] He probado comandos en consola
- [ ] Sé cómo funciona FileSystem Access API
- [ ] He explorado los 6 tabs principales
- [ ] Conozco las convenciones del proyecto

**Próximo paso:** Leer `MODELOS_DATOS.md` para estructuras completas

---

## 📞 INFORMACIÓN DE CONTACTO

**Proyecto:** APP Inventario v6.0  
**Repositorio:** github.com/orelcain/APP_INVENTARIO  
**Versión Actual:** v6.0.1 (27 nov 2025)  
**Última Actualización:** 27 de noviembre de 2025

---

**¡Documentación completa lista para Spark!** 🚀
