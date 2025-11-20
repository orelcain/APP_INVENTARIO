/**
 * 🚀 MAP ENHANCEMENTS MODULE
 * Mejoras visuales y de funcionalidad para la pestaña Mapas
 * @version 1.0.0
 */

// ========================================
// SISTEMA DE BÚSQUEDA AVANZADA
// ========================================

class AdvancedSearch {
  constructor() {
    this.searchHistory = JSON.parse(localStorage.getItem('mapSearchHistory') || '[]');
    this.currentFilter = 'all';
    this.suggestions = [];
  }

  handleSearch(query) {
    const input = document.getElementById('globalSearch');
    const suggestionsEl = document.getElementById('searchSuggestions');
    
    if (!query || query.length < 2) {
      suggestionsEl.style.display = 'none';
      return;
    }

    // Buscar sugerencias según filtro activo
    this.suggestions = this.findSuggestions(query);
    this.renderSuggestions(this.suggestions, query);
  }

  findSuggestions(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    if (this.currentFilter === 'all' || this.currentFilter === 'mapas') {
      // Buscar en mapas
      if (window.mapStorage && window.mapStorage.mapas) {
        window.mapStorage.mapas.forEach(mapa => {
          if (mapa.nombre.toLowerCase().includes(lowerQuery)) {
            results.push({
              type: 'mapa',
              icon: '🗺️',
              text: mapa.nombre,
              id: mapa.id
            });
          }
        });
      }
    }

    if (this.currentFilter === 'all' || this.currentFilter === 'areas') {
      // Buscar en áreas
      if (window.mapStorage && window.mapStorage.zonas) {
        window.mapStorage.zonas.forEach(zona => {
          if (zona.nombre.toLowerCase().includes(lowerQuery)) {
            results.push({
              type: 'area',
              icon: '📦',
              text: zona.nombre,
              id: zona.id
            });
          }
        });
      }
    }

    if (this.currentFilter === 'all' || this.currentFilter === 'marcadores') {
      // Buscar en jerarquía
      if (window.app && window.app.jerarquiaAnidada) {
        this.searchInHierarchy(window.app.jerarquiaAnidada, lowerQuery, results);
      }
    }

    return results.slice(0, 8); // Máximo 8 sugerencias
  }

  searchInHierarchy(nodes, query, results, level = 1) {
    nodes.forEach(node => {
      if (node.nombre.toLowerCase().includes(query)) {
        results.push({
          type: 'jerarquia',
          icon: '📍',
          text: node.nombre,
          id: node.id,
          nivel: level
        });
      }
      if (node.hijos && node.hijos.length > 0) {
        this.searchInHierarchy(node.hijos, query, results, level + 1);
      }
    });
  }

  renderSuggestions(suggestions, query) {
    const suggestionsEl = document.getElementById('searchSuggestions');
    
    if (suggestions.length === 0) {
      suggestionsEl.style.display = 'none';
      return;
    }

    const html = suggestions.map(item => {
      const highlightedText = this.highlightMatch(item.text, query);
      return `
        <div class="suggestion-item" onclick="advancedSearch.selectSuggestion('${item.type}', '${item.id}', '${item.text}')">
          <span class="suggestion-icon">${item.icon}</span>
          <span class="suggestion-text">${highlightedText}</span>
        </div>
      `;
    }).join('');

    suggestionsEl.innerHTML = html;
    suggestionsEl.style.display = 'block';
  }

  highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="suggestion-match">$1</span>');
  }

  selectSuggestion(type, id, text) {
    // Agregar a historial
    this.addToHistory(text);
    
    // Ejecutar acción según tipo
    if (type === 'mapa') {
      window.mapController?.loadMap(id);
    } else if (type === 'area') {
      window.mapController?.focusArea(id);
    } else if (type === 'jerarquia') {
      window.hierarchySync?.focusNode(id);
    }

    // Cerrar sugerencias
    document.getElementById('searchSuggestions').style.display = 'none';
    document.getElementById('globalSearch').value = text;
  }

  addToHistory(text) {
    // Evitar duplicados
    this.searchHistory = this.searchHistory.filter(item => item !== text);
    this.searchHistory.unshift(text);
    this.searchHistory = this.searchHistory.slice(0, 10); // Máximo 10
    localStorage.setItem('mapSearchHistory', JSON.stringify(this.searchHistory));
  }

  setFilter(filter) {
    this.currentFilter = filter;
    
    // Actualizar UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      }
    });

    // Re-ejecutar búsqueda si hay texto
    const query = document.getElementById('globalSearch').value;
    if (query) {
      this.handleSearch(query);
    }
  }

  handleKeyboard(event) {
    const suggestionsEl = document.getElementById('searchSuggestions');
    
    if (event.key === 'Escape') {
      suggestionsEl.style.display = 'none';
      document.getElementById('globalSearch').blur();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      // TODO: Navegación con teclado en sugerencias
    } else if (event.key === 'Enter') {
      // Seleccionar primera sugerencia
      const firstSuggestion = suggestionsEl.querySelector('.suggestion-item');
      if (firstSuggestion) {
        firstSuggestion.click();
      }
    }
  }
}

