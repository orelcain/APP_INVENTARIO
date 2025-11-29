# 📄 DOCUMENTO 9/11: SPARK_08_COMPONENTES_UI.md

**Tamaño:** 23.0 KB | **Líneas:** 830
**Posición:** 9 de 11

⏩ **DOCUMENTO INTERMEDIO** - Continúa leyendo...

---

# 🛠️ Componentes UI y Wizard

**Módulo 8/10** - Componentes visuales reutilizables y sistema de wizard  
**Detalle completo de UI patterns**

---

## 📋 CONTENIDO

1. [Sistema de Wizard/Modal](#sistema-de-wizardmodal)
2. [Sistema de Toasts](#sistema-de-toasts)
3. [Lightbox Avanzado](#lightbox-avanzado)
4. [Modal Resizable](#modal-resizable)
5. [Modales Personalizados](#modales-personalizados)
6. [Tabs y Navegación](#tabs-y-navegación)
7. [Componentes de Formulario](#componentes-de-formulario)

---

## 🎯 SISTEMA DE WIZARD/MODAL

### Modal Principal (7 Pasos)

```html
<!-- Línea 15100 en index.html -->
<div id="modal" class="modal" style="display: none;">
  <div class="modal-content is-resizable" id="modalContent">
    <!-- Header con timeline -->
    <div class="modal-header">
      <div class="wizard-timeline">
        <div class="wizard-step" data-step="1">
          <div class="step-number">1</div>
          <div class="step-label">Básicos</div>
        </div>
        <div class="wizard-step" data-step="2">
          <div class="step-number">2</div>
          <div class="step-label">Fotos</div>
        </div>
        <div class="wizard-step" data-step="3">
          <div class="step-number">3</div>
          <div class="step-label">Categoría</div>
        </div>
        <div class="wizard-step" data-step="4">
          <div class="step-number">4</div>
          <div class="step-label">Ubicaciones</div>
        </div>
        <div class="wizard-step" data-step="5">
          <div class="step-number">5</div>
          <div class="step-label">Stock</div>
        </div>
        <div class="wizard-step" data-step="6">
          <div class="step-number">6</div>
          <div class="step-label">Técnicos</div>
        </div>
        <div class="wizard-step" data-step="7">
          <div class="step-number">7</div>
          <div class="step-label">Proveedores</div>
        </div>
      </div>
      
      <button class="close-btn" onclick="app.closeModal()">✕</button>
    </div>

    <!-- Body dinámico -->
    <div class="modal-body" id="modalBody">
      <!-- Contenido de cada paso se renderiza aquí -->
    </div>

    <!-- Footer con botones -->
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="app.previousStep()">
        ← Anterior
      </button>
      <button class="btn btn-primary" onclick="app.nextStep()">
        Siguiente →
      </button>
      <button class="btn btn-success" onclick="app.saveRepuesto()" 
              style="display: none;">
        💾 Guardar Repuesto
      </button>
    </div>
  </div>
</div>
```

### Control del Wizard

```javascript
// Línea 43500 en index.html
renderWizardStep(step) {
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.querySelector('.modal-footer');
  
  // Actualizar timeline
  document.querySelectorAll('.wizard-step').forEach(stepEl => {
    const stepNum = parseInt(stepEl.dataset.step);
    stepEl.classList.remove('active', 'completed');
    
    if (stepNum === step) {
      stepEl.classList.add('active');
    } else if (stepNum < step) {
      stepEl.classList.add('completed');
    }
  });

  // Renderizar contenido del paso
  modalBody.innerHTML = this.getStepContent(step);
  
  // Actualizar botones
  this.updateWizardButtons(step);
  
  // Guardar paso actual
  this.wizardState.currentStep = step;
  localStorage.setItem('lastWizardStep', step);
}
```

### Contenido de Cada Paso

```javascript
// Línea 43650 en index.html
getStepContent(step) {
  switch (step) {
    case 1: return this.renderStepBasicos();
    case 2: return this.renderStepFotos();
    case 3: return this.renderStepCategoria();
    case 4: return this.renderStepUbicaciones();
    case 5: return this.renderStepStock();
    case 6: return this.renderStepTecnicos();
    case 7: return this.renderStepProveedores();
    default: return '<p>Paso no encontrado</p>';
  }
}
```

### Step 1: Básicos

```javascript
// Línea 43800 en index.html
renderStepBasicos() {
  return `
    <div class="wizard-step-content">
      <h2>📝 Información Básica</h2>
      <p class="step-description">Completa los datos principales del repuesto</p>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="formCodSAP">Código SAP <span class="required">*</span></label>
          <input type="text" id="formCodSAP" placeholder="Ej: REP-001" required>
        </div>
        
        <div class="form-group">
          <label for="formNombre">Nombre <span class="required">*</span></label>
          <input type="text" id="formNombre" placeholder="Ej: Rodamiento 6205-2RS" required>
        </div>
        
        <div class="form-group full-width">
          <label for="formDescripcion">Descripción</label>
          <textarea id="formDescripcion" rows="3" placeholder="Descripción detallada del repuesto"></textarea>
        </div>
      </div>
    </div>
  `;
}
```

### Step 2: Fotos (Multimedia)

```javascript
// Línea 44000 en index.html
renderStepFotos() {
  return `
    <div class="wizard-step-content">
      <h2>📷 Fotos y Archivos</h2>
      <p class="step-description">Adjunta imágenes y documentos</p>
      
      <div class="upload-zone">
        <input type="file" id="fileInput" multiple accept="image/*" 
               style="display: none;" onchange="app.handleFileUpload(event)">
        
        <button class="btn-upload" onclick="document.getElementById('fileInput').click()">
          <span class="upload-icon">📁</span>
          <span>Seleccionar archivos</span>
          <small>o arrastra aquí</small>
        </button>
        
        <div class="upload-stats">
          <span>Formatos: JPG, PNG, WebP</span>
          <span>Máx 10 MB por archivo</span>
        </div>
      </div>
      
      <div id="multimediaPreview" class="multimedia-preview">
        ${this.renderMultimediaItems()}
      </div>
    </div>
  `;
}
```

### Step 4: Ubicaciones (Con Mapa Integrado)

```javascript
// Línea 44500 en index.html
renderStepUbicaciones() {
  return `
    <div class="wizard-step-content">
      <h2>📍 Ubicaciones</h2>
      <p class="step-description">Define dónde se encuentra el repuesto</p>
      
      <div class="ubicaciones-container">
        <!-- Lista de ubicaciones -->
        <div class="ubicaciones-list">
          <h3>Ubicaciones asignadas</h3>
          <div id="ubicacionesList">
            ${this.renderUbicacionesList()}
          </div>
          
          <button class="btn btn-secondary" onclick="app.addUbicacion()">
            + Agregar Ubicación
          </button>
        </div>
        
        <!-- Formulario nueva ubicación -->
        <div class="ubicacion-form" id="ubicacionForm" style="display: none;">
          <h3>Nueva Ubicación</h3>
          
          <!-- 8 niveles de jerarquía -->
          <div class="form-group">
            <label>Nivel 1: Planta General</label>
            <input type="text" id="formPlantaGeneral" 
                   placeholder="Ej: Planta Principal"
                   list="dataPlantaGeneral">
            <datalist id="dataPlantaGeneral">
              ${this.getAutocompletePlanta().map(p => `<option value="${p}"></option>`).join('')}
            </datalist>
          </div>
          
          <div class="form-group">
            <label>Nivel 2: Área General</label>
            <input type="text" id="formAreaGeneral" 
                   placeholder="Ej: Producción"
                   list="dataAreaGeneral">
          </div>
          
          <!-- ... 6 niveles más -->
          
          <div class="form-buttons">
            <button class="btn btn-secondary" onclick="app.cancelUbicacion()">Cancelar</button>
            <button class="btn btn-primary" onclick="app.saveUbicacion()">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
```

---

## 🔔 SISTEMA DE TOASTS

### Estructura

```javascript
// Línea 54200 en index.html
showToast(message, type = 'info', duration = 3000) {
  const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Animación de entrada
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Auto-cerrar
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
```

### CSS de Toasts

```css
/* Línea 13500 en CSS embebido */
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  margin-bottom: 12px;
  min-width: 320px;
  max-width: 480px;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid var(--primary);
}

.toast.show {
  opacity: 1;
  transform: translateX(0);
}

.toast.hiding {
  opacity: 0;
  transform: translateX(100%);
}

.toast-success { border-left-color: var(--success); }
.toast-error { border-left-color: var(--danger); }
.toast-warning { border-left-color: var(--warning); }
.toast-info { border-left-color: var(--info); }

.toast-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}
```

---

## 🖼️ LIGHTBOX AVANZADO

### Abrir Lightbox

```javascript
// Línea 39200 en index.html
abrirLightbox(repuestoId, startIndex = 0) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto || !repuesto.multimedia || repuesto.multimedia.length === 0) {
    this.showToast('⚠️ Sin imágenes para mostrar', 'warning');
    return;
  }

  this.lightboxData = {
    repuestoId: repuestoId,
    repuestoNombre: repuesto.nombre,
    medias: repuesto.multimedia.filter(m => m.type === 'image'),
    currentIndex: startIndex,
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false
  };

  const lightbox = document.getElementById('lightbox');
  lightbox.style.display = 'flex';
  
  this.renderLightboxImage();
  
  // Listener para teclado
  this.lightboxKeyHandler = (e) => this.handleLightboxKey(e);
  document.addEventListener('keydown', this.lightboxKeyHandler);
}
```

### Renderizado con Zoom

```javascript
// Línea 39350 en index.html
renderLightboxImage() {
  const { medias, currentIndex, zoom, panX, panY } = this.lightboxData;
  const media = medias[currentIndex];
  
  if (!media) return;

  const lightbox = document.getElementById('lightbox');
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <!-- Header -->
      <div class="lightbox-header">
        <div class="lightbox-title">
          ${this.lightboxData.repuestoNombre}
        </div>
        <div class="lightbox-counter">
          ${currentIndex + 1} / ${medias.length}
        </div>
        <button class="lightbox-close" onclick="app.cerrarLightbox()">✕</button>
      </div>

      <!-- Imagen principal -->
      <div class="lightbox-image-container" id="lightboxImageContainer">
        <img 
          id="lightboxImg"
          src="${media.url}" 
          alt="${media.name}"
          style="
            transform: scale(${zoom}) translate(${panX}px, ${panY}px);
            cursor: ${zoom > 1 ? 'grab' : 'zoom-in'};
          "
          draggable="false">
      </div>

      <!-- Controles -->
      <div class="lightbox-controls">
        <button onclick="app.lightboxPrev()" ${currentIndex === 0 ? 'disabled' : ''}>
          ◀ Anterior
        </button>
        
        <div class="zoom-controls">
          <button onclick="app.lightboxZoomOut()" ${zoom <= 0.5 ? 'disabled' : ''}>
            🔍-
          </button>
          <span class="zoom-level">${Math.round(zoom * 100)}%</span>
          <button onclick="app.lightboxZoomIn()" ${zoom >= 4 ? 'disabled' : ''}>
            🔍+
          </button>
          <button onclick="app.lightboxResetZoom()">
            ↻ Reset
          </button>
        </div>
        
        <button onclick="app.lightboxNext()" ${currentIndex === medias.length - 1 ? 'disabled' : ''}>
          Siguiente ▶
        </button>
      </div>

      <!-- Thumbnails -->
      <div class="lightbox-thumbnails">
        ${medias.map((m, i) => `
          <div class="lightbox-thumb ${i === currentIndex ? 'active' : ''}" 
               onclick="app.lightboxGoTo(${i})">
            <img src="${m.url}" alt="${m.name}">
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Setup pan con drag
  this.setupLightboxPan();
}
```

### Pan con Arrastre

```javascript
// Línea 39550 en index.html
setupLightboxPan() {
  const img = document.getElementById('lightboxImg');
  if (!img) return;

  let startX = 0;
  let startY = 0;

  img.addEventListener('mousedown', (e) => {
    if (this.lightboxData.zoom <= 1) return;
    
    e.preventDefault();
    this.lightboxData.isDragging = true;
    startX = e.clientX - this.lightboxData.panX;
    startY = e.clientY - this.lightboxData.panY;
    img.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!this.lightboxData.isDragging) return;
    
    this.lightboxData.panX = e.clientX - startX;
    this.lightboxData.panY = e.clientY - startY;
    
    img.style.transform = `scale(${this.lightboxData.zoom}) translate(${this.lightboxData.panX}px, ${this.lightboxData.panY}px)`;
  });

  document.addEventListener('mouseup', () => {
    this.lightboxData.isDragging = false;
    if (img) img.style.cursor = this.lightboxData.zoom > 1 ? 'grab' : 'zoom-in';
  });

  // Zoom con rueda del mouse
  img.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      this.lightboxZoomIn();
    } else {
      this.lightboxZoomOut();
    }
  });
}
```

---

## 🔄 MODAL RESIZABLE

**Archivo:** `scripts/modal-resizable.js`

### Inicialización

```javascript
// Línea 44 en modal-resizable.js
class ModalResizable {
  constructor(modalContent, options = {}) {
    this.modal = modalContent;
    this.options = {
      minWidth: options.minWidth || 800,
      minHeight: options.minHeight || 400,
      maxWidth: options.maxWidth || window.innerWidth - 40,
      maxHeight: options.maxHeight || window.innerHeight - 40,
      draggable: options.draggable !== false,
      resizable: options.resizable !== false,
      snapDistance: options.snapDistance || 20,
      persist: options.persist || false,
      storageKey: options.storageKey || 'modal-state'
    };
    
    this.init();
  }
}
```

### Uso en la App

```javascript
// Línea 30750 en index.html
inicializarModalResizable() {
  const modalContent = document.getElementById('modalContent');
  
  if (modalContent) {
    this.modalResizable = ModalResizable.init(modalContent, {
      minWidth: 900,
      minHeight: 500,
      draggable: true,
      resizable: true,
      persist: true,
      storageKey: 'repuesto-modal-state'
    });
    
    console.log('✅ Modal resizable inicializado');
  }
}
```

---

## 💬 MODALES PERSONALIZADOS

### Modal de Confirmación

```javascript
// Línea 53000 en index.html
showConfirmModal(title, message, confirmText = 'Aceptar', cancelText = 'Cancelar') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    
    overlay.innerHTML = `
      <div class="custom-modal">
        <div class="custom-modal-title">${title}</div>
        <div class="custom-modal-message">${message}</div>
        <div class="custom-modal-buttons">
          <button class="custom-modal-btn custom-modal-btn-secondary" data-action="cancel">
            ${cancelText}
          </button>
          <button class="custom-modal-btn custom-modal-btn-primary" data-action="confirm">
            ${confirmText}
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const close = (confirmed) => {
      overlay.remove();
      resolve(confirmed);
    };
    
    overlay.querySelector('[data-action="confirm"]').onclick = () => close(true);
    overlay.querySelector('[data-action="cancel"]').onclick = () => close(false);
    overlay.onclick = (e) => {
      if (e.target === overlay) close(false);
    };
  });
}
```

### Modal de Input

```javascript
// Línea 53150 en index.html
showInputModal(title, label, defaultValue = '', placeholder = '') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    
    overlay.innerHTML = `
      <div class="custom-modal">
        <div class="custom-modal-title">${title}</div>
        <div style="margin: 20px 0;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">
            ${label}
          </label>
          <input type="text" class="custom-modal-input" id="modal-input" 
                 value="${defaultValue}" placeholder="${placeholder}">
        </div>
        <div class="custom-modal-buttons">
          <button class="custom-modal-btn custom-modal-btn-secondary" data-action="cancel">
            Cancelar
          </button>
          <button class="custom-modal-btn custom-modal-btn-primary" data-action="accept">
            Aceptar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const input = overlay.querySelector('#modal-input');
    const close = (value) => {
      overlay.remove();
      resolve(value);
    };
    
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
    
    overlay.querySelector('[data-action="accept"]').onclick = () => close(input.value);
    overlay.querySelector('[data-action="cancel"]').onclick = () => close(null);
    
    input.onkeydown = (e) => {
      if (e.key === 'Enter') close(input.value);
      if (e.key === 'Escape') close(null);
    };
    
    overlay.onclick = (e) => {
      if (e.target === overlay) close(null);
    };
  });
}
```

---

## 📑 TABS Y NAVEGACIÓN

### Sistema de Tabs

```javascript
// Línea 30850 en index.html
switchTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });

  // Remover clase active
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Mostrar tab seleccionado
  const selectedTab = document.getElementById(`${tabName}Content`);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }

  // Activar botón
  const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }

  // Actualizar estado
  this.currentTab = tabName;
  localStorage.setItem('lastTab', tabName);

  // Renderizar contenido del tab
  this.renderCurrentTab();
}
```

---

## 📝 COMPONENTES DE FORMULARIO

### Autocomplete con Datalist

```javascript
// Línea 45200 en index.html
setupAutocomplete(inputId, datalistId, dataSource) {
  const input = document.getElementById(inputId);
  const datalist = document.getElementById(datalistId);
  
  if (!input || !datalist) return;

  // Llenar datalist
  const options = dataSource.map(item => `<option value="${item}"></option>`).join('');
  datalist.innerHTML = options;

  // Listener para autocompletar
  input.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = dataSource.filter(item => 
      item.toLowerCase().includes(value)
    );
    
    datalist.innerHTML = filtered
      .map(item => `<option value="${item}"></option>`)
      .join('');
  });
}
```

### Select con Búsqueda

```javascript
// Línea 45350 en index.html
createSearchableSelect(containerId, options, selected = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const selectHtml = `
    <div class="searchable-select">
      <input type="text" class="select-search" placeholder="Buscar...">
      <div class="select-options" style="display: none;">
        ${options.map(opt => `
          <div class="select-option ${opt.value === selected ? 'selected' : ''}" 
               data-value="${opt.value}">
            ${opt.label}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = selectHtml;

  // Setup comportamiento
  const input = container.querySelector('.select-search');
  const optionsContainer = container.querySelector('.select-options');
  
  input.addEventListener('focus', () => {
    optionsContainer.style.display = 'block';
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      optionsContainer.style.display = 'none';
    }, 200);
  });

  input.addEventListener('input', (e) => {
    const filter = e.target.value.toLowerCase();
    container.querySelectorAll('.select-option').forEach(opt => {
      const text = opt.textContent.toLowerCase();
      opt.style.display = text.includes(filter) ? 'block' : 'none';
    });
  });

  container.querySelectorAll('.select-option').forEach(opt => {
    opt.addEventListener('click', () => {
      input.value = opt.textContent;
      optionsContainer.style.display = 'none';
      
      // Emitir evento de cambio
      const event = new CustomEvent('select-change', {
        detail: { value: opt.dataset.value }
      });
      container.dispatchEvent(event);
    });
  });
}
```

---

## 📚 RESUMEN DE COMPONENTES

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| **Wizard Modal** | Línea 43500 | Modal de 7 pasos para crear/editar |
| **Toast System** | Línea 54200 | Notificaciones temporales |
| **Lightbox** | Línea 39200 | Visualizador de imágenes con zoom |
| **Modal Resizable** | `scripts/modal-resizable.js` | Modales arrastrables |
| **Confirm Modal** | Línea 53000 | Confirmaciones personalizadas |
| **Input Modal** | Línea 53150 | Inputs rápidos |
| **Tabs System** | Línea 30850 | Navegación entre secciones |
| **Autocomplete** | Línea 45200 | Autocompletado de formularios |

---

**Continúa con:** [`SPARK_09_SCRIPTS_HERRAMIENTAS.md`](./SPARK_09_SCRIPTS_HERRAMIENTAS.md)


================================================================================

## ⏭️ SIGUIENTE: SPARK_09_SCRIPTS_HERRAMIENTAS.md

