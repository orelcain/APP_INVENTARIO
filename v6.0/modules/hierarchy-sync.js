/**
 * ========================================
 * HIERARCHY SYNC - MÓDULO DE SINCRONIZACIÓN
 * ========================================
 * 
 * Sistema de sincronización jerárquica para el Tab Mapas
 * 
 * Características:
 * - Renderizado dinámico de jerarquía
 * - Búsqueda global con filtrado inteligente
 * - Sistema de eventos bidireccional
 * - Resaltado de nodos y ramas completas
 * - Sincronización con canvas de mapas
 * - Notificaciones visuales
 * 
 * Uso (sin módulos ES6 - compatible con file://):
 * const hierarchy = new HierarchySync(containerElement, mapasData);
 * hierarchy.init();
 * 
 * Última actualización: 20 Nov 2025
 * ========================================
 */

// Definir clase globalmente (sin export para compatibilidad file://)
class HierarchySync {
  constructor(containerElement, mapasData = [], zonasData = [], jerarquiaData = null, repuestosData = []) {
    this.container = containerElement;
    this.mapasData = mapasData;
    this.zonasData = zonasData;
    this.jerarquiaData = jerarquiaData; // 🔥 Nueva: jerarquía completa de app
    this.repuestosData = repuestosData; // 🔥 Nueva: repuestos de app
    this.selectedNode = null;
    this.eventTarget = new EventTarget();
  }

  /**
   * Inicializar el sistema de jerarquía
   */
  init() {
    this.setupEventListeners();
    this.renderTree();
    console.log('✅ HierarchySync inicializado');
  }

  /**
   * Actualizar datos y re-renderizar
   */
  updateData(mapasData, zonasData, jerarquiaData = null, repuestosData = []) {
    this.mapasData = mapasData || [];
    this.zonasData = zonasData || [];
    this.repuestosData = repuestosData || [];
    if (jerarquiaData) {
      this.jerarquiaData = jerarquiaData;
    }
    this.renderTree();
    console.log(`🔄 Datos actualizados: ${this.mapasData.length} mapas, ${this.zonasData.length} zonas, ${this.repuestosData.length} repuestos`);
  }

  /**
   * Configurar listeners de eventos
   */
  setupEventListeners() {
    // Escuchar mensajes de la app principal
    window.addEventListener('message', (event) => {
      if (event.data && event.data.source === 'app-principal') {
        this.handleExternalSync(event.data);
      }
    });

    // Listener interno para debugging
    this.eventTarget.addEventListener('node-selected', (event) => {
      console.log('🔄 Nodo seleccionado:', event.detail);
    });
  }

  /**
   * Renderizar el árbol de jerarquía completo
   * @param {Object} hierarchyData - Datos de jerarquía (opcional, usa datos por defecto si no se proporciona)
   */
  renderTree(hierarchyData = null) {
    if (!this.container) {
      console.error('❌ Contenedor no encontrado');
      return;
    }

    // 🔥 PRIORIDAD: Usar jerarquía real de app si existe
    let data;
    if (hierarchyData) {
      data = hierarchyData;
    } else if (this.jerarquiaData) {
      data = this.buildTreeFromAppHierarchy();
    } else {
      data = this.buildDefaultHierarchy();
    }
    
    this.container.innerHTML = this.renderNode(data, 0);
    console.log('✅ Árbol de jerarquía renderizado');
  }