// ========================================
// MINIMAPA Y CONTROLES DE CANVAS
// ========================================

class MinimapController {
  constructor(mainCanvas, minimapCanvas) {
    this.mainCanvas = mainCanvas;
    this.minimapCanvas = minimapCanvas;
    this.viewportElement = document.getElementById('minimapViewport');
    this.visible = true;
    this.scale = 0.15; // 15% del tamaño original
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Click en minimapa para mover vista principal
    this.minimapCanvas.addEventListener('click', (e) => {
      const rect = this.minimapCanvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / this.scale;
      const y = (e.clientY - rect.top) / this.scale;
      
      if (window.mapController) {
        window.mapController.panTo(x, y);
      }
    });
  }

  update(mainContext, viewport) {
    if (!this.visible) return;

    const ctx = this.minimapCanvas.getContext('2d');
    const width = this.minimapCanvas.width;
    const height = this.minimapCanvas.height;

    // Limpiar
    ctx.clearRect(0, 0, width, height);

    // Dibujar versión reducida del mapa principal
    ctx.save();
    ctx.scale(this.scale, this.scale);
    
    // Copiar contenido del canvas principal
    if (mainContext.canvas.width > 0) {
      ctx.drawImage(mainContext.canvas, 0, 0);
    }
    
    ctx.restore();

    // Dibujar viewport
    this.updateViewport(viewport);
  }

  updateViewport(viewport) {
    if (!this.viewportElement || !viewport) return;

    const x = viewport.x * this.scale;
    const y = viewport.y * this.scale;
    const w = viewport.width * this.scale;
    const h = viewport.height * this.scale;

    this.viewportElement.style.left = `${x}px`;
    this.viewportElement.style.top = `${y}px`;
    this.viewportElement.style.width = `${w}px`;
    this.viewportElement.style.height = `${h}px`;
  }

  toggle() {
    this.visible = !this.visible;
    const container = document.getElementById('minimapContainer');
    if (container) {
      container.style.display = this.visible ? 'block' : 'none';
    }
    
    // Actualizar botón
    const btn = document.querySelector('[onclick*="toggleMinimap"]');
    if (btn) {
      btn.classList.toggle('active', this.visible);
    }
  }
}

// ========================================
// BREADCRUMB Y MAPA ACTIVO
// ========================================

class MapBreadcrumb {
  constructor() {
    this.path = [];
    this.activeMap = null;
  }

  setActiveMap(mapData) {
    this.activeMap = mapData;
    this.updateUI();
  }

  setPath(pathArray) {
    this.path = pathArray;
    this.updateUI();
  }

  updateUI() {
    // Actualizar thumbnail
    const thumbnail = document.getElementById('activeMapThumbnail');
    const placeholder = document.querySelector('.map-thumbnail-placeholder');
    
    if (this.activeMap && this.activeMap.imagePath) {
      thumbnail.src = this.activeMap.imagePath;
      thumbnail.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    } else {
      thumbnail.style.display = 'none';
      if (placeholder) placeholder.style.display = 'flex';
    }

    // Actualizar breadcrumb
    const breadcrumbEl = document.getElementById('mapBreadcrumb');
    if (breadcrumbEl) {
      if (this.path.length > 0) {
        breadcrumbEl.innerHTML = this.path
          .map(item => `<span class="breadcrumb-item">${item}</span>`)
          .join('');
      } else {
        breadcrumbEl.innerHTML = '<span class="breadcrumb-item">Sin ubicación</span>';
      }
    }

    // Actualizar nombre del mapa
    const nameEl = document.getElementById('activeMapName');
    if (nameEl) {
      nameEl.textContent = this.activeMap ? this.activeMap.nombre : 'Ningún mapa cargado';
    }

    // Actualizar badge de estado
    const statusBadge = document.getElementById('mapStatusBadge');
    if (statusBadge) {
      if (this.activeMap) {
        statusBadge.classList.remove('status-inactive');
        statusBadge.classList.add('status-active');
      } else {
        statusBadge.classList.remove('status-active');
        statusBadge.classList.add('status-inactive');
      }
    }

    // Actualizar toolbar info
    const toolbarInfo = document.getElementById('mapToolbarInfo');
    if (toolbarInfo) {
      if (this.activeMap) {
        toolbarInfo.textContent = this.activeMap.nombre;
      } else {
        toolbarInfo.textContent = 'Sin mapa cargado';
      }
    }
  }
}

