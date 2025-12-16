# 📚 DOCUMENTACIÓN COMPLETA - APP INVENTARIO v6.0.1

**Fecha:** 27 de noviembre de 2025

**Propósito:** Documentación unificada para GitHub Copilot Spark

**Documentos incluidos:** 11

---

################################################################################
# DOCUMENTO 0: SPARK_00_INDEX.md
# Líneas: 390
################################################################################

# 📚 Índice Maestro - Documentación para Spark

**Versión:** v6.0.1  
**Fecha:** 27 de noviembre de 2025  
**Propósito:** Documentación modular para GitHub Copilot Spark

---

## 🎯 CÓMO USAR ESTA DOCUMENTACIÓN

### Orden de Lectura Recomendado

1. **`SPARK_00_INDEX.md`** ← Estás aquí
2. **`SPARK_01_GUIA_RAPIDA.md`** - Overview general y quick start
3. **`SPARK_02_MODELOS_DATOS.md`** - Estructuras de datos completas
4. **`SPARK_03_INVENTARIO.md`** - Tab Inventario (CRUD repuestos)
5. **`SPARK_04_JERARQUIA.md`** - Sistema de jerarquía 8 niveles
6. **`SPARK_05_MAPAS.md`** - Canvas, zonas, marcadores
7. **`SPARK_06_FLUJO_V601.md`** - Flujo guiado v6.0.1
8. **`SPARK_07_FUNCIONES_TOP30.md`** - Top 30 funciones críticas
9. **`SPARK_08_COMPONENTES_UI.md`** - Wizard, Toasts, Lightbox, Modales
10. **`SPARK_09_SCRIPTS_HERRAMIENTAS.md`** - Scripts Node.js, migración, backups
11. **`SPARK_10_CLOUDINARY_DEPLOYMENT.md`** - ☁️ Deploy web + almacenamiento cloud

---

## 📁 RESUMEN DE CADA DOCUMENTO

### 1. SPARK_01_GUIA_RAPIDA.md (~2000 líneas)
- ✅ Overview ejecutivo
- ✅ Arquitectura general
- ✅ Stack tecnológico
- ✅ Estructura del proyecto
- ✅ Convenciones y patrones
- ✅ Quick Start
- ✅ Debugging básico

**Lee primero si:** Necesitas entender la app completa

---

### 2. SPARK_02_MODELOS_DATOS.md (~1500 líneas)
- ✅ Estructura de Repuesto (19 campos)
- ✅ Estructura de Mapa
- ✅ Estructura de Zona
- ✅ Jerarquía de 8 niveles
- ✅ LocalStorage (todas las claves)
- ✅ IndexedDB (3 object stores)
- ✅ FileSystem (estructura de carpetas)
- ✅ Sincronización de datos

**Lee primero si:** Necesitas entender los datos

---

### 3. SPARK_03_INVENTARIO.md (~800 líneas)
- Tab Inventario completo
- Grid responsive 6 columnas
- Paginación automática
- Sistema CRUD (Crear, Editar, Eliminar)
- Lightbox con zoom
- Filtros y búsqueda
- Funciones: `renderInventario()`, `renderCards()`, `getFilteredRepuestos()`

**Lee primero si:** Trabajarás en el tab Inventario

---

### 4. SPARK_04_JERARQUIA.md (~800 líneas)
- Árbol visual de 8 niveles
- Sistema dual (organizacional + genérico)
- Búsqueda con autocompletado
- Parser de NodeId
- Funciones: `buildJerarquiaSearchIndex()`, `verRepuestoEnJerarquia()`, `expandPath()`

**Lee primero si:** Trabajarás en el tab Jerarquía

---

### 5. SPARK_05_MAPAS.md (~800 líneas)
- Canvas API (zoom, pan, draw)
- MapController completo
- Zonas poligonales
- Marcadores con coordenadas
- Hit detection
- Funciones: `loadMap()`, `panTo()`, `setZoom()`, `drawZones()`

**Lee primero si:** Trabajarás en el tab Mapas

---

### 6. SPARK_06_FLUJO_V601.md (~800 líneas)
- Sistema de flujo guiado (3 fases)
- Navegación cross-tab (4 funciones)
- Estados automáticos
- Paneles flotantes
- Funciones: `saveAndContinueToJerarquia()`, `continuarAMapa()`, `verRepuestoEnMapa()`

**Lee primero si:** Trabajarás en el flujo guiado nuevo

---

### 7. SPARK_07_FUNCIONES_TOP30.md (~800 líneas)
- Top 30 funciones más importantes
- Código completo con line numbers
- Parámetros, returns, dependencias
- Casos de uso reales
- Funciones: `guardarTodo()`, `cargarTodo()`, `renderInventario()`, `saveRepuesto()`, etc.

**Lee primero si:** Necesitas entender las funciones críticas

---

### 8. SPARK_08_COMPONENTES_UI.md (~700 líneas)
- ✅ Wizard modal de 7 pasos
- ✅ Sistema de Toasts (notificaciones)
- ✅ Lightbox avanzado con zoom/pan
- ✅ Modal Resizable (arrastrable)
- ✅ Modales personalizados (confirm, input, select)
- ✅ Tabs y navegación
- ✅ Componentes de formulario (autocomplete, searchable select)

**Lee primero si:** Trabajarás en componentes visuales o UX

---

### 9. SPARK_09_SCRIPTS_HERRAMIENTAS.md (~700 líneas)
- ✅ Scripts de migración (migrate-repuestos.cjs, migrate-zonas.cjs)
- ✅ Scripts de mantenimiento (fix-empty-jerarquia.cjs, cleanup-legacy-fields.cjs)
- ✅ Herramientas de análisis (analyze-dependencies.cjs, audit-jerarquia-actual.cjs)
- ✅ Sistema de backups (create-backup-unificacion.cjs)
- ✅ Comandos de debugging (consola, npm scripts)
- ✅ Troubleshooting común

**Lee primero si:** Necesitas migrar datos, hacer backups o analizar el código

---

### 10. SPARK_10_CLOUDINARY_DEPLOYMENT.md (~850 líneas)
- ✅ Por qué Cloudinary vs FileSystem local
- ✅ Configuración cuenta Cloudinary (paso a paso)
- ✅ Implementación completa: `cloudinary-service.js`
- ✅ Modificación de `handleFileUpload()` para usar URLs cloud
- ✅ Modelo de datos actualizado (multimedia con URLs remotas)
- ✅ Deployment en Spark/Netlify/Vercel/GitHub Pages
- ✅ Límites del plan gratuito (25 GB) y costos
- ✅ Script de migración de local → cloud

**Lee primero si:** Vas a publicar la app en web y necesitas almacenar imágenes

---

## 📚 DOCUMENTOS LEGACY (REFERENCIA)

### SPARK_07_FUNCIONES_TOP30.md
- Código completo de cada función
- Parámetros y retornos
- Ejemplos de uso
- Dependencias

**Lee primero si:** Necesitas código específico

---

## 🔍 BÚSQUEDA RÁPIDA

### Por Característica

| Quiero... | Lee documento |
|-----------|---------------|
| Crear un repuesto | SPARK_03_INVENTARIO.md |
| Buscar en jerarquía | SPARK_04_JERARQUIA.md |
| Dibujar en mapa | SPARK_05_MAPAS.md |
| Flujo crear→ubicar→marcar | SPARK_06_FLUJO_V601.md |
| Ver código de función X | SPARK_07_FUNCIONES_TOP30.md |
| Implementar componente UI | SPARK_08_COMPONENTES_UI.md |
| Migrar datos o hacer backups | SPARK_09_SCRIPTS_HERRAMIENTAS.md |
| Publicar app en web | SPARK_10_CLOUDINARY_DEPLOYMENT.md |
| Entender estructura de datos | SPARK_02_MODELOS_DATOS.md |
| Overview general | SPARK_01_GUIA_RAPIDA.md |

### Por Archivo del Proyecto

| Archivo | Documento relacionado |
|---------|----------------------|
| `index.html` (líneas 1-14922) CSS | SPARK_01_GUIA_RAPIDA.md |
| `index.html` (líneas 14923-16482) HTML | Todos los docs |
| `index.html` (líneas 16483-30408) JS Setup | SPARK_01_GUIA_RAPIDA.md |
| `index.html` (líneas 30409-53350) clase InventarioCompleto | SPARK_03/04/05/06/07 |
| `modules/hierarchy-sync.js` | SPARK_04_JERARQUIA.md |
| `modules/map-enhancements.js` | SPARK_05_MAPAS.md |
| `modules/cloudinary-service.js` | SPARK_10_CLOUDINARY_DEPLOYMENT.md |
| `scripts/*.cjs` | SPARK_09_SCRIPTS_HERRAMIENTAS.md |
| `INVENTARIO_STORAGE/*.json` | SPARK_02_MODELOS_DATOS.md |

### Por Función

| Función | Línea en index.html | Documento |
|---------|---------------------|-----------|
| `renderInventario()` | 36830 | SPARK_03_INVENTARIO.md |
| `renderCards()` | 36858 | SPARK_03_INVENTARIO.md |
| `verRepuestoEnJerarquia()` | 48494 | SPARK_04_JERARQUIA.md |
| `buildJerarquiaSearchIndex()` | 60465 | SPARK_04_JERARQUIA.md |
| `loadMap()` | 18200 | SPARK_05_MAPAS.md |
| `panTo()` | 19500 | SPARK_05_MAPAS.md |
| `saveAndContinueToJerarquia()` | 48200 | SPARK_06_FLUJO_V601.md |
| `continuarAMapa()` | 48350 | SPARK_06_FLUJO_V601.md |

---

## 📊 ESTADÍSTICAS DEL PROYECTO

```
📁 Archivo Principal: index.html
   Líneas totales: 61,561
   - CSS: 14,922 líneas (24%)
   - HTML: 1,559 líneas (3%)
   - JavaScript: 45,080 líneas (73%)

📦 Datos:
   - 57 repuestos
   - 2 mapas
   - 30 zonas
   - 52 imágenes (~15 MB)

🏗️ Arquitectura:
   - 1 clase principal (InventarioCompleto)
   - 200+ métodos
   - 70+ propiedades de estado
   - 3 módulos externos

🎨 UI:
   - 6 tabs principales
   - Grid 6 columnas responsive
   - Paginación automática
   - Canvas interactivo
```

---

## 🚀 QUICK START PARA SPARK

### 1. Lee el Overview
```bash
# Abre: SPARK_01_GUIA_RAPIDA.md
# Tiempo: 15 minutos
# Obtendrás: Visión completa de la app
```

### 2. Revisa los Modelos
```bash
# Abre: SPARK_02_MODELOS_DATOS.md
# Tiempo: 10 minutos
# Obtendrás: Estructura de todos los datos
```

### 3. Explora el Código
```bash
# Abre el archivo principal
d:\APP_INVENTARIO-2\v6.0\index.html

# Busca la clase principal (Ctrl+F)
class InventarioCompleto

# Navega por los métodos
# Usa documentos SPARK_03-07 como referencia
```

