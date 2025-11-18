# 📐 Sistema de Modales Redimensionables y Arrastrables

Sistema completo para hacer modales **draggable** y **resizable** con múltiples funcionalidades.

---

## 🎯 Características

✅ **Arrastrar** (drag & drop) - Mueve el modal por toda la pantalla  
✅ **Redimensionar** - 8 handles (esquinas + bordes)  
✅ **Snap a bordes** - Ajuste automático al acercarse a los bordes  
✅ **Doble click** - Maximizar/restaurar con doble click en header  
✅ **Persistencia** - Guarda posición/tamaño en localStorage  
✅ **Multi-pantalla** - Arrastra a otra pantalla sin problemas  
✅ **API programática** - Control por código JavaScript  
✅ **Límites inteligentes** - No sale del viewport  

---

## 🚀 Uso Básico

### Inicialización Automática (Ya implementado)

El modal de repuestos se inicializa automáticamente cuando se abre:

```javascript
// En app.openModal() - línea ~35236
this.modalResizableInstance = ModalResizable.init(modalContent, {
  minWidth: 900,
  minHeight: 500,
  draggable: true,
  resizable: true,
  persist: true,
  storageKey: 'modal-repuesto-state'
});
```

### Inicialización Manual

Para otros modales:

```javascript
const modalContent = document.querySelector('.modal-content');
const modalInstance = ModalResizable.init(modalContent, {
  minWidth: 800,
  minHeight: 400,
  draggable: true,
  resizable: true,
  persist: false
});
```

---

## ⚙️ Opciones de Configuración

```javascript
ModalResizable.init(element, {
  minWidth: 800,           // Ancho mínimo en px
  minHeight: 400,          // Alto mínimo en px
  maxWidth: 1920,          // Ancho máximo en px (default: window.innerWidth - 40)
  maxHeight: 1080,         // Alto máximo en px (default: window.innerHeight - 40)
  
  draggable: true,         // Permitir arrastrar
  resizable: true,         // Permitir redimensionar
  
  snapDistance: 20,        // Distancia de snap a bordes (px)
  
  persist: true,           // Guardar estado en localStorage
  storageKey: 'mi-modal',  // Clave para localStorage
  
  onResize: (size) => {    // Callback al redimensionar
    console.log('Nuevo tamaño:', size.width, size.height);
  },
  
  onMove: (pos) => {       // Callback al mover
    console.log('Nueva posición:', pos.left, pos.top);
  }
});
```

---

## 🎮 Controles de Usuario

### Arrastrar
- **Click y arrastrar** en cualquier parte del header/timeline
- **Doble click** en header para maximizar/restaurar

### Redimensionar
- **8 handles invisibles** en bordes y esquinas
- Hover sobre borde/esquina para ver cursor
- Arrastra para redimensionar

### Snap Automático
- Al acercarte a 20px del borde, se ajusta automáticamente
- Útil para alinear modales

---

## 📋 API Programática

### Métodos Disponibles

```javascript
// Centrar modal
modalInstance.center();

// Cambiar tamaño
modalInstance.setSize(1200, 800);

// Cambiar posición
modalInstance.setPosition(100, 50);

// Maximizar
modalInstance.maximize();

// Restaurar tamaño anterior
modalInstance.restore();

// Toggle maximizar/restaurar
modalInstance.toggleMaximize();

// Destruir instancia (limpiar listeners)
modalInstance.destroy();
```

### Ejemplos de Uso

**Centrar modal al abrir:**
```javascript
const modal = ModalResizable.init(element);
modal.center();
```

**Modal con tamaño custom:**
```javascript
const modal = ModalResizable.init(element);
modal.setSize(1400, 900);
modal.center();
```

**Mover a posición específica:**
```javascript
const modal = ModalResizable.init(element);
modal.setPosition(200, 100); // 200px desde izquierda, 100px desde arriba
```

**Maximizar programáticamente:**
```javascript
const modal = ModalResizable.init(element);
modal.maximize();
```

**Callbacks personalizados:**
```javascript
const modal = ModalResizable.init(element, {
  onResize: (size) => {
    console.log(`Nuevo tamaño: ${size.width}x${size.height}`);
    // Ajustar contenido interno
    document.querySelector('.content').style.fontSize = size.width > 1200 ? '16px' : '14px';
  },
  onMove: (pos) => {
    console.log(`Movido a: (${pos.left}, ${pos.top})`);
    // Guardar posición en base de datos
    saveModalPosition(pos);
  }
});
```

---

## 🔧 Integración con Otros Modales

### Modal de Jerarquía

```javascript
// En openJerarquiaModal()
const modalContent = document.querySelector('#modalJerarquia .modal-content');
this.jerarquiaModalInstance = ModalResizable.init(modalContent, {
  minWidth: 600,
  minHeight: 400,
  persist: true,
  storageKey: 'modal-jerarquia-state'
});
```

### Modal de Estadísticas

```javascript
// En abrirModalEstadisticas()
const modalContent = document.querySelector('#modalEstadisticas .modal-content-flex');
this.statsModalInstance = ModalResizable.init(modalContent, {
  minWidth: 900,
  minHeight: 600,
  persist: true,
  storageKey: 'modal-stats-state'
});
```