// ========================================
// STATS MEJORADOS CON COMPARATIVAS
// ========================================

class EnhancedStats {
  constructor() {
    this.previousValues = JSON.parse(localStorage.getItem('mapStatsPrevious') || '{}');
    this.sparklineData = JSON.parse(localStorage.getItem('mapStatsHistory') || '{"mapas":[],"areas":[],"marcadores":[]}');
  }

  update(mapasCount, areasCount, marcadoresCount) {
    // Actualizar valores
    document.getElementById('statsMapasCount').textContent = mapasCount;
    document.getElementById('statsAreasCount').textContent = areasCount;
    document.getElementById('statsMarcadoresCount').textContent = marcadoresCount;

    // Calcular y mostrar cambios
    this.updateChange('statsMapasChange', mapasCount, this.previousValues.mapas || 0);
    this.updateChange('statsAreasChange', areasCount, this.previousValues.areas || 0);
    this.updateChange('statsMarcadoresChange', marcadoresCount, this.previousValues.marcadores || 0);

    // Actualizar sparklines
    this.updateSparkline('statsMapasSparkline', 'mapas', mapasCount);
    this.updateSparkline('statsAreasSparkline', 'areas', areasCount);
    this.updateSparkline('statsMarcadoresSparkline', 'marcadores', marcadoresCount);

    // Guardar valores actuales
    this.previousValues = { mapas: mapasCount, areas: areasCount, marcadores: marcadoresCount };
    localStorage.setItem('mapStatsPrevious', JSON.stringify(this.previousValues));
  }

  updateChange(elementId, current, previous) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const diff = current - previous;
    const sign = diff > 0 ? '+' : '';
    
    el.textContent = `${sign}${diff}`;
    el.className = 'stat-change';
    