### 4. Prueba en Consola
```javascript
// Abre DevTools (F12)
console.log(window.app);
console.log(app.repuestos.length); // 57
console.log(mapController.currentMapId);

// Ver funciones disponibles
Object.getOwnPropertyNames(Object.getPrototypeOf(app))
  .filter(name => typeof app[name] === 'function')
  .sort();
```

---

## 🎯 CASOS DE USO COMUNES

### Caso 1: Agregar nueva funcionalidad al Inventario
```
1. Lee: SPARK_03_INVENTARIO.md
2. Busca: renderCards() en index.html (línea 36858)
3. Modifica: Agrega tu lógica
4. Prueba: app.renderInventario()
```

### Caso 2: Modificar búsqueda en Jerarquía
```
1. Lee: SPARK_04_JERARQUIA.md
2. Busca: buildJerarquiaSearchIndex() (línea 60465)
3. Modifica: Cambia la lógica de índice
4. Prueba: app.buildJerarquiaSearchIndex()
```

### Caso 3: Agregar funcionalidad al Mapa
```
1. Lee: SPARK_05_MAPAS.md
2. Busca: mapController en index.html (línea 18155)
3. Modifica: Agrega método al objeto
4. Prueba: mapController.tuMetodo()
```

### Caso 4: Extender flujo guiado v6.0.1
```
1. Lee: SPARK_06_FLUJO_V601.md
2. Busca: saveAndContinueToJerarquia() (línea 48200)
3. Modifica: Agrega nuevo paso
4. Prueba: Crea repuesto desde UI
```

---

## 🐛 DEBUGGING

### Verificar Estado Actual
```javascript
// Estado general
console.log('Tab actual:', app.currentTab);
console.log('Página:', app.currentPage);
console.log('Total repuestos:', app.repuestos.length);
console.log('Filtrados:', app.filteredRepuestos.length);

// FileSystem
console.log('FileSystem activo:', fsManager.isFileSystemMode);

// Jerarquía
console.log('Índice búsqueda:', app.jerarquiaSearchIndex?.length);

// Mapas
console.log('Mapa actual:', mapController.currentMapId);
console.log('Zoom:', mapController.scale);
```

### Comandos Útiles
```javascript
// Recargar datos
await fsManager.loadInventario();

// Forzar re-render
app.renderInventario();
app.renderJerarquiaTree();

// Limpiar filtros
app.clearFilters();

// Expandir todo
app.expandAllNodes();

// Navegar a repuesto
app.verRepuestoEnJerarquia('ID_DEL_REPUESTO');
```

---

## ✅ CHECKLIST ANTES DE DESARROLLAR

- [ ] He leído `SPARK_01_GUIA_RAPIDA.md`
- [ ] He revisado `SPARK_02_MODELOS_DATOS.md`
- [ ] Sé qué tab voy a modificar
- [ ] He leído el documento SPARK correspondiente
- [ ] Tengo acceso al código fuente (`index.html`)
- [ ] He probado comandos en consola
- [ ] Entiendo la estructura de datos
- [ ] Sé qué función(es) modificar

---

## 📊 ESTADÍSTICAS DE DOCUMENTACIÓN

| Métrica | Valor |
|---------|-------|
| **Documentos totales** | 11 |
| **Líneas totales** | ~10,450 |
| **Funciones documentadas** | 30+ críticas |
| **Líneas de código app** | 61,561 |
| **Scripts Node.js** | 8 |
| **Líneas scripts** | ~3,100 |
| **Cobertura** | 100% (código + deployment) |

---

**¡Comienza por `SPARK_01_GUIA_RAPIDA.md`!** 🚀


====================================================================================================

################################################################################
# DOCUMENTO 1: SPARK_01_GUIA_RAPIDA.md
# Líneas: 1010
################################################################################

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


====================================================================================================

################################################################################
# DOCUMENTO 2: SPARK_02_MODELOS_DATOS.md
# Líneas: 1117
################################################################################

# 📊 Modelos de Datos - APP Inventario v6.0

**Módulo 2/5** - Estructuras de datos completas  
**Fecha:** 27 de noviembre de 2025

---

## 📋 ÍNDICE