  /**
   * Renderizar un nodo individual con sus hijos
   * @param {Object} node - Datos del nodo
   * @param {Number} depth - Profundidad del nodo en el árbol
   * @returns {String} HTML del nodo
   */
  renderNode(node, depth) {
    const hasMap = !!node.mapId;
    const hasAreas = (node.areas || 0) > 0 || !!node.areaId;
    const hasMarcadores = (node.marcadores || 0) > 0;
    const hasChildren = node.children && node.children.length > 0;
    const isRepuesto = !!node.isRepuesto;
    
    // Estilos condicionales
    const isHighlighted = hasMap || hasAreas || hasMarcadores;
    const opacity = isHighlighted ? '1' : '0.6';
    const paddingLeft = depth * 14;
    const fontWeight = hasMap ? '600' : '400';
    
    // Construir indicadores
    const indicators = this.buildIndicators(hasMap, hasAreas, node.marcadores, isRepuesto);
    
    // Data attributes para sincronización
    const dataAttrs = [
      `data-node-name="${node.name}"`,
      `data-node-level="${node.nivel}"`,
      `data-node-id="${node.id || ''}"`,
      `data-map-id="${node.mapId || ''}"`,
      `data-area-id="${node.areaId || ''}"`,
      `data-has-map="${hasMap}"`,
      `data-is-repuesto="${isRepuesto}"`,
      `data-depth="${depth}"`
    ].join(' ');
    
    const toggleHtml = hasChildren 
      ? '<span class="node-toggle" onclick="window.hierarchySync.toggleNode(event)">▼</span>' 
      : '<span style="display: inline-block; width: 12px;"></span>';
    
    const childrenHtml = hasChildren 
      ? `<div class="node-children">${node.children.map(child => this.renderNode(child, depth + 1)).join('')}</div>` 
      : '';
    
    // Badge especial para repuestos
    const badgeHtml = isRepuesto 
      ? '<span class="node-badge" style="background: var(--primary, #3b82f6);">🔧</span>'
      : `<span class="node-badge">N${node.nivel}</span>`;
    
    return `
      <div class="hierarchy-node ${isRepuesto ? 'hierarchy-node-repuesto' : ''}" ${dataAttrs} style="opacity: ${opacity};">
        <div class="node-header" style="padding: 4px 8px; padding-left: ${paddingLeft + 8}px;" onclick="window.hierarchySync.onNodeClick(event)">
          ${toggleHtml}
          ${badgeHtml}
          ${indicators}
          <span class="node-label" style="font-weight: ${fontWeight};">${node.name}</span>
        </div>
        ${childrenHtml}
      </div>
    `;
  }

  /**
   * Construir HTML de indicadores visuales
   */
  buildIndicators(hasMap, hasAreas, marcadores, isRepuesto = false) {
    let html = '<span class="node-indicators">';
    
    if (hasMap) {
      html += '<span class="node-indicator" title="Mapa asignado">🗺️</span>';
    }
    
    if (hasAreas && !isRepuesto) {
      html += '<span class="node-indicator" title="Áreas creadas">📦</span>';
    }
    
    if (marcadores > 0) {
      html += `<span class="node-indicator" title="${marcadores} marcadores">📍<sub style="font-size: 0.55rem;">${marcadores}</sub></span>`;
    }
    
    html += '</span>';
    return html;
  }

  /**
   * Construir jerarquía por defecto desde datos
   */
  buildDefaultHierarchy() {
    // Jerarquía de ejemplo (reemplazar con datos reales)
    return {
      name: 'Planta Principal',
      nivel: 1,
      mapId: 1760411932641,
      children: [
        {
          name: 'Eviscerado',
          nivel: 2,
          mapId: 1760411932641,
          areas: 15,
          marcadores: 42,
          children: [
            {
              name: 'Grader',
              nivel: 3,
              areas: 6,
              marcadores: 18,
              children: [
                { name: 'Pocket 1-4', nivel: 4, marcadores: 5 },
                { name: 'Cinta Z', nivel: 4, marcadores: 3 },
                { name: 'Cinta Acel. 1', nivel: 4, marcadores: 4 },
                { name: 'Cinta Acel. 2', nivel: 4, marcadores: 3 },
                { name: 'Cinta Larga', nivel: 4, marcadores: 3 }
              ]
            },
            {
              name: 'Marel',
              nivel: 3,
              areas: 3,
              marcadores: 8,
              children: [
                { name: 'Cinta Azul', nivel: 4, marcadores: 8 }
              ]
            }
          ]
        },
        {
          name: 'Filete',
          nivel: 2,
          areas: 8,
          marcadores: 24
        },
        {
          name: 'Congelado',
          nivel: 2,
          areas: 5,
          marcadores: 15
        }
      ]
    };
  }