    if (diff > 0) {
      el.classList.add('positive');
    } else if (diff < 0) {
      el.classList.add('negative');
    } else {
      el.classList.add('neutral');
    }
  }

  updateSparkline(elementId, key, value) {
    // Agregar valor al historial
    this.sparklineData[key].push(value);
    if (this.sparklineData[key].length > 20) {
      this.sparklineData[key].shift(); // Mantener últimos 20 valores
    }
    localStorage.setItem('mapStatsHistory', JSON.stringify(this.sparklineData));

    // Dibujar sparkline simple con SVG
    const el = document.getElementById(elementId);
    if (!el || this.sparklineData[key].length < 2) return;

    const data = this.sparklineData[key];
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const step = width / (data.length - 1);

    const points = data.map((val, i) => {
      const x = i * step;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    el.innerHTML = `
      <svg width="${width}" height="${height}">
        <polyline 
          points="${points}" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        />
      </svg>
    `;
  }
}

// ========================================
// ATAJOS DE TECLADO
// ========================================

class KeyboardShortcuts {
  constructor() {
    this.shortcuts = {
      'ctrl+f': () => this.focusSearch(),
      'ctrl+n': () => this.newMap(),
      'ctrl+s': () => this.save(),
      'escape': () => this.closeModals(),
      'r': () => this.resetView(),
      'm': () => this.toggleMinimap(),
      '?': () => this.showHelp()
    };

    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener('keydown', (e) => {
      const key = this.getKeyCombo(e);
      
      if (this.shortcuts[key]) {
        e.preventDefault();
        this.shortcuts[key]();
        this.showIndicator(key);
      }
    });
  }

  getKeyCombo(event) {
    const parts = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }

  focusSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  newMap() {
    // Implementar creación de nuevo mapa
    console.log('Nuevo mapa - TODO');
  }

  save() {
    if (window.app && typeof window.app.guardarTodo === 'function') {
      window.app.guardarTodo();
    }
  }

  closeModals() {
    // Cerrar todos los modales abiertos
    document.querySelectorAll('.map-modal:not(.hidden)').forEach(modal => {
      modal.classList.add('hidden');
    });
    
    // Cerrar sugerencias
    const suggestions = document.getElementById('searchSuggestions');
    if (suggestions) {
      suggestions.style.display = 'none';
    }
  }

  resetView() {
    if (window.mapController) {
      window.mapController.resetView();
    }
  }

  toggleMinimap() {
    if (window.minimapController) {
      window.minimapController.toggle();
    }
  }

  showHelp() {
    // Mostrar modal con atajos
    const shortcuts = [
      { keys: 'Ctrl + F', desc: 'Enfocar búsqueda' },
      { keys: 'Ctrl + N', desc: 'Nuevo mapa' },
      { keys: 'Ctrl + S', desc: 'Guardar cambios' },
      { keys: 'Esc', desc: 'Cerrar modales' },
      { keys: 'R', desc: 'Restablecer vista' },
      { keys: 'M', desc: 'Mostrar/ocultar minimapa' },
      { keys: '?', desc: 'Mostrar esta ayuda' }
    ];

    const html = `
      <div style="padding: 20px;">
        <h3 style="margin-bottom: 16px; color: var(--text-primary);">⌨️ Atajos de Teclado</h3>
        <div style="display: grid; gap: 8px;">
          ${shortcuts.map(s => `
            <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--bg-primary); border-radius: 4px;">
              <span style="font-family: monospace; font-weight: 600; color: var(--primary-light);">${s.keys}</span>
              <span style="color: var(--text-secondary);">${s.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Mostrar en modal existente o crear uno nuevo
    if (window.app && typeof window.app.mostrarModalGenerico === 'function') {
      window.app.mostrarModalGenerico('Atajos de Teclado', html);
    }
  }

  showIndicator(key) {
    const indicator = document.getElementById('keyboardShortcuts');
    if (!indicator) return;

    indicator.textContent = `Atajo: ${key.toUpperCase()}`;
    indicator.classList.add('visible');

    setTimeout(() => {
      indicator.classList.remove('visible');
    }, 1500);
  }
}

// ========================================
// INICIALIZACIÓN Y INTEGRACIÓN CON DATOS
// ========================================

// Variables globales
let advancedSearch;
let minimapController;
let mapBreadcrumb;
let enhancedStats;
let keyboardShortcuts;

// Funciones globales para HTML onclick
function handleAdvancedSearch(query) {
  if (advancedSearch) {
    advancedSearch.handleSearch(query);
  }
}

function handleSearchKeyboard(event) {
  if (advancedSearch) {
    advancedSearch.handleKeyboard(event);
  }
}

function setSearchFilter(filter) {
  if (advancedSearch) {
    advancedSearch.setFilter(filter);
  }
}

// ========================================
// INTEGRACIÓN CON DATOS REALES
// ========================================

function updateEnhancedStatsFromApp() {
  if (!enhancedStats || !window.mapStorage) return;

  const mapasCount = window.mapStorage.mapas?.length || 0;
  const areasCount = window.mapStorage.zonas?.length || 0;
  
  // Contar marcadores de todos los mapas
  let marcadoresCount = 0;
  if (window.mapStorage.mapas) {
    window.mapStorage.mapas.forEach(mapa => {
      if (mapa.marcadores) {
        marcadoresCount += mapa.marcadores.length;
      }
    });
  }

  enhancedStats.update(mapasCount, areasCount, marcadoresCount);
}

function updateBreadcrumbFromActiveMap(mapId) {
  if (!mapBreadcrumb || !window.mapStorage) return;

  const mapa = window.mapStorage.mapas?.find(m => m.id === mapId);
  if (mapa) {
    mapBreadcrumb.setActiveMap(mapa);
    
    // Construir path basado en jerarquía si existe
    const path = ['Planta Principal']; // TODO: Obtener de jerarquía real
    if (mapa.nombre) {
      path.push(mapa.nombre);
    }
    mapBreadcrumb.setPath(path);
  }
}

// ========================================
// GENERACIÓN DE THUMBNAILS
// ========================================

class ThumbnailGenerator {
  static async generateFromImage(imagePath, width = 100, height = 100) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Calcular aspect ratio
        const scale = Math.min(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;
        
        ctx.fillStyle = '#1a1d23';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.onerror = reject;
      img.src = imagePath;
    });
  }

  static async generateForAllMaps() {
    if (!window.mapStorage || !window.mapStorage.mapas) return;

    for (const mapa of window.mapStorage.mapas) {
      if (mapa.imagePath && !mapa.thumbnail) {
        try {
          mapa.thumbnail = await this.generateFromImage(mapa.imagePath, 100, 100);
          console.log(`✅ Thumbnail generado para: ${mapa.nombre}`);
        } catch (error) {
          console.warn(`⚠️ Error generando thumbnail para ${mapa.nombre}:`, error);
        }
      }
    }

    // Guardar en localStorage
    if (window.mapStorage.saveMapas) {
      window.mapStorage.saveMapas();
    }
  }
}

