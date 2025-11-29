# 📚 APP INVENTARIO v6.0.1 - PARTE 1/4

**Fecha:** 27/11/2025
**Tamaño:** ~68.1 KB

🏠 **PRIMERA PARTE** - Lee todo y espera las siguientes partes

**Documentos en esta parte:**
- SPARK_00_INDEX.md
- SPARK_01_GUIA_RAPIDA.md
- SPARK_02_MODELOS_DATOS.md

---


################################################################################
# SPARK_00_INDEX.md
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


################################################################################
# SPARK_01_GUIA_RAPIDA.md
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


################################################################################
# SPARK_02_MODELOS_DATOS.md
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


================================================================================

## ⏭️ CONTINÚA EN SPARK_MINI_2.md

**Lee la siguiente parte antes de crear la app**
