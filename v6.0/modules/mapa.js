// ========================================
// MÓDULO DE MAPA
// mapController - Gestión de mapas y zonas
// ========================================

import { fsManager, mapStorage } from './storage.js';

const mapController = {
  elements: {},
  state: {
    currentMapId: null,
    currentMap: null,
    currentImage: null,
    currentImageUrl: null,
    scale: 1,
    minScale: 0.05,
    maxScale: 20,
    offsetX: 0,
    offsetY: 0,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    drawing: false,
    tempPoints: [],
    previewPoint: null,
    highlightZoneId: null,
    showGrid: false,
    zones: []
  },

  init() {
    this.elements = {
      shell: document.querySelector('.map-shell'),
      connectBtn: document.getElementById('mapConnectBtn'),
      newBtn: document.getElementById('mapNewBtn'),
      drawBtn: document.getElementById('mapDrawZoneBtn'),
      saveBtn: document.getElementById('mapSaveZonesBtn'),
      mapList: document.getElementById('mapList'),
      zoneList: document.getElementById('zoneList'),
      logList: document.getElementById('mapLogList'),
      logRefreshBtn: document.getElementById('mapLogRefreshBtn'),
      connectionBadge: document.getElementById('mapConnectionBadge'),
      status: document.getElementById('mapStatus'),
      zoomBadge: document.getElementById('mapZoomBadge'),
      metaBadge: document.getElementById('mapMetaBadge'),
      toolbar: document.getElementById('mapToolbar'),
      canvasStage: document.querySelector('.map-canvas-stage'),
      canvas: document.getElementById('mapCanvas'),
      hint: document.getElementById('mapHint'),
      modal: document.getElementById('mapModalOverlay'),
      modalBody: document.getElementById('mapModalBody'),
      modalTitle: document.getElementById('mapModalTitle'),
      modalClose: document.getElementById('mapModalClose')
    };

    if (!this.elements.canvas) {
      console.warn('mapController: canvas no disponible');
      return;
    }

    this.ctx = this.elements.canvas.getContext('2d', { alpha: false, desynchronized: true });
    this.bindEvents();
    this.updateConnectionBadge();
    this.resizeCanvas();

    if (mapStorage.initialized) {
      this.loadData();
    } else if (fsManager.isConnected) {
      mapStorage.init({ autoReconnect: false }).then(() => this.loadData()).catch((error) => {
        console.warn('mapController: no se pudo inicializar mapStorage de inmediato', error);
      });
    } else {
      this.drawMessage('Conecta la carpeta INVENTARIO_STORAGE para comenzar.');
      this.renderMapList([]);
      this.renderZoneList([]);
    }
  },

  bindEvents() {
    const { connectBtn, newBtn, drawBtn, toolbar, logRefreshBtn, modalClose, modal } = this.elements;

    if (connectBtn) connectBtn.addEventListener('click', () => this.handleConnect());
    if (newBtn) newBtn.addEventListener('click', () => this.openNewMapModal());
    if (drawBtn) drawBtn.addEventListener('click', () => this.toggleDrawingMode());
    if (toolbar) {
      toolbar.addEventListener('click', (event) => {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;
        event.preventDefault();
        this.handleToolbarAction(action);
      });
    }
    if (logRefreshBtn) logRefreshBtn.addEventListener('click', () => this.refreshLog());
    if (modalClose) modalClose.addEventListener('click', () => this.closeModal());
    if (modal) modal.addEventListener('click', (event) => {
      if (event.target === modal) this.closeModal();
    });

    this.registerCanvasEvents();
    window.addEventListener('resize', () => this.handleResize());
  },

  async handleConnect() {
    if (typeof fsManager?.checkFileSystemAPI === 'function' && !fsManager.checkFileSystemAPI()) {
      this.showToast('Tu navegador no soporta File System Access API. Usa Microsoft Edge o Chrome.', 'warning');
      return;
    }

    try {
      const connected = await fsManager.selectFolder();
      if (connected) {
        await mapStorage.init({ autoReconnect: false });
        this.showToast('Carpeta conectada correctamente.', 'success');
        this.updateConnectionBadge();
        await this.loadData({ force: true });
      }
    } catch (error) {
      console.error('Error conectando carpeta:', error);
      this.showToast('No se pudo conectar la carpeta: ' + (error?.message || error), 'error');
    }
  },

  updateConnectionBadge() {
    const { connectionBadge, status } = this.elements;
    if (!connectionBadge) return;

    if (mapStorage.initialized && fsManager.isConnected) {
      connectionBadge.textContent = fsManager.folderPath || 'INVENTARIO_STORAGE';
      connectionBadge.classList.remove('map-status-badge--off');
      connectionBadge.classList.add('map-status-badge--on');
      if (status) {
        status.textContent = 'Selecciona un mapa o crea uno nuevo para comenzar a trabajar.';
      }
    } else {
      connectionBadge.textContent = 'Sin carpeta';
      connectionBadge.classList.remove('map-status-badge--on');
      connectionBadge.classList.add('map-status-badge--off');
      if (status) {
        status.textContent = 'Conecta la carpeta INVENTARIO_STORAGE para habilitar el editor de mapas.';
      }
    }
  },

  async loadData(options = {}) {
    if (!mapStorage.initialized) {
      this.renderMapList([]);
      this.renderZoneList([]);
      this.drawMessage('Conecta la carpeta INVENTARIO_STORAGE para comenzar.');
      return;
    }

    try {
      if (options.force) {
        await mapStorage.ensureStructure();
        await Promise.all([mapStorage.loadMaps(), mapStorage.loadZones()]);
      }

      const maps = mapStorage.maps || [];
      this.renderMapList(maps);

      if (!maps.length) {
        this.state.currentMapId = null;
        this.state.currentMap = null;
        this.cleanupImage();
        this.renderZoneList([]);
        this.drawMessage('Crea un mapa para comenzar a dibujar zonas.');
        return;
      }

      if (!this.state.currentMapId || !maps.some(m => m.id === this.state.currentMapId)) {
        await this.selectMap(maps[0].id);
      } else {
        await this.selectMap(this.state.currentMapId, { keepViewport: true });
      }

      await this.refreshLog();
    } catch (error) {
      console.error('mapController.loadData error:', error);
      this.showToast('No se pudieron cargar los mapas. Revisa la consola.', 'error');
    }
  },

  renderMapList(maps) {
    const { mapList } = this.elements;
    if (!mapList) return;

    if (!Array.isArray(maps) || !maps.length) {
      mapList.innerHTML = `<div style="padding: 16px; border: 1px dashed var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 0.85rem;">Aún no hay mapas registrados.</div>`;
      return;
    }

    const activeId = this.state.currentMapId;
    mapList.innerHTML = maps.map(map => {
      const isActive = activeId === map.id;
      const createdAt = map.createdAt ? new Date(map.createdAt).toLocaleDateString('es-CL') : '';
      const dimensions = map.width && map.height ? `${map.width} × ${map.height}px` : 'Dimensiones pendientes';
      const zonesCount = (mapStorage.zones || []).filter(z => z.mapId === map.id).length;
      return `
        <article class="map-card ${isActive ? 'map-card--active' : ''}" data-map-id="${map.id}">
          <div class="map-card-title">${this.escapeHtml(map.name || 'Mapa sin nombre')}</div>
          <div class="map-card-meta">${dimensions}</div>
          <div class="map-card-meta">${zonesCount} zona(s) registradas</div>
          ${createdAt ? `<div class="map-card-meta">Creado: ${createdAt}</div>` : ''}
        </article>
      `;
    }).join('');

    Array.from(mapList.querySelectorAll('.map-card')).forEach(card => {
      card.addEventListener('click', async () => {
        const mapId = card.getAttribute('data-map-id');
        if (!mapId) return;
        await this.selectMap(mapId);
      });
    });
  },

  renderZoneList(zones) {
    const { zoneList } = this.elements;
    if (!zoneList) return;

    if (!Array.isArray(zones) || !zones.length) {
      zoneList.innerHTML = `<div style="padding: 12px; border: 1px dashed var(--border-color); border-radius: 8px; color: var(--text-secondary); font-size: 0.8rem;">No hay zonas registradas para este mapa.</div>`;
      return;
    }

    zoneList.innerHTML = zones.map(zone => {
      const color = zone.color || '#5a6b7a';
      const jerarquia = zone.jerarquia ? Object.values(zone.jerarquia).filter(Boolean).join(' > ') : '';
      const equipos = Array.isArray(zone.equipos) ? zone.equipos.length : 0;
      return `
        <div class="map-zone-item ${zone.id === this.state.highlightZoneId ? 'map-zone-item--active' : ''}" data-zone-id="${zone.id}" style="border-left-color:${color};">
          <div class="map-zone-title">${this.escapeHtml(zone.name || 'Zona sin nombre')}</div>
          ${jerarquia ? `<div class="map-zone-subtitle">${this.escapeHtml(jerarquia)}</div>` : ''}
          <div class="map-zone-subtitle">${equipos} equipos asociados</div>
        </div>
      `;
    }).join('');

    Array.from(zoneList.querySelectorAll('.map-zone-item')).forEach(item => {
      item.addEventListener('click', () => {
        const zoneId = item.getAttribute('data-zone-id');
        this.focusZone(zoneId);
      });
    });
  },

  async selectMap(mapId, options = {}) {
    if (!mapId) return;
    if (!mapStorage.initialized) {
      this.showToast('Conecta la carpeta primero.', 'warning');
      return;
    }

    const numericId = typeof mapId === 'string' ? parseInt(mapId, 10) : mapId;
    const map = mapStorage.getMapById(numericId);

    if (!map) {
      this.showToast('Mapa no encontrado.', 'warning');
      return;
    }

    this.state.currentMapId = map.id;
    this.state.currentMap = map;
    this.state.zones = mapStorage.getZonesByMap(map.id);
    this.state.highlightZoneId = null;

    if (!options.keepViewport) {
      this.state.scale = 1;
      this.state.offsetX = 0;
      this.state.offsetY = 0;
    }

    await this.loadMapImage(map, options);
    this.renderMapList(mapStorage.maps);
    this.renderZoneList(this.state.zones);
    this.updateMetaBadge();
  },

  async loadMapImage(map, options = {}) {
    this.cleanupImage();

    if (!map.imagePath) {
      this.drawMessage('El mapa seleccionado no tiene imagen asociada.');
      return;
    }

    try {
      const file = await mapStorage.getMapImage(map);
      if (!file) {
        this.drawMessage('No se encontr la imagen del mapa.');
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        this.state.currentImage = img;
        this.state.currentImageUrl = url;
        this.configureCanvasForImage(img, options);
        this.draw();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        this.drawMessage('Error cargando la imagen del mapa.');
      };
      img.src = url;
    } catch (error) {
      console.error('Error cargando imagen del mapa:', error);
      this.drawMessage('No se pudo cargar la imagen del mapa.');
    }
  },

  configureCanvasForImage(img, options = {}) {
    const canvas = this.elements.canvas;
    if (!canvas) return;

    canvas.width = img.width;
    canvas.height = img.height;

    const container = this.elements.canvasStage || canvas.parentElement;
    if (container) {
      const containerWidth = Math.max(container.clientWidth - 48, 320);
      const containerHeight = Math.max(container.clientHeight - 48, 240);
      const initialCssScale = Math.min(containerWidth / img.width, containerHeight / img.height, 1);
      canvas.style.width = `${img.width * initialCssScale}px`;
      canvas.style.height = `${img.height * initialCssScale}px`;
    }

    if (!options.keepViewport) {
      this.state.scale = 1;
      this.state.offsetX = 0;
      this.state.offsetY = 0;
    }

    this.updateZoomBadge();
  },

  cleanupImage() {
    if (this.state.currentImageUrl) {
      try {
        URL.revokeObjectURL(this.state.currentImageUrl);
      } catch (error) {
        console.debug('cleanupImage revoke fall:', error);
      }
    }
    this.state.currentImageUrl = null;
    this.state.currentImage = null;
  },

  handleResize() {
    if (!this.elements.canvas) return;
    if (!this.state.currentImage) {
      this.resizeCanvas();
      return;
    }

    const container = this.elements.canvasStage || this.elements.canvas.parentElement;
    if (container) {
      const containerWidth = Math.max(container.clientWidth - 48, 320);
      const containerHeight = Math.max(container.clientHeight - 48, 240);
      const img = this.state.currentImage;
      const cssScale = Math.min(containerWidth / img.width, containerHeight / img.height, 1);
      this.elements.canvas.style.width = `${img.width * cssScale}px`;
      this.elements.canvas.style.height = `${img.height * cssScale}px`;
    }

    this.draw();
  },

  resizeCanvas() {
    const canvas = this.elements.canvas;
    if (!canvas) return;

    if (!this.state.currentImage) {
      const container = this.elements.canvasStage || canvas.parentElement;
      const rectWidth = container ? container.clientWidth : 640;
      const rectHeight = container ? container.clientHeight : 480;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rectWidth * dpr));
      canvas.height = Math.max(1, Math.round(rectHeight * dpr));
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.drawMessage('Conecta la carpeta INVENTARIO_STORAGE para comenzar.');
    } else {
      this.handleResize();
    }
  },

  drawMessage(message) {
    const canvas = this.elements.canvas;
    if (!canvas || !this.ctx) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(212, 212, 212, 0.9)';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.restore();
  },

  draw() {
    const canvas = this.elements.canvas;
    if (!canvas || !this.ctx) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(this.state.offsetX, this.state.offsetY);
    ctx.scale(this.state.scale, this.state.scale);

    if (this.state.currentImage) {
      ctx.drawImage(this.state.currentImage, 0, 0);
    }

    if (this.state.showGrid) {
      this.drawGrid(ctx);
    }

    this.drawZones(ctx);
    this.drawTempShape(ctx);

    ctx.restore();
    this.updateZoomBadge();
  },

  drawGrid(ctx) {
    if (!this.state.currentImage) return;
    const step = 100;
    const width = this.state.currentImage.width;
    const height = this.state.currentImage.height;
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1 / this.state.scale;

    for (let x = step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  },

  drawZones(ctx) {
    if (!Array.isArray(this.state.zones) || !this.state.zones.length) return;

    ctx.save();
    this.state.zones.forEach(zone => {
      if (!Array.isArray(zone.points) || zone.points.length < 3) return;
      const color = zone.color || '#5a6b7a';
      const opacity = typeof zone.opacity === 'number' ? zone.opacity : 0.35;
      ctx.beginPath();
      zone.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.fillStyle = this.hexToRgba(color, opacity);
      ctx.strokeStyle = zone.id === this.state.highlightZoneId ? '#8a7a5a' : color;
      ctx.lineWidth = zone.id === this.state.highlightZoneId ? 3 / this.state.scale : 2 / this.state.scale;
      ctx.fill();
      ctx.stroke();

      const centroid = this.calculateCentroid(zone.points);
      if (centroid) {
        ctx.save();
        ctx.fillStyle = zone.id === this.state.highlightZoneId ? '#8a7a5a' : '#d4d4d4';
        ctx.font = `${Math.max(12, 24 / this.state.scale)}px "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(zone.name || 'Zona', centroid.x, centroid.y);
        ctx.restore();
      }
    });
    ctx.restore();
  },

  drawTempShape(ctx) {
    if (!this.state.drawing || this.state.tempPoints.length === 0) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.lineWidth = 2 / this.state.scale;

    ctx.beginPath();
    this.state.tempPoints.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });

    if (this.state.previewPoint) {
      ctx.lineTo(this.state.previewPoint.x, this.state.previewPoint.y);
    }

    if (this.state.tempPoints.length >= 2) {
      ctx.fill();
    }
    ctx.stroke();

    ctx.fillStyle = '#5a6b7a';
    this.state.tempPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4 / this.state.scale, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  },

  registerCanvasEvents() {
    const canvas = this.elements.canvas;
    if (!canvas) return;

    canvas.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        if (this.state.drawing) {
          this.addPoint(event);
        } else {
          this.beginPan(event);
        }
      }
    });

    canvas.addEventListener('mousemove', (event) => {
      if (this.state.drawing) {
        this.updatePreviewPoint(event);
      } else if (this.state.isPanning) {
        this.pan(event);
      }
    });

    ['mouseup', 'mouseleave'].forEach(type => {
      canvas.addEventListener(type, () => this.endPan());
    });

    canvas.addEventListener('wheel', (event) => this.handleWheel(event));

    canvas.addEventListener('dblclick', (event) => {
      if (this.state.drawing) {
        event.preventDefault();
        this.finishDrawing();
      }
    });

    canvas.addEventListener('contextmenu', (event) => {
      if (this.state.drawing) {
        event.preventDefault();
        this.finishDrawing();
      }
    });
  },

  beginPan(event) {
    const { canvasX, canvasY } = this.getCanvasCoordinates(event);
    this.state.isPanning = true;
    this.state.panStartX = canvasX - this.state.offsetX;
    this.state.panStartY = canvasY - this.state.offsetY;
    this.elements.canvas.style.cursor = 'grabbing';
  },

  pan(event) {
    if (!this.state.isPanning) return;
    const { canvasX, canvasY } = this.getCanvasCoordinates(event);
    this.state.offsetX = canvasX - this.state.panStartX;
    this.state.offsetY = canvasY - this.state.panStartY;
    this.draw();
  },

  endPan() {
    if (this.state.isPanning) {
      this.state.isPanning = false;
      this.elements.canvas.style.cursor = this.state.drawing ? 'crosshair' : 'grab';
    }
  },

  handleWheel(event) {
    if (!this.state.currentImage) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.85 : 1.15;
    const coords = this.getCanvasCoordinates(event);
    this.zoomAt(coords.canvasX, coords.canvasY, delta);
  },

  zoomAt(canvasX, canvasY, factor) {
    const newScale = Math.max(this.state.minScale, Math.min(this.state.maxScale, this.state.scale * factor));
    if (newScale === this.state.scale) return;

    const worldX = (canvasX - this.state.offsetX) / this.state.scale;
    const worldY = (canvasY - this.state.offsetY) / this.state.scale;

    this.state.scale = newScale;
    this.state.offsetX = canvasX - worldX * newScale;
    this.state.offsetY = canvasY - worldY * newScale;
    this.draw();
  },

  handleToolbarAction(action) {
    switch (action) {
      case 'zoom-in':
        this.zoomCentered(1.2);
        break;
      case 'zoom-out':
        this.zoomCentered(1 / 1.2);
        break;
      case 'reset-view':
        this.resetView();
        break;
      case 'toggle-grid':
        this.toggleGrid();
        break;
      case 'recenter':
        this.recenter();
        break;
      default:
        console.debug('Accin de toolbar no implementada:', action);
    }
  },

  zoomCentered(factor) {
    if (!this.state.currentImage) return;
    const canvas = this.elements.canvas;
    const canvasX = canvas.width / 2;
    const canvasY = canvas.height / 2;
    this.zoomAt(canvasX, canvasY, factor);
  },

  resetView() {
    this.state.scale = 1;
    this.state.offsetX = 0;
    this.state.offsetY = 0;
    this.draw();
  },

  recenter() {
    if (!this.state.currentImage) return;
    const canvas = this.elements.canvas;
    const centerX = (this.state.currentImage.width / 2) * this.state.scale;
    const centerY = (this.state.currentImage.height / 2) * this.state.scale;
    this.state.offsetX = canvas.width / 2 - centerX;
    this.state.offsetY = canvas.height / 2 - centerY;
    this.draw();
  },

  toggleGrid() {
    this.state.showGrid = !this.state.showGrid;
    this.draw();
    this.showToast(this.state.showGrid ? 'Rejilla activada.' : 'Rejilla desactivada.', 'info');
  },

  getCanvasCoordinates(event) {
    const canvas = this.elements.canvas;
    const rect = canvas.getBoundingClientRect();
    const cssScaleX = canvas.width / rect.width;
    const cssScaleY = canvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * cssScaleX;
    const canvasY = (event.clientY - rect.top) * cssScaleY;
    return { canvasX, canvasY };
  },

  getMapPoint(event) {
    const { canvasX, canvasY } = this.getCanvasCoordinates(event);
    const mapX = (canvasX - this.state.offsetX) / this.state.scale;
    const mapY = (canvasY - this.state.offsetY) / this.state.scale;
    return { mapX, mapY, canvasX, canvasY };
  },

  addPoint(event) {
    const { mapX, mapY } = this.getMapPoint(event);
    if (!Number.isFinite(mapX) || !Number.isFinite(mapY)) return;

    if (this.state.tempPoints.length >= 3) {
      const firstPoint = this.state.tempPoints[0];
      const distance = Math.hypot(firstPoint.x - mapX, firstPoint.y - mapY);
      if (distance <= 15) {
        this.finishDrawing();
        return;
      }
    }

    this.state.tempPoints.push({ x: mapX, y: mapY });
    this.draw();
  },

  updatePreviewPoint(event) {
    const { mapX, mapY } = this.getMapPoint(event);
    this.state.previewPoint = { x: mapX, y: mapY };
    this.draw();
  },

  finishDrawing() {
    if (this.state.tempPoints.length < 3) {
      this.showToast('Necesitas al menos 3 puntos para crear una zona.', 'warning');
      return;
    }

    this.openZoneModal();
  },

  toggleDrawingMode() {
    if (!mapStorage.initialized || !this.state.currentMapId) {
      this.showToast('Selecciona un mapa antes de dibujar una zona.', 'info');
      return;
    }

    if (this.state.drawing) {
      this.cancelDrawing();
    } else {
      this.state.drawing = true;
      this.state.tempPoints = [];
      this.state.previewPoint = null;
      this.state.highlightZoneId = null;
      if (this.elements.drawBtn) {
        this.elements.drawBtn.textContent = 'Finalizar zona';
        this.elements.drawBtn.classList.add('map-btn--primary');
      }
      this.showHint('Modo dibujo activo: haz clic para agregar puntos. Doble clic o clic derecho para cerrar.');
      this.elements.canvas.style.cursor = 'crosshair';
    }
  },

  cancelDrawing() {
    this.state.drawing = false;
    this.state.tempPoints = [];
    this.state.previewPoint = null;
    if (this.elements.drawBtn) {
      this.elements.drawBtn.textContent = 'Dibujar zona';
      this.elements.drawBtn.classList.remove('map-btn--primary');
    }
    this.hideHint();
    this.elements.canvas.style.cursor = 'grab';
    this.draw();
  },

  openZoneModal() {
    const modal = this.elements.modal;
    const body = this.elements.modalBody;
    if (!modal || !body) return;

    this.elements.modalTitle.textContent = 'Definir nueva zona';

    const jerarquia = app?.opcionesJerarquia || {};
    const buildDatalist = (id, values) => {
      if (!Array.isArray(values) || !values.length) return '';
      return `<datalist id="${id}">${values.map(v => `<option value="${this.escapeHtml(v)}"></option>`).join('')}</datalist>`;
    };

    body.innerHTML = `
      <form id="mapZoneForm" class="map-zone-form">
        <div class="form-group">
          <label>Nombre de la zona</label>
          <input type="text" name="zoneName" required placeholder="Ej: Planta Principal" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Color</label>
            <input type="color" name="zoneColor" value="#5a6b7a" />
          </div>
          <div class="form-group">
            <label>Opacidad</label>
            <input type="range" name="zoneOpacity" min="10" max="90" value="35" />
          </div>
        </div>
        <div class="form-group">
          <label>Nivel 1  rea general</label>
          <input type="text" name="nivel1" list="nivel1List" placeholder="Ej: Planta Principal" />
          ${buildDatalist('nivel1List', jerarquia.areaGeneral)}
        </div>
        <div class="form-group">
          <label>Nivel 2  Sub-rea</label>
          <input type="text" name="nivel2" list="nivel2List" placeholder="Ej: Lnea de Eviscerado" />
          ${buildDatalist('nivel2List', jerarquia.subArea)}
        </div>
        <div class="form-group">
          <label>Nivel 3  Sistema / Equipo</label>
          <input type="text" name="nivel3" list="nivel3List" placeholder="Ej: Grader Baader" />
          ${buildDatalist('nivel3List', jerarquia.sistemaEquipo)}
        </div>
        <div class="form-group">
          <label>Nivel 4  Sub-sistema</label>
          <input type="text" name="nivel4" list="nivel4List" placeholder="Ej: Cinta Zeta" />
          ${buildDatalist('nivel4List', jerarquia.subSistema)}
        </div>
        <div class="form-group">
          <label>Nivel 5  Seccin</label>
          <input type="text" name="nivel5" list="nivel5List" placeholder="Ej: Mdulo 1" />
          ${buildDatalist('nivel5List', jerarquia.seccion)}
        </div>
        <div class="form-group">
          <label>Equipos / mquinas (uno por lnea)</label>
          <textarea name="equipos" rows="4" placeholder="Ej:\nMotor principal\nBanda transportadora"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="map-btn map-btn--ghost" data-action="cancel">Cancelar</button>
          <button type="submit" class="map-btn map-btn--primary">Guardar zona</button>
        </div>
      </form>
    `;

    modal.classList.remove('hidden');

    const form = body.querySelector('#mapZoneForm');
    const cancelBtn = body.querySelector('[data-action="cancel"]');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
      this.closeModal();
      this.cancelDrawing();
    });

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.saveZoneFromModal(new FormData(form));
      });
    }
  },

  closeModal() {
    const modal = this.elements.modal;
    if (modal) {
      modal.classList.add('hidden');
    }
    this.elements.modalBody.innerHTML = '';
    this.elements.modalTitle.textContent = '';
  },

  async saveZoneFromModal(formData) {
    const name = (formData.get('zoneName') || '').toString().trim();
    if (!name) {
      this.showToast('Asigna un nombre a la zona.', 'warning');
      return;
    }

    const color = (formData.get('zoneColor') || '#5a6b7a').toString();
    const opacityValue = parseInt(formData.get('zoneOpacity'), 10);
    const opacity = Number.isFinite(opacityValue) ? opacityValue / 100 : 0.35;

    const jerarquia = {
      nivel1: (formData.get('nivel1') || '').toString().trim() || null,
      nivel2: (formData.get('nivel2') || '').toString().trim() || null,
      nivel3: (formData.get('nivel3') || '').toString().trim() || null,
      nivel4: (formData.get('nivel4') || '').toString().trim() || null,
      nivel5: (formData.get('nivel5') || '').toString().trim() || null
    };

    const equiposRaw = (formData.get('equipos') || '').toString();
    const equipos = equiposRaw
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    const zone = {
      id: Date.now(),
      mapId: this.state.currentMapId,
      name,
      color,
      opacity,
      points: [...this.state.tempPoints],
      jerarquia,
      equipos,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const zones = [...(mapStorage.zones || []), zone];
      await mapStorage.saveZones(zones, { action: 'create', mapId: zone.mapId, zoneId: zone.id, detail: zone.name });
      this.state.zones = mapStorage.getZonesByMap(zone.mapId);
      this.renderZoneList(this.state.zones);
      this.state.highlightZoneId = zone.id;
      this.closeModal();
      this.cancelDrawing();
      this.draw();
      this.showToast('Zona guardada correctamente.', 'success');
      this.updateMetaBadge();

      if (typeof app?.aprenderNuevaOpcion === 'function') {
        Object.entries(jerarquia).forEach(([nivel, valor]) => {
          if (valor) {
            app.aprenderNuevaOpcion(nivel, valor);
          }
        });
      }
    } catch (error) {
      console.error('Error guardando la zona:', error);
      this.showToast('No se pudo guardar la zona. Revisa la consola.', 'error');
    }
  },

  focusZone(zoneId) {
    const zone = this.state.zones.find(z => z.id == zoneId);
    if (!zone || !Array.isArray(zone.points) || zone.points.length < 1) return;

    this.state.highlightZoneId = zone.id;

    const xs = zone.points.map(p => p.x);
    const ys = zone.points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const zoneWidth = Math.max(1, maxX - minX);
    const zoneHeight = Math.max(1, maxY - minY);
    const canvas = this.elements.canvas;

    const scaleX = (canvas.width * 0.6) / zoneWidth;
    const scaleY = (canvas.height * 0.6) / zoneHeight;
    const targetScale = Math.min(scaleX, scaleY, this.state.maxScale);

    this.state.scale = Math.max(this.state.minScale, targetScale);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    this.state.offsetX = canvas.width / 2 - centerX * this.state.scale;
    this.state.offsetY = canvas.height / 2 - centerY * this.state.scale;

    this.draw();
  },

  updateMetaBadge() {
    const badge = this.elements.metaBadge;
    if (!badge) return;
    if (!this.state.currentMap) {
      badge.textContent = 'Sin mapa';
      return;
    }
    const map = this.state.currentMap;
    const zonesCount = this.state.zones.length;
    const dimensions = map.width && map.height ? `${map.width} × ${map.height}px` : 'Dimensiones pendientes';
    badge.textContent = `${map.name} × ${dimensions}  ${zonesCount} zona(s)`;
  },

  updateZoomBadge() {
    const badge = this.elements.zoomBadge;
    if (!badge) return;
    badge.textContent = `${Math.round(this.state.scale * 100)}%`;
  },

  calculateCentroid(points) {
    if (!Array.isArray(points) || points.length === 0) return null;
    const sum = points.reduce((acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      return acc;
    }, { x: 0, y: 0 });
    return {
      x: sum.x / points.length,
      y: sum.y / points.length
    };
  },

  openNewMapModal() {
    if (!mapStorage.initialized) {
      this.showToast('Conecta la carpeta antes de crear un mapa.', 'info');
      return;
    }

    const modal = this.elements.modal;
    const body = this.elements.modalBody;
    if (!modal || !body) return;

    this.elements.modalTitle.textContent = 'Nuevo mapa';
    body.innerHTML = `
      <form id="mapCreateForm" class="map-zone-form">
        <div class="form-group">
          <label>Nombre del mapa</label>
          <input type="text" name="mapName" required placeholder="Ej: Planta principal" />
        </div>
        <div class="form-group">
          <label>Imagen del mapa</label>
          <input type="file" name="mapImage" accept="image/*" required />
          <small style="color: var(--text-secondary); font-size: 0.75rem;">Se recomienda usar imgenes en alta resolucin (PNG, JPG o WEBP).</small>
        </div>
        <div class="form-actions">
          <button type="button" class="map-btn map-btn--ghost" data-action="cancel">Cancelar</button>
          <button type="submit" class="map-btn map-btn--primary">Guardar mapa</button>
        </div>
      </form>
    `;

    modal.classList.remove('hidden');

    const form = body.querySelector('#mapCreateForm');
    const cancelBtn = body.querySelector('[data-action="cancel"]');

    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        await this.createMapFromForm(formData);
      });
    }
  },

  async createMapFromForm(formData) {
    const name = (formData.get('mapName') || '').toString().trim();
    const file = formData.get('mapImage');
    if (!name) {
      this.showToast('Asigna un nombre al mapa.', 'warning');
      return;
    }
    if (!(file instanceof File)) {
      this.showToast('Selecciona una imagen para el mapa.', 'warning');
      return;
    }

    try {
      await mapStorage.ensureStructure();
      const timestamp = Date.now();
      const extension = (file.name.split('.').pop() || 'png').toLowerCase();
      const safeExtension = extension.length <= 5 ? extension : 'png';
      const fileName = `map_${timestamp}.${safeExtension}`;
      let mapDir = mapStorage.mapImagesDir;
      if (!mapDir) {
        mapDir = await mapStorage.rootHandle.getDirectoryHandle('imagenes', { create: true });
        mapDir = await mapDir.getDirectoryHandle('mapas', { create: true });
        mapStorage.mapImagesDir = mapDir;
      }

      const fileHandle = await mapDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();

      const dimensions = await this.getImageDimensions(file);

      const mapRecord = {
        id: timestamp,
        name,
        imagePath: `${mapStorage.mapImagesPath.join('/')}/${fileName}`,
        width: dimensions.width,
        height: dimensions.height,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedMaps = [...(mapStorage.maps || []), mapRecord];
      await mapStorage.saveMaps(updatedMaps, { action: 'create', mapId: mapRecord.id, detail: mapRecord.name });

      this.closeModal();
      await this.loadData();
      await this.selectMap(mapRecord.id);
      this.showToast('Mapa creado correctamente.', 'success');
    } catch (error) {
      console.error('Error creando mapa:', error);
      this.showToast('No se pudo crear el mapa. Revisa la consola.', 'error');
    }
  },

  async getImageDimensions(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  },

  async refreshLog() {
    const events = mapStorage.initialized ? await mapStorage.readLog(30) : [];
    this.renderLog(events);
  },

  renderLog(events) {
    const { logList } = this.elements;
    if (!logList) return;

    if (!Array.isArray(events) || !events.length) {
      logList.innerHTML = `<div style="color: var(--text-secondary);">Sin eventos registrados.</div>`;
      return;
    }

    logList.innerHTML = events.map(event => {
      const timestamp = event.timestamp ? new Date(event.timestamp).toLocaleString('es-CL') : '';
      const scope = event.scope || 'maps';
      const action = event.action || 'update';
      const detail = event.detail ? `  ${this.escapeHtml(event.detail)}` : '';
      return `<div class="map-log-entry"><time>${timestamp}</time><span>${scope} × ${action}${detail}</span></div>`;
    }).join('');
  },

  showHint(text) {
    const hint = this.elements.hint;
    if (!hint) return;
    hint.textContent = text;
    hint.classList.remove('hidden');
  },

  hideHint() {
    const hint = this.elements.hint;
    if (!hint) return;
    hint.classList.add('hidden');
  },

  escapeHtml(text) {
    return text
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  hexToRgba(hex, alpha = 0.35) {
    let normalized = hex.replace('#', '').trim();
    if (normalized.length === 3) {
      normalized = normalized.split('').map(char => char + char).join('');
    }
    const bigint = parseInt(normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  showToast(message, type = 'info') {
    if (typeof app?.showToast === 'function') {
      app.showToast(message, type);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }
};

// IndexedDB Manager comentado temporalmente (no implementado en v6.0)
// const indexedDBManager = new IndexedDBImageManager();

// if (!('showDirectoryPicker' in window)) {
//   indexedDBManager.init().then(() => {
//     console.log('  IndexedDB Manager inicializado para modo mvil');
//   }).catch(err => {
//     console.error('- Error al inicializar IndexedDB:', err);
//   });
// }

const globalBlobCache = new Map();

// Funcin para obtener o crear Blob URL con cach global
async function getCachedBlobUrl(filename, loadFunction) {
  if (globalBlobCache.has(filename)) {
    const cached = globalBlobCache.get(filename);
    console.log(`  [CACH GLOBAL] Reutilizando: ${filename}`);
    return cached.url;
  }
  
  const url = await loadFunction();
  if (url) {
    // Guardar con referencia fuerte
    globalBlobCache.set(filename, {
      url: url,
      timestamp: Date.now(),
      filename: filename
    });
    console.log(`- [CACH GLOBAL] Guardado: ${filename} (Total: ${globalBlobCache.size})`);
  }
  return url;
}

function activarModoFileSystem() {
  if (!('showDirectoryPicker' in window)) {
    alert('Tu navegador no soporta FileSystem Access API.\n\nPor favor usa:\n Google Chrome 86+\n Microsoft Edge 86+');
    return;
  }
  fsManager.selectFolder().then(ok => {
    if (ok) {
      document.getElementById('fsBadge').style.display = 'inline';
      alert('Almacenamiento Ilimitado activado!\n\nAhora puedes agregar INFINITAS imgenes.\nCarpeta: ' + fsManager.folderPath);
    }
  });
}

// FUNCIN TOGGLE PARA ACTIVAR/DESACTIVAR ALMACENAMIENTO ILIMITADO
function toggleModoFileSystem() {
  if (fsManager.isFileSystemMode) {
    // Si est activo, mostrar confirmacin para desactivar
    const confirmar = confirm(
      'Almacenamiento Ilimitado ACTIVO\n\n' +
      'Deseas DESACTIVAR el almacenamiento ilimitado?\n\n' +
      'Se volver al modo localStorage (lmite 10MB)\n' +
      'Los datos guardados en la carpeta NO se perdern'
    );
    if (confirmar) {
      desactivarModoFileSystem();
    }
  } else {
    // Si est inactivo, activar
    activarModoFileSystem();
  }
}

//   FUNCIN PARA DESACTIVAR MODO FILESYSTEM
function desactivarModoFileSystem() {
  console.log('  Desactivando modo FileSystem...');
  
  // Limpiar estado del FileSystemManager
  fsManager.isFileSystemMode = false;
  fsManager.directoryHandle = null;
  fsManager.imagesFolder = null;
  fsManager.folderPath = null;
  
  // Limpiar localStorage
  localStorage.removeItem('fsDirectory');
  localStorage.removeItem('fsFolderName');
  
  // Eliminar base de datos IndexedDB
  const deleteRequest = indexedDB.deleteDatabase(fsManager.dbName);
  deleteRequest.onsuccess = () => {
    console.log('- Base de datos IndexedDB eliminada');
  };
  deleteRequest.onerror = () => {
    console.warn('  No se pudo eliminar la base de datos IndexedDB');
  };
  
  // Actualizar indicador visual
  fsManager.updateStatusIndicator(false);
  document.getElementById('fsBadge').style.display = 'none';
  
  // Mostrar notificacin
  if (typeof app !== 'undefined' && app.showToast) {
    app.showToast('  Modo Carpeta DESACTIVADO - Volviendo a localStorage (lmite 10MB)', 'error', 4000);
  } else {
    alert('  Modo Carpeta DESACTIVADO\n\nAhora usars localStorage con lmite de 10MB');
  }
  
  console.log('- Modo FileSystem desactivado completamente');
}


export default mapController;