// ========================================
// DRAG & DROP PARA JERARQUÍA
// ========================================

class HierarchyDragDrop {
  constructor() {
    this.draggedNode = null;
    this.draggedElement = null;
    this.setupDragDrop();
  }

  setupDragDrop() {
    // Esperar a que el DOM esté listo
    setTimeout(() => {
      this.attachDragListeners();
    }, 2000);
  }

  attachDragListeners() {
    const treeContainer = document.getElementById('hierarchy-tree-container');
    if (!treeContainer) return;

    treeContainer.addEventListener('dragstart', (e) => this.handleDragStart(e));
    treeContainer.addEventListener('dragover', (e) => this.handleDragOver(e));
    treeContainer.addEventListener('drop', (e) => this.handleDrop(e));
    treeContainer.addEventListener('dragend', (e) => this.handleDragEnd(e));
    
    // Hacer nodos arrastrables
    this.makeNodesDraggable();
  }

  makeNodesDraggable() {
    const nodes = document.querySelectorAll('.hierarchy-node');
    nodes.forEach(node => {
      const header = node.querySelector('.node-header');
      if (header) {
        header.setAttribute('draggable', 'true');
        header.style.cursor = 'move';
      }
    });
  }

  handleDragStart(e) {
    const nodeHeader = e.target.closest('.node-header');
    if (!nodeHeader) return;

    this.draggedElement = nodeHeader.closest('.hierarchy-node');
    this.draggedNode = {
      id: nodeHeader.dataset.nodeId,
      name: nodeHeader.dataset.nodeName,
      nivel: nodeHeader.dataset.nodeLevel
    };

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.draggedElement.innerHTML);
    
    this.draggedElement.style.opacity = '0.4';
  }

  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    const target = e.target.closest('.hierarchy-node');
    if (target && target !== this.draggedElement) {
      target.style.borderTop = '2px solid var(--primary)';
    }
    
    return false;
  }

  handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    const target = e.target.closest('.hierarchy-node');
    if (target && target !== this.draggedElement) {
      // Reorganizar en jerarquía
      this.reorganizeHierarchy(this.draggedNode, target.dataset.nodeId);
      
      // Feedback visual
      window.app?.mostrarToast('Jerarquía reorganizada', 'success');
    }

    return false;
  }

  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.style.opacity = '1';
    }

    // Limpiar estilos de drop zones
    document.querySelectorAll('.hierarchy-node').forEach(node => {
      node.style.borderTop = '';
    });
  }

  reorganizeHierarchy(draggedNode, targetNodeId) {
    console.log('🔄 Reorganizando jerarquía:', draggedNode, '→', targetNodeId);
    
    // TODO: Implementar lógica de reorganización en window.app.jerarquiaAnidada
    // Por ahora solo mostramos el log
    
    if (window.hierarchySync) {
      window.hierarchySync.refresh();
    }
  }
}

// ========================================
// EXPORT DE LOGS
// ========================================

function exportLogs(format) {
  const logs = window.mapActivityLogs || [];
  
  if (logs.length === 0) {
    window.app?.mostrarToast('No hay logs para exportar', 'warning');
    return;
  }

  if (format === 'csv') {
    exportLogsAsCSV(logs);
  } else if (format === 'json') {
    exportLogsAsJSON(logs);
  }
}