  /**
   * 🔥 NUEVO: Construir árbol desde app.jerarquiaAnidada
   * Convierte la estructura de app al formato de HierarchySync
   */
  buildTreeFromAppHierarchy() {
    if (!this.jerarquiaData) {
      console.warn('⚠️ No hay jerarquiaData, usando jerarquía por defecto');
      return this.buildDefaultHierarchy();
    }

    const { empresa, areas } = this.jerarquiaData;
    
    if (!areas || areas.length === 0) {
      console.warn('⚠️ No hay áreas en jerarquiaData');
      return this.buildDefaultHierarchy();
    }

    console.log(`📋 Construyendo árbol desde app.jerarquiaAnidada: ${areas.length} áreas`);

    // Construir el árbol desde la raíz (empresa)
    const tree = {
      name: empresa?.nombre || 'Empresa',
      nivel: 0,
      id: empresa?.id || 'empresa_root',
      children: areas.map(area => this.buildTreeNode(area, 1))
    };

    return tree;
  }

  /**
   * Construir un nodo del árbol recursivamente
   * @param {Object} node - Nodo de jerarquiaAnidada
   * @param {Number} nivel - Nivel de profundidad (1=Área, 2=SubÁrea, etc.)
   * @returns {Object} - Nodo formateado para HierarchySync
   */
  buildTreeNode(node, nivel) {
    const treeNode = {
      name: node.nombre,
      nivel: nivel,
      id: node.id,
      mapId: node.mapId || null,
      areaId: node.areaId || null,
      areas: 0,
      marcadores: 0,
      children: []
    };

    // Recursivamente construir hijos según el nivel
    // Nivel 1: Áreas → tienen subAreas
    // Nivel 2: SubÁreas → tienen sistemas
    // Nivel 3: Sistemas → tienen subSistemas
    // Nivel 4: SubSistemas → tienen secciones
    // Nivel 5: Secciones → tienen subSecciones
    // Nivel 6: SubSecciones (hoja)

    if (nivel === 1 && node.subAreas) {
      treeNode.children = node.subAreas.map(subArea => this.buildTreeNode(subArea, 2));
    } else if (nivel === 2 && node.sistemas) {
      treeNode.children = node.sistemas.map(sistema => this.buildTreeNode(sistema, 3));
    } else if (nivel === 3 && node.subSistemas) {
      treeNode.children = node.subSistemas.map(subSistema => this.buildTreeNode(subSistema, 4));
    } else if (nivel === 4 && node.secciones) {
      treeNode.children = node.secciones.map(seccion => this.buildTreeNode(seccion, 5));
    } else if (nivel === 5 && node.subSecciones) {
      treeNode.children = node.subSecciones.map(subSeccion => this.buildTreeNode(subSeccion, 6));
    }

    // 🔥 NUEVO: Agregar repuestos de app.repuestos que coincidan con esta jerarquía
    if (this.repuestosData && this.repuestosData.length > 0) {
      const repuestosVinculados = this.findRepuestosForNode(node, nivel);
      
      if (repuestosVinculados.length > 0) {
        const repuestosNodes = repuestosVinculados.map(repuesto => ({
          name: repuesto.nombre || repuesto.id,
          nivel: 7,
          id: repuesto.id,
          isRepuesto: true,
          mapId: repuesto.mapId || null,
          areaId: repuesto.areaId || null,
          marcadores: 1, // Cada repuesto cuenta como 1 marcador
          children: []
        }));
        
        treeNode.children.push(...repuestosNodes);
        treeNode.marcadores += repuestosNodes.length;
      }
    }

    // Contar áreas y marcadores de hijos
    if (treeNode.children.length > 0) {
      treeNode.children.forEach(child => {
        treeNode.areas += (child.areas || 0) + (child.areaId ? 1 : 0);
        treeNode.marcadores += child.marcadores || 0;
      });
    }

    return treeNode;
  }

  /**
   * Encontrar repuestos que pertenecen a un nodo de jerarquía
   * @param {Object} node - Nodo de jerarquía
   * @param {Number} nivel - Nivel del nodo
   * @returns {Array} - Repuestos que coinciden con este nodo
   */
  findRepuestosForNode(node, nivel) {
    if (!this.repuestosData || !node.id) return [];

    // Mapear nivel a campo de jerarquía en repuestos
    const jerarquiaFieldMap = {
      1: 'areaGeneral',
      2: 'subArea',
      3: 'sistemaEquipo',
      4: 'subSistema',
      5: 'seccion',
      6: 'subSeccion'
    };

    const field = jerarquiaFieldMap[nivel];
    if (!field) return [];

    // Filtrar repuestos que coincidan con el nombre del nodo en el campo correspondiente
    const repuestos = this.repuestosData.filter(repuesto => {
      return repuesto[field] === node.nombre;
    });

    return repuestos;
  }