### Modal Custom

```javascript
function openCustomModal() {
  const modal = document.getElementById('miModal');
  modal.classList.add('active');
  
  const modalContent = modal.querySelector('.modal-content');
  const instance = ModalResizable.init(modalContent, {
    minWidth: 500,
    minHeight: 300,
    draggable: true,
    resizable: true
  });
  
  // Guardar instancia para destruir al cerrar
  modal.modalResizableInstance = instance;
}

function closeCustomModal() {
  const modal = document.getElementById('miModal');
  
  // Destruir instancia
  if (modal.modalResizableInstance) {
    modal.modalResizableInstance.destroy();
    modal.modalResizableInstance = null;
  }
  
  modal.classList.remove('active');
}
```

---

## 💾 Persistencia de Estado

Cuando `persist: true`:

- **Guarda automáticamente** en localStorage al redimensionar/mover
- **Restaura automáticamente** al inicializar
- **Clave personalizable** con `storageKey`

```javascript
// Guardar estado
const modal = ModalResizable.init(element, {
  persist: true,
  storageKey: 'mi-modal-state'
});

// El estado se guarda automáticamente como:
{
  "width": 1200,
  "height": 800,
  "left": 100,
  "top": 50,
  "isMaximized": false
}

// Limpiar estado guardado
localStorage.removeItem('mi-modal-state');
```

---

## 🎨 Estilos CSS (Ya incluidos)

Los handles son invisibles por defecto. El cursor cambia al hover:

```css
.modal-resize-handle {
  position: absolute;
  z-index: 10;
  background: transparent;
}

.modal-drag-handle {
  position: absolute;
  cursor: move;
  user-select: none;
}
```

Cursores automáticos:
- **n/s**: `cursor: ns-resize` (norte/sur)
- **e/w**: `cursor: ew-resize` (este/oeste)
- **ne/sw**: `cursor: nesw-resize` (diagonal)
- **nw/se**: `cursor: nwse-resize` (diagonal)

---

## 🐛 Troubleshooting

### El modal no se puede arrastrar

**Problema:** El header no tiene área draggable.

**Solución:** El sistema crea automáticamente un `.modal-drag-handle`. Si no funciona, verifica que el modal tenga un elemento header.

### El modal se sale de la pantalla

**Problema:** Modal posicionado fuera del viewport.

**Solución:** Usa `modal.center()` o el sistema ajusta automáticamente al redimensionar ventana.

### No guarda el estado

**Problema:** `persist: true` pero no guarda.

**Solución:** Verifica que `storageKey` sea único y que localStorage esté habilitado en el navegador.

### Conflicto con CSS existente

**Problema:** El modal tiene `clamp()` o márgenes auto que interfieren.

**Solución:** El sistema establece `position: fixed` y `margin: 0` automáticamente.

---

## 📊 Performance

- **Ligero**: ~400 líneas de código vanilla JS
- **Sin dependencias**: No requiere jQuery ni librerías externas
- **Optimizado**: Event listeners solo durante drag/resize
- **Memory-safe**: Limpieza automática con `destroy()`

---

## 🔮 Funcionalidades Futuras

- [ ] Snap entre modales múltiples
- [ ] Guardar layouts predefinidos
- [ ] Animaciones suaves al maximizar
- [ ] Restricciones de aspect ratio
- [ ] Touch support para tablets

---

## 💡 Ejemplos Avanzados

### Modal con tamaño adaptativo según contenido

```javascript
const modal = ModalResizable.init(element, {
  onResize: (size) => {
    // Ajustar grid interno según ancho
    const container = element.querySelector('.ubicaciones-grid');
    if (size.width > 1400) {
      container.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else {
      container.style.gridTemplateColumns = '1fr';
    }
  }
});
```

### Sincronizar múltiples modales

```javascript
const modal1 = ModalResizable.init(element1, {
  onMove: (pos) => {
    // Mover modal2 junto con modal1
    modal2.setPosition(pos.left + 50, pos.top + 50);
  }
});

const modal2 = ModalResizable.init(element2);
```

### Límites custom

```javascript
const modal = ModalResizable.init(element, {
  maxWidth: 1600,
  maxHeight: 1000,
  onResize: (size) => {
    // Evitar que sea muy ancho en pantallas pequeñas
    if (window.innerWidth < 1920 && size.width > 1400) {
      modal.setSize(1400, size.height);
    }
  }
});
```

---

## ✅ Checklist de Implementación

- [x] Script `modal-resizable.js` creado
- [x] Script incluido en `index.html`
- [x] Integrado en `app.openModal()`
- [x] Limpieza en `app.closeModal()`
- [x] Documentación completa
- [ ] Testing en múltiples resoluciones
- [ ] Testing con múltiples pantallas
- [ ] Feedback visual al arrastrar (opcional)

---

**Última actualización:** 18 de noviembre de 2025  
**Versión:** 1.0.0  
**Autor:** Sistema APP Inventario v6.0