function exportLogsAsCSV(logs) {
  const headers = ['Timestamp', 'Tipo', 'Mensaje', 'Usuario', 'Detalles'];
  const rows = logs.map(log => [
    log.timestamp || new Date().toISOString(),
    log.type || 'info',
    log.message || '',
    log.user || 'Sistema',
    log.details || ''
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });

  downloadFile(csv, 'logs-mapas-' + getDateString() + '.csv', 'text/csv');
  window.app?.mostrarToast('Logs exportados en CSV', 'success');
}

function exportLogsAsJSON(logs) {
  const json = JSON.stringify(logs, null, 2);
  downloadFile(json, 'logs-mapas-' + getDateString() + '.json', 'application/json');
  window.app?.mostrarToast('Logs exportados en JSON', 'success');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// ========================================
// GRÁFICOS AVANZADOS CON CHART.JS
// ========================================

class AdvancedCharts {
  constructor() {
    this.charts = {};
    this.loadChartJS();
  }

  loadChartJS() {
    if (typeof Chart !== 'undefined') {
      this.initCharts();
      return;
    }

    // Cargar Chart.js dinámicamente
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => {
      console.log('✅ Chart.js cargado');
      this.initCharts();
    };
    document.head.appendChild(script);
  }

  initCharts() {
    setTimeout(() => {
      this.createMapasPorNivelChart();
      this.createDistribucionAreasChart();
      this.createActividadTimelineChart();
    }, 1000);
  }

  createMapasPorNivelChart() {
    const container = document.getElementById('stats-details-container');
    if (!container || typeof Chart === 'undefined') return;

    // Crear canvas si no existe
    let canvas = document.getElementById('chartMapasPorNivel');
    if (!canvas) {
      const chartDiv = document.createElement('div');
      chartDiv.className = 'stat-chart-card';
      chartDiv.innerHTML = `
        <div class="stat-chart-header">📊 Mapas por Nivel Jerárquico</div>
        <canvas id="chartMapasPorNivel" class="stat-chart-canvas"></canvas>
      `;
      container.appendChild(chartDiv);
      canvas = document.getElementById('chartMapasPorNivel');
    }

    const ctx = canvas.getContext('2d');
    
    // Datos de ejemplo (TODO: obtener de jerarquía real)
    const data = {
      labels: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5', 'Nivel 6', 'Nivel 7'],
      datasets: [{
        label: 'Mapas asignados',
        data: this.getMapasPorNivel(),
        backgroundColor: 'rgba(91, 139, 180, 0.8)',
        borderColor: 'rgba(91, 139, 180, 1)',
        borderWidth: 1
      }]
    };

    this.charts.mapasPorNivel = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#8a909a', font: { size: 10 } },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#8a909a', font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  createDistribucionAreasChart() {
    const container = document.getElementById('stats-details-container');
    if (!container || typeof Chart === 'undefined') return;

    let canvas = document.getElementById('chartDistribucionAreas');
    if (!canvas) {
      const chartDiv = document.createElement('div');
      chartDiv.className = 'stat-chart-card';
      chartDiv.innerHTML = `
        <div class="stat-chart-header">🥧 Distribución de Áreas</div>
        <canvas id="chartDistribucionAreas" class="stat-chart-canvas"></canvas>
      `;
      container.appendChild(chartDiv);
      canvas = document.getElementById('chartDistribucionAreas');
    }

    const ctx = canvas.getContext('2d');
    
    const data = {
      labels: ['Con Mapa', 'Sin Mapa', 'En Proceso'],
      datasets: [{
        data: this.getDistribucionAreas(),
        backgroundColor: [
          'rgba(91, 155, 122, 0.8)',
          'rgba(184, 107, 107, 0.8)',
          'rgba(184, 146, 90, 0.8)'
        ],
        borderColor: [
          'rgba(91, 155, 122, 1)',
          'rgba(184, 107, 107, 1)',
          'rgba(184, 146, 90, 1)'
        ],
        borderWidth: 1
      }]
    };

    this.charts.distribucionAreas = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#b8bec8',
              font: { size: 10 },
              padding: 10
            }
          }
        }
      }
    });
  }

  createActividadTimelineChart() {
    const container = document.getElementById('stats-details-container');
    if (!container || typeof Chart === 'undefined') return;

    let canvas = document.getElementById('chartActividadTimeline');
    if (!canvas) {
      const chartDiv = document.createElement('div');
      chartDiv.className = 'stat-chart-card';
      chartDiv.style.gridColumn = '1 / -1'; // Full width
      chartDiv.innerHTML = `
        <div class="stat-chart-header">📈 Actividad de los Últimos 7 Días</div>
        <canvas id="chartActividadTimeline" class="stat-chart-canvas"></canvas>
      `;
      container.appendChild(chartDiv);
      canvas = document.getElementById('chartActividadTimeline');
    }

    const ctx = canvas.getContext('2d');
    
    const data = {
      labels: this.getLast7Days(),
      datasets: [
        {
          label: 'Mapas creados',
          data: [2, 1, 0, 3, 1, 2, 1],
          borderColor: 'rgba(91, 139, 180, 1)',
          backgroundColor: 'rgba(91, 139, 180, 0.1)',
          tension: 0.4
        },
        {
          label: 'Áreas asignadas',
          data: [5, 3, 2, 4, 6, 3, 4],
          borderColor: 'rgba(91, 155, 122, 1)',
          backgroundColor: 'rgba(91, 155, 122, 0.1)',
          tension: 0.4
        }
      ]
    };

    this.charts.actividadTimeline = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#b8bec8',
              font: { size: 10 },
              padding: 10
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#8a909a', font: { size: 10 } },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#8a909a', font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  getMapasPorNivel() {
    // TODO: Calcular desde jerarquía real
    if (!window.app || !window.app.jerarquiaAnidada) {
      return [2, 3, 5, 4, 2, 1, 0];
    }
    // Implementar lógica real aquí
    return [2, 3, 5, 4, 2, 1, 0];
  }

  getDistribucionAreas() {
    // TODO: Calcular desde zonas reales
    const zonas = window.mapStorage?.zonas || [];
    const conMapa = zonas.filter(z => z.mapaId).length;
    const sinMapa = zonas.length - conMapa;
    const enProceso = Math.floor(zonas.length * 0.1); // 10% estimado
    
    return [conMapa, sinMapa, enProceso];
  }

  getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('es', { weekday: 'short' }));
    }
    return days;
  }

  updateCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.update === 'function') {
        chart.update();
      }
    });
  }
}