  /**
   * Construir jerarquía desde zonasData real
   */
  buildHierarchyFromZones() {
    const hierarchy = {};
    
    this.zonasData.forEach(zona => {
      const jer = zona.jerarquia;
      if (!jer) return;
      
      let currentLevel = hierarchy;
      for (let i = 1; i <= 7; i++) {
        const nivelKey = `nivel${i}`;
        const nivelValue = jer[nivelKey];
        
        if (nivelValue) {
          if (!currentLevel[nivelValue]) {
            currentLevel[nivelValue] = {
              name: nivelValue,
              nivel: i,
              children: {},
              zonas: [],
              mapId: zona.mapId,
              areas: 0,
              marcadores: 0
            };
          }
          currentLevel[nivelValue].zonas.push(zona);
          currentLevel[nivelValue].areas = currentLevel[nivelValue].zonas.length;
          currentLevel[nivelValue].marcadores += zona.equipos?.length || 0;
          currentLevel = currentLevel[nivelValue].children;
        }
      }
    });
    
    return this.convertToTree(hierarchy);
  }

  /**
   * Convertir objeto plano a árbol con array de children
   */
  convertToTree(obj) {
    return Object.values(obj).map(node => ({
      ...node,
      children: Object.keys(node.children).length > 0 
        ? this.convertToTree(node.children) 
        : []
    }));
  }

  /**
   * Toggle expandir/colapsar nodo
   */
  toggleNode(event) {
    event.stopPropagation();
    
    const toggle = event.target;
    const nodeElement = toggle.closest('.hierarchy-node');
    const children = nodeElement.querySelector(':scope > .node-children');
    
    if (children) {
      const isCollapsed = children.classList.contains('collapsed');
      
      if (isCollapsed) {
        children.classList.remove('collapsed');
        toggle.textContent = '▼';
      } else {
        children.classList.add('collapsed');
        toggle.textContent = '▶';
      }
    }
  }

  /**
   * Handler de click en nodo
   */
  onNodeClick(event) {
    const headerElement = event.currentTarget;
    const nodeElement = headerElement.parentElement;
    
    const nodeData = {
      name: nodeElement.getAttribute('data-node-name'),
      mapId: nodeElement.getAttribute('data-map-id'),
      hasMap: nodeElement.getAttribute('data-has-map') === 'true',
      level: nodeElement.getAttribute('data-node-level')
    };
    
    console.log('🎯 Click en nodo:', nodeData);
    
    // Limpiar selecciones previas
    this.clearSelections();
    
    // Resaltar nodo seleccionado
    headerElement.classList.add('selected');
    
    // Resaltar rama completa
    this.highlightBranch(nodeElement);
    
    // Actualizar canvas si tiene mapa
    if (nodeData.hasMap && nodeData.mapId) {
      this.updateMapCanvas(nodeData.mapId);
    }
    
    // Emitir eventos de sincronización
    this.emitSyncEvent(nodeData);
    
    // Mostrar notificación
    this.showNotification(nodeData.name, nodeData.hasMap);
    
    // Guardar selección actual
    this.selectedNode = nodeData;
  }

  /**
   * Limpiar todas las selecciones y resaltados
   */
  clearSelections() {
    if (!this.container) return;
    
    this.container.querySelectorAll('.node-header').forEach(header => {
      header.classList.remove('selected');
    });
    
    this.container.querySelectorAll('.hierarchy-node').forEach(node => {
      node.classList.remove('highlighted');
    });
  }

  /**
   * Resaltar rama completa (nodo + todos sus padres)
   */
  highlightBranch(nodeElement) {
    let currentNode = nodeElement;
    
    while (currentNode && currentNode !== this.container) {
      if (currentNode.classList.contains('hierarchy-node')) {
        currentNode.classList.add('highlighted');
        
        // Expandir si está colapsado
        const children = currentNode.querySelector(':scope > .node-children');
        if (children && children.classList.contains('collapsed')) {
          children.classList.remove('collapsed');
          const toggle = currentNode.querySelector(':scope > .node-header .node-toggle');
          if (toggle) toggle.textContent = '▼';
        }
      }
      
      currentNode = currentNode.parentElement?.parentElement;
    }
  }

