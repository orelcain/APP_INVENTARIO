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