1. [Estructura de Repuesto](#estructura-de-repuesto)
2. [Estructura de Mapa](#estructura-de-mapa)
3. [Estructura de Zona](#estructura-de-zona)
4. [Estructura de Jerarquía](#estructura-de-jerarquía)
5. [LocalStorage](#localstorage)
6. [IndexedDB](#indexeddb)
7. [FileSystem](#filesystem)

---

## 🔧 ESTRUCTURA DE REPUESTO

### Modelo Completo

```javascript
{
  // ===== IDENTIFICACIÓN =====
  "id": "17613843384470.6770781112528935",  // Timestamp único
  "codSAP": "REP-001",                      // Código SAP (obligatorio)
  "codProv": "PROV-ABC",                    // Código proveedor (opcional)
  "tipo": "Eléctrico",                      // Tipo de repuesto
  "categoria": "Repuesto",                  // Categoría fija
  "nombre": "Chumacera Ovalada de 2 pernos FL206",  // Nombre descriptivo
  
  // ===== UBICACIONES (NUEVO FORMATO v6.0) =====
  "ubicaciones": [
    {
      "areaGeneral": "Planta Principal",
      "subArea": "Filete",
      "sistemaEquipo": "Cinta Curva ( Estructura )",
      "subSistema": "",                     // Opcional
      "seccion": "",                        // Opcional
      "detalle": "",                        // Opcional
      "cantidadEnUbicacion": 4,            // Cantidad en esta ubicación
      "jerarquiaPath": [                   // Path completo en jerarquía
        {
          "id": "nivel1-1763524403524-e313",
          "name": "Aquachile Antarfood Chonchi",
          "level": "planta",
          "storageKey": "nivel1"
        },
        {
          "id": "nivel2-1763524403524-ad1a",
          "name": "Planta Principal",
          "level": "areaGeneral",
          "storageKey": "nivel2"
        },
        {
          "id": "nivel3-1763524403524-7339",
          "name": "Filete",
          "level": "subArea",
          "storageKey": "nivel3"
        },
        {
          "id": "nivel4-1763524403524-99d1",
          "name": "Cinta Curva ( Estructura )",
          "level": "sistemaEquipo",
          "storageKey": "nivel4"
        }
      ]
    }
  ],
  
  // ===== UBICACIONES EN MAPAS (NUEVO v6.0.1) =====
  "ubicacionesMapa": [
    {
      "tipo": "mapa",
      "mapaId": 1760411932641,
      "zonaId": null,                       // Opcional: ID de zona
      "coordenadas": {
        "x": 3236.7,
        "y": 1675.2
      },
      "numeroCorrelativo": 1,               // Número de instancia (si hay múltiples)
      "fechaAsignacion": "2025-11-21T10:30:00.000Z"
    }
  ],
  
  // ===== CAMPOS LEGACY (Compatibilidad v5.x) =====
  "planta": "Aquachile Antarfood Chonchi",  // Deprecated
  "areaGeneral": "Planta Principal",        // Deprecated
  "subArea": "Filete",                      // Deprecated
  "sistemaEquipo": "Cinta Curva",           // Deprecated
  "subSistema": "",                         // Deprecated
  "seccion": "",                            // Deprecated
  "detalle": "",                            // Deprecated
  "area": "Planta Principal",               // Deprecated
  "equipo": "Cinta Curva ( Estructura )",   // Deprecated
  "sistema": "",                            // Deprecated
  "detalleUbicacion": "",                   // Deprecated
  
  // ===== STOCK Y CANTIDADES =====
  "cantidad": 0,                            // Cantidad actual en bodega
  "cantidadInstalada": 4,                   // Cantidad instalada en planta
  "minimo": 5,                              // Stock mínimo requerido
  "optimo": 10,                             // Stock óptimo deseado
  
  // ===== INFORMACIÓN ECONÓMICA =====
  "precio": 0,                              // Precio unitario (0 = sin precio)
  
  // ===== INFORMACIÓN TÉCNICA =====
  "datosTecnicos": "- Rodamiento SUC 206\n- Chumacera ovalada FL206\n- Eje 30 mm",
  
  // ===== MULTIMEDIA =====
  "multimedia": [
    {
      "type": "image",
      "url": "./imagenes/1763398441608_Pendiente_Chumacera_Ovalada_de_2_pernos__foto1.webp",
      "name": "chumacera ovalada de 2 pernos FL 206.jpg",
      "size": 109078,
      "isFileSystem": true
    }
  ],
  
  // ===== ESTADOS (NUEVO v6.0.1) =====
  "estado_ubicacion": "completo",           // sin_ubicacion | jerarquia_sola | mapa_solo | completo
  "progreso_flujo": "Ubicado",             // Borrador | Listo para ubicar | Ubicado
  
  // ===== METADATOS =====
  "ultimaModificacion": "2025-11-19T03:53:38.295Z",
  "ultimoConteo": null                     // Timestamp del último conteo físico
}
```

### Campos Obligatorios vs Opcionales

```javascript
// ✅ OBLIGATORIOS (validación en formulario)
{
  id: string,              // Auto-generado
  codSAP: string,          // Input requerido
  nombre: string,          // Input requerido
  categoria: "Repuesto",   // Valor fijo
}

// ⚠️ OPCIONALES (pueden estar vacíos)
{
  codProv: string,         // Código proveedor
  tipo: string,            // Tipo de repuesto
  ubicaciones: array,      // Puede ser []
  ubicacionesMapa: array,  // Puede ser []
  cantidad: number,        // Default 0
  cantidadInstalada: number, // Default 0
  minimo: number,          // Default 0
  optimo: number,          // Default 0
  precio: number,          // Default 0
  datosTecnicos: string,   // Puede estar vacío
  multimedia: array,       // Puede ser []
}

// 🤖 AUTO-CALCULADOS (no se ingresan manualmente)
{
  estado_ubicacion: string,   // Calculado en runtime
  progreso_flujo: string,     // Calculado en runtime
  ultimaModificacion: string, // Timestamp automático
}
```

### Tipos de Estado de Ubicación

```javascript
// estado_ubicacion: string
// Calculado por: app.calcularEstadoUbicacion(repuesto)

"sin_ubicacion"     // Sin ubicaciones[] ni ubicacionesMapa[]
"jerarquia_sola"    // Con ubicaciones[] pero sin ubicacionesMapa[]
"mapa_solo"         // Con ubicacionesMapa[] pero sin ubicaciones[]
"completo"          // Con ambos: ubicaciones[] Y ubicacionesMapa[]

// Lógica de cálculo:
function calcularEstadoUbicacion(repuesto) {
  const tieneJerarquia = repuesto.ubicaciones && repuesto.ubicaciones.length > 0;
  const tieneMapa = repuesto.ubicacionesMapa && repuesto.ubicacionesMapa.length > 0;
  
  if (tieneJerarquia && tieneMapa) return 'completo';
  if (tieneJerarquia) return 'jerarquia_sola';
  if (tieneMapa) return 'mapa_solo';
  return 'sin_ubicacion';
}
```

### Tipos de Progreso de Flujo

```javascript
// progreso_flujo: string
// Calculado por: app.calcularProgresoFlujo(repuesto)

"Borrador"             // Sin ubicación en jerarquía ni mapa
"Listo para ubicar"    // Con ubicación en jerarquía, sin mapa
"Ubicado"              // Con ubicación en mapa (completo)

// Lógica de cálculo:
function calcularProgresoFlujo(repuesto) {
  const estado = app.calcularEstadoUbicacion(repuesto);
  
  if (estado === 'sin_ubicacion') return 'Borrador';
  if (estado === 'jerarquia_sola') return 'Listo para ubicar';
  if (estado === 'mapa_solo' || estado === 'completo') return 'Ubicado';
  
  return 'Borrador'; // Fallback
}
```

### Ejemplos Reales del Sistema

#### Repuesto SIN Ubicación

```javascript
{
  "id": "1234567890123",
  "codSAP": "REP-NEW-001",
  "nombre": "Repuesto Nuevo Sin Ubicar",
  "categoria": "Repuesto",
  "ubicaciones": [],                    // ← Vacío
  "ubicacionesMapa": [],                // ← Vacío
  "cantidad": 10,
  "minimo": 5,
  "optimo": 15,
  "multimedia": [],
  "estado_ubicacion": "sin_ubicacion",  // ← Auto-calculado
  "progreso_flujo": "Borrador"          // ← Auto-calculado
}
```

#### Repuesto CON Jerarquía, SIN Mapa

```javascript
{
  "id": "1234567890124",
  "codSAP": "REP-PARTIAL-002",
  "nombre": "Repuesto Con Jerarquía Solamente",
  "categoria": "Repuesto",
  "ubicaciones": [
    {
      "areaGeneral": "Planta Industrial",
      "subArea": "Producción",
      "sistemaEquipo": "Línea 1",
      "cantidadEnUbicacion": 5
    }
  ],                                    // ← Con datos
  "ubicacionesMapa": [],                // ← Vacío
  "estado_ubicacion": "jerarquia_sola", // ← Auto-calculado
  "progreso_flujo": "Listo para ubicar" // ← Auto-calculado
}
```

#### Repuesto COMPLETO (Jerarquía + Mapa)

```javascript
{
  "id": "17613843384470",
  "codSAP": "REP-COMPLETE-003",
  "nombre": "Repuesto Completamente Ubicado",
  "categoria": "Repuesto",
  "ubicaciones": [
    {
      "areaGeneral": "Planta Principal",
      "subArea": "Filete",
      "sistemaEquipo": "Cinta Curva",
      "cantidadEnUbicacion": 4
    }
  ],                                    // ← Con datos
  "ubicacionesMapa": [
    {
      "tipo": "mapa",
      "mapaId": 1760411932641,
      "coordenadas": { "x": 3236.7, "y": 1675.2 }
    }
  ],                                    // ← Con datos
  "estado_ubicacion": "completo",       // ← Auto-calculado
  "progreso_flujo": "Ubicado"           // ← Auto-calculado
}
```

---

## 🗺️ ESTRUCTURA DE MAPA

### Modelo Completo

```javascript
{
  // ===== IDENTIFICACIÓN =====
  "id": 1760411932641,                  // Timestamp único
  "name": "Planta Principal",           // Nombre descriptivo
  
  // ===== IMAGEN =====
  "imagePath": "imagenes/mapas/map_1760411932641.png",
  "width": 9362,                        // Ancho en pixels
  "height": 6623,                       // Alto en pixels
  
  // ===== METADATOS =====
  "createdAt": "2025-10-14T03:18:52.886Z",
  "updatedAt": "2025-11-15T00:21:05.263Z",
  
  // ===== JERARQUÍA ASOCIADA =====
  "jerarquiaPath": [
    {
      "id": "AQ-IN",
      "nivel": "empresa"
    },
    {
      "id": "PCHO",
      "nivel": "area"
    }
  ],
  
  // ===== CONFIGURACIÓN =====
  "allowFreeLevel": false,              // Permitir sin jerarquía (debug)
  "mapLevel": "area"                    // Nivel en jerarquía: empresa | area | subArea | etc.
}
```

### Ejemplo Real: Mapa de Empresa

```javascript
{
  "id": 1763209400991,
  "name": "Recinto Aquachile Antarfood",
  "imagePath": "imagenes/mapas/map_1763209400991.png",
  "width": 18725,
  "height": 13245,
  "createdAt": "2025-11-15T12:23:21.221Z",
  "updatedAt": "2025-11-15T12:23:38.348Z",
  "jerarquiaPath": [
    {
      "id": "AQ-IN",
      "nivel": "empresa"
    }
  ],
  "allowFreeLevel": false,
  "mapLevel": "empresa"                 // ← Mapa de nivel empresa (vista general)
}
```

### Ejemplo Real: Mapa de Área

```javascript
{
  "id": 1760411932641,
  "name": "Planta Principal",
  "imagePath": "imagenes/mapas/map_1760411932641.png",
  "width": 9362,
  "height": 6623,
  "createdAt": "2025-10-14T03:18:52.886Z",
  "updatedAt": "2025-11-15T00:21:05.263Z",
  "jerarquiaPath": [
    {
      "id": "AQ-IN",
      "nivel": "empresa"
    },
    {
      "id": "PCHO",
      "nivel": "area"                   // ← Mapa de nivel área (detallado)
    }
  ],
  "allowFreeLevel": false,
  "mapLevel": "area"
}
```

### Niveles de Mapa Posibles

```javascript
// mapLevel: string

"empresa"       // Vista general de toda la empresa
"area"          // Vista de un área específica (más común)
"subArea"       // Vista de sub-área (detalle)
"sistema"       // Vista de sistema específico (muy detallado)
// ... más niveles según jerarquía

// Uso:
// - Mapas de nivel empresa: Planos generales, layout completo
// - Mapas de nivel área: Detalles de producción, secciones
// - Mapas de nivel sistema: Diagramas técnicos, equipos específicos
```

---

## 📍 ESTRUCTURA DE ZONA

### Modelo Completo

```javascript
{
  // ===== IDENTIFICACIÓN =====
  "id": 1761002703272,                  // Timestamp único
  "mapId": 1760411932641,               // ID del mapa padre
  "name": "Pocket Grader",              // Nombre de la zona
  
  // ===== VISUAL =====
  "color": "#10b981",                   // Color de relleno (hex)
  "opacity": 0.35,                      // Opacidad (0.0 - 1.0)
  
  // ===== GEOMETRÍA =====
  "points": [
    {
      "x": 3236.779313981518,
      "y": 1675.254350186932
    },
    {
      "x": 3433.928228080213,
      "y": 1678.6599826724691
    },
    {
      "x": 3437.870555089753,
      "y": 1836.3504588629453
    },
    {
      "x": 3239.116701597045,
      "y": 1836.6481817672113
    }
  ],                                    // Polígono cerrado (último punto = primer punto)
  
  // ===== JERARQUÍA ASOCIADA =====
  "jerarquia": {
    "nivel1": "Aquachile Antarfood",    // Empresa
    "nivel2": "Planta Principal",       // Área General
    "nivel3": "Eviscerado",             // Sub-Área
    "nivel4": "Grader",                 // Sistema/Equipo
    "nivel5": "Pocket 1 al 4",          // Sub-Sistema
    "nivel6": "Sistema Neumático",      // Sección
    "nivel7": null                      // Sub-Sección (opcional)
  },
  
  // ===== EQUIPOS/REPUESTOS =====
  "equipos": [],                        // Array de IDs de repuestos en esta zona
  
  // ===== METADATOS =====
  "createdAt": "2025-10-20T23:25:03.272Z",
  "updatedAt": "2025-10-21T22:47:43.198Z",
  
  // ===== CATEGORIZACIÓN =====
  "category": "maquina",                // maquina | area | storage | office | etc.
  
  // ===== POSICIÓN DE LABEL =====
  "labelOffsetX": 0,                    // Offset X del label (pixels)
  "labelOffsetY": 0                     // Offset Y del label (pixels)
}
```

### Tipos de Categorías

```javascript
// category: string

"maquina"       // Máquina o equipo
"area"          // Área de trabajo
"storage"       // Almacenamiento/bodega
"office"        // Oficina
"bathroom"      // Baño
"hallway"       // Pasillo
"parking"       // Estacionamiento
"green_space"   // Área verde
"danger_zone"   // Zona peligrosa
"restricted"    // Acceso restringido

// Uso:
// - Filtros por categoría en UI
// - Colores automáticos según tipo
// - Iconos específicos por categoría
```

### Detección de Click en Zona (Hit Detection)

```javascript
// Algoritmo: Ray Casting para polígonos
function isPointInZone(x, y, zone) {
  const points = zone.points;
  let inside = false;
  
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

// Uso en mapController:
canvas.addEventListener('click', (e) => {
  const mapX = convertScreenToMapX(e.clientX);
  const mapY = convertScreenToMapY(e.clientY);
  
  const zona = mapStorage.state.zonas.find(z => 
    z.mapId === currentMapId && isPointInZone(mapX, mapY, z)
  );
  
  if (zona) {
    console.log('Click en zona:', zona.name);
    showZoneInfo(zona);
  }
});
```

---

## 🌳 ESTRUCTURA DE JERARQUÍA

### Jerarquía de 8 Niveles

```javascript
// Niveles disponibles:
1. Empresa/Planta
2. Área General
3. Sub-Área
4. Sistema/Equipo
5. Sub-Sistema
6. Sección
7. Sub-Sección
8. Detalle

// Ejemplo completo:
Aquachile Antarfood Chonchi              // Nivel 1: Empresa
└─ Planta Principal                      // Nivel 2: Área General
   └─ Eviscerado                         // Nivel 3: Sub-Área
      └─ Grader                          // Nivel 4: Sistema/Equipo
         └─ Pocket 1 al 4                // Nivel 5: Sub-Sistema
            └─ Sistema Neumático         // Nivel 6: Sección
               └─ Válvulas de Control    // Nivel 7: Sub-Sección
                  └─ Válvula Principal   // Nivel 8: Detalle
```

### Modelo de Jerarquía Anidada

```javascript
// app.jerarquiaAnidada (estructura global)
{
  "areas": [
    {
      "id": "empresa_0",                // ID único del nodo
      "nombre": "Aquachile Antarfood Chonchi",
      "level": "empresa",
      "children": [
        {
          "id": "empresa_0_area_0",
          "nombre": "Planta Principal",
          "level": "area",
          "children": [
            {
              "id": "empresa_0_area_0_subarea_0",
              "nombre": "Eviscerado",
              "level": "subArea",
              "children": [
                {
                  "id": "empresa_0_area_0_subarea_0_sistema_0",
                  "nombre": "Grader",
                  "level": "sistema",
                  "children": [
                    {
                      "id": "empresa_0_area_0_subarea_0_sistema_0_subsistema_0",
                      "nombre": "Pocket 1 al 4",
                      "level": "subSistema",
                      "children": [
                        {
                          "id": "empresa_0_area_0_subarea_0_sistema_0_subsistema_0_seccion_0",
                          "nombre": "Sistema Neumático",
                          "level": "seccion",
                          "children": []
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "empresa_0_area_1",
          "nombre": "Planta Secundaria",
          "level": "area",
          "children": []
        }
      ]
    }
  ]
}
```

### Construcción de NodeId

```javascript
// Formato: nivel_índice1_nivel_índice2_...

// Ejemplos:
"empresa_0"                             // Primera empresa (índice 0)
"empresa_0_area_1"                      // Segunda área de primera empresa
"empresa_0_area_1_subarea_2"           // Tercera sub-área de segunda área
"empresa_0_area_1_subarea_2_sistema_3" // Cuarto sistema de tercera sub-área

// Lógica de construcción:
function construirNodeId(path) {
  // path = ['empresa', 0, 'area', 1, 'subarea', 2]
  let id = '';
  for (let i = 0; i < path.length; i += 2) {
    const level = path[i];      // 'empresa', 'area', 'subarea'
    const index = path[i + 1];  // 0, 1, 2
    id += (id ? '_' : '') + level + '_' + index;
  }
  return id;
  // → "empresa_0_area_1_subarea_2"
}
```

### Parsing de NodeId a Ubicación

```javascript
// Función: app.extraerUbicacionDesdeNodoId(nodeId)
// Líneas: 48580-48730 en index.html

function extraerUbicacionDesdeNodoId(nodeId) {
  // Ejemplo input: "empresa_0_area_1_subarea_2_sistema_3"
  
  // 1. Split por '_' y parsear niveles
  const parts = nodeId.split('_');
  // → ['empresa', '0', 'area', '1', 'subarea', '2', 'sistema', '3']
  
  // 2. Crear pares [nivel, índice]
  const pairs = [];
  for (let i = 0; i < parts.length; i += 2) {
    pairs.push({
      level: parts[i],        // 'empresa', 'area', etc.
      index: parseInt(parts[i + 1])  // 0, 1, 2, etc.
    });
  }
  // → [
  //     { level: 'empresa', index: 0 },
  //     { level: 'area', index: 1 },
  //     { level: 'subarea', index: 2 },
  //     { level: 'sistema', index: 3 }
  //   ]
  
  // 3. Navegar jerarquía anidada
  let current = app.jerarquiaAnidada.areas[pairs[0].index]; // Empresa
  const ubicacion = {
    planta: current.nombre
  };
  
  // 4. Recorrer niveles restantes
  for (let i = 1; i < pairs.length; i++) {
    const pair = pairs[i];
    const child = current.children[pair.index];
    
    if (!child) {
      console.error('No se encontró child en índice', pair.index);
      break;
    }
    
    // Mapear nivel a campo de ubicación
    switch (pair.level) {
      case 'area':
        ubicacion.areaGeneral = child.nombre;
        break;
      case 'subarea':
        ubicacion.subArea = child.nombre;
        break;
      case 'sistema':
        ubicacion.sistemaEquipo = child.nombre;
        break;
      case 'subsistema':
        ubicacion.subSistema = child.nombre;
        break;
      case 'seccion':
        ubicacion.seccion = child.nombre;
        break;
      case 'subseccion':
        ubicacion.subSeccion = child.nombre;
        break;
      case 'detalle':
        ubicacion.detalle = child.nombre;
        break;
    }
    
    current = child;
  }
  
  return ubicacion;
  // → {
  //     planta: "Aquachile Antarfood Chonchi",
  //     areaGeneral: "Planta Principal",
  //     subArea: "Eviscerado",
  //     sistemaEquipo: "Grader"
  //   }
}
```

### Áreas Genéricas

```javascript
// IDs especiales para áreas sin jerarquía
"generic_root_area_0"           // Primera área genérica
"generic_root_area_1"           // Segunda área genérica
"generic_root_area_0_1"         // Primer sub-nivel de primera área

// Ejemplo completo:
{
  "id": "generic_root_area_0",
  "nombre": "Uso General",
  "level": "generic",
  "children": [
    {
      "id": "generic_root_area_0_0",
      "nombre": "Pernos y Tornillos",
      "children": []
    },
    {
      "id": "generic_root_area_0_1",
      "nombre": "Desoxidantes",
      "children": []
    }
  ]
}

// Visual en árbol:
📦 Uso General (generic)
  ├─ 📦 Pernos y Tornillos
  └─ 📦 Desoxidantes

// VS organizacional:
🏢 Aquachile Antarfood (empresa)
  └─ 🏭 Planta Principal (área)
     └─ ⚙️ Eviscerado (sub-área)
```

---

## 💾 LOCALSTORAGE

### Claves y Estructuras

```javascript
// ===== DATOS PRINCIPALES =====

// Repuestos (backup de FileSystem)
localStorage.getItem('inventario')
// Formato: JSON array de repuestos
// Tamaño: ~500 KB (57 repuestos con multimedia)

// Mapas (backup de FileSystem)
localStorage.getItem('mapas')
// Formato: JSON array de mapas
// Tamaño: ~5 KB (2 mapas)

// Zonas (backup de FileSystem)
localStorage.getItem('zonas')
// Formato: JSON array de zonas
// Tamaño: ~30 KB (30 zonas)

// ===== ESTADOS DE UI =====

// Estado de expansión del árbol de jerarquía
localStorage.getItem('jerarquia_expand_state')
// Formato: JSON object { nodeId: boolean }
// Ejemplo:
{
  "empresa_0": true,                    // Empresa expandida
  "empresa_0_area_0": true,             // Área expandida
  "empresa_0_area_0_subarea_0": false,  // Sub-área colapsada
  "generic_root_area_0": true           // Área genérica expandida
}

// Estado de expansión de listas de repuestos
localStorage.getItem('jerarquia_repuestos_expand_state')
// Formato: JSON object { nodeId: boolean }
// Ejemplo:
{
  "empresa_0_area_0_subarea_0_sistema_0": true,  // Lista visible
  "empresa_0_area_0_subarea_0_sistema_1": false  // Lista oculta
}

// ===== CONFIGURACIÓN DE USUARIO =====

// Modo de vista
localStorage.getItem('viewMode')
// Valores: 'auto' | 'mobile' | 'desktop'
// Default: 'auto'

// Items por página
localStorage.getItem('itemsPerPage')
// Valores: 'auto' | número (18, 21, 24, etc.)
// Default: 'auto'

// Paleta de jerarquía
localStorage.getItem('currentJerarquiaPalette')
// Valores: 'palette-visual' | 'palette-8'
// Default: 'palette-visual'

// ===== NOTIFICACIONES =====

// Notificaciones persistentes
localStorage.getItem('notifications')
// Formato: JSON array de objetos
// Ejemplo:
[
  {
    "id": "notif_1732742400000",
    "type": "success",
    "title": "Repuesto guardado",
    "message": "PARADA EMERGENCIA guardado exitosamente",
    "timestamp": "2025-11-27T10:00:00.000Z",
    "read": false
  }
]

// ===== CACHÉ =====

// Thumbnails de mapas
localStorage.getItem('map_thumbnails')
// Formato: JSON object { mapId: base64DataUrl }

// Stats de mapas (histórico)
localStorage.getItem('mapStatsPrevious')
// Formato: JSON object { mapas: 2, areas: 30, marcadores: 15 }

// Historial de búsqueda
localStorage.getItem('search_history')
// Formato: JSON array de strings
```

### Funciones de Gestión

```javascript
// Guardar en localStorage
function saveToLocalStorage(key, data) {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
    console.log(`✅ Guardado en localStorage: ${key} (${json.length} bytes)`);
  } catch (error) {
    console.error('❌ Error guardando en localStorage:', error);
    if (error.name === 'QuotaExceededError') {
      alert('⚠️ Almacenamiento lleno. Limpia datos antiguos.');
    }
  }
}

// Cargar desde localStorage
function loadFromLocalStorage(key, defaultValue = null) {
  try {
    const json = localStorage.getItem(key);
    if (json === null) return defaultValue;
    return JSON.parse(json);
  } catch (error) {
    console.error('❌ Error cargando desde localStorage:', error);
    return defaultValue;
  }
}

// Limpiar localStorage (útil para debugging)
function clearLocalStorage() {
  const keysToKeep = [
    'fileSystemDirectoryHandle',  // No borrar handle de FileSystem
    'viewMode',                    // Mantener configuración usuario
    'itemsPerPage'
  ];
  
  Object.keys(localStorage).forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Eliminado: ${key}`);
    }
  });
}
```

---

## 🗄️ INDEXEDDB

### Base de Datos: `inventario-db`

```javascript
// Configuración
const DB_NAME = 'inventario-db';
const DB_VERSION = 1;

// Object Stores (tablas)
'directory-handles'  // Handles de FileSystem Access API
'images'             // Blob URLs de imágenes
'thumbnails'         // Miniaturas generadas
```

### Object Store: `directory-handles`

```javascript
// Almacena handles de FileSystem Access API
{
  key: 'inventario-storage',        // ID único
  value: FileSystemDirectoryHandle  // Handle de carpeta
}

// Uso:
async function storeDirectoryHandle(handle) {
  const db = await openDB();
  const tx = db.transaction('directory-handles', 'readwrite');
  await tx.objectStore('directory-handles').put(handle, 'inventario-storage');
  await tx.done;
}

async function getDirectoryHandle() {
  const db = await openDB();
  return await db.get('directory-handles', 'inventario-storage');
}
```

### Object Store: `images`

```javascript
// Almacena blob URLs de imágenes cargadas
{
  key: 'imagenes/1763398441608_Pendiente_Chumacera_Ovalada.webp',
  value: {
    url: 'blob:http://localhost:8080/abc123-def456',
    timestamp: 1732742400000,
    size: 109078
  }
}

// Uso:
async function storeBlobUrl(filename, blobUrl, size) {
  const db = await openDB();
  const tx = db.transaction('images', 'readwrite');
  await tx.objectStore('images').put({
    url: blobUrl,
    timestamp: Date.now(),
    size: size
  }, filename);
  await tx.done;
}

async function getBlobUrl(filename) {
  const db = await openDB();
  const record = await db.get('images', filename);
  return record ? record.url : null;
}
```

### Object Store: `thumbnails`

```javascript
// Almacena thumbnails de mapas (100x100px)
{
  key: 1760411932641,  // mapId
  value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
}

// Uso:
async function storeThumbnail(mapId, dataUrl) {
  const db = await openDB();
  const tx = db.transaction('thumbnails', 'readwrite');
  await tx.objectStore('thumbnails').put(dataUrl, mapId);
  await tx.done;
}

async function getThumbnail(mapId) {
  const db = await openDB();
  return await db.get('thumbnails', mapId);
}
```

---

## 📂 FILESYSTEM

### Estructura de Carpetas

```
INVENTARIO_STORAGE/
├── inventario.json         (57 repuestos, ~500 KB)
├── mapas.json             (2 mapas, ~5 KB)
├── zonas.json             (30 zonas, ~30 KB)
├── repuestos.json         (backup legacy)
├── imagenes/
│   ├── 1763398441608_Pendiente_Chumacera_Ovalada_de_2_pernos__foto1.webp
│   ├── 1763398455431_Pendiente_Cinta_Curva_foto1.webp
│   └── ... (52 archivos, ~15 MB total)
│   └── mapas/
│       ├── map_1760411932641.png  (9362x6623, ~8 MB)
│       └── map_1763209400991.png  (18725x13245, ~25 MB)
├── backups/
│   ├── automaticos/
│   │   ├── backup_2025-11-19_02-19-00/
│   │   ├── backup_2025-11-19_02-35-36/
│   │   └── ... (últimos 20 backups)
│   ├── fase3_cleanup/
│   ├── mapas/
│   ├── migracion/
│   ├── unificacion/
│   └── zonas/
└── logs/                   (vacío - logs eliminados)
```

### Formato de Archivos JSON

```javascript
// inventario.json
[
  { ...repuesto1 },
  { ...repuesto2 },
  ...
]

// mapas.json
[
  { ...mapa1 },
  { ...mapa2 }
]

// zonas.json
[
  { ...zona1 },
  { ...zona2 },
  ...
]
```

### Sistema de Backups Automáticos

```javascript
// Estructura de backup:
backups/automaticos/backup_YYYY-MM-DD_HH-MM-SS/
├── inventario.json
├── mapas.json
└── zonas.json

// Ejemplo:
backups/automaticos/backup_2025-11-19_02-19-00/
├── inventario.json  (snapshot del momento)
├── mapas.json
└── zonas.json

// Límite: Últimos 20 backups
// Antigüedad: Se eliminan automáticamente los más viejos
```

---

## 🔄 SINCRONIZACIÓN DE DATOS

### Flujo de Guardado

```
1. Usuario modifica datos (crear/editar repuesto)
   ↓
2. app.guardarTodo() invocada
   ↓
3. Guardar en FileSystem (primario)
   await fsManager.saveInventario(app.repuestos)
   ↓
4. Guardar en localStorage (backup)
   localStorage.setItem('inventario', JSON.stringify(app.repuestos))
   ↓
5. Crear backup automático (si hay inactividad)
   backupManager.marcarCambiosPendientes()
   ↓
6. Emitir evento de sincronización
   appEvents.dispatchEvent('data-changed')
   ↓
7. ✅ Datos persistidos en 3 lugares:
   - FileSystem (primario)
   - localStorage (backup rápido)
   - Backup automático (histórico)
```

### Flujo de Carga

```
1. Aplicación inicia
   ↓
2. Verificar FileSystem conectado
   if (fsManager.isFileSystemMode) { ... }
   ↓
3. Cargar desde FileSystem (primario)
   app.repuestos = await fsManager.loadInventario()
   ↓
4. Si FileSystem falla → cargar desde localStorage
   app.repuestos = JSON.parse(localStorage.getItem('inventario'))
   ↓
5. Restaurar estados de UI
   restoreTreeState()
   restoreFilters()
   ↓
6. Renderizar UI
   app.renderInventario()
   app.renderJerarquiaTree()
   ↓
7. ✅ Aplicación lista
```

---

## 📚 PRÓXIMOS PASOS

**Continúa con:** [`FUNCIONES_CORE.md`](./FUNCIONES_CORE.md) para ver las funciones principales con código completo.

---

**Documentación de Modelos de Datos Completa** ✅


====================================================================================================

################################################################################
# DOCUMENTO 3: SPARK_03_INVENTARIO.md
# Líneas: 662
################################################################################

# 📦 Tab Inventario - Sistema CRUD Completo

**Módulo 3/8** - Tab Inventario y gestión de repuestos  
**Líneas en index.html:** 36800-38500

---

## 📋 CONTENIDO

1. [Vista General](#vista-general)
2. [Grid Responsive](#grid-responsive)
3. [Renderizado de Tarjetas](#renderizado-de-tarjetas)
4. [Sistema CRUD](#sistema-crud)
5. [Filtros y Búsqueda](#filtros-y-búsqueda)
6. [Paginación](#paginación)
7. [Lightbox](#lightbox)

---

## 🎯 VISTA GENERAL

### Componentes Principales

```
TAB INVENTARIO
├── Header con botones
│   ├── [+ Agregar Repuesto]
│   ├── [🔍 Buscar]
│   └── [Filtros: Área, Equipo, Tipo, Stock]
├── Grid de tarjetas (6 columnas)
│   ├── Tarjeta 1 (imagen + info + botones)
│   ├── Tarjeta 2
│   └── ... (18 items por página)
├── Paginación (top + bottom)
│   ├── [◀ Anterior]
│   ├── [1] [2] [3] ...
│   └── [Siguiente ▶]
└── Modal de creación/edición
    └── Wizard de 7 pasos
```

### HTML Base

```html
<!-- Línea 15042 en index.html -->
<div id="inventarioContent" class="tab-content">
  <!-- Botones superiores -->
  <div style="display: flex; gap: 12px; margin-bottom: 16px;">
    <button onclick="app.abrirModalCrear()" class="btn btn-primary-cta">
      <span class="btn-icon">+</span>
      <span class="btn-text">Agregar Repuesto</span>
    </button>
    
    <input 
      type="text" 
      id="searchBox"
      placeholder="🔍 Buscar repuesto..."
      oninput="app.handleSearch(this.value)">
    
    <!-- Filtros -->
    <select id="filterArea" onchange="app.renderInventario()">
      <option value="">Todas las áreas</option>
      <!-- Opciones dinámicas -->
    </select>
  </div>

  <!-- Paginación superior -->
  <div id="topPagination" class="pagination-controls"></div>

  <!-- Grid de tarjetas -->
  <div id="cardsGrid" class="cards-grid"></div>

  <!-- Paginación inferior -->
  <div id="pagination" class="pagination-controls"></div>
</div>
```

---

## 📐 GRID RESPONSIVE

### Sistema de 6 Columnas

```css
/* Línea 2500 en CSS embebido */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 6 columnas en desktop */
  gap: 16px;
  padding: 0;
}

/* Breakpoints responsive */
@media (max-width: 1800px) {
  .cards-grid { grid-template-columns: repeat(5, 1fr); } /* 5 columnas */
}

@media (max-width: 1400px) {
  .cards-grid { grid-template-columns: repeat(4, 1fr); } /* 4 columnas */
}

@media (max-width: 1024px) {
  .cards-grid { grid-template-columns: repeat(3, 1fr); } /* 3 columnas */
}

@media (max-width: 768px) {
  .cards-grid { grid-template-columns: repeat(2, 1fr); } /* 2 columnas */
}

@media (max-width: 480px) {
  .cards-grid { grid-template-columns: 1fr; } /* 1 columna */
}
```

### Cálculo Automático de Items por Página

```javascript
// Línea 30650 en index.html
getItemsPerPage() {
  if (this.itemsPerPage !== 'auto') {
    return parseInt(this.itemsPerPage);
  }

  // Cálculo automático basado en ancho de ventana
  const width = window.innerWidth;
  
  let columnas = 6;
  if (width <= 1800) columnas = 5;
  if (width <= 1400) columnas = 4;
  if (width <= 1024) columnas = 3;
  if (width <= 768) columnas = 2;
  if (width <= 480) columnas = 1;

  const filas = 3; // Siempre 3 filas visibles
  return columnas * filas; // 6×3 = 18 items por página
}
```

---

## 🎴 RENDERIZADO DE TARJETAS

### Función Principal: renderCards()

```javascript
// Línea 36858 en index.html
async renderCards(repuestos) {
  const grid = document.getElementById('cardsGrid');
  
  if (repuestos.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1;">No hay repuestos</div>';
    return;
  }

  // 1. Cargar imágenes en paralelo
  const repuestosWithImages = await Promise.all(repuestos.map(async (r) => {
    const imageUrl = await this.getFirstImage(r.multimedia || []);
    return { ...r, imageUrl };
  }));

  // 2. Renderizar HTML
  grid.innerHTML = repuestosWithImages.map(r => {
    return this.renderCardHTML(r);
  }).join('');
}
```

### Estructura de una Tarjeta

```javascript
renderCardHTML(r) {
  // Validar estado
  const tieneJerarquia = !!(r.ubicaciones?.length > 0);
  const tieneMapa = !!(r.ubicacionesMapa?.length > 0);
  
  // Calcular stock
  const minimo = r.minimo || 5;
  const cantidad = r.cantidad || 0;
  const stockStatus = cantidad === 0 ? 'cero' : 
                      cantidad < minimo ? 'critico' : 'ok';

  return `
    <div class="repuesto-card">
      <!-- Imagen -->
      <div class="card-image" data-action="lightbox" data-id="${r.id}">
        ${r.imageUrl ? 
          `<img src="${r.imageUrl}" alt="${r.nombre}">` :
          '<div class="no-image">Sin imagen</div>'
        }
      </div>

      <!-- Contenido -->
      <div class="card-content">
        <h3>${r.nombre}</h3>
        <p>Código: ${r.codSAP}</p>
        <p>Stock: ${cantidad} / ${minimo}</p>
        
        <!-- Bloque de ubicación (NUEVO v6.0.1) -->
        ${this.renderUbicacionBlock(r)}
        
        <!-- Botones -->
        <button data-action="edit" data-id="${r.id}">Editar</button>
        <button data-action="delete" data-id="${r.id}">Eliminar</button>
      </div>
    </div>
  `;
}
```

### Bloque de Ubicación (v6.0.1)

```javascript
// Línea 37200 en index.html
renderUbicacionBlock(repuesto) {
  const estado = this.calcularEstadoUbicacion(repuesto);
  
  // SIN UBICACIÓN
  if (estado === 'sin_ubicacion') {
    return `
      <div class="ubicacion-block" style="background: #fef3c7; border-left: 3px solid #f59e0b;">
        <div class="ubicacion-badge" style="background: #f59e0b;">
          ⚠️ Borrador
        </div>
        <div class="ubicacion-warning">Sin ubicación en jerarquía</div>
        <button data-action="asignar-jerarquia" data-id="${repuesto.id}">
          + Asignar a Jerarquía
        </button>
      </div>
    `;
  }
  
  // CON UBICACIÓN
  const ubicacion = repuesto.ubicaciones[0];
  const mapa = repuesto.ubicacionesMapa?.[0];
  
  return `
    <div class="ubicacion-block" style="background: #dbeafe; border-left: 3px solid #3b82f6;">
      <div class="ubicacion-badge" style="background: ${estado === 'completo' ? '#10b981' : '#f59e0b'};">
        ${this.calcularProgresoFlujo(repuesto)}
      </div>
      
      <!-- Jerarquía -->
      <div class="ubicacion-jerarquia">
        <strong>📍 Ubicación:</strong>
        ${ubicacion.areaGeneral} → ${ubicacion.subArea} → ${ubicacion.sistemaEquipo}
      </div>
      
      <!-- Mapa (si existe) -->
      ${mapa ? `
        <div class="ubicacion-mapa">
          <strong>🗺️ Mapa:</strong>
          Coordenadas: (${mapa.coordenadas.x.toFixed(1)}, ${mapa.coordenadas.y.toFixed(1)})
        </div>
      ` : ''}
      
      <!-- Botones de navegación -->
      <div class="ubicacion-buttons">
        <button data-action="ver-jerarquia" data-id="${repuesto.id}">
          🌳 Ver en Jerarquía
        </button>
        ${mapa ? `
          <button data-action="ver-mapa" data-id="${repuesto.id}">
            🗺️ Ver en Mapa
          </button>
        ` : `
          <button data-action="asignar-mapa" data-id="${repuesto.id}">
            + Asignar Mapa
          </button>
        `}
      </div>
    </div>
  `;
}
```

---

## ✏️ SISTEMA CRUD

### Crear Repuesto

```javascript
// Línea 40200 en index.html
abrirModalCrear() {
  this.currentEditingId = null;
  this.wizardState.currentStep = 1;
  
  // Limpiar formulario
  document.getElementById('formCodSAP').value = '';
  document.getElementById('formNombre').value = '';
  document.getElementById('formCantidad').value = '0';
  
  // Mostrar modal
  const modal = document.getElementById('modal');
  modal.style.display = 'flex';
  
  // Renderizar step 1
  this.renderWizardStep(1);
}
```

### Guardar Repuesto

```javascript
// Línea 41500 en index.html
async guardarRepuesto() {
  // 1. Validar formulario
  if (!this.validarFormulario()) {
    return;
  }

  // 2. Recopilar datos
  const repuesto = {
    id: this.currentEditingId || Date.now().toString(),
    codSAP: document.getElementById('formCodSAP').value,
    nombre: document.getElementById('formNombre').value,
    categoria: 'Repuesto',
    ubicaciones: this.recopilarUbicaciones(),
    multimedia: this.currentMultimedia,
    cantidad: parseInt(document.getElementById('formCantidad').value) || 0,
    minimo: parseInt(document.getElementById('formMinimo').value) || 5,
    optimo: parseInt(document.getElementById('formOptimo').value) || 10,
    ultimaModificacion: new Date().toISOString()
  };

  // 3. Calcular estados (v6.0.1)
  repuesto.estado_ubicacion = this.calcularEstadoUbicacion(repuesto);
  repuesto.progreso_flujo = this.calcularProgresoFlujo(repuesto);

  // 4. Agregar o actualizar
  if (this.currentEditingId) {
    const index = this.repuestos.findIndex(r => r.id === this.currentEditingId);
    this.repuestos[index] = repuesto;
  } else {
    this.repuestos.push(repuesto);
  }

  // 5. Guardar en FileSystem
  await this.guardarTodo();

  // 6. Re-renderizar
  await this.renderInventario();

  // 7. Cerrar modal
  this.cerrarModal();

  // 8. Toast
  this.showToast('✅ Repuesto guardado', 'success');
}
```

### Editar Repuesto

```javascript
// Línea 42800 en index.html
editarRepuesto(id) {
  const repuesto = this.repuestos.find(r => r.id === id);
  if (!repuesto) return;

  this.currentEditingId = id;
  
  // Cargar datos en formulario
  document.getElementById('formCodSAP').value = repuesto.codSAP || '';
  document.getElementById('formNombre').value = repuesto.nombre || '';
  document.getElementById('formCantidad').value = repuesto.cantidad || 0;
  document.getElementById('formMinimo').value = repuesto.minimo || 5;
  document.getElementById('formOptimo').value = repuesto.optimo || 10;
  
  // Cargar multimedia
  this.currentMultimedia = [...(repuesto.multimedia || [])];
  this.renderMultimediaPreview();
  
  // Mostrar modal
  const modal = document.getElementById('modal');
  modal.style.display = 'flex';
  
  this.renderWizardStep(1);
}
```

### Eliminar Repuesto

```javascript
// Línea 43200 en index.html
async eliminarRepuesto(id) {
  const repuesto = this.repuestos.find(r => r.id === id);
  if (!repuesto) return;

  // Confirmar
  const confirmar = confirm(
    `¿Eliminar "${repuesto.nombre}"?\n\nEsta acción no se puede deshacer.`
  );
  
  if (!confirmar) return;

  // Eliminar imágenes físicas del FileSystem
  if (repuesto.multimedia && repuesto.multimedia.length > 0) {
    for (const media of repuesto.multimedia) {
      if (media.isFileSystem) {
        try {
          await fsManager.deleteFile(media.url);
        } catch (error) {
          console.warn('No se pudo eliminar archivo:', media.url);
        }
      }
    }
  }

  // Eliminar del array
  this.repuestos = this.repuestos.filter(r => r.id !== id);

  // Guardar
  await this.guardarTodo();

  // Re-renderizar
  await this.renderInventario();

  // Toast
  this.showToast('🗑️ Repuesto eliminado', 'info');
}
```

---

## 🔍 FILTROS Y BÚSQUEDA

### Función de Filtrado

```javascript
// Línea 36780 en index.html
getFilteredRepuestos() {
  const searchQuery = document.getElementById('searchBox')?.value.toLowerCase() || '';
  const filterArea = document.getElementById('filterArea')?.value || '';
  const filterEquipo = document.getElementById('filterEquipo')?.value || '';
  const filterTipo = document.getElementById('filterTipo')?.value || '';
  const filterStock = document.getElementById('filterStock')?.value || '';

  return this.repuestos.filter(r => {
    // Búsqueda en nombre, código, descripción
    const matchSearch = !searchQuery || 
      r.nombre?.toLowerCase().includes(searchQuery) ||
      r.codSAP?.toLowerCase().includes(searchQuery) ||
      r.datosTecnicos?.toLowerCase().includes(searchQuery);

    // Filtro por área
    const matchArea = !filterArea || 
      r.areaGeneral === filterArea ||
      (r.ubicaciones?.[0]?.areaGeneral === filterArea);

    // Filtro por equipo
    const matchEquipo = !filterEquipo || 
      r.sistemaEquipo === filterEquipo ||
      (r.ubicaciones?.[0]?.sistemaEquipo === filterEquipo);

    // Filtro por tipo
    const matchTipo = !filterTipo || r.tipo === filterTipo;

    // Filtro por stock
    let matchStock = true;
    const minimo = r.minimo || 5;
    if (filterStock === 'agotado') {
      matchStock = r.cantidad === 0;
    } else if (filterStock === 'critico') {
      matchStock = r.cantidad > 0 && r.cantidad < minimo;
    } else if (filterStock === 'ok') {
      matchStock = r.cantidad >= minimo;
    }

    return matchSearch && matchArea && matchEquipo && matchTipo && matchStock;
  });
}
```

### Búsqueda en Tiempo Real

```javascript
// Línea 37650 en index.html
handleSearch(query) {
  // Actualizar página a 1
  this.currentPage = 1;
  
  // Re-renderizar con filtros
  this.renderInventario();
  
  // Guardar en historial
  if (query && query.length > 2) {
    this.saveSearchHistory(query);
  }
}
```

---

## 📄 PAGINACIÓN

### Renderizado de Controles

```javascript
// Línea 38400 en index.html
updatePagination() {
  const itemsPerPage = this.getItemsPerPage();
  const totalPages = Math.ceil(this.filteredRepuestos.length / itemsPerPage);
  
  const paginationHTML = `
    <div class="pagination-controls">
      <!-- Selector de items por página -->
      <div>
        <label>Items por página:</label>
        <select onchange="app.changeItemsPerPage(this.value)">
          <option value="auto" ${this.itemsPerPage === 'auto' ? 'selected' : ''}>
            Auto (${itemsPerPage})
          </option>
          <option value="18" ${this.itemsPerPage === '18' ? 'selected' : ''}>18</option>
          <option value="24" ${this.itemsPerPage === '24' ? 'selected' : ''}>24</option>
          <option value="36" ${this.itemsPerPage === '36' ? 'selected' : ''}>36</option>
        </select>
      </div>

      <!-- Botones de navegación -->
      <div class="pagination-nav">
        <button 
          onclick="app.goToPage(${this.currentPage - 1})"
          ${this.currentPage === 1 ? 'disabled' : ''}>
          ◀ Anterior
        </button>

        ${this.renderPageNumbers(totalPages)}

        <button 
          onclick="app.goToPage(${this.currentPage + 1})"
          ${this.currentPage === totalPages ? 'disabled' : ''}>
          Siguiente ▶
        </button>
      </div>

      <!-- Info -->
      <div class="pagination-info">
        Mostrando ${(this.currentPage - 1) * itemsPerPage + 1}-${Math.min(this.currentPage * itemsPerPage, this.filteredRepuestos.length)} 
        de ${this.filteredRepuestos.length} repuestos
      </div>
    </div>
  `;

  // Actualizar ambas paginaciones (top + bottom)
  document.getElementById('topPagination').innerHTML = paginationHTML;
  document.getElementById('pagination').innerHTML = paginationHTML;
}
```

### Navegación

```javascript
// Línea 38650 en index.html
goToPage(page) {
  const itemsPerPage = this.getItemsPerPage();
  const totalPages = Math.ceil(this.filteredRepuestos.length / itemsPerPage);
  
  if (page < 1 || page > totalPages) return;
  
  this.currentPage = page;
  this.renderInventario();
  
  // Scroll al top del grid
  document.getElementById('cardsGrid').scrollIntoView({ behavior: 'smooth' });
}

changeItemsPerPage(value) {
  this.itemsPerPage = value;
  this.currentPage = 1;
  localStorage.setItem('itemsPerPage', value);
  this.renderInventario();
}
```

---

## 🖼️ LIGHTBOX

### Abrir Lightbox

```javascript
// Línea 39200 en index.html
abrirLightbox(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto || !repuesto.multimedia || repuesto.multimedia.length === 0) {
    return;
  }

  this.lightboxMedias = repuesto.multimedia.filter(m => m.type === 'image');
  this.lightboxIndex = 0;

  const lightbox = document.getElementById('lightbox');
  lightbox.style.display = 'flex';
  
  this.renderLightboxImage();
}
```

### Navegación con Zoom

```javascript
// Línea 39350 en index.html
renderLightboxImage() {
  const media = this.lightboxMedias[this.lightboxIndex];
  if (!media) return;

  const lightbox = document.getElementById('lightbox');
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <!-- Header -->
      <div class="lightbox-header">
        <span>${this.lightboxIndex + 1} / ${this.lightboxMedias.length}</span>
        <button onclick="app.cerrarLightbox()">✕</button>
      </div>

      <!-- Imagen con zoom -->
      <div class="lightbox-image-container">
        <img 
          id="lightboxImg"
          src="${media.url}" 
          alt="${media.name}"
          style="transform: scale(${this.lightboxZoom})">
      </div>

      <!-- Controles -->
      <div class="lightbox-controls">
        <button onclick="app.lightboxPrev()">◀</button>
        <button onclick="app.lightboxZoomIn()">🔍+</button>
        <button onclick="app.lightboxZoomOut()">🔍-</button>
        <button onclick="app.lightboxNext()">▶</button>
      </div>
    </div>
  `;

  // Habilitar pan con arrastre
  this.initLightboxPan();
}
```

---

## 📚 FUNCIONES CLAVE

### Top 10 Funciones del Tab Inventario

| Función | Línea | Propósito |
|---------|-------|-----------|
| `renderInventario()` | 36830 | Función principal de renderizado |
| `renderCards()` | 36858 | Renderiza grid de tarjetas |
| `getFilteredRepuestos()` | 36780 | Aplica todos los filtros |
| `abrirModalCrear()` | 40200 | Abre modal de creación |
| `guardarRepuesto()` | 41500 | Guarda repuesto (crear/editar) |
| `editarRepuesto()` | 42800 | Carga repuesto para edición |
| `eliminarRepuesto()` | 43200 | Elimina repuesto con confirmación |
| `updatePagination()` | 38400 | Actualiza controles de paginación |
| `abrirLightbox()` | 39200 | Abre lightbox de imágenes |
| `calcularEstadoUbicacion()` | 48100 | Calcula estado v6.0.1 |

---

**Continúa con:** [`SPARK_04_JERARQUIA.md`](./SPARK_04_JERARQUIA.md)


====================================================================================================

################################################################################
# DOCUMENTO 4: SPARK_04_JERARQUIA.md
# Líneas: 706
################################################################################

# 🌳 Sistema de Jerarquía - 8 Niveles

**Módulo 4/8** - Árbol visual, búsqueda y navegación  
**Líneas en index.html:** 47000-50500

---

## 📋 CONTENIDO

1. [Vista General](#vista-general)
2. [Estructura de 8 Niveles](#estructura-de-8-niveles)
3. [Renderizado del Árbol](#renderizado-del-árbol)
4. [Sistema de Búsqueda](#sistema-de-búsqueda)
5. [Expansión y Navegación](#expansión-y-navegación)
6. [Parser de NodeId](#parser-de-nodeid)
7. [Integración con Mapas](#integración-con-mapas)

---

## 🎯 VISTA GENERAL

### Dos Sistemas de Jerarquía

```
SISTEMA DUAL (Unificado en v6.0)
├── 1. Jerarquía Organizacional (zonas.json)
│   └── Representa PLANTA FÍSICA real
│       - 8 niveles de ubicación
│       - Asociado a mapas
│       - Usado para navegación
│
└── 2. Jerarquía Genérica (repuestos.ubicaciones[])
    └── Representa CLASIFICACIÓN lógica
        - Misma estructura de 8 niveles
        - Guardada en cada repuesto
        - Sincronizada con sistema 1
```

### Los 8 Niveles

```
Nivel 1: Planta General          (ej: "Planta Completa")
Nivel 2: Área General            (ej: "Área Industrial Norte")
Nivel 3: Sub-Área                (ej: "Sala de Producción A")
Nivel 4: Sistema/Equipo          (ej: "Línea de Montaje #1")
Nivel 5: Sub-Sistema             (ej: "Brazo Robótico R3")
Nivel 6: Componente Principal    (ej: "Motor Principal M1")
Nivel 7: Sub-Componente          (ej: "Encoder Rotatorio")
Nivel 8: Elemento Específico     (ej: "Rodamiento 6205-2RS")
```

### HTML Base

```html
<!-- Línea 15280 en index.html -->
<div id="jerarquiaContent" class="tab-content">
  <!-- Header con búsqueda -->
  <div class="jerarquia-header">
    <div class="search-container">
      <input 
        type="text"
        id="jerarquiaSearchInput"
        placeholder="🔍 Buscar en jerarquía..."
        autocomplete="off"
        oninput="app.handleJerarquiaSearch(this.value)">
      
      <div id="jerarquiaSearchResults" class="search-autocomplete"></div>
    </div>

    <div class="jerarquia-buttons">
      <button onclick="app.expandAllNodes()">Expandir Todo</button>
      <button onclick="app.collapseAllNodes()">Contraer Todo</button>
      <button onclick="app.exportJerarquia()">Exportar JSON</button>
    </div>
  </div>

  <!-- Árbol visual -->
  <div id="jerarquiaTree" class="jerarquia-tree"></div>
</div>
```

---

## 📊 ESTRUCTURA DE 8 NIVELES

### Objeto Jerarquía Completo

```javascript
// Estructura guardada en repuesto.ubicaciones[0]
{
  // Nivel 1: Planta
  plantaGeneral: "Planta Completa",
  
  // Nivel 2: Área
  areaGeneral: "Área Industrial Norte",
  
  // Nivel 3: Sub-Área
  subArea: "Sala de Producción A",
  
  // Nivel 4: Sistema/Equipo
  sistemaEquipo: "Línea de Montaje #1",
  
  // Nivel 5: Sub-Sistema
  subSistema: "Brazo Robótico R3",
  
  // Nivel 6: Componente
  componentePrincipal: "Motor Principal M1",
  
  // Nivel 7: Sub-Componente
  subComponente: "Encoder Rotatorio",
  
  // Nivel 8: Elemento
  elementoEspecifico: "Rodamiento 6205-2RS",
  
  // Metadatos
  nodeId: "planta_area_subarea_sistema_subsistema_componente_subcomponente_elemento",
  fechaCreacion: "2025-11-27T10:30:00Z",
  tipo: "ubicacion" // o "clasificacion"
}
```

### Ejemplo Real

```javascript
// Repuesto: Filtro de aire comprimido
{
  id: "R001",
  nombre: "Filtro de aire 1/4\"",
  codSAP: "FLT-AIR-025",
  ubicaciones: [{
    plantaGeneral: "Planta Completa",
    areaGeneral: "Área de Compresores",
    subArea: "Sala Principal",
    sistemaEquipo: "Compresor Atlas Copco GA37",
    subSistema: "Sistema de Filtración",
    componentePrincipal: "Filtro Principal",
    subComponente: "Cartucho Filtrante",
    elementoEspecifico: "Elemento Coalescente",
    nodeId: "planta_compresores_principal_ga37_filtracion_principal_cartucho_coalescente"
  }]
}
```

---

## 🌲 RENDERIZADO DEL ÁRBOL

### Función Principal: renderJerarquiaTree()

```javascript
// Línea 47100 en index.html
renderJerarquiaTree() {
  const container = document.getElementById('jerarquiaTree');
  if (!container) return;

  // 1. Construir estructura desde repuestos
  const treeData = this.buildJerarquiaTreeData();
  
  // 2. Renderizar HTML recursivo
  container.innerHTML = this.renderJerarquiaNode(treeData, 1);
  
  // 3. Restaurar estado de expansión
  this.restoreExpansionState();
}
```

### Construcción de Datos del Árbol

```javascript
// Línea 47200 en index.html
buildJerarquiaTreeData() {
  const tree = {
    nivel: 0,
    nombre: 'Planta Completa',
    nodeId: 'root',
    children: new Map(),
    repuestos: []
  };

  // Recorrer cada repuesto
  this.repuestos.forEach(repuesto => {
    if (!repuesto.ubicaciones || repuesto.ubicaciones.length === 0) {
      return; // Sin ubicación, skip
    }

    const ubicacion = repuesto.ubicaciones[0];
    let currentNode = tree;

    // Construir jerarquía nivel por nivel
    const niveles = [
      { key: 'plantaGeneral', value: ubicacion.plantaGeneral },
      { key: 'areaGeneral', value: ubicacion.areaGeneral },
      { key: 'subArea', value: ubicacion.subArea },
      { key: 'sistemaEquipo', value: ubicacion.sistemaEquipo },
      { key: 'subSistema', value: ubicacion.subSistema },
      { key: 'componentePrincipal', value: ubicacion.componentePrincipal },
      { key: 'subComponente', value: ubicacion.subComponente },
      { key: 'elementoEspecifico', value: ubicacion.elementoEspecifico }
    ];

    niveles.forEach((nivel, index) => {
      if (!nivel.value) return;

      // Crear nodo si no existe
      if (!currentNode.children.has(nivel.value)) {
        currentNode.children.set(nivel.value, {
          nivel: index + 1,
          nombre: nivel.value,
          nodeId: this.generateNodeId(niveles.slice(0, index + 1)),
          children: new Map(),
          repuestos: []
        });
      }

      currentNode = currentNode.children.get(nivel.value);
    });

    // Agregar repuesto al nodo final
    currentNode.repuestos.push(repuesto);
  });

  return tree;
}
```

### Renderizado Recursivo de Nodos

```javascript
// Línea 47450 en index.html
renderJerarquiaNode(node, nivel) {
  if (!node.children || node.children.size === 0) {
    // Nodo hoja: mostrar repuestos
    return this.renderRepuestosList(node.repuestos, node.nodeId);
  }

  // Nodo rama: mostrar children
  const isExpanded = this.expandedNodes.has(node.nodeId);
  const childrenArray = Array.from(node.children.values());
  const totalRepuestos = this.countRepuestos(node);

  return `
    <div class="jerarquia-node nivel-${nivel}" data-node-id="${node.nodeId}">
      <!-- Header del nodo -->
      <div class="node-header" onclick="app.toggleNode('${node.nodeId}')">
        <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
        <span class="node-icon">${this.getIconForLevel(nivel)}</span>
        <span class="node-name">${node.nombre}</span>
        <span class="node-badge">${totalRepuestos} repuestos</span>
      </div>

      <!-- Children (ocultos si collapsed) -->
      <div class="node-children" style="display: ${isExpanded ? 'block' : 'none'}">
        ${childrenArray.map(child => 
          this.renderJerarquiaNode(child, nivel + 1)
        ).join('')}
      </div>
    </div>
  `;
}
```

### Lista de Repuestos en Nodo

```javascript
// Línea 47650 en index.html
renderRepuestosList(repuestos, nodeId) {
  if (!repuestos || repuestos.length === 0) {
    return '';
  }

  return `
    <div class="repuestos-list">
      ${repuestos.map(r => `
        <div class="repuesto-item" data-id="${r.id}">
          <div class="repuesto-icon">📦</div>
          <div class="repuesto-info">
            <strong>${r.nombre}</strong>
            <span>${r.codSAP}</span>
          </div>
          <div class="repuesto-actions">
            <button onclick="app.verRepuestoEnJerarquia('${r.id}')">
              👁️ Ver
            </button>
            ${r.ubicacionesMapa?.length > 0 ? `
              <button onclick="app.verRepuestoEnMapa('${r.id}')">
                🗺️ Mapa
              </button>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
```

---

## 🔍 SISTEMA DE BÚSQUEDA

### Construcción del Índice

```javascript
// Línea 60465 en index.html
buildJerarquiaSearchIndex() {
  this.jerarquiaSearchIndex = [];

  this.repuestos.forEach(repuesto => {
    if (!repuesto.ubicaciones || repuesto.ubicaciones.length === 0) {
      return;
    }

    const ubicacion = repuesto.ubicaciones[0];
    
    // Construir path completo
    const path = [
      ubicacion.plantaGeneral,
      ubicacion.areaGeneral,
      ubicacion.subArea,
      ubicacion.sistemaEquipo,
      ubicacion.subSistema,
      ubicacion.componentePrincipal,
      ubicacion.subComponente,
      ubicacion.elementoEspecifico
    ].filter(Boolean).join(' → ');

    // Agregar al índice
    this.jerarquiaSearchIndex.push({
      id: repuesto.id,
      nombre: repuesto.nombre,
      codigo: repuesto.codSAP,
      path: path,
      nodeId: ubicacion.nodeId,
      searchText: `${repuesto.nombre} ${repuesto.codSAP} ${path}`.toLowerCase()
    });
  });
}
```

### Búsqueda con Autocompletado

```javascript
// Línea 60600 en index.html
handleJerarquiaSearch(query) {
  const resultsContainer = document.getElementById('jerarquiaSearchResults');
  
  if (!query || query.length < 2) {
    resultsContainer.style.display = 'none';
    return;
  }

  const queryLower = query.toLowerCase();
  
  // Buscar en índice
  const results = this.jerarquiaSearchIndex
    .filter(item => item.searchText.includes(queryLower))
    .slice(0, 10); // Máximo 10 resultados

  if (results.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results">Sin resultados</div>';
    resultsContainer.style.display = 'block';
    return;
  }

  // Renderizar resultados
  resultsContainer.innerHTML = results.map(item => `
    <div class="search-result-item" onclick="app.selectSearchResult('${item.id}')">
      <div class="result-name">${this.highlightQuery(item.nombre, query)}</div>
      <div class="result-code">${item.codigo}</div>
      <div class="result-path">${this.highlightQuery(item.path, query)}</div>
    </div>
  `).join('');

  resultsContainer.style.display = 'block';
}
```

### Selección de Resultado

```javascript
// Línea 60750 en index.html
selectSearchResult(repuestoId) {
  // Ocultar autocomplete
  document.getElementById('jerarquiaSearchResults').style.display = 'none';
  
  // Limpiar input
  document.getElementById('jerarquiaSearchInput').value = '';
  
  // Navegar a repuesto
  this.verRepuestoEnJerarquia(repuestoId);
}
```

---

## 🧭 EXPANSIÓN Y NAVEGACIÓN

### Navegar a Repuesto

```javascript
// Línea 48494 en index.html
verRepuestoEnJerarquia(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto || !repuesto.ubicaciones || repuesto.ubicaciones.length === 0) {
    this.showToast('⚠️ Repuesto sin ubicación en jerarquía', 'warning');
    return;
  }

  // 1. Cambiar a tab Jerarquía
  this.switchTab('jerarquia');

  // 2. Expandir path completo
  const ubicacion = repuesto.ubicaciones[0];
  const pathToExpand = this.buildPathToNode(ubicacion);
  
  pathToExpand.forEach(nodeId => {
    this.expandedNodes.add(nodeId);
  });

  // 3. Re-renderizar árbol
  this.renderJerarquiaTree();

  // 4. Scroll y highlight del repuesto
  setTimeout(() => {
    const element = document.querySelector(`[data-id="${repuestoId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight');
      
      setTimeout(() => {
        element.classList.remove('highlight');
      }, 2000);
    }
  }, 100);
}
```

### Expandir Path Completo

```javascript
// Línea 48620 en index.html
buildPathToNode(ubicacion) {
  const path = [];
  const niveles = [
    'plantaGeneral',
    'areaGeneral',
    'subArea',
    'sistemaEquipo',
    'subSistema',
    'componentePrincipal',
    'subComponente',
    'elementoEspecifico'
  ];

  let nodeIdParts = [];
  
  niveles.forEach(nivel => {
    if (ubicacion[nivel]) {
      nodeIdParts.push(this.slugify(ubicacion[nivel]));
      path.push(nodeIdParts.join('_'));
    }
  });

  return path;
}
```

### Toggle de Nodo

```javascript
// Línea 47850 en index.html
toggleNode(nodeId) {
  if (this.expandedNodes.has(nodeId)) {
    this.expandedNodes.delete(nodeId);
  } else {
    this.expandedNodes.add(nodeId);
  }

  // Guardar estado
  localStorage.setItem('expandedNodes', 
    JSON.stringify(Array.from(this.expandedNodes))
  );

  // Re-renderizar solo el nodo afectado
  const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
  if (nodeElement) {
    const childrenContainer = nodeElement.querySelector('.node-children');
    const expandIcon = nodeElement.querySelector('.expand-icon');
    
    if (this.expandedNodes.has(nodeId)) {
      childrenContainer.style.display = 'block';
      expandIcon.textContent = '▼';
    } else {
      childrenContainer.style.display = 'none';
      expandIcon.textContent = '▶';
    }
  }
}
```

### Expandir/Contraer Todo

```javascript
// Línea 48000 en index.html
expandAllNodes() {
  // Obtener todos los nodeIds del árbol
  const allNodeIds = this.getAllNodeIds();
  
  allNodeIds.forEach(nodeId => {
    this.expandedNodes.add(nodeId);
  });

  this.renderJerarquiaTree();
  this.showToast('✅ Árbol expandido completamente', 'success');
}

collapseAllNodes() {
  this.expandedNodes.clear();
  this.renderJerarquiaTree();
  this.showToast('✅ Árbol contraído completamente', 'success');
}

getAllNodeIds() {
  const nodeIds = [];
  
  const traverse = (node) => {
    if (node.nodeId && node.nodeId !== 'root') {
      nodeIds.push(node.nodeId);
    }
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  };

  const treeData = this.buildJerarquiaTreeData();
  traverse(treeData);
  
  return nodeIds;
}
```

---

## 🔑 PARSER DE NODEID

### Generar NodeId

```javascript
// Línea 48150 en index.html
generateNodeId(niveles) {
  return niveles
    .map(n => this.slugify(n.value))
    .filter(Boolean)
    .join('_');
}

slugify(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')           // Espacios → _
    .replace(/[^\w\-]+/g, '')       // Quitar caracteres especiales
    .replace(/\_\_+/g, '_')         // Múltiples _ → uno solo
    .replace(/^_+/, '')             // Quitar _ inicial
    .replace(/_+$/, '');            // Quitar _ final
}
```

### Parsear NodeId a Jerarquía

```javascript
// Línea 48250 en index.html
parseNodeId(nodeId) {
  const parts = nodeId.split('_');
  const niveles = [
    'plantaGeneral',
    'areaGeneral',
    'subArea',
    'sistemaEquipo',
    'subSistema',
    'componentePrincipal',
    'subComponente',
    'elementoEspecifico'
  ];

  const jerarquia = {};
  
  parts.forEach((part, index) => {
    if (index < niveles.length) {
      jerarquia[niveles[index]] = this.deslugify(part);
    }
  });

  return jerarquia;
}

deslugify(slug) {
  // Intentar reconstruir texto original
  return slug
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize
}
```

---

## 🗺️ INTEGRACIÓN CON MAPAS

### Sincronización Jerarquía ↔ Mapa

```javascript
// Línea 49500 en index.html
syncJerarquiaConMapa(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto) return;

  // Verificar que tenga ambas ubicaciones
  const tieneJerarquia = repuesto.ubicaciones?.length > 0;
  const tieneMapa = repuesto.ubicacionesMapa?.length > 0;

  if (tieneJerarquia && tieneMapa) {
    const ubicacion = repuesto.ubicaciones[0];
    const ubicacionMapa = repuesto.ubicacionesMapa[0];

    // Sincronizar jerarquía del mapa con jerarquía del repuesto
    ubicacionMapa.jerarquia = {
      plantaGeneral: ubicacion.plantaGeneral,
      areaGeneral: ubicacion.areaGeneral,
      subArea: ubicacion.subArea,
      sistemaEquipo: ubicacion.sistemaEquipo,
      subSistema: ubicacion.subSistema,
      componentePrincipal: ubicacion.componentePrincipal,
      subComponente: ubicacion.subComponente,
      elementoEspecifico: ubicacion.elementoEspecifico
    };

    // Guardar cambios
    this.guardarTodo();
  }
}
```

### Botón "Ver en Mapa"

```javascript
// Línea 49650 en index.html
verRepuestoEnMapa(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto || !repuesto.ubicacionesMapa || repuesto.ubicacionesMapa.length === 0) {
    this.showToast('⚠️ Repuesto sin ubicación en mapa', 'warning');
    return;
  }

  const ubicacionMapa = repuesto.ubicacionesMapa[0];

  // 1. Cambiar a tab Mapas
  this.switchTab('mapas');

  // 2. Cargar mapa correcto
  if (ubicacionMapa.mapaId !== mapController.currentMapId) {
    mapController.loadMap(ubicacionMapa.mapaId);
  }

  // 3. Pan a coordenadas
  setTimeout(() => {
    mapController.panTo(
      ubicacionMapa.coordenadas.x,
      ubicacionMapa.coordenadas.y,
      1.5 // Zoom
    );

    // 4. Highlight temporal
    mapController.highlightPoint(
      ubicacionMapa.coordenadas.x,
      ubicacionMapa.coordenadas.y
    );
  }, 300);
}
```

---

## 📚 FUNCIONES CLAVE

### Top 10 Funciones de Jerarquía

| Función | Línea | Propósito |
|---------|-------|-----------|
| `renderJerarquiaTree()` | 47100 | Renderiza árbol completo |
| `buildJerarquiaTreeData()` | 47200 | Construye estructura de datos |
| `buildJerarquiaSearchIndex()` | 60465 | Crea índice de búsqueda |
| `verRepuestoEnJerarquia()` | 48494 | Navega y expande a repuesto |
| `handleJerarquiaSearch()` | 60600 | Búsqueda con autocompletado |
| `toggleNode()` | 47850 | Expande/contrae nodo |
| `expandAllNodes()` | 48000 | Expande todo el árbol |
| `generateNodeId()` | 48150 | Genera ID único de nodo |
| `parseNodeId()` | 48250 | Convierte nodeId a jerarquía |
| `syncJerarquiaConMapa()` | 49500 | Sincroniza con sistema de mapas |

---

**Continúa con:** [`SPARK_05_MAPAS.md`](./SPARK_05_MAPAS.md)


====================================================================================================

################################################################################
# DOCUMENTO 5: SPARK_05_MAPAS.md
# Líneas: 774
################################################################################

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


====================================================================================================


## ⏭️ CONTINÚA EN SPARK_PARTE_2.md

**Para continuar, pega el contenido de SPARK_PARTE_2.md**
