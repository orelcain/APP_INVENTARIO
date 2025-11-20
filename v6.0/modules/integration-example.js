/**
 * ========================================
 * EJEMPLO DE INTEGRACIÓN - HIERARCHY SYNC
 * ========================================
 * 
 * Este archivo muestra cómo integrar el sistema de
 * jerarquía en el Tab Mapas de la aplicación principal.
 * 
 * Copiar y adaptar el código según sea necesario.
 * ========================================
 */

import { HierarchySync } from './hierarchy-sync.js';

// ===== 1. CONFIGURACIÓN INICIAL =====

/**
 * Sistema de eventos global de la aplicación
 * Definir ANTES de inicializar cualquier tab
 */
if (!window.appEvents) {
  window.appEvents = new EventTarget();
  console.log('✅ Sistema de eventos global creado');
}

// ===== 2. INICIALIZACIÓN DEL TAB MAPAS =====

/**
 * Inicializar el Tab Mapas con jerarquía
 */
async function initTabMapas() {
  console.log('🔄 Inicializando Tab Mapas...');
  
  try {
    // 1. Cargar datos
    const mapasData = await loadMapasData();
    const zonasData = await loadZonasData();
    
    console.log(`📦 Datos cargados: ${mapasData.length} mapas, ${zonasData.length} zonas`);
    
    // 2. Obtener contenedor HTML
    const container = document.getElementById('hierarchy-tree-container');
    if (!container) {
      throw new Error('Contenedor #hierarchy-tree-container no encontrado');
    }
    
    // 3. Crear instancia de HierarchySync
    window.hierarchySync = new HierarchySync(container, mapasData, zonasData);
    
    // 4. Suscribirse a eventos ANTES de inicializar
    setupHierarchyEvents();
    
    // 5. Inicializar (renderiza el árbol)
    window.hierarchySync.init();
    
    // 6. Conectar búsqueda global
    setupGlobalSearch();
    
    console.log('✅ Tab Mapas inicializado correctamente');
    
  } catch (error) {
    console.error('❌ Error al inicializar Tab Mapas:', error);
    showErrorUI(error.message);
  }
}

// ===== 3. CARGAR DATOS =====

/**
 * Cargar datos de mapas
 * Adaptar según tu método de carga (fetch, localStorage, etc.)
 */
async function loadMapasData() {
  // Opción 1: Fetch desde archivo JSON
  const response = await fetch('./INVENTARIO_STORAGE/mapas.json');
  if (!response.ok) throw new Error('Error al cargar mapas');
  return await response.json();
  
  // Opción 2: Desde localStorage
  // return JSON.parse(localStorage.getItem('mapas')) || [];
  
  // Opción 3: Desde variable global (si ya están cargados)
  // return window.mapasData || [];
}

/**
 * Cargar datos de zonas
 */
async function loadZonasData() {
  const response = await fetch('./INVENTARIO_STORAGE/zonas.json');
  if (!response.ok) throw new Error('Error al cargar zonas');
  return await response.json();
}

// ===== 4. CONFIGURAR EVENTOS =====

/**
 * Configurar listeners de eventos de la jerarquía
 */
function setupHierarchyEvents() {
  // Evento: Nodo seleccionado
  window.hierarchySync.on('node-selected', (event) => {
    const { name, mapId, level, hasMap } = event.detail.data;
    
    console.log(`✅ Nodo seleccionado: ${name} (Nivel ${level})`);
    
    // Actualizar breadcrumb
    updateBreadcrumb(name, level);
    
    // Actualizar estadísticas
    updateStats(name);
    
    // Sincronizar con otros componentes
    syncWithOtherTabs(event.detail);
  });
  
  // Evento: Actualizar canvas de mapa
  window.hierarchySync.on('map-canvas-update', (event) => {
    const mapa = event.detail.mapa;
    
    console.log(`🗺️ Actualizando canvas: ${mapa.name}`);
    
    // Renderizar mapa en canvas
    renderMapOnCanvas(mapa);
  });
}

/**
 * Configurar búsqueda global
 */
function setupGlobalSearch() {
  const searchInput = document.getElementById('globalSearch');
  if (!searchInput) {
    console.warn('⚠️ Input de búsqueda no encontrado');
    return;
  }
  
  // Búsqueda en tiempo real
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value;
    window.hierarchySync.filter(term);
  });
  
  // Limpiar con ESC
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      window.hierarchySync.filter('');
    }
  });
}

// ===== 5. SINCRONIZACIÓN CON OTROS TABS =====

/**
 * Sincronizar con otros tabs de la aplicación
 */
function syncWithOtherTabs(syncData) {
  const { name, mapId, hasMap } = syncData.data;
  
  // Emitir evento global para otros tabs
  window.appEvents.dispatchEvent(new CustomEvent('mapas-node-selected', {
    detail: { name, mapId, hasMap }
  }));
}

