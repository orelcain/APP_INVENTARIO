/**
 * MODAL RESIZABLE & DRAGGABLE SYSTEM
 * Sistema completo para modales redimensionables y arrastrables
 * Uso: ModalResizable.init(modalElement, options)
 */

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
      storageKey: options.storageKey || 'modal-state',
      onResize: options.onResize || null,
      onMove: options.onMove || null
    };

    this.state = {
      isDragging: false,
      isResizing: false,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      startLeft: 0,
      startTop: 0,
      resizeDirection: null,
      isMaximized: false,
      previousState: null
    };

    this.init();
  }

  init() {
    // El modal ya tiene position: fixed desde CSS con clase .is-resizable
    // Solo ajustar márgenes
    this.modal.style.margin = '0';
    
    // Cargar estado guardado o centrar
    if (this.options.persist) {
      this.loadState();
    }
    // 🎯 Si persist: false, NO forzar centrado, dejar que flexbox del padre lo centre

    if (this.options.draggable) {
      this.makeDraggable();
    }

    if (this.options.resizable) {
      this.makeResizable();
    }

    // Doble click en header para maximizar
    this.addDoubleClickMaximize();

    // Listener para guardar estado al redimensionar ventana
    window.addEventListener('resize', () => this.handleWindowResize());
  }

  makeDraggable() {
    // Crear header draggable transparente sobre el wizard-timeline
    let dragHandle = this.modal.querySelector('.modal-drag-handle');
    
    if (!dragHandle) {
      dragHandle = document.createElement('div');
      dragHandle.className = 'modal-drag-handle';
      dragHandle.title = 'Arrastra para mover el modal';
      dragHandle.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 50px;
        height: 80px;
        cursor: move;
        z-index: 5;
        user-select: none;
      `;
      this.modal.appendChild(dragHandle);
    }

    dragHandle.addEventListener('mousedown', (e) => this.startDrag(e));
  }

  makeResizable() {
    // Crear handles de resize más grandes y visibles
    const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    
    directions.forEach(dir => {
      const handle = document.createElement('div');
      handle.className = `modal-resize-handle modal-resize-${dir}`;
      handle.dataset.direction = dir;
      handle.title = `Redimensionar ${dir.toUpperCase()}`;
      
      const styles = {
        n: 'top: 0; left: 10px; right: 10px; height: 8px; cursor: ns-resize;',
        s: 'bottom: 0; left: 10px; right: 10px; height: 8px; cursor: ns-resize;',
        e: 'right: 0; top: 10px; bottom: 10px; width: 8px; cursor: ew-resize;',
        w: 'left: 0; top: 10px; bottom: 10px; width: 8px; cursor: ew-resize;',
        ne: 'top: 0; right: 0; width: 20px; height: 20px; cursor: nesw-resize;',
        nw: 'top: 0; left: 0; width: 20px; height: 20px; cursor: nwse-resize;',
        se: 'bottom: 0; right: 0; width: 20px; height: 20px; cursor: nwse-resize;',
        sw: 'bottom: 0; left: 0; width: 20px; height: 20px; cursor: nesw-resize;',
      };

      handle.style.cssText = `
        position: absolute;
        ${styles[dir]}
        z-index: 15;
        background: transparent;
      `;

      handle.addEventListener('mousedown', (e) => this.startResize(e, dir));
      this.modal.appendChild(handle);
    });
  }

  startDrag(e) {
    if (this.state.isMaximized) return;
    
    e.preventDefault();
    this.state.isDragging = true;
    this.state.startX = e.clientX;
    this.state.startY = e.clientY;
    
    const rect = this.modal.getBoundingClientRect();
    this.state.startLeft = rect.left;
    this.state.startTop = rect.top;

    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.stopDrag);
    
    this.modal.style.transition = 'none';
  }

  handleDrag = (e) => {
    if (!this.state.isDragging) return;

    const deltaX = e.clientX - this.state.startX;
    const deltaY = e.clientY - this.state.startY;

    let newLeft = this.state.startLeft + deltaX;
    let newTop = this.state.startTop + deltaY;

    // Snap a bordes
    if (Math.abs(newLeft) < this.options.snapDistance) newLeft = 0;
    if (Math.abs(newTop) < this.options.snapDistance) newTop = 0;
    
    const maxLeft = window.innerWidth - this.modal.offsetWidth;
    const maxTop = window.innerHeight - this.modal.offsetHeight;
    
    if (Math.abs(newLeft - maxLeft) < this.options.snapDistance) newLeft = maxLeft;
    if (Math.abs(newTop - maxTop) < this.options.snapDistance) newTop = maxTop;

    // Limitar a viewport
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    this.modal.style.left = newLeft + 'px';
    this.modal.style.top = newTop + 'px';

    if (this.options.onMove) {
      this.options.onMove({ left: newLeft, top: newTop });
    }
  }

  stopDrag = () => {
    this.state.isDragging = false;
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.stopDrag);
    
    this.modal.style.transition = '';
    
    if (this.options.persist) {
      this.saveState();
    }
  }

  startResize(e, direction) {
    if (this.state.isMaximized) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    this.state.isResizing = true;
    this.state.resizeDirection = direction;
    this.state.startX = e.clientX;
    this.state.startY = e.clientY;
    
    const rect = this.modal.getBoundingClientRect();
    this.state.startWidth = rect.width;
    this.state.startHeight = rect.height;
    this.state.startLeft = rect.left;
    this.state.startTop = rect.top;

    document.addEventListener('mousemove', this.handleResize);
    document.addEventListener('mouseup', this.stopResize);
    
    this.modal.style.transition = 'none';
  }

  handleResize = (e) => {
    if (!this.state.isResizing) return;

    const deltaX = e.clientX - this.state.startX;
    const deltaY = e.clientY - this.state.startY;
    const dir = this.state.resizeDirection;

    let newWidth = this.state.startWidth;
    let newHeight = this.state.startHeight;
    let newLeft = this.state.startLeft;
    let newTop = this.state.startTop;

    // Calcular nuevas dimensiones según dirección
    if (dir.includes('e')) newWidth = this.state.startWidth + deltaX;
    if (dir.includes('w')) {
      newWidth = this.state.startWidth - deltaX;
      newLeft = this.state.startLeft + deltaX;
    }
    if (dir.includes('s')) newHeight = this.state.startHeight + deltaY;
    if (dir.includes('n')) {
      newHeight = this.state.startHeight - deltaY;
      newTop = this.state.startTop + deltaY;
    }

    // Aplicar límites
    newWidth = Math.max(this.options.minWidth, Math.min(newWidth, this.options.maxWidth));
    newHeight = Math.max(this.options.minHeight, Math.min(newHeight, this.options.maxHeight));

    // Ajustar posición si llegamos al límite mínimo
    if (newWidth === this.options.minWidth && dir.includes('w')) {
      newLeft = this.state.startLeft + this.state.startWidth - this.options.minWidth;
    }
    if (newHeight === this.options.minHeight && dir.includes('n')) {
      newTop = this.state.startTop + this.state.startHeight - this.options.minHeight;
    }

    this.modal.style.width = newWidth + 'px';
    this.modal.style.height = newHeight + 'px';
    
    if (dir.includes('w') || dir.includes('n')) {
      this.modal.style.left = newLeft + 'px';
      this.modal.style.top = newTop + 'px';
    }

    if (this.options.onResize) {
      this.options.onResize({ width: newWidth, height: newHeight });
    }
  }

  stopResize = () => {
    this.state.isResizing = false;
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.stopResize);
    
    this.modal.style.transition = '';
    
    if (this.options.persist) {
      this.saveState();
    }
  }

  addDoubleClickMaximize() {
    const dragHandle = this.modal.querySelector('.modal-drag-handle');
    if (dragHandle) {
      dragHandle.addEventListener('dblclick', () => this.toggleMaximize());
    }
  }

  toggleMaximize() {
    if (this.state.isMaximized) {
      this.restore();
    } else {
      this.maximize();
    }
  }

  maximize() {
    if (this.state.isMaximized) return;

    // Guardar estado actual
    const rect = this.modal.getBoundingClientRect();
    this.state.previousState = {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
    };

    // Maximizar
    this.modal.style.width = window.innerWidth + 'px';
    this.modal.style.height = window.innerHeight + 'px';
    this.modal.style.left = '0';
    this.modal.style.top = '0';
    this.modal.style.borderRadius = '0';

    this.state.isMaximized = true;
  }

  restore() {
    if (!this.state.isMaximized || !this.state.previousState) return;

    const prev = this.state.previousState;
    this.modal.style.width = prev.width + 'px';
    this.modal.style.height = prev.height + 'px';
    this.modal.style.left = prev.left + 'px';
    this.modal.style.top = prev.top + 'px';
    this.modal.style.borderRadius = '';

    this.state.isMaximized = false;
  }

  center() {
    const width = this.modal.offsetWidth || this.options.minWidth;
    const height = this.modal.offsetHeight || this.options.minHeight;
    
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    this.modal.style.left = Math.max(0, left) + 'px';
    this.modal.style.top = Math.max(0, top) + 'px';
  }

  setSize(width, height) {
    width = Math.max(this.options.minWidth, Math.min(width, this.options.maxWidth));
    height = Math.max(this.options.minHeight, Math.min(height, this.options.maxHeight));
    
    this.modal.style.width = width + 'px';
    this.modal.style.height = height + 'px';

    if (this.options.persist) {
      this.saveState();
    }
  }

  setPosition(left, top) {
    const maxLeft = window.innerWidth - this.modal.offsetWidth;
    const maxTop = window.innerHeight - this.modal.offsetHeight;
    
    left = Math.max(0, Math.min(left, maxLeft));
    top = Math.max(0, Math.min(top, maxTop));

    this.modal.style.left = left + 'px';
    this.modal.style.top = top + 'px';

    if (this.options.persist) {
      this.saveState();
    }
  }

  handleWindowResize() {
    if (this.state.isMaximized) {
      this.maximize(); // Re-maximizar con nuevo tamaño
      return;
    }

    // Ajustar si el modal queda fuera del viewport
    const rect = this.modal.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width;
    const maxTop = window.innerHeight - rect.height;

    if (rect.left > maxLeft) this.modal.style.left = maxLeft + 'px';
    if (rect.top > maxTop) this.modal.style.top = maxTop + 'px';
  }

  saveState() {
    const rect = this.modal.getBoundingClientRect();
    const state = {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      isMaximized: this.state.isMaximized,
    };
    localStorage.setItem(this.options.storageKey, JSON.stringify(state));
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.options.storageKey);
      if (!saved) {
        this.center();
        return;
      }

      const state = JSON.parse(saved);
      
      if (state.isMaximized) {
        this.maximize();
      } else {
        this.setSize(state.width, state.height);
        this.setPosition(state.left, state.top);
      }
    } catch (e) {
      console.error('Error cargando estado del modal:', e);
      this.center();
    }
  }

  destroy() {
    // Limpiar event listeners y elementos creados
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.stopDrag);
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.stopResize);

    // Remover handles
    this.modal.querySelectorAll('.modal-resize-handle, .modal-drag-handle').forEach(el => el.remove());
  }

  // API pública
  static init(modalElement, options = {}) {
    return new ModalResizable(modalElement, options);
  }
}

// Export para uso global
window.ModalResizable = ModalResizable;