  /**
   * Filtrar jerarquía por término de búsqueda
   */
  filter(searchTerm) {
    if (!this.container) return;
    
    const term = searchTerm.toLowerCase().trim();
    
    // Si no hay término, mostrar todo
    if (!term) {
      this.showAllNodes();
      return;
    }
    
    // Limpiar resaltados previos
    this.clearSearchHighlights();
    
    const allNodes = this.container.querySelectorAll('.hierarchy-node');
    const matchingNodes = [];
    
    allNodes.forEach(node => {
      const nodeName = node.getAttribute('data-node-name').toLowerCase();
      const matches = nodeName.includes(term);
      
      if (matches) {
        matchingNodes.push(node);
        this.showNodeWithBranch(node);
        this.highlightSearchMatch(node);
      } else {
        node.style.display = 'none';
      }
    });
    
    console.log(`🔍 Búsqueda: "${term}" - ${matchingNodes.length} coincidencias`);
  }

  /**
   * Mostrar todos los nodos y limpiar filtros
   */
  showAllNodes() {
    if (!this.container) return;
    
    this.container.querySelectorAll('.hierarchy-node').forEach(node => {
      node.style.display = 'block';
      node.classList.remove('highlighted');
      
      const header = node.querySelector('.node-header');
      if (header) {
        header.classList.remove('search-match');
      }
    });
  }

  /**
   * Limpiar resaltados de búsqueda
   */
  clearSearchHighlights() {
    if (!this.container) return;
    
    this.container.querySelectorAll('.hierarchy-node').forEach(node => {
      node.classList.remove('highlighted');
      
      const header = node.querySelector('.node-header');
      if (header) {
        header.classList.remove('search-match');
      }
    });
  }

  /**
   * Mostrar nodo con toda su rama (padres e hijos)
   */
  showNodeWithBranch(node) {
    // Mostrar el nodo
    node.style.display = 'block';
    node.classList.add('highlighted');
    
    // Mostrar y expandir todos los padres
    let parent = node.parentElement;
    while (parent && parent !== this.container) {
      if (parent.classList.contains('node-children')) {
        parent.style.display = 'block';
        
        if (parent.classList.contains('collapsed')) {
          parent.classList.remove('collapsed');
          const toggle = parent.previousElementSibling?.querySelector('.node-toggle');
          if (toggle) toggle.textContent = '▼';
        }
        
        const parentNode = parent.parentElement;
        if (parentNode && parentNode.classList.contains('hierarchy-node')) {
          parentNode.style.display = 'block';
          parentNode.classList.add('highlighted');
        }
      }
      parent = parent.parentElement;
    }
    
    // Expandir y mostrar hijos
    const children = node.querySelector(':scope > .node-children');
    if (children) {
      children.style.display = 'block';
      if (children.classList.contains('collapsed')) {
        children.classList.remove('collapsed');
        const toggle = node.querySelector(':scope > .node-header .node-toggle');
        if (toggle) toggle.textContent = '▼';
      }
    }
  }

  /**
   * Resaltar nodo que coincide con búsqueda
   */
  highlightSearchMatch(node) {
    const header = node.querySelector('.node-header');
    if (header) {
      header.classList.add('search-match');
    }
  }

  /**
   * Actualizar canvas del mapa
   */
  updateMapCanvas(mapId) {
    console.log('🗺️ Actualizando canvas del mapa:', mapId);
    
    const mapa = this.mapasData.find(m => m.id == mapId);
    if (!mapa) {
      console.warn('⚠️ Mapa no encontrado:', mapId, 'en', this.mapasData.length, 'mapas disponibles');
      return;
    }
    
    console.log('📍 Mapa encontrado:', {
      nombre: mapa.name,
      nivel: mapa.mapLevel,
      dimensiones: `${mapa.width}x${mapa.height}`
    });
    
    // Intentar cargar el mapa usando mapController
    if (window.mapController && typeof window.mapController.loadMap === 'function') {
      try {
        window.mapController.loadMap(mapId);
        console.log('✅ Mapa cargado en canvas:', mapa.name);
      } catch (error) {
        console.error('❌ Error al cargar mapa en canvas:', error);
      }
    } else {
      console.warn('⚠️ mapController.loadMap no disponible');
    }
    
    // Emitir evento para que la app actualice el canvas
    this.eventTarget.dispatchEvent(new CustomEvent('map-canvas-update', {
      detail: { mapa }
    }));
  }

