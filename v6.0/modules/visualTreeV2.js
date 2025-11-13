(function(window) {
  const DEFAULT_ZOOM = 1;
  const MIN_ZOOM = 0.6;
  const MAX_ZOOM = 1.8;
  const ZOOM_STEP = 0.1;

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (event) => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(script);
    });
  }

  function createVisualTreeV2(app) {
    const state = {
      container: null,
      treeScroll: null,
      treeContainer: null,
      toolbar: null,
      zoom: DEFAULT_ZOOM,
      zoomIndicator: null,
      statusBadge: null,
      undoButton: null,
      redoButton: null,
      searchInput: null,
      searchSuggestions: null,
      searchStatus: null,
      mounted: false
    };

    function buildLayout() {
      return `
        <div class="visual-v2-shell">
          <header class="visual-v2-toolbar" role="toolbar">
            <div class="visual-v2-toolbar-left">
              <div class="visual-v2-heading">
                <span class="visual-v2-heading-icon">🧭</span>
                <div>
                  <h3 class="visual-v2-title">Jerarquía Visual 2.0</h3>
                  <p class="visual-v2-subtitle">Vista jerárquica optimizada</p>
                </div>
              </div>
              <div class="jerarquia-search-wrapper visual-v2-search-wrapper">
                <span class="jerarquia-search-icon">🔍</span>
                <input 
                  type="text" 
                  id="visualV2SearchInput" 
                  class="jerarquia-search-input"
                  placeholder="Buscar en la jerarquía..."
                  autocomplete="off"
                />
                <div id="visualV2SearchSuggestions" class="jerarquia-search-suggestions"></div>
              </div>
            </div>
            <div class="visual-v2-toolbar-actions">
              <button class="visual-v2-btn" data-action="expand-all" title="Expandir todo">Expandir</button>
              <button class="visual-v2-btn" data-action="collapse-all" title="Contraer todo">Contraer</button>
              <div class="visual-v2-toolbar-divider"></div>
              <button class="visual-v2-btn" data-action="undo" title="Deshacer (Ctrl+Z)">Deshacer</button>
              <button class="visual-v2-btn" data-action="redo" title="Rehacer (Ctrl+Y)">Rehacer</button>
              <div class="visual-v2-toolbar-divider"></div>
              <button class="visual-v2-btn" data-action="zoom-out" title="Alejar">−</button>
              <div class="visual-v2-zoom-indicator" data-role="zoom-indicator">100%</div>
              <button class="visual-v2-btn" data-action="zoom-in" title="Acercar">+</button>
              <button class="visual-v2-btn" data-action="zoom-reset" title="Restablecer zoom">Reset</button>
              <div class="visual-v2-toolbar-divider"></div>
              <button class="visual-v2-btn" data-action="export-png" title="Exportar PNG">PNG</button>
              <button class="visual-v2-btn" data-action="export-pdf" title="Exportar PDF">PDF</button>
            </div>
          </header>
          <div class="visual-v2-statusbar">
            <div class="visual-v2-status-group">
              <span class="visual-v2-status-label">Estado:</span>
              <span class="visual-v2-status-value" data-role="status-badge">Listo</span>
            </div>
            <div class="visual-v2-status-group">
              <span class="visual-v2-status-label">Búsqueda:</span>
              <span class="visual-v2-search-status" data-role="search-status">Sin filtros activos</span>
            </div>
          </div>
          <div class="visual-v2-tree-scroll">
            <div class="visual-v2-tree-container"></div>
          </div>
        </div>
      `;
    }

    function mount(container) {
      if (!container) {
        console.warn('[VisualV2] contenedor no disponible, omitiendo montaje');
        return;
      }

      state.container = container;
      container.classList.add('visual-v2-wrapper');
      container.innerHTML = buildLayout();

      state.treeScroll = container.querySelector('.visual-v2-tree-scroll');
      state.treeContainer = container.querySelector('.visual-v2-tree-container');
      state.toolbar = container.querySelector('.visual-v2-toolbar');
      state.zoomIndicator = container.querySelector('[data-role="zoom-indicator"]');
      state.statusBadge = container.querySelector('[data-role="status-badge"]');
      state.undoButton = container.querySelector('button[data-action="undo"]');
      state.redoButton = container.querySelector('button[data-action="redo"]');
      state.searchInput = container.querySelector('#visualV2SearchInput');
      state.searchSuggestions = container.querySelector('#visualV2SearchSuggestions');
      state.searchStatus = container.querySelector('[data-role="search-status"]');

      bindToolbarActions();
      if (state.zoomIndicator) {
        state.zoomIndicator.textContent = `${Math.round(state.zoom * 100)}%`;
      }
      if (app && typeof app.initJerarquiaSearch === 'function') {
        app.initJerarquiaSearch();
      }
      state.mounted = true;
    }

    function bindToolbarActions() {
      if (!state.toolbar) return;

      state.toolbar.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const action = button.getAttribute('data-action');
        if (action === 'zoom-in') {
          setZoom(state.zoom + ZOOM_STEP);
        } else if (action === 'zoom-out') {
          setZoom(state.zoom - ZOOM_STEP);
        } else if (action === 'zoom-reset') {
          setZoom(DEFAULT_ZOOM);
        } else if (action === 'export-png') {
          exportAs('png');
        } else if (action === 'export-pdf') {
          exportAs('pdf');
        } else if (action === 'undo' && app && typeof app.undo === 'function') {
          app.undo();
        } else if (action === 'redo' && app && typeof app.redo === 'function') {
          app.redo();
        } else if (action === 'expand-all' && app && typeof app.expandirTodoJerarquia === 'function') {
          app.expandirTodoJerarquia();
        } else if (action === 'collapse-all' && app && typeof app.contraerTodoJerarquia === 'function') {
          app.contraerTodoJerarquia();
        }
      });
    }

    function render() {
      if (!state.mounted || !state.treeContainer) {
        return;
      }

      if (!app || typeof app.buildTreeHTML_Visual !== 'function') {
        state.treeContainer.innerHTML = '<div class="visual-v2-empty">No se pudo generar el árbol visual.</div>';
        return;
      }

      try {
        const html = app.buildTreeHTML_Visual();
        state.treeContainer.innerHTML = html;
        applyZoom();
      } catch (error) {
        console.error('[VisualV2] Error renderizando árbol:', error);
        state.treeContainer.innerHTML = '<div class="visual-v2-empty">Error al renderizar la jerarquía.</div>';
      }
    }

    function setZoom(value) {
      const normalized = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
      if (normalized === state.zoom) return;

      state.zoom = normalized;
      applyZoom();

      if (state.zoomIndicator) {
        state.zoomIndicator.textContent = `${Math.round(state.zoom * 100)}%`;
      }
    }

    function applyZoom() {
      if (!state.treeContainer) return;
      state.treeContainer.style.transform = `scale(${state.zoom})`;
      state.treeContainer.style.transformOrigin = 'top center';
    }

    async function exportAs(format) {
      if (!state.treeContainer) return;

      const label = format === 'pdf' ? 'PDF' : 'PNG';
      if (app && typeof app.showToast === 'function') {
        app.showToast(`Generando ${label}...`, 'info');
      }

      try {
        await ensureExportDependencies(format);

        const clone = prepareClone();
        document.body.appendChild(clone.wrapper);

        const canvas = await window.html2canvas(clone.target, {
          backgroundColor: '#1a1d23',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });

        document.body.removeChild(clone.wrapper);

        if (format === 'png') {
          const link = document.createElement('a');
          link.download = buildExportFilename('png');
          link.href = canvas.toDataURL('image/png');
          link.click();
        } else if (format === 'pdf') {
          const imgData = canvas.toDataURL('image/png');
          const { jsPDF } = window.jspdf;

          const pdfWidth = canvas.width * 0.264583;
          const pdfHeight = canvas.height * 0.264583;
          const orientation = pdfWidth > pdfHeight ? 'landscape' : 'portrait';
          const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format: [Math.max(pdfWidth, 210), Math.max(pdfHeight, 297)]
          });

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
          pdf.save(buildExportFilename('pdf'));
        }

        if (app && typeof app.showToast === 'function') {
          app.showToast(`${label} exportado correctamente`, 'success');
        }
      } catch (error) {
        console.error('[VisualV2] Error exportando:', error);
        if (app && typeof app.showToast === 'function') {
          app.showToast(`Error al exportar ${label}`, 'error');
        }
      }
    }

    async function ensureExportDependencies(format) {
      const tasks = [];
      if (!window.html2canvas) {
        tasks.push(loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'));
      }
      if (format === 'pdf' && !window.jspdf) {
        tasks.push(loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'));
      }
      if (tasks.length) {
        await Promise.all(tasks);
      }
    }

    function prepareClone() {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-99999px';
      wrapper.style.top = '0';
      wrapper.style.background = '#1a1d23';
      wrapper.style.padding = '30px';
      wrapper.style.zIndex = '-1';

      const clone = state.treeContainer.cloneNode(true);
      clone.classList.add('visual-v2-export');
      clone.style.transform = 'scale(1)';
      clone.style.transformOrigin = 'top center';

      if (app && app.jerarquiaSearchState && app.jerarquiaSearchState.isFilterActive) {
        syncFilterStateToClone(clone);
      } else {
        clone.querySelectorAll('.tree-children').forEach((children) => {
          children.style.display = 'block';
        });
      }

      clone.querySelectorAll('.visual-v2-search-highlight, .visual-v2-search-match, .search-highlight, .search-match').forEach((node) => {
        node.classList.remove('visual-v2-search-highlight', 'visual-v2-search-match', 'search-highlight', 'search-match');
      });

      wrapper.appendChild(clone);
      return { wrapper, target: clone };
    }

    function syncFilterStateToClone(clone) {
      if (!state.treeContainer) return;

      const originalChildren = state.treeContainer.querySelectorAll('.tree-children');
      const cloneChildren = clone.querySelectorAll('.tree-children');
      cloneChildren.forEach((element, index) => {
        if (originalChildren[index]) {
          element.style.display = originalChildren[index].style.display;
        }
      });

      const originalNodes = state.treeContainer.querySelectorAll('.tree-node');
      const cloneNodes = clone.querySelectorAll('.tree-node');
      cloneNodes.forEach((node, index) => {
        const original = originalNodes[index];
        if (!original) return;
        const parentChildren = original.closest('.tree-children');
        if (parentChildren && parentChildren.style.display === 'none') {
          node.style.display = 'none';
        }
      });
    }

    function buildExportFilename(extension) {
      const empresaId = app?.jerarquiaAnidada?.empresa?.id || 'EMPRESA';
      const date = new Date().toISOString().split('T')[0];
      return `jerarquia_visual_v2_${empresaId}_${date}.${extension}`;
    }

    function updateStatus(message) {
      if (!state.statusBadge) return;
      state.statusBadge.textContent = message || 'Listo';
    }

    function setSearchStatus(message) {
      if (!state.searchStatus) return;
      state.searchStatus.textContent = message || 'Sin filtros activos';
    }

    function setUndoRedoState({ canUndo, canRedo }) {
      if (state.undoButton) {
        state.undoButton.disabled = !canUndo;
      }
      if (state.redoButton) {
        state.redoButton.disabled = !canRedo;
      }
    }

    function getTreeContainer() {
      return state.treeContainer;
    }

    function destroy() {
      if (!state.container) return;
      state.container.innerHTML = '';
      state.container.classList.remove('visual-v2-wrapper');
      state.mounted = false;
      state.treeContainer = null;
      state.zoom = DEFAULT_ZOOM;
    }

    return {
      mount,
      render,
      destroy,
      setZoom,
      updateStatus,
      setSearchStatus,
      setUndoRedoState,
      getTreeContainer
    };
  }

  window.visualTreeV2Module = {
    create: createVisualTreeV2
  };
})(window);