// ========================================
// INICIALIZACIÓN COMPLETA
// ========================================

let hierarchyDragDrop;
let advancedCharts;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar búsqueda avanzada
  advancedSearch = new AdvancedSearch();
  
  // Inicializar breadcrumb
  mapBreadcrumb = new MapBreadcrumb();
  
  // Inicializar stats mejorados
  enhancedStats = new EnhancedStats();
  
  // Inicializar atajos de teclado
  keyboardShortcuts = new KeyboardShortcuts();
  
  // Inicializar drag & drop
  hierarchyDragDrop = new HierarchyDragDrop();
  
  // Inicializar gráficos avanzados
  advancedCharts = new AdvancedCharts();
  
  // Inicializar minimapa cuando el canvas esté listo
  setTimeout(() => {
    const mainCanvas = document.getElementById('mapCanvas');
    const minimapCanvas = document.getElementById('minimapCanvas');
    
    if (mainCanvas && minimapCanvas) {
      minimapController = new MinimapController(mainCanvas, minimapCanvas);
    }
    
    // Generar thumbnails para mapas existentes
    ThumbnailGenerator.generateForAllMaps();
    
    // Actualizar stats con datos reales
    updateEnhancedStatsFromApp();
  }, 1000);

  // Actualizar stats cada 30 segundos
  setInterval(() => {
    updateEnhancedStatsFromApp();
    if (advancedCharts) {
      advancedCharts.updateCharts();
    }
  }, 30000);

  console.log('✅ Map Enhancements Module loaded successfully (FULL VERSION)');
});

// Exportar para uso global
window.advancedSearch = advancedSearch;
window.minimapController = minimapController;
window.mapBreadcrumb = mapBreadcrumb;
window.enhancedStats = enhancedStats;
window.keyboardShortcuts = keyboardShortcuts;
window.hierarchyDragDrop = hierarchyDragDrop;
window.advancedCharts = advancedCharts;
window.updateEnhancedStatsFromApp = updateEnhancedStatsFromApp;
window.updateBreadcrumbFromActiveMap = updateBreadcrumbFromActiveMap;
window.exportLogs = exportLogs;
window.ThumbnailGenerator = ThumbnailGenerator;