/**
 * Escuchar eventos desde Tab Inventario
 */
window.appEvents.addEventListener('inventario-item-selected', (event) => {
  const { nodoJerarquia, equipoId } = event.detail;
  
  console.log(`📨 Recibido de Inventario: ${nodoJerarquia}`);
  
  // Navegar al nodo en la jerarquía
  if (window.hierarchySync) {
    window.hierarchySync.navigateToNode(nodoJerarquia);
  }
});

/**
 * Escuchar eventos desde Tab Jerarquía
 */
window.appEvents.addEventListener('jerarquia-node-clicked', (event) => {
  const { nodeName } = event.detail;
  
  console.log(`📨 Recibido de Jerarquía: ${nodeName}`);
  
  // Sincronizar con vista de mapas
  if (window.hierarchySync) {
    window.hierarchySync.navigateToNode(nodeName);
  }
});

// ===== 6. FUNCIONES AUXILIARES =====

/**
 * Actualizar breadcrumb de navegación
 */
function updateBreadcrumb(nodeName, level) {
  const breadcrumb = document.getElementById('breadcrumb');
  if (!breadcrumb) return;
  
  // Construir ruta de navegación
  // TODO: Implementar lógica completa de breadcrumb
  breadcrumb.innerHTML = `
    <span>Inicio</span> 
    <span>›</span> 
    <span>Nivel ${level}</span> 
    <span>›</span> 
    <strong>${nodeName}</strong>
  `;
}

/**
 * Actualizar estadísticas del nodo
 */
function updateStats(nodeName) {
  // TODO: Calcular y mostrar estadísticas del nodo
  console.log(`📊 Actualizando stats para: ${nodeName}`);
}

/**
 * Renderizar mapa en canvas
 */
function renderMapOnCanvas(mapa) {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) {
    console.warn('⚠️ Canvas no encontrado');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  
  // Limpiar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Cargar y renderizar imagen del mapa
  const img = new Image();
  img.onload = () => {
    // Ajustar canvas al tamaño de la imagen
    canvas.width = mapa.width;
    canvas.height = mapa.height;
    
    // Dibujar imagen
    ctx.drawImage(img, 0, 0, mapa.width, mapa.height);
    
    console.log(`✅ Mapa renderizado: ${mapa.name}`);
  };
  img.onerror = () => {
    console.error(`❌ Error al cargar imagen: ${mapa.imagePath}`);
  };
  img.src = mapa.imagePath;
}

/**
 * Mostrar UI de error
 */
function showErrorUI(message) {
  const container = document.getElementById('hierarchy-tree-container');
  if (!container) return;
  
  container.innerHTML = `
    <div style="padding: 40px; text-align: center; color: var(--danger);">
      <div style="font-size: 2rem; margin-bottom: 16px;">⚠️</div>
      <div style="font-size: 1rem; font-weight: 600; margin-bottom: 8px;">
        Error al cargar jerarquía
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
        ${message}
      </div>
      <button onclick="location.reload()" style="
        padding: 10px 20px;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
      ">
        🔄 Recargar página
      </button>
    </div>
  `;
}

// ===== 7. INICIALIZACIÓN AUTOMÁTICA =====

/**
 * Inicializar cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTabMapas);
} else {
  // DOM ya está listo
  initTabMapas();
}

// ===== 8. FUNCIONES GLOBALES ÚTILES =====

/**
 * Exportar funciones para uso global
 */
window.MapasTab = {
  /**
   * Reinicializar jerarquía
   */
  refresh: async () => {
    if (window.hierarchySync) {
      window.hierarchySync.destroy();
    }
    await initTabMapas();
  },
  
  /**
   * Buscar en jerarquía
   */
  search: (term) => {
    if (window.hierarchySync) {
      window.hierarchySync.filter(term);
    }
  },
  
  /**
   * Navegar a nodo
   */
  navigateTo: (nodeName) => {
    if (window.hierarchySync) {
      window.hierarchySync.navigateToNode(nodeName);
    }
  },
  
  /**
   * Obtener nodo seleccionado
   */
  getSelected: () => {
    return window.hierarchySync ? window.hierarchySync.getSelectedNode() : null;
  }
};

console.log('📦 Módulo de integración cargado');

// ===== 9. EJEMPLO DE USO DESDE CONSOLA =====

/**
 * Comandos útiles para debugging en consola del navegador:
 * 
 * // Buscar "eviscerado"
 * window.MapasTab.search('eviscerado');
 * 
 * // Navegar a "Grader"
 * window.MapasTab.navigateTo('Grader');
 * 
 * // Obtener nodo seleccionado
 * window.MapasTab.getSelected();
 * 
 * // Reinicializar todo
 * window.MapasTab.refresh();
 * 
 * // Emitir evento personalizado
 * window.appEvents.dispatchEvent(new CustomEvent('test-event', {
 *   detail: { message: 'Hola desde consola' }
 * }));
 */
