# 📚 APP INVENTARIO v6.0.1 - PARTE 2/4

**Fecha:** 27/11/2025
**Tamaño:** ~53.8 KB

⏩ **PARTE INTERMEDIA** - Continúa leyendo...

**Documentos en esta parte:**
- SPARK_03_INVENTARIO.md
- SPARK_04_JERARQUIA.md
- SPARK_05_MAPAS.md

---


################################################################################
# SPARK_03_INVENTARIO.md
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


################################################################################
# SPARK_04_JERARQUIA.md
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


################################################################################
# SPARK_05_MAPAS.md
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


================================================================================

## ⏭️ CONTINÚA EN SPARK_MINI_3.md

**Lee la siguiente parte antes de crear la app**
