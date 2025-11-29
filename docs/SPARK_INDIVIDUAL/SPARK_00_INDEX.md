# 📄 DOCUMENTO 1/11: SPARK_00_INDEX.md

**Tamaño:** 10.8 KB | **Líneas:** 390
**Posición:** 1 de 11

🏠 **PRIMER DOCUMENTO** - Lee y espera los siguientes 10

---

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


================================================================================

## ⏭️ SIGUIENTE: SPARK_01_GUIA_RAPIDA.md

