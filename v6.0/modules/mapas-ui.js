/**
 * MAPAS UI - Funciones de interfaz para Tab Mapas
 * Portadas desde prototype-mapas.html
 * Fecha: 2025-11-20
 */

(function() {
  'use strict';

const MapasUI = {
  
  /**
   * Alternar visibilidad de secciones colapsables
   */
  toggleSection(header) {
    const section = header.closest('.map-section');
    if (section) {
      section.classList.toggle('collapsed');
    }
  },

  /**
   * Alternar nodo de jerarquía
   */
  toggleNode(header) {
    const children = header.nextElementSibling;
    const toggle = header.querySelector('.node-toggle');
    if (children && children.classList.contains('node-children')) {
      children.classList.toggle('collapsed');
      if (toggle) {
        toggle.textContent = children.classList.contains('collapsed') ? '▶' : '▼';
      }
    }
  },

  /**
   * Cambiar entre tabs del panel (Mapas / Logs)
   */
  switchPanelTab(tabName) {
    // Remover active de todos los tabs
    document.querySelectorAll('.panel-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Ocultar todos los contenidos
    document.querySelectorAll('.panel-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    // Activar tab clickeado
    const clickedTab = event.target.closest('.panel-tab');
    if (clickedTab) {
      clickedTab.classList.add('active');
    }
    
    // Mostrar contenido correspondiente
    const contentMap = {
      'mapas': 'tabMapas',
      'logs': 'tabLogs'
    };
    
    const contentId = contentMap[tabName];
    if (contentId) {
      const content = document.getElementById(contentId);
      if (content) {
        content.classList.add('active');
      }
      
      // Si es la pestaña de Mapas, restablecer vista a "Jerarquía Completa"
      if (tabName === 'mapas') {
        this.scrollToSection('jerarquia-completa');
      }
    }
  },

  /**
   * Mostrar subsección específica
   */
  scrollToSection(sectionId) {
    console.log('🔄 Cambiando a subsección:', sectionId);
    
    const sectionMap = {
      'jerarquia-completa': 'section-jerarquia-completa',
      'mapas-creados': 'section-mapas-creados',
      'pendientes': 'section-pendientes',
      'estadisticas': 'section-estadisticas'
    };
    
    const targetId = sectionMap[sectionId];
    
    // Ocultar todas las secciones
    Object.values(sectionMap).forEach(id => {
      const section = document.getElementById(id);
      if (section) {
        section.style.display = 'none';
      }
    });
    
    // Mostrar solo la sección seleccionada
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.style.display = 'block';
      targetSection.classList.remove('collapsed');
      console.log('✅ Mostrando:', targetId);
    }
    
    // Actualizar subsección activa
    document.querySelectorAll('.subsection-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const clickedItem = event.target.closest('.subsection-item');
    if (clickedItem) {
      clickedItem.classList.add('active');
    }
  },

  /**
   * Inicializar subsecciones al cargar
   */
  initializeSubsections() {
    const sectionMap = {
      'jerarquia-completa': 'section-jerarquia-completa',
      'mapas-creados': 'section-mapas-creados',
      'pendientes': 'section-pendientes',
      'estadisticas': 'section-estadisticas'
    };
    
    // Mostrar solo Jerarquía Completa al inicio
    Object.entries(sectionMap).forEach(([key, id]) => {
      const section = document.getElementById(id);
      if (section) {
        section.style.display = key === 'jerarquia-completa' ? 'block' : 'none';
      }
    });

    // Activar primer subsection item
    const firstItem = document.querySelector('.subsection-item');
    if (firstItem) {
      firstItem.classList.add('active');
    }
  },

  /**
   * Filtrar jerarquía por término de búsqueda
   */
  filterHierarchy(searchTerm) {
    const container = document.getElementById('hierarchy-tree-container');
    if (!container) return;

    const term = searchTerm.toLowerCase().trim();
    
    // Si no hay término, mostrar todo y limpiar resaltados
    if (!term) {
      container.querySelectorAll('.hierarchy-node').forEach(node => {
        node.style.display = 'block';
        node.classList.remove('highlighted');
        const header = node.querySelector('.node-header');
        if (header) {
          header.classList.remove('search-match');
        }
      });
      return;
    }

    // Primero, ocultar todos
    const allNodes = container.querySelectorAll('.hierarchy-node');
    allNodes.forEach(node => {
      node.style.display = 'none';
      node.classList.remove('highlighted');
      const header = node.querySelector('.node-header');
      if (header) {
        header.classList.remove('search-match');
      }
    });

    // Buscar coincidencias
    allNodes.forEach(node => {
      const label = node.querySelector('.node-label');
      if (label && label.textContent.toLowerCase().includes(term)) {
        // Marcar nodo como coincidencia
        node.style.display = 'block';
        node.classList.add('highlighted');
        const header = node.querySelector('.node-header');
        if (header) {
          header.classList.add('search-match');
        }

        // Mostrar todos los ancestros
        let parent = node.parentElement;
        while (parent && parent.classList.contains('node-children')) {
          const parentNode = parent.previousElementSibling;
          if (parentNode && parentNode.classList.contains('node-header')) {
            const parentContainer = parentNode.closest('.hierarchy-node');
            if (parentContainer) {
              parentContainer.style.display = 'block';
            }
          }
          parent = parent.parentElement;
        }

        // Expandir nodo para mostrar children
        const children = node.querySelector('.node-children');
        if (children) {
          children.classList.remove('collapsed');
          const toggle = node.querySelector('.node-toggle');
          if (toggle) {
            toggle.textContent = '▼';
          }
        }
      }
    });
  },

  /**
   * Renderizar lista de mapas en sección "Mapas Creados"
   */
  renderMapasList(mapas) {
    const container = document.getElementById('mapList');
    if (!container) return;

    if (!mapas || mapas.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No hay mapas creados</p>';
      return;
    }

    container.innerHTML = mapas.map(mapa => {
      const zonasCount = window.mapStorage?.countZonasByMapId(mapa.id) || 0;
      const jerarquiaText = mapa.jerarquiaPath ? mapa.jerarquiaPath.map(j => j.id).join(' > ') : 'Sin jerarquía';
      
      return `
        <div class="area-item" style="padding: 8px; margin-bottom: 6px; border-left: 2px solid var(--primary); background: var(--bg-primary); border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">
                ${mapa.name}
              </div>
              <div style="font-size: 0.65rem; color: var(--text-secondary);">
                ${mapa.mapLevel} • ${zonasCount} zonas • ${jerarquiaText}
              </div>
            </div>
            <div style="display: flex; gap: 4px; flex-shrink: 0;">
              <button class="action-btn" onclick="window.mapStorage?.loadMap(${mapa.id})" style="background: var(--primary); color: white; border-color: var(--primary);">Ver</button>
              <button class="action-btn" onclick="window.mapStorage?.editMap(${mapa.id})">Editar</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Actualizar estadísticas
   */
  updateStats() {
    const mapas = window.mapStorage?.state?.mapas || [];
    const zonas = window.mapStorage?.state?.zonas || [];
    
    // Contar marcadores (equipos en zonas)
    let totalMarcadores = 0;
    zonas.forEach(zona => {
      if (zona.equipos && Array.isArray(zona.equipos)) {
        totalMarcadores += zona.equipos.length;
      }
    });

    // Actualizar badges en tabs
    const mapasCountBadge = document.getElementById('mapasCountBadge');
    if (mapasCountBadge) {
      mapasCountBadge.textContent = mapas.length;
    }

    // Actualizar stats cards
    const statsMapasCount = document.getElementById('statsMapasCount');
    const statsAreasCount = document.getElementById('statsAreasCount');
    const statsMarcadoresCount = document.getElementById('statsMarcadoresCount');

    if (statsMapasCount) statsMapasCount.textContent = mapas.length;
    if (statsAreasCount) statsAreasCount.textContent = zonas.length;
    if (statsMarcadoresCount) statsMarcadoresCount.textContent = totalMarcadores;
  },

  /**
   * Renderizar logs de actividad
   */
  renderLogs() {
    const container = document.getElementById('logTimeline');
    if (!container) return;

    // Por ahora, logs estáticos de ejemplo
    const logs = [
      { type: 'success', icon: '✓', message: 'Mapa <strong>Planta Principal</strong> creado', time: 'Hace 2 horas' },
      { type: 'marker', icon: '📍', message: 'Marcador agregado en <strong>Eviscerado</strong>', time: 'Hace 3 horas' },
      { type: 'edit', icon: '✏️', message: 'Zona <strong>Grader</strong> actualizada', time: 'Hace 5 horas' }
    ];

    container.innerHTML = logs.map(log => `
      <div class="log-item log-${log.type}">
        <div class="log-icon">${log.icon}</div>
        <div class="log-content">
          <div class="log-message">${log.message}</div>
          <div class="log-time">${log.time}</div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Inicializar eventos de UI
   */
  initializeEvents() {
    // Tabs del panel
    document.querySelectorAll('.panel-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = tab.dataset.tab;
        if (tabName) {
          this.switchPanelTab(tabName);
        }
      });
    });

    // Subsecciones
    document.querySelectorAll('.subsection-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const sectionId = item.dataset.section;
        if (sectionId) {
          this.scrollToSection(sectionId);
        }
      });
    });

    // Buscador global
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        this.filterHierarchy(e.target.value);
      });
    }

    // Headers de secciones colapsables
    document.querySelectorAll('.map-section-header').forEach(header => {
      header.addEventListener('click', () => {
        this.toggleSection(header);
      });
    });

    console.log('✅ MapasUI eventos inicializados');
  }
};

// Exponer globalmente para compatibilidad
window.MapasUI = MapasUI;

})();