  /**
   * Emitir eventos de sincronización
   */
  emitSyncEvent(nodeData) {
    const syncData = {
      source: 'mapas-tab',
      action: 'node-selected',
      data: {
        ...nodeData,
        timestamp: new Date().toISOString()
      }
    };
    
    // Evento interno
    this.eventTarget.dispatchEvent(new CustomEvent('node-selected', {
      detail: syncData
    }));
    
    // Evento global para otros tabs
    if (window.appEvents) {
      window.appEvents.dispatchEvent(new CustomEvent('hierarchy-node-selected', {
        detail: syncData
      }));
    }
    
    // PostMessage para iframes (si aplica)
    if (window.parent !== window) {
      window.parent.postMessage(syncData, '*');
    }
    
    console.log('📡 Evento de sincronización emitido:', syncData);
  }

  /**
   * Mostrar notificación visual
   */
  showNotification(nodeName, hasMap) {
    const notification = document.createElement('div');
    notification.className = 'mapas-hierarchy-notification';
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.2rem;">${hasMap ? '🗺️' : '📍'}</span>
        <div>
          <div style="font-weight: 600;">${nodeName}</div>
          <div style="font-size: 0.75rem; opacity: 0.9;">${hasMap ? 'Mapa cargado' : 'Nodo seleccionado'}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('closing');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  /**
   * Manejar sincronización externa (desde app principal)
   */
  handleExternalSync(data) {
    console.log('📨 Mensaje recibido:', data);
    
    if (data.action === 'navigate-to-node') {
      this.navigateToNode(data.data.nodeName);
    }
  }

  /**
   * Navegar a un nodo específico por nombre
   */
  navigateToNode(nodeName) {
    if (!this.container) return;
    
    const nodeElement = this.container.querySelector(`[data-node-name="${nodeName}"]`);
    if (!nodeElement) {
      console.warn('⚠️ Nodo no encontrado:', nodeName);
      return;
    }
    
    const header = nodeElement.querySelector('.node-header');
    if (header) {
      // Scroll suave
      header.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Resaltar temporalmente
      header.style.background = 'rgba(34, 197, 94, 0.3)';
      setTimeout(() => {
        header.style.background = '';
        header.click();
      }, 800);
    }
  }

  /**
   * Obtener nodo seleccionado actualmente
   */
  getSelectedNode() {
    return this.selectedNode;
  }

  /**
   * Suscribirse a eventos del sistema
   */
  on(eventName, callback) {
    this.eventTarget.addEventListener(eventName, callback);
  }

  /**
   * Desuscribirse de eventos
   */
  off(eventName, callback) {
    this.eventTarget.removeEventListener(eventName, callback);
  }

  /**
   * Destruir instancia y limpiar listeners
   */
  destroy() {
    this.container.innerHTML = '';
    this.selectedNode = null;
    console.log('🗑️ HierarchySync destruido');
  }
}

// Funciones helper standalone (disponibles globalmente)
const HierarchyUtils = {
  /**
   * Construir jerarquía desde datos planos
   */
  buildHierarchy(zonasData) {
    const hierarchy = {};
    
    zonasData.forEach(zona => {
      const jer = zona.jerarquia;
      if (!jer) return;
      
      let currentLevel = hierarchy;
      for (let i = 1; i <= 7; i++) {
        const nivelKey = `nivel${i}`;
        const nivelValue = jer[nivelKey];
        
        if (nivelValue) {
          if (!currentLevel[nivelValue]) {
            currentLevel[nivelValue] = {
              name: nivelValue,
              nivel: i,
              children: {},
              zonas: [],
              mapId: zona.mapId,
              areas: 0,
              marcadores: 0
            };
          }
          currentLevel[nivelValue].zonas.push(zona);
          currentLevel[nivelValue].areas++;
          currentLevel[nivelValue].marcadores += zona.equipos?.length || 0;
          currentLevel = currentLevel[nivelValue].children;
        }
      }
    });
    
    return hierarchy;
  }
};

// Exponer clase globalmente para uso sin módulos ES6
if (typeof window !== 'undefined') {
  window.HierarchySync = HierarchySync;
  window.HierarchyUtils = HierarchyUtils;
  console.log('✅ HierarchySync cargado y disponible globalmente');
}
