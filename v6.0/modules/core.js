// ========================================
// MÓDULO CORE
// Clase principal InventarioCompleto
// ========================================

import { fsManager, mapStorage } from './storage.js';
import mapController from './mapa.js';

// ===================================================================
// CACHÉ GLOBAL DE BLOB URLs (Prevenir Garbage Collection)
// ===================================================================
const globalBlobCache = new Map();

// Función para obtener o crear Blob URL con caché global
async function getCachedBlobUrl(filename, loadFunction) {
  if (globalBlobCache.has(filename)) {
    const cached = globalBlobCache.get(filename);
    console.log(`  [CACHÉ GLOBAL] Reutilizando: ${filename}`);
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
    console.log(`✅ [CACHÉ GLOBAL] Guardado: ${filename} (Total: ${globalBlobCache.size})`);
  }
  return url;
}

class InventarioCompleto {
  constructor() {
    this.repuestos = [];
    this.conteoData = {};
    this.conteoActivo = false;
    this.currentView = 'cards';
    this.currentTab = 'inventario';
    this.mapTool = 'pan'; // Herramienta por defecto para mover el mapa
    this.mapObjects = []; // {type, x, y, w, h, r, name, color, locked, id, cuadrante}
    this.selectedObject = null; // Objeto seleccionado para editar
    this.showGrid = true; // Mostrar rejilla
    this.showCuadrantes = true; // Mostrar cuadrantes
    this.cuadrantesConfig = { filas: 8, columnas: 8 }; // 8x8 por defecto (como ajedrez)
    this.mapImage = null;
    this.currentMultimedia = [];
    this.currentDocuments = [];
    this.currentEditingId = null;
    this.currentPage = 1;
    this.itemsPerPage = 'auto'; // Modo automtico responsive por defecto
    this.itemsPerPageManual = 21; // Valor manual cuando no es auto
    this.viewMode = localStorage.getItem('viewMode') || 'auto'; // 'auto', 'mobile', 'desktop'
    this.isEdge = this.detectEdge(); // Detectar si es Microsoft Edge
    this.isEdgeIOS = false; // Se setea en detectEdge() si es Edge iOS
    this.filteredRepuestos = [];
    this.showPrecio = false;
    this.autocompleteData = { codProv: [], tipo: [], area: [], equipo: [] };
    this.lightboxMedias = [];
    this.lightboxIndex = 0;
    this.canvas = null;
    this.ctx = null;
    this.listSortField = 'codSAP';
    this.listSortOrder = 'asc';
    this.columnWidths = ['50px', '0.9fr', '1.5fr', '160px', '220px'];
    
    // Sistema de Mapa Avanzado
    this.mapViewMode = 'embedded'; // 'embedded', 'floating', 'fullscreen'
    this.mapLayers = []; // Array de capas [{id, name, image, visible, opacity, locked}]
    this.selectedLayer = null; // Capa seleccionada actualmente
    this.mapZoom = 1.0;
    this.mapPanX = 0;
    this.mapPanY = 0;
    this.mapIsPanning = false;
    this.mapLastPanX = 0;
    this.mapLastPanY = 0;
    this.floatingWindowPos = { x: 100, y: 100, width: 800, height: 600 };
    this.isResizing = false;
    this.resizeEdge = null;
    
    // Variables para edicin de objetos con handles
    this.isDraggingObject = false;
    this.isResizingObject = false;
    this.resizeHandle = null; // 'tl', 'tc', 'tr', 'rc', 'br', 'bc', 'bl', 'lc', 'radius'
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.objectStartState = null;
    
    // Sistema de Zonas del Mapa (Vinculadas a Jerarqua)
    this.mapZones = []; // [{id, nombre, jerarquia: {planta, areaGeneral, subArea, sistemaEquipo...}, shape, coords, color}]
    this.mapProgramMode = false; // Modo programacin para crear zonas
    this.selectedZone = null; // Zona seleccionada
    this.highlightedZones = []; // Zonas resaltadas por filtro
    this.editingZoneId = null; // ID de zona en edicin
    this.selectedZoneColor = '#3b82f6'; // Color seleccionado para zona
    this.inventoryFocusId = null;
    this.jerarquiaFilter = '';
    this.jerarquiaCriticalOnly = false;
    
    this.sistemaPorEquipo = {
      'Grader': [
        'Pocket 1', 'Pocket 2', 'Pocket 3', 'Pocket 4',
        'Cinta Z', 'Cinta Aceleracin 1', 'Cinta Aceleracin 2', 'Cinta Larga',
        'Sistema Hidrulico', 'Sistema Neumtico', 'Panel Elctrico Principal',
        'Tablero Control', 'Motor Principal', 'Otro'
      ],
      'Compresor': [
        'Motor Principal', 'Tanque Almacenamiento', 'Vlvulas Control',
        'Sistema Refrigeracin', 'Panel Control', 'Filtros Aire', 'Otro'
      ],
      'Bomba': [
        'Motor Elctrico', 'Impulsor', 'Carcasa', 'Sellos Mecnicos',
        'Rodamientos', 'Base y Acople', 'Vlvulas', 'Otro'
      ],
      'Transportador': [
        'Banda/Cadena', 'Motor Traccin', 'Rodillos', 'Tensor',
        'Estructura Soporte', 'Sistema Guas', 'Otro'
      ],
      'default': [
        'Motor', 'Transmisin', 'Sistema Elctrico', 'Sistema Hidrulico',
        'Sistema Neumtico', 'Estructura', 'Controles', 'Otro'
      ]
    };
    
    this.customSistemas = this.loadCustomSistemas();
    
    this.plantaBase = 'Aquachile Antarfood Chonchi';
    
    // ===============================================
    // CONFIGURACIN DE ORGANIZACIN DE IMGENES
    // ===============================================
    this.nivelJerarquiaImagenes = parseInt(localStorage.getItem('nivelJerarquiaImagenes')) || 3;
    // 1 = Solo rea General
    // 2 = rea + Sistema/Equipo
    // 3 = Jerarqua Completa (rea > Subrea > Sistema)
    
    this.renombrarImagenesAutomaticamente = localStorage.getItem('renombrarImagenesAuto') !== 'false'; // true por defecto
    this.eliminarImagenAntiguaAlMover = localStorage.getItem('eliminarImagenAntigua') !== 'false'; // true por defecto
    this.longitudMaximaNombreArchivo = 100; // Mximo caracteres para nombres de archivo
    
    // Opciones predefinidas por defecto (solo se usan si no hay nada guardado)
    this.opcionesJerarquiaPredefinidas = {
      'areaGeneral': [
        'Planta Principal',
        'Acopio',
        'Planta Yal',
        'Estanques Agua',
        'Estanque Inox',
        'Entretecho',
        'Bodega General',
        'Zona Externa',
        'rea de Mantencin',
        'GENERAL'
      ],
      'subArea': [
        'Zona Norte',
        'Zona Sur',
        'Piso 1',
        'Piso 2',
        'Sector A',
        'Sector B',
        'Pasillo Central',
        'Lnea 1',
        'Lnea 2'
      ],
      'sistemaEquipo': [
        'Grader Marel',
        'Compresor Atlas Copco',
        'Cinta Transportadora 1',
        'Cinta Transportadora 2',
        'Bomba Principal',
        'Sistema Hidrulico',
        'Panel Elctrico Central',
        'Grader',
        'Compresor 01',
        'Compresor 02'
      ],
      'subSistema': [
        'Motor Principal',
        'Sistema de Lubricacin',
        'Tablero de Control',
        'Pocket 1',
        'Pocket 2',
        'Pocket 3',
        'Pocket 4',
        'Cinta Z',
        'Cinta Aceleracin 1',
        'Cinta Aceleracin 2',
        'Panel Elctrico'
      ],
      'seccion': [
        'Panel Elctrico',
        'Controles',
        'Sistema Hidrulico',
        'Sistema Neumtico',
        'Zona de Corte',
        'Sistema de Refrigeracin',
        'Vlvulas Control'
      ]
      // Nota: 'detalle' no tiene opciones predefinidas porque es texto libre
    };
    
    // Cargar opciones desde localStorage (o inicializar con predefinidas)
    this.opcionesJerarquia = {};
    this.loadOpcionesPersonalizadas();
    
    this.jerarquiaNiveles = [
      { id: 'planta', nombre: 'Empresa', requerido: true, visible: true },
      { id: 'areaGeneral', nombre: 'rea General', requerido: true, visible: true },
      { id: 'subArea', nombre: 'Sub-rea', requerido: false, visible: false },
      { id: 'sistemaEquipo', nombre: 'Sistema/Equipo', requerido: false, visible: true },
      { id: 'subSistema', nombre: 'Sub-Sistema', requerido: false, visible: false },
      { id: 'seccion', nombre: 'Seccin', requerido: false, visible: false },
      { id: 'detalle', nombre: 'Detalle/Ubicacin', requerido: false, visible: false }
    ];
    
    this.isMobile = this.detectMobile();
    this.hasFileSystemAPI = this.checkFileSystemAPI();
    this.storageMode = this.hasFileSystemAPI ? 'filesystem' : 'indexeddb';
    
    console.log(`  Dispositivo: ${this.isMobile ? 'Mvil' : 'PC'}`);
    console.log(`  Modo de almacenamiento: ${this.storageMode.toUpperCase()}`);
    console.log(`  File System API: ${this.hasFileSystemAPI ? '- Disponible' : '- No disponible'}`);
  }
  
  // NUEVO: Detectar si es dispositivo mvil
  detectMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    
    return isMobileUA || (isTouchDevice && isSmallScreen);
  }
  
  // NUEVO: Verificar disponibilidad de File System Access API
  checkFileSystemAPI() {
    return 'showDirectoryPicker' in window;
  }

  // Detectar si el navegador es Microsoft Edge
  detectEdge() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isEdgeChromium = userAgent.includes('edg/'); // Edge Chromium (PC y mvil)
    const isEdgeLegacy = userAgent.includes('edge/'); // Edge Legacy (ya no se usa)
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // - ACEPTAR Edge iOS tambin (aunque use WebKit)
    // El usuario ya est usando Edge, no tiene sentido pedirle que lo descargue
    if (isEdgeChromium && isIOS) {
      console.log('  Edge en iOS detectado - Modo mvil con IndexedDB');
      this.isEdgeIOS = true; // Flag especial para Edge iOS
      return true; // - S es Edge (aunque limitado)
    }
    
    this.isEdgeIOS = false;
    return isEdgeChromium || isEdgeLegacy;
  }

  // Mostrar advertencia si no es Edge
  showBrowserWarning() {
    // PRIORIDAD 1: Mostrar banner de mvil simplificado si no hay FileSystem
    if (this.isMobile && !this.hasFileSystemAPI) {
      console.log('  Modo Mvil Simplificado detectado');
      this.showMobileSimplifiedBanner();
      return;
    }
    
    if (this.isEdge) {
      // Si es Edge iOS, mostrar mensaje informativo suave
      if (this.isEdgeIOS) {
        console.log('  Microsoft Edge iOS detectado - Modo mvil activo');
        this.showEdgeIOSInfo();
        return;
      }
      
      console.log('- Microsoft Edge detectado - Experiencia optimizada');
      return;
    }

    const browserName = this.getBrowserName();
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isEdgeIOS = userAgent.includes('edg/') && isIOS;
    const isMobile = this.isMobile;
    const storageMode = this.storageMode;
    
    console.warn('  Navegador no optimizado:', browserName);

    // Mensaje especfico segn plataforma y navegador
    let warningMessage = '';
    
    if (isEdgeIOS) {
      warningMessage = 'Edge en iOS usa WebKit (motor de Safari) por restricciones de Apple. La app funciona en <strong>modo mvil con IndexedDB</strong> (lmite ~50-100MB). Para almacenamiento ilimitado, usa Edge en <strong>Windows</strong> o <strong>Android</strong>.';
    } else if (isMobile && storageMode === 'indexeddb') {
      warningMessage = 'Ests usando <strong>modo mvil con IndexedDB</strong> (lmite ~50-100MB para imgenes). Para almacenamiento ilimitado con File System API, usa <strong>Microsoft Edge en Windows/Android</strong>.';
    } else {
      warningMessage = 'Esta aplicacin est optimizada exclusivamente para <strong>Microsoft Edge</strong> en <strong>Windows</strong> y <strong>Android</strong>. Algunas funciones pueden no funcionar correctamente.';
    }

    // Crear banner de advertencia
    const banner = document.createElement('div');
    banner.id = 'browser-warning-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 99999;
        background: linear-gradient(135deg, var(--danger), #b91c1c);
        color: white;
        padding: 16px 20px;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        animation: slideDown 0.5s ease-out;
        flex-wrap: wrap;
      ">
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 250px;">
          <span style="font-size: 2rem;"> </span>
          <div>
            <div style="font-weight: 700; font-size: 1rem; margin-bottom: 4px;">
              Navegador No Optimizado: ${browserName}
            </div>
            <div style="font-size: 0.85rem; opacity: 0.95; line-height: 1.4;">
              ${warningMessage}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <a href="https://www.microsoft.com/edge" target="_blank" 
             style="
               padding: 10px 20px;
               background: var(--primary);
               color: white;
               border-radius: 6px;
               text-decoration: none;
               font-weight: 600;
               white-space: nowrap;
               box-shadow: var(--shadow-md);
               transition: all 0.3s ease;
             "
             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-lg)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-md)'">
              Descargar Edge
          </a>
          <button onclick="document.getElementById('browser-warning-banner').style.display='none'" 
                  style="
                    padding: 10px 16px;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.4);
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                  "
                  onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                  onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            - Cerrar
          </button>
        </div>
      </div>
      <style>
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @media (max-width: 768px) {
          #browser-warning-banner > div {
            flex-direction: column !important;
            text-align: center;
          }
          #browser-warning-banner a,
          #browser-warning-banner button {
            width: 100%;
          }
        }
      </style>
    `;

    document.body.insertBefore(banner, document.body.firstChild);

    // Ajustar padding del body para que no se solape el contenido
    document.body.style.paddingTop = '120px';
  }
  
  // Mostrar info amigable para Edge iOS (sin alarmar al usuario)
  showEdgeIOSInfo() {
    // Crear banner informativo SUAVE (azul, no rojo)
    const banner = document.createElement('div');
    banner.id = 'edge-ios-info-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 99999;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95));
        color: white;
        padding: 12px 16px;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        animation: slideDown 0.5s ease-out;
        font-size: 0.9rem;
      ">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
          <span style="font-size: 1.5rem;"> </span>
          <div>
            <strong>Edge Mvil Detectado</strong>  
              Cmara +  - Galera/iCloud disponibles
          </div>
        </div>
        <button onclick="document.getElementById('edge-ios-info-banner').style.display='none'" 
                style="
                  padding: 6px 12px;
                  background: rgba(255,255,255,0.2);
                  color: white;
                  border: 1px solid rgba(255,255,255,0.3);
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 0.85rem;
                  font-weight: 600;
                "
                onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          - Entendido
        </button>
      </div>
      <style>
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 768px) {
          #edge-ios-info-banner > div {
            font-size: 0.85rem;
          }
        }
      </style>
    `;

    document.body.insertBefore(banner, document.body.firstChild);
    
    // Auto-cerrar despus de 5 segundos
    setTimeout(() => {
      const bannerEl = document.getElementById('edge-ios-info-banner');
      if (bannerEl) {
        bannerEl.style.transition = 'opacity 0.5s ease-out';
        bannerEl.style.opacity = '0';
        setTimeout(() => bannerEl.remove(), 500);
      }
    }, 5000);
  }

  // Mostrar banner de modo mvil simplificado (sin FileSystem)
  showMobileSimplifiedBanner() {
    const banner = document.createElement('div');
    banner.id = 'mobile-simplified-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 99999;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(124, 58, 237, 0.95));
        color: white;
        padding: 14px 16px;
        box-shadow: var(--shadow-lg);
        animation: slideDown 0.5s ease-out;
        font-size: 0.85rem;
      ">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
              <span style="font-size: 1.8rem;"> </span>
              <div>
                <strong style="font-size: 1rem; display: block; margin-bottom: 3px;">
                  Modo Mvil Simplificado
                </strong>
                <span style="opacity: 0.95; font-size: 0.8rem;">
                  Solo datos  Sin fotos
                </span>
              </div>
            </div>
            <button onclick="document.getElementById('mobile-simplified-banner').style.display='none'" 
                    style="
                      padding: 6px 12px;
                      background: rgba(255,255,255,0.2);
                      color: white;
                      border: 1px solid rgba(255,255,255,0.3);
                      border-radius: 4px;
                      cursor: pointer;
                      font-size: 0.8rem;
                      font-weight: 600;
                      white-space: nowrap;
                    ">
              - Entendido
            </button>
          </div>
          
          <div style="
            background: rgba(255,255,255,0.15);
            padding: 10px 12px;
            border-radius: 6px;
            line-height: 1.5;
            font-size: 0.8rem;
          ">
            <strong style="display: block; margin-bottom: 6px;">- Funciones activas:</strong>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.75rem;">
              <span> Ver inventario</span>
              <span> Conteo rpido</span>
              <span> Agregar repuestos</span>
              <span> Buscar/Filtrar</span>
              <span> Editar datos</span>
              <span> Eliminar items</span>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.75rem;">
                <strong>Para fotos:</strong> Usa la versin de PC
            </div>
          </div>
        </div>
      </div>
      <style>
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Auto-cerrar despus de 8 segundos (ms tiempo para leer todo)
    setTimeout(() => {
      const bannerEl = document.getElementById('mobile-simplified-banner');
      if (bannerEl) {
        bannerEl.style.transition = 'opacity 0.5s ease-out';
        bannerEl.style.opacity = '0';
        setTimeout(() => bannerEl.remove(), 500);
      }
    }, 8000);
    
    console.log('  Banner de Modo Mvil Simplificado mostrado');
  }

  // Obtener nombre del navegador actual
  getBrowserName() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('firefox')) return 'Mozilla Firefox';
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'Google Chrome';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'Safari';
    if (userAgent.includes('opera') || userAgent.includes('opr')) return 'Opera';
    
    return 'Navegador Desconocido';
  }

  // Helper para obtener URL de imagen (soporta base64 Y rutas externas)
  async getImageUrl(media) {
    if (!media) return null;
    
    // ===================================================================
    // MANEJO UNIVERSAL DE IMGENES (FileSystem, IndexedDB, base64)
    // ===================================================================
    
    // Si es un string simple
    if (typeof media === 'string') {
      // Base64 inline - Retornar directamente
      if (media.startsWith('data:image')) {
        return media;
      }
      // ID de IndexedDB (img_timestamp_filename)
      if (media.startsWith('img_') && this.storageMode === 'indexeddb') {
        try {
          const result = await this.loadImageFromFileSystem(media);
          return result; // Puede ser null si falla
        } catch (error) {
          console.log(`  Imagen IndexedDB no disponible: ${media}`);
          return null;
        }
      }
      // Ruta de FileSystem (./imagenes/...)
      if (media.startsWith('./imagenes/') || media.startsWith('imagenes/')) {
        try {
          const result = await this.loadImageFromFileSystem(media);
          return result; // Puede ser null si falla
        } catch (error) {
          console.log(`  Imagen FileSystem no disponible: ${media}`);
          return null;
        }
      }
      // Ruta relativa o absoluta
      return media;
    }
    
    // Si es objeto con flag de IndexedDB
    if (media.type === 'image' && media.url) {
      if (media.isIndexedDB && media.url.startsWith('img_')) {
        try {
          const result = await this.loadImageFromFileSystem(media.url);
          return result; // Puede ser null si falla
        } catch (error) {
          console.log(`  Imagen IndexedDB no disponible: ${media.url}`);
          return null;
        }
      }
      // Si es objeto con flag de FileSystem
      if (media.isFileSystem && (media.url.startsWith('./imagenes/') || media.url.startsWith('imagenes/'))) {
        try {
          const result = await this.loadImageFromFileSystem(media.url);
          return result; // Puede ser null si falla
        } catch (error) {
          console.log(`  Imagen FileSystem no disponible: ${media.url}`);
          return null;
        }
      }
      // Base64 u otro formato
      return media.url;
    }
    
    // Si es objeto con estructura {tipo: 'imagen', url: '...'}
    if (media.tipo === 'imagen' && media.url) {
      // - SOPORTE PARA ARCHIVOS EXTERNOS
      if (media.esArchivoExterno) {
        return media.url;
      }
      // Base64 o URL normal
      return media.url;
    }
    
    return null;
  }

  async loadImageFromFileSystem(path) {
    // ===================================================================
    // CARGA UNIVERSAL DE IMGENES (FileSystem, IndexedDB o base64)
    // ===================================================================
    
    // CASO 1: Base64 inline (LocalStorage mode) - Retornar directamente
    if (path.startsWith('data:image')) {
      return path;
    }
    
    // CASO 2: IndexedDB ID (Mobile mode)
    if (path.startsWith('img_') && this.storageMode === 'indexeddb') {
      try {
        const imageData = await indexedDBManager.getImage(path);
        if (imageData && imageData.url) {
          console.log(`- IndexedDB: ${path} cargada`);
          return imageData.url;
        }
      } catch (error) {
        console.error(`- Error cargando desde IndexedDB: ${path}`, error);
        return null;
      }
    }
    
    // CASO 3: FileSystem path (PC mode con Edge)
    if (!fsManager.isFileSystemMode || !fsManager.imagesFolder) {
      console.warn('  No est en modo FileSystem o no hay carpeta imagenes configurada');
      console.warn('   isFileSystemMode:', fsManager.isFileSystemMode);
      console.warn('   imagesFolder:', fsManager.imagesFolder);
      console.warn('   Ruta solicitada:', path);
      return null;
    }

    try {
      // Extraer ruta relativa desde imagenes/
      const originalPath = path.replace('./imagenes/', '').replace('imagenes/', '');
      
      // Usar cach global con referencias fuertes (previene Garbage Collection)
      return await getCachedBlobUrl(originalPath, async () => {
        console.log(`  Cargando imagen desde FileSystem: ${originalPath}`);
        console.log(`   Desde carpeta: ${fsManager.folderPath}/imagenes/`);
        
        // Usar el handle de imgenes ya inicializado (mejor sincronizacin)
        const imagesFolder = fsManager.imagesFolder;
        if (!imagesFolder) {
          console.error('- No hay handle de carpeta imagenes inicializado');
          return null;
        }
        
        let fileHandle;
        let file;
        
        // ESTRATEGIA 1: Intentar buscar el archivo con su nombre original (codificado)
        try {
          fileHandle = await imagesFolder.getFileHandle(originalPath);
          file = await fileHandle.getFile();
          const blobUrl = URL.createObjectURL(file);
          console.log(`- Imagen cargada (codificada): ${originalPath} (${file.size} bytes)`);
          return blobUrl;
        } catch (error) {
          console.log(`     Archivo no encontrado en raz con nombre codificado`);
        }
        
        // ESTRATEGIA 2: Si tiene __, intentar decodificar y buscar en carpetas jerrquicas
        if (originalPath.includes('__')) {
          try {
            const decodedPath = this.decodificarRutaJerarquica(originalPath);
            console.log(`     Intentando ruta decodificada: ${decodedPath}`);
            
            if (decodedPath.includes('/')) {
              const parts = decodedPath.split('/');
              const filename = parts.pop();
              let currentFolder = imagesFolder;
              
              // Navegar por subcarpetas
              for (const folderName of parts) {
                currentFolder = await currentFolder.getDirectoryHandle(folderName);
              }
              
              fileHandle = await currentFolder.getFileHandle(filename);
              file = await fileHandle.getFile();
              const blobUrl = URL.createObjectURL(file);
              console.log(`- Imagen cargada (jerrquica): ${decodedPath} (${file.size} bytes)`);
              return blobUrl;
            }
          } catch (error) {
            console.log(`     Archivo no encontrado en carpetas jerrquicas`);
          }
        }
        
        // Si llegamos aqu, no se encontr el archivo
        throw new Error(`Archivo no encontrado: ${originalPath}`);
      });
    } catch (error) {
      console.error(`- Error cargando imagen desde FileSystem: ${path}`);
      console.error(`   Ruta original: ${path.replace('./imagenes/', '').replace('imagenes/', '')}`);
      console.error(`   Error: ${error.name} - ${error.message}`);
      return null;
    }
  }

  // Obtener primera imagen de multimedia array
  async getFirstImage(multimedia) {
    if (!multimedia || !Array.isArray(multimedia) || multimedia.length === 0) {
      return null;
    }

    // Filtrar automticamente entradas invlidas (sin URL o con URLs vacas)
    const multimediaValido = multimedia.filter(media =>
      media && media.type === 'image' && media.url && media.url.trim() !== ''
    );

    for (let i = 0; i < multimediaValido.length; i++) {
      const media = multimediaValido[i];
      try {
        const url = await this.getImageUrl(media);
        if (url) return url;
      } catch (error) {
        console.log(`  Imagen invlida detectada y omitida: ${media.url}`);
        // Remover la entrada invlida del array original
        const index = multimedia.indexOf(media);
        if (index > -1) {
          multimedia.splice(index, 1);
          console.log(`  Referencia invlida eliminada del array multimedia`);
        }
        i--; // Ajustar ndice despus de remover elemento
      }
    }

    return null;
  }

  // ===================================================================
  async renderZonaBadge(zonaMapaId) {
    if (!zonaMapaId) return '';

    try {
      const [mapIdRaw, zonaIdRaw] = zonaMapaId.split('|');
      const mapId = parseInt(mapIdRaw, 10);
      const zonaId = parseInt(zonaIdRaw, 10);

      let zona = null;
      let mapaNombre = `Mapa ${mapId}`;

      if (mapStorage?.initialized) {
        zona = (mapStorage.zones || []).find(z => z.mapId === mapId && z.id === zonaId);
        const mapa = mapStorage.getMapById(mapId);
        if (mapa) {
          mapaNombre = mapa.name || mapaNombre;
        }
      }

      if (!zona && fsManager?.isConnected && fsManager.storageHandle) {
        try {
          const zonasHandle = await fsManager.storageHandle.getFileHandle('zonas.json');
          const zonasFile = await zonasHandle.getFile();
          const zonasText = await zonasFile.text();
          const zonas = JSON.parse(zonasText);
          zona = zonas.find(z => z.mapId === mapId && z.id === zonaId) || null;

          const mapasHandle = await fsManager.storageHandle.getFileHandle('mapas.json');
          const mapasFile = await mapasHandle.getFile();
          const mapasText = await mapasFile.text();
          const mapas = JSON.parse(mapasText);
          const mapa = mapas.find(m => m.id === mapId);
          if (mapa) {
            mapaNombre = mapa.name || mapaNombre;
          }
        } catch (error) {
          console.warn('No se pudo cargar mapas/zona desde FileSystem:', error);
        }
      }

      if (!zona) {
        return '';
      }

      return `
        <div onclick="app.filterByZona('${zonaMapaId}')" style="
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
          margin-top: 4px;
        "
        data-map-id="${mapId}"
        data-zone-id="${zonaId}"
        title="Click para filtrar por esta zona">
          <span style="font-size: 1rem;">&#128205;</span>
          <div style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2;">
            <span style="font-size: 0.65rem; opacity: 0.9;">${mapaNombre}</span>
            <span style="font-weight: 700;">${zona.name}</span>
          </div>
        </div>
      `;
    } catch (error) {
      console.warn('Error renderizando badge de zona:', error.message);
    }

    return '';
  }

  filterByZona(zonaMapaId) {
    const filterSelect = document.getElementById('filterZonaMapa');
    if (filterSelect) {
      filterSelect.value = zonaMapaId;
      this.applyFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.showToast('Filtrando por zona seleccionada', 'success');
    }

    if (typeof this.switchTab === 'function') {
      this.switchTab('mapa');
    }

    if (typeof mapController?.selectMap === 'function') {
      const [mapIdRaw, zonaIdRaw] = zonaMapaId.split('|');
      const mapId = parseInt(mapIdRaw, 10);
      const zonaId = parseInt(zonaIdRaw, 10);

      mapController.selectMap(mapId, { keepViewport: false })
        .then(() => {
          if (typeof mapController.focusZone === 'function') {
            mapController.focusZone(zonaId);
          }
        })
        .catch(error => console.warn('No se pudo resaltar la zona en el mapa:', error));
    }
  }
  // LIMPIEZA DE REFERENCIAS INVLIDAS DE IMGENES
  // ===================================================================
  async sanitizeImageReferences() {
    const statusDiv = document.getElementById('sanitize-status');
    if (!statusDiv) {
      console.warn('Elemento sanitize-status no encontrado');
      return;
    }
    
    // Mostrar progreso inicial
    statusDiv.innerHTML = '  Iniciando limpieza...';
    statusDiv.style.color = '#ffa500';
    
    console.log('  Iniciando sanitizacin de referencias de imgenes...');
    
    let totalReferences = 0;
    let invalidReferences = 0;
    let repuestosModificados = 0;
    
    try {
      for (const repuesto of this.repuestos) {
        if (!repuesto.multimedia || !Array.isArray(repuesto.multimedia)) {
          continue;
        }
        
        const originalLength = repuesto.multimedia.length;
        totalReferences += originalLength;
        
        // Actualizar progreso
        statusDiv.innerHTML = `  Revisando ${totalReferences} referencias...`;
        
        // Filtrar referencias vlidas
        const validMultimedia = [];
        
        for (const media of repuesto.multimedia) {
          try {
            const imageUrl = await this.getImageUrl(media);
            if (imageUrl !== null) {
              // Imagen vlida, mantener referencia
              validMultimedia.push(media);
            } else {
              // Imagen invlida, eliminar
              invalidReferences++;
              console.log(` ? Referencia invlida eliminada: ${typeof media === 'string' ? media : media.url || 'sin URL'}`);
            }
          } catch (error) {
            // Error al verificar, considerar invlida
            invalidReferences++;
            console.log(`- Error verificando imagen, eliminada: ${error.message}`);
          }
        }
        
        // Actualizar array multimedia si cambi
        if (validMultimedia.length !== originalLength) {
          repuesto.multimedia = validMultimedia;
          repuestosModificados++;
        }
      }
      
      console.log(`- Sanitizacin completada:`);
      console.log(`     Total referencias revisadas: ${totalReferences}`);
      console.log(`    - Referencias invlidas eliminadas: ${invalidReferences}`);
      console.log(`     Repuestos modificados: ${repuestosModificados}`);
      
      // Mostrar resultados
      statusDiv.innerHTML = `
        - Limpieza completada<br>
          ${totalReferences} referencias revisadas<br>
         - ${invalidReferences} eliminadas<br>
          ${repuestosModificados} repuestos actualizados
      `;
      statusDiv.style.color = '#28a745';
      
      // Guardar datos sanitizados si se hicieron cambios
      if (invalidReferences > 0) {
        console.log('  Guardando datos sanitizados...');
        statusDiv.innerHTML += '<br>  Guardando cambios...';
        await this.saveData();
        statusDiv.innerHTML += '<br>- Datos guardados';
      }
      
      return { totalReferences, invalidReferences, repuestosModificados };
      
    } catch (error) {
      console.error('- Error durante la sanitizacin:', error);
      statusDiv.innerHTML = `- Error: ${error.message}`;
      statusDiv.style.color = '#dc3545';
      throw error;
    }
  }

  // ===================================================================
  // MOSTRAR ESTADSTICAS DEL SISTEMA
  // ===================================================================
  // ===================================================================
  // CREAR CARPETAS JERRQUICAS PARA REPUESTOS EXISTENTES
  // ===================================================================
  async crearCarpetasDesdeRepuestosExistentes() {
    console.log('  Iniciando creacin de carpetas jerrquicas desde repuestos existentes...');
    
    if (!fsManager.isFileSystemMode) {
      console.warn('  No est en modo FileSystem');
      return { success: false, message: 'No est en modo FileSystem' };
    }
    
    const statusDiv = document.getElementById('sanitize-status');
    if (statusDiv) {
      statusDiv.innerHTML = '  Creando carpetas jerrquicas...';
      statusDiv.style.color = '#007bff';
    }
    
    let carpetasCreadas = 0;
    let repuestosConUbicacion = 0;
    let errores = 0;
    
    try {
      for (const repuesto of this.repuestos) {
        // Verificar si el repuesto tiene ubicaciones
        if (repuesto.ubicaciones && Array.isArray(repuesto.ubicaciones) && repuesto.ubicaciones.length > 0) {
          repuestosConUbicacion++;
          
          for (const ubicacion of repuesto.ubicaciones) {
            if (ubicacion.areaGeneral && ubicacion.areaGeneral.trim() !== '') {
              try {
                // Crear carpetas jerrquicas para esta ubicacin
                const carpetaDestino = await this.crearCarpetasJerarquicas(ubicacion);
                if (carpetaDestino) {
                  carpetasCreadas++;
                  console.log(`- Carpetas creadas para: ${repuesto.nombre} - ${ubicacion.areaGeneral}`);
                }
              } catch (error) {
                console.error(`- Error creando carpetas para ${repuesto.nombre}:`, error);
                errores++;
              }
            }
          }
        }
      }
      
      const resultado = {
        success: true,
        repuestosConUbicacion,
        carpetasCreadas,
        errores,
        message: `- Proceso completado: ${carpetasCreadas} carpetas creadas para ${repuestosConUbicacion} repuestos`
      };
      
      console.log('  Creacin de carpetas completada:', resultado);
      
      if (statusDiv) {
        statusDiv.innerHTML = `
          - Carpetas creadas<br>
            Repuestos con ubicacin: ${repuestosConUbicacion}<br>
            Carpetas creadas: ${carpetasCreadas}<br>
          ${errores > 0 ? `- Errores: ${errores}` : ''}
        `;
        statusDiv.style.color = errores > 0 ? '#ffc107' : '#28a745';
      }
      
      return resultado;
      
    } catch (error) {
      console.error('- Error general creando carpetas:', error);
      
      if (statusDiv) {
        statusDiv.innerHTML = `- Error: ${error.message}`;
        statusDiv.style.color = '#dc3545';
      }
      
      return { 
        success: false, 
        error: error.message,
        repuestosConUbicacion,
        carpetasCreadas,
        errores 
      };
    }
  }

  // ===================================================================
  // CORREGIR REFERENCIAS DE IMGENES MAL FORMADAS
  // ===================================================================
  async corregirReferenciasImagenes() {
    console.log('  Iniciando correccin de referencias de imgenes...');
    
    // Mostrar feedback en UI
    this.showToast('  Corrigiendo referencias de imgenes...', 'info');
    
    let referenciasCorregidas = 0;
    let repuestosModificados = 0;
    
    for (const repuesto of this.repuestos) {
      if (!repuesto.multimedia || !Array.isArray(repuesto.multimedia)) {
        continue;
      }
      
      let multimediaModificado = false;
      
      for (const media of repuesto.multimedia) {
        if (media.type === 'image' && media.url) {
          let urlOriginal = media.url;
          let urlCorregida = urlOriginal;
          
          // Caso 1: Referencia jerrquica sin prefijo ./imagenes/
          if (urlOriginal.includes('/') && !urlOriginal.startsWith('./imagenes/') && !urlOriginal.startsWith('imagenes/') && !urlOriginal.startsWith('data:') && !urlOriginal.startsWith('blob:')) {
            // Si es una ruta jerrquica sin prefijo, codificarla con __
            const nombreCodificado = this.codificarRutaJerarquica(urlOriginal);
            urlCorregida = `./imagenes/${nombreCodificado}`;
            
            console.log(`  Corrigiendo referencia: ${urlOriginal} - ${urlCorregida}`);
            referenciasCorregidas++;
            multimediaModificado = true;
          }
          
          // Caso 2: Referencia con prefijo pero ruta jerrquica sin codificar
          else if (urlOriginal.startsWith('./imagenes/') && urlOriginal.split('/').length > 2 && !urlOriginal.includes('__')) {
            // Es una ruta jerrquica sin codificar (ej: ./imagenes/PLANTA/archivo.webp)
            const rutaRelativa = urlOriginal.replace('./imagenes/', '');
            const nombreCodificado = this.codificarRutaJerarquica(rutaRelativa);
            urlCorregida = `./imagenes/${nombreCodificado}`;
            
            console.log(`  Codificando referencia: ${urlOriginal} - ${urlCorregida}`);
            referenciasCorregidas++;
            multimediaModificado = true;
          }
          
          // Actualizar la referencia si cambi
          if (urlCorregida !== urlOriginal) {
            media.url = urlCorregida;
          }
        }
      }
      
      if (multimediaModificado) {
        repuestosModificados++;
      }
    }
    
    // Guardar cambios si se hicieron correcciones
    if (referenciasCorregidas > 0) {
      console.log(`  Guardando ${referenciasCorregidas} referencias corregidas en ${repuestosModificados} repuestos...`);
      await this.saveData();
      this.showToast(`- ${referenciasCorregidas} referencias corregidas en ${repuestosModificados} repuestos`, 'success');
      
      // Refrescar vista para mostrar imgenes corregidas
      await this.render();
    } else {
      console.log('- No se encontraron referencias que corregir');
      this.showToast('- Todas las referencias estn correctas', 'success');
    }
    
    console.log(`- Correccin completada: ${referenciasCorregidas} referencias corregidas, ${repuestosModificados} repuestos modificados`);
    return { referenciasCorregidas, repuestosModificados };
  }
  async migrarImagenesACarpetasJerarquicas() {
    console.log('  Iniciando migracin de imgenes a carpetas jerrquicas...');
    
    if (!fsManager.isFileSystemMode) {
      console.warn('  No est en modo FileSystem');
      return { success: false, message: 'No est en modo FileSystem' };
    }
    
    const statusDiv = document.getElementById('sanitize-status');
    if (statusDiv) {
      statusDiv.innerHTML = '  Migrando imgenes a carpetas...';
      statusDiv.style.color = '#007bff';
    }
    
    let imagenesMigradas = 0;
    let imagenesSaltadas = 0;
    let errores = 0;
    
    try {
      for (const repuesto of this.repuestos) {
        // Verificar si el repuesto tiene multimedia y ubicaciones
        if (repuesto.multimedia && Array.isArray(repuesto.multimedia) && repuesto.multimedia.length > 0 &&
            repuesto.ubicaciones && Array.isArray(repuesto.ubicaciones) && repuesto.ubicaciones.length > 0) {
          
          const ubicacion = repuesto.ubicaciones[0]; // Usar primera ubicacin
          
          if (ubicacion.areaGeneral && ubicacion.areaGeneral.trim() !== '') {
            // Crear carpetas jerrquicas
            const carpetaDestino = await this.crearCarpetasJerarquicas(ubicacion);
            
            if (carpetaDestino) {
              for (const media of repuesto.multimedia) {
                if (media.type === 'image' && media.url) {
                  try {
                    // Extraer nombre del archivo de la URL
                    const urlParts = media.url.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    
                    // Si el archivo est en la raz (no tiene __ en el nombre), intentar migrarlo
                    if (filename && !filename.includes('__')) {
                      console.log(`  Migrando: ${filename} - carpeta jerrquica`);
                      
                      // Leer archivo desde raz
                      const imagesFolder = fsManager.imagesFolder;
                      if (!imagesFolder) {
                        console.error('- No hay handle de carpeta imagenes inicializado');
                        errores++;
                        continue;
                      }
                      const fileHandle = await imagesFolder.getFileHandle(filename);
                      const file = await fileHandle.getFile();
                      
                      // Guardar directamente en la carpeta jerrquica con el nombre original
                      await fsManager.saveImageJerarquica(await file.arrayBuffer(), filename, carpetaDestino);
                      
                      // Actualizar referencia en el repuesto para usar ruta jerrquica
                      const rutaJerarquica = this.generarRutaImagen(ubicacion).replace('./imagenes/', '') + '/' + filename;
                      media.url = `./imagenes/${rutaJerarquica}`;
                      
                      // Eliminar archivo antiguo
                      await imagesFolder.removeEntry(filename);
                      
                      imagenesMigradas++;
                      console.log(`- Migrada: ${filename} - ${rutaJerarquica}`);
                    } else {
                      imagenesSaltadas++;
                    }
                  } catch (error) {
                    console.error(`- Error migrando imagen ${media.url}:`, error);
                    errores++;
                  }
                }
              }
            }
          }
        }
      }
      
      // Guardar cambios si hubo migraciones
      if (imagenesMigradas > 0) {
        console.log('  Guardando cambios despus de migracin...');
        await this.saveData();
      }
      
      const resultado = {
        success: true,
        imagenesMigradas,
        imagenesSaltadas,
        errores,
        message: `- Migracin completada: ${imagenesMigradas} imgenes migradas, ${imagenesSaltadas} saltadas`
      };
      
      console.log('  Migracin completada:', resultado);
      
      if (statusDiv) {
        statusDiv.innerHTML = `
          - Migracin completada<br>
            Imgenes migradas: ${imagenesMigradas}<br>
            Imgenes saltadas: ${imagenesSaltadas}<br>
          ${errores > 0 ? `- Errores: ${errores}` : ''}
        `;
        statusDiv.style.color = errores > 0 ? '#ffc107' : '#28a745';
      }
      
      return resultado;
      
    } catch (error) {
      console.error('- Error general en migracin:', error);
      
      if (statusDiv) {
        statusDiv.innerHTML = `- Error: ${error.message}`;
        statusDiv.style.color = '#dc3545';
      }
      
      return { 
        success: false, 
        error: error.message,
        imagenesMigradas,
        imagenesSaltadas,
        errores 
      };
    }
  }

  showSystemStats() {
    const totalRepuestos = this.repuestos.length;
    const repuestosConImagenes = this.repuestos.filter(r => r.multimedia && r.multimedia.length > 0).length;
    const repuestosSinImagenes = totalRepuestos - repuestosConImagenes;
    
    let totalImagenes = 0;
    let imagenesPorTipo = { filesystem: 0, indexeddb: 0, base64: 0, externas: 0 };
    for(const repuesto of this.repuestos) {
      if (repuesto.multimedia && Array.isArray(repuesto.multimedia)) {
        totalImagenes += repuesto.multimedia.length;
        
        for (const media of repuesto.multimedia) {
          if (typeof media === 'string') {
            if (media.startsWith('data:image')) {
              imagenesPorTipo.base64++;
            } else if (media.startsWith('img_')) {
              imagenesPorTipo.indexeddb++;
            } else if (media.startsWith('./imagenes/') || media.startsWith('imagenes/')) {
              imagenesPorTipo.filesystem++;
            } else {
              imagenesPorTipo.externas++;
            }
          } else if (media.type === 'image' && media.url) {
            if (media.isFileSystem) {
              imagenesPorTipo.filesystem++;
            } else if (media.isIndexedDB) {
              imagenesPorTipo.indexeddb++;
            } else if (media.esArchivoExterno) {
              imagenesPorTipo.externas++;
            } else {
              imagenesPorTipo.base64++;
            }
          }
        }
      }
    }
    
    // Informacin de almacenamiento
    const storageMode = this.storageMode.toUpperCase();
    const hasFileSystem = this.hasFileSystemAPI ? 'SI' : 'NO';
    const isFileSystemMode = fsManager.isFileSystemMode ? 'ACTIVO' : 'INACTIVO';
    
    // Mostrar estadsticas
    statsDiv.innerHTML = `
      <div style="display: grid; gap: 8px; font-size: 0.8rem;">
        <div><strong>  Repuestos:</strong> ${totalRepuestos}</div>
        <div style="margin-left: 12px;"> Con imgenes: ${repuestosConImagenes}</div>
        <div style="margin-left: 12px;"> Sin imgenes: ${repuestosSinImagenes}</div>
        
        <div><strong> - Imgenes totales:</strong> ${totalImagenes}</div>
        <div style="margin-left: 12px;"> FileSystem: ${imagenesPorTipo.filesystem}</div>
        <div style="margin-left: 12px;"> IndexedDB: ${imagenesPorTipo.indexeddb}</div>
        <div style="margin-left: 12px;"> Base64: ${imagenesPorTipo.base64}</div>
        <div style="margin-left: 12px;"> Externas: ${imagenesPorTipo.externas}</div>
        
        <div><strong>  Almacenamiento:</strong> ${storageMode}</div>
        <div style="margin-left: 12px;"> FileSystem API: ${hasFileSystem}</div>
        <div style="margin-left: 12px;"> Modo FileSystem: ${isFileSystemMode}</div>
        
        <div><strong>  Plataforma:</strong> ${this.isMobile ? 'Mvil' : 'PC'}</div>
      </div>
    `;
  }

  loadCustomSistemas() {
    try {
      const stored = localStorage.getItem('inventarioCustomSistemas');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('- Error cargando sistemas personalizados:', error);
      return {};
    }
  }
  
  saveCustomSistemas() {
    try {
      localStorage.setItem('inventarioCustomSistemas', JSON.stringify(this.customSistemas));
      console.log('- Sistemas personalizados guardados:', this.customSistemas);
    } catch (error) {
      console.error('- Error guardando sistemas personalizados:', error);
      this.showAlert('Error al guardar sistemas personalizados', 'error');
    }
  }
  
  addCustomSistema(equipo, sistema) {
    if (!equipo || !sistema || sistema.trim() === '') return;
    
    if (!this.customSistemas[equipo]) {
      this.customSistemas[equipo] = [];
    }
    
    const sistemaTrimmed = sistema.trim();
    const predefinidos = this.sistemaPorEquipo[equipo] || this.sistemaPorEquipo['default'];
    
    if (predefinidos.includes(sistemaTrimmed) || this.customSistemas[equipo].includes(sistemaTrimmed)) {
      return false;
    }
    
    this.customSistemas[equipo].push(sistemaTrimmed);
    this.saveCustomSistemas();
    console.log(`- Sistema personalizado agregado: ${sistemaTrimmed} (${equipo})`);
    return true;
  }
  
  deleteCustomSistema(equipo, sistema) {
    if (!this.customSistemas[equipo]) return false;
    
    const index = this.customSistemas[equipo].indexOf(sistema);
    if (index > -1) {
      this.customSistemas[equipo].splice(index, 1);
      
      if (this.customSistemas[equipo].length === 0) {
        delete this.customSistemas[equipo];
      }
      
      this.saveCustomSistemas();
      console.log(`- Sistema personalizado eliminado: ${sistema} (${equipo})`);
      return true;
    }
    return false;
  }
  
  editCustomSistema(equipo, oldSistema, newSistema) {
    if (!this.customSistemas[equipo] || !newSistema || newSistema.trim() === '') return false;
    
    const index = this.customSistemas[equipo].indexOf(oldSistema);
    if (index > -1) {
      const newSistemaTrimmed = newSistema.trim();
      
      const predefinidos = this.sistemaPorEquipo[equipo] || this.sistemaPorEquipo['default'];
      if (predefinidos.includes(newSistemaTrimmed) || this.customSistemas[equipo].includes(newSistemaTrimmed)) {
        this.showAlert('Este sistema ya existe', 'warning');
        return false;
      }
      
      this.customSistemas[equipo][index] = newSistemaTrimmed;
      this.saveCustomSistemas();
      console.log(`- Sistema personalizado editado: ${oldSistema} - ${newSistemaTrimmed} (${equipo})`);
      return true;
    }
    return false;
  }
  
  // ============================================
  // GESTIN DE OPCIONES PERSONALIZADAS DE JERARQUA
  // ============================================
  
  loadOpcionesPersonalizadas() {
    try {
      const stored = localStorage.getItem('inventarioOpcionesJerarquia');
      if (stored) {
        // Si existe en localStorage, usar ESO (respeta eliminaciones)
        this.opcionesJerarquia = JSON.parse(stored);
        console.log('- Opciones cargadas desde localStorage');
      } else {
        // Primera vez: usar valores predefinidos y guardarlos
        this.opcionesJerarquia = JSON.parse(JSON.stringify(this.opcionesJerarquiaPredefinidas));
        this.saveOpcionesPersonalizadas();
        console.log('- Opciones inicializadas con valores predefinidos');
      }
    } catch (error) {
      console.error('- Error cargando opciones personalizadas:', error);
      // En caso de error, usar predefinidas
      this.opcionesJerarquia = JSON.parse(JSON.stringify(this.opcionesJerarquiaPredefinidas));
    }
  }
  
  saveOpcionesPersonalizadas() {
    try {
      // Guardar todas las opciones actuales
      const toSave = {};
      Object.keys(this.opcionesJerarquia).forEach(nivel => {
        toSave[nivel] = [...this.opcionesJerarquia[nivel]];
      });
      localStorage.setItem('inventarioOpcionesJerarquia', JSON.stringify(toSave));
      console.log('- Opciones personalizadas guardadas');
    } catch (error) {
      console.error('- Error guardando opciones personalizadas:', error);
    }
  }
  
  aprenderNuevaOpcion(nivel, valor) {
    if (!nivel || !valor || valor.trim() === '') return false;
    if (!this.opcionesJerarquia[nivel]) return false;
    
    const valorTrimmed = valor.trim();
    
    // Si ya existe, no hacer nada
    if (this.opcionesJerarquia[nivel].includes(valorTrimmed)) {
      return false;
    }
    
    // Agregar nueva opcin
    this.opcionesJerarquia[nivel].push(valorTrimmed);
    this.saveOpcionesPersonalizadas();
    console.log(`- Nueva opcin aprendida: ${valorTrimmed} en ${nivel}`);
    return true;
  }
  
  eliminarOpcionJerarquia(nivel, valor) {
    if (!this.opcionesJerarquia[nivel]) return false;
    
    const index = this.opcionesJerarquia[nivel].indexOf(valor);
    if (index > -1) {
      this.opcionesJerarquia[nivel].splice(index, 1);
      this.saveOpcionesPersonalizadas();
      
      // Limpiar esta opcin de todos los repuestos que la usen
      this.limpiarOpcionDeRepuestos(nivel, valor);
      
      console.log(`- Opcin eliminada: ${valor} de ${nivel}`);
      return true;
    }
    return false;
  }
  
  limpiarOpcionDeRepuestos(nivel, valor) {
    let modificados = 0;
    
    this.repuestos.forEach(repuesto => {
      if (repuesto.ubicaciones && Array.isArray(repuesto.ubicaciones)) {
        repuesto.ubicaciones.forEach(ubicacion => {
          if (ubicacion[nivel] === valor) {
            ubicacion[nivel] = '';
            modificados++;
          }
        });
      }
    });
    
    if (modificados > 0) {
      this.guardarDatos();
      console.log(`- Limpiado "${valor}" de ${modificados} ubicacin(es)`);
      this.showAlert(`Se elimin "${valor}" de ${modificados} ubicacin(es)`, 'success');
    }
  }
  
  agregarOpcionJerarquia(nivel, valor) {
    if (!nivel || !valor || valor.trim() === '') {
      this.showToast('- Debes ingresar un valor', 'warning');
      return false;
    }
    
    // Inicializar array si no existe
    if (!this.opcionesJerarquia[nivel]) {
      this.opcionesJerarquia[nivel] = [];
    }
    
    const valorTrimmed = valor.trim();
    
    if (this.opcionesJerarquia[nivel].includes(valorTrimmed)) {
      this.showToast('  Esta opcin ya existe', 'warning');
      return false;
    }
    
    this.opcionesJerarquia[nivel].push(valorTrimmed);
    this.opcionesJerarquia[nivel].sort();
    this.saveOpcionesPersonalizadas();
    console.log(`- Opcin agregada: ${valorTrimmed} a ${nivel}`);
    this.showToast(`- "${valorTrimmed}" agregado correctamente`, 'success');
    return true;
  }


  toggleNivelesConfig() {
    const panel = document.getElementById('nivelesConfigPanel');
    if (panel.style.display === 'none') {
      panel.style.display = 'block';
      this.renderNivelesConfig();
    } else {
      panel.style.display = 'none';
    }
  }

  renderNivelesConfig() {
    const container = document.getElementById('nivelesCheckboxes');
    if (!container) return;
    
    let html = '';
    this.jerarquiaNiveles.forEach((nivel, index) => {
      if (nivel.id === 'planta' || nivel.id === 'areaGeneral') return;
      
      html += `
        <label style="display: flex; align-items: center; gap: 8px; padding: 8px; background: var(--bg-primary); border-radius: 6px; cursor: pointer; border: 2px solid ${nivel.visible ? 'var(--success)' : 'var(--border-color)'};">
          <input type="checkbox" 
                 ${nivel.visible ? 'checked' : ''}
                 onchange="app.toggleNivelVisibilidad('${nivel.id}', this.checked)"
                 style="cursor: pointer;">
          <span style="font-weight: 600; font-size: 0.85rem;">${index + 1}. ${nivel.nombre}</span>
        </label>
      `;
    });
    
    container.innerHTML = html;
  }

  toggleNivelVisibilidad(nivelId, visible) {
    const nivel = this.jerarquiaNiveles.find(n => n.id === nivelId);
    if (nivel) {
      nivel.visible = visible;
      this.renderNivelesDinamicos();
      this.updateJerarquiaPreview();
    }
  }

  renderNivelesDinamicos() {
    const container = document.getElementById('nivelesDinamicosContainer');
    if (!container) return;
    
    let html = '';
    let numeroNivel = 3;
    
    this.jerarquiaNiveles.forEach(nivel => {
      if (nivel.id === 'planta' || nivel.id === 'areaGeneral') return;
      
      html += `
        <div class="form-group" style="opacity: ${nivel.visible ? '1' : '0.5'};">
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" 
                   ${nivel.visible ? 'checked' : ''}
                   onchange="app.toggleNivelVisibilidad('${nivel.id}', this.checked)"
                   style="width: 18px; height: 18px; cursor: pointer;">
            <span style="font-weight: 700; color: var(--primary); min-width: 20px;">${numeroNivel}.</span>
            <span style="flex: 1;">${nivel.nombre}:</span>
            ${nivel.requerido ? '<span style="background: var(--danger); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700;">OBLIGATORIO</span>' : '<span style="background: var(--text-secondary); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem;">Opcional</span>'}
          </label>
          <input type="text" 
                 class="form-control nivel-input" 
                 id="nivel_${nivel.id}" 
                 data-nivel="${nivel.id}"
                 ${nivel.requerido ? 'required' : ''}
                 ${nivel.visible ? '' : 'disabled'}
                 placeholder="Ej: ${this.getPlaceholderParaNivel(nivel.id)}"
                 onchange="app.updateJerarquiaPreview()"
                 style="margin-left: 26px;">
        </div>
      `;
      
      numeroNivel++;
    });
    
    container.innerHTML = html;
  }

  getPlaceholderParaNivel(nivelId) {
    const placeholders = {
      'subArea': 'Zona Norte, Piso 1, Sector A',
      'sistemaEquipo': 'Grader, Compresor 01, Bomba Principal',
      'subSistema': 'Pocket 1, Motor Principal, Cinta Z',
      'seccion': 'Sistema Hidrulico, Panel Elctrico, Controles',
      'detalle': 'Lado Izquierdo, Bastidor Superior, Vlvula V3'
    };
    return placeholders[nivelId] || 'Ingrese valor';
  }

  updateJerarquiaPreview() {
    const previewText = document.getElementById('jerarquiaPreviewText');
    if (!previewText) return;
    
    const partes = [];
    
    partes.push(this.plantaBase);
    
    this.jerarquiaNiveles.forEach(nivel => {
      if (nivel.id === 'planta') return;
      
      const input = document.getElementById(`nivel_${nivel.id}`);
      if (input && input.value.trim() !== '') {
        partes.push(input.value.trim());
      }
    });
    
    if (partes.length > 0) {
      previewText.innerHTML = partes.map(parte => 
        `<span style="font-weight: 600;">${parte}</span>`
      ).join(' <span style="color: var(--success); font-weight: bold;"></span> ');
    } else {
      previewText.innerHTML = '<span style="color: var(--text-secondary); font-style: italic;">Complete los campos para ver la ruta</span>';
    }
  }

  generarUbicacionResumida(repuesto) {
    // Si tiene mltiples ubicaciones
    if (repuesto.ubicaciones && Array.isArray(repuesto.ubicaciones) && repuesto.ubicaciones.length > 0) {
      return repuesto.ubicaciones.map(ub => {
        const partes = [];
        if (ub.areaGeneral) partes.push(ub.areaGeneral);
        if (ub.sistemaEquipo) partes.push(ub.sistemaEquipo);
        if (ub.subSistema) partes.push(ub.subSistema);
        return partes.length > 0 ? partes.join('  ') : 'Sin detalles';
      }).join(' <span style="color: var(--warning);">|</span> ');
    }
    
    // Compatibilidad con formato antiguo
    const partes = [];
    const areaGeneral = repuesto.areaGeneral || repuesto.area || '';
    if (areaGeneral) partes.push(areaGeneral);
    
    const sistemaEquipo = repuesto.sistemaEquipo || repuesto.equipo || '';
    if (sistemaEquipo) partes.push(sistemaEquipo);
    
    const subSistema = repuesto.subSistema || repuesto.sistema || '';
    if (subSistema) partes.push(subSistema);
    
    if (partes.length === 0) return '<em style="color: var(--text-secondary);">Sin ubicacin</em>';
    
    return partes.join('  ');
  }

  // ===== GESTIN DE MLTIPLES UBICACIONES =====
  
  ubicacionesActuales = [];
  
  agregarUbicacion() {
    const nuevaUbicacion = {
      id: Date.now(),
      areaGeneral: '',
      subArea: '',
      sistemaEquipo: '',
      subSistema: '',
      seccion: '',
      detalle: ''
    };
    
    this.ubicacionesActuales.push(nuevaUbicacion);
    this.renderUbicaciones();
  }
  
  eliminarUbicacion(id) {
    this.ubicacionesActuales = this.ubicacionesActuales.filter(ub => ub.id !== id);
    this.renderUbicaciones();
  }
  
  renderUbicaciones() {
    const container = document.getElementById('ubicacionesContainer');
    if (!container) return;
    
    if (this.ubicacionesActuales.length === 0) {
      this.agregarUbicacion(); // Agregar al menos una ubicacin
      return;
    }
    
    // Layout horizontal adaptativo segn cantidad de ubicaciones
    const numUbicaciones = this.ubicacionesActuales.length;
    const minWidth = numUbicaciones <= 2 ? '350px' : '320px';
    let html = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(${minWidth}, 1fr)); gap: 16px;">`;
    
    this.ubicacionesActuales.forEach((ubicacion, index) => {
      html += `
        <div style="background: var(--bg-primary); padding: 14px; border-radius: 8px; border: 2px solid var(--border-color);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <h5 style="margin: 0; color: var(--text-primary); font-size: 0.95rem; font-weight: 600;">
              Ubicacin ${index + 1}
            </h5>
            ${this.ubicacionesActuales.length > 1 ? `
              <button type="button" onclick="app.eliminarUbicacion(${ubicacion.id})" class="btn btn-danger" style="padding: 4px 10px; font-size: 0.75rem;">
                Eliminar
              </button>
            ` : ''}
          </div>
          
          <!-- Nivel 1: Empresa (fijo) -->
          <div class="form-group" style="margin-bottom: 10px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
              <span style="font-weight: 700; color: var(--primary);">1.</span>
              <span>Empresa:</span>
            </label>
            <input type="text" class="form-control" value="Aquachile Antarfood Chonchi" readonly style="background: var(--bg-secondary); cursor: not-allowed; font-size: 0.85rem;">
          </div>
          
          <!-- Nivel 2: rea General -->
          <div class="form-group" style="margin-bottom: 10px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
              <span style="font-weight: 700; color: var(--primary);">2.</span>
              <span>rea General: *</span>
            </label>
            <input type="text" 
                   class="form-control ubicacion-input" 
                   data-ubicacion-id="${ubicacion.id}"
                   data-field="areaGeneral"
                   value="${ubicacion.areaGeneral}"
                   list="areaGeneralList-${ubicacion.id}"
                   placeholder="Ej: Planta Principal, Acopio"
                   style="font-size: 0.85rem;">
            <datalist id="areaGeneralList-${ubicacion.id}">
              ${this.opcionesJerarquia.areaGeneral.map(opt => `<option value="${opt}">`).join('')}
            </datalist>
          </div>
          
          <!-- Nivel 3: Sub-rea -->
          <div class="form-group" style="margin-bottom: 10px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
              <span style="font-weight: 700; color: var(--primary);">3.</span>
              <span>Sub-rea:</span>
            </label>
            <input type="text" 
                   class="form-control ubicacion-input" 
                   data-ubicacion-id="${ubicacion.id}"
                   data-field="subArea"
                   value="${ubicacion.subArea}"
                   list="subAreaList-${ubicacion.id}"
                   placeholder="Ej: Zona Norte, Piso 1"
                   style="font-size: 0.85rem;">
            <datalist id="subAreaList-${ubicacion.id}">
              ${this.opcionesJerarquia.subArea.map(opt => `<option value="${opt}">`).join('')}
            </datalist>
          </div>
          
          <!-- Nivel 4: Sistema/Equipo -->
          <div class="form-group" style="margin-bottom: 10px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
              <span style="font-weight: 700; color: var(--primary);">4.</span>
              <span>Sistema/Equipo:</span>
            </label>
            <input type="text" 
                   class="form-control ubicacion-input" 
                   data-ubicacion-id="${ubicacion.id}"
                   data-field="sistemaEquipo"
                   value="${ubicacion.sistemaEquipo}"
                   list="sistemaEquipoList-${ubicacion.id}"
                   placeholder="Ej: Grader Marel, Compresor 01"
                   style="font-size: 0.85rem;">
            <datalist id="sistemaEquipoList-${ubicacion.id}">
              ${this.opcionesJerarquia.sistemaEquipo.map(opt => `<option value="${opt}">`).join('')}
            </datalist>
          </div>
          
          <!-- Nivel 5: Sub-Sistema -->
          <div class="form-group" style="margin-bottom: 10px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
              <span style="font-weight: 700; color: var(--primary);">5.</span>
              <span>Sub-Sistema:</span>
            </label>
            <input type="text" 
                   class="form-control ubicacion-input" 
                   data-ubicacion-id="${ubicacion.id}"
                   data-field="subSistema"
                   value="${ubicacion.subSistema}"
                   list="subSistemaList-${ubicacion.id}"
                   placeholder="Ej: Pocket 1, Motor Principal"
                   style="font-size: 0.85rem;">
            <datalist id="subSistemaList-${ubicacion.id}">
              ${this.opcionesJerarquia.subSistema.map(opt => `<option value="${opt}">`).join('')}
            </datalist>
          </div>
          
          <!-- Nivel 6: Seccin -->
          <div class="form-group" style="margin-bottom: 10px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
              <span style="font-weight: 700; color: var(--primary);">6.</span>
              <span>Seccin:</span>
            </label>
            <input type="text" 
                   class="form-control ubicacion-input" 
                   data-ubicacion-id="${ubicacion.id}"
                   data-field="seccion"
                   value="${ubicacion.seccion}"
                   list="seccionList-${ubicacion.id}"
                   placeholder="Ej: Sistema Hidrulico, Panel Elctrico"
                   style="font-size: 0.85rem;">
            <datalist id="seccionList-${ubicacion.id}">
              ${this.opcionesJerarquia.seccion.map(opt => `<option value="${opt}">`).join('')}
            </datalist>
          </div>
          
          <!-- Nivel 7: Detalle -->
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
              <span style="font-weight: 700; color: var(--primary);">7.</span>
              <span>Detalle / Ubicacin Especfica:</span>
            </label>
            <input type="text" 
                   class="form-control ubicacion-input" 
                   data-ubicacion-id="${ubicacion.id}"
                   data-field="detalle"
                   value="${ubicacion.detalle}"
                   placeholder="Ej: Lado Izquierdo, Estante 2 Nivel 3, Bastidor Superior"
                   style="font-size: 0.85rem;">
            <small style="color: var(--text-secondary); font-size: 0.7rem; display: block; margin-top: 4px;">
                Campo de texto libre para referencia exacta de ubicacin
            </small>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Agregar listeners para actualizar datos
    document.querySelectorAll('.ubicacion-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const ubicacionId = parseInt(e.target.dataset.ubicacionId);
        const field = e.target.dataset.field;
        const ubicacion = this.ubicacionesActuales.find(ub => ub.id === ubicacionId);
        if (ubicacion) {
          ubicacion[field] = e.target.value;
          console.log(`  Actualizado ${field} =`, e.target.value, 'en ubicacin', ubicacionId);
        }
      });
    });
    
    // DEBUG: Mostrar estado actual
    console.log('  Ubicaciones actuales:', JSON.stringify(this.ubicacionesActuales, null, 2));
    
    // Ajustar ancho del modal segn cantidad de ubicaciones
    this.ajustarAnchoModal();
  }
  
  ajustarAnchoModal() {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;
    
    const numUbicaciones = this.ubicacionesActuales.length;
    const screenWidth = window.innerWidth;
    
    // En mviles, siempre full width
    if (screenWidth <= 480) {
      modalContent.style.width = 'calc(100vw - 20px)';
      return;
    }
    
    // Calcular ancho ptimo segn nmero de ubicaciones
    let optimalWidth;
    if (numUbicaciones === 1) {
      optimalWidth = '800px';
    } else if (numUbicaciones === 2) {
      optimalWidth = '1100px';
    } else if (numUbicaciones === 3) {
      optimalWidth = '1400px';
    } else if (numUbicaciones === 4) {
      optimalWidth = '1700px';
    } else {
      optimalWidth = 'calc(100vw - 20px)'; // 5 o ms = full width
    }
    
    // Aplicar el ancho, pero no exceder el ancho de pantalla
    modalContent.style.width = optimalWidth;
    modalContent.style.maxWidth = 'calc(100vw - 20px)';
  }

  mostrarEjemplosCategoria(categoria) {
    const ejemplosElement = document.getElementById('ejemplosCategoria');
    if (!ejemplosElement) return;
    
    const ejemplos = {
      'Repuesto': 'Ejemplos: filtros, rodamientos, vlvulas, correas, motores',
      'Insumo': 'Ejemplos: brochas, guantes, grasas, pinturas, cintas adhesivas',
      'Herramienta': 'Ejemplos: taladros, llaves, destornilladores, martillos',
      'EPP': 'Ejemplos: cascos, lentes, arneses, guantes de seguridad',
      'Qumico': 'Ejemplos: desengrasantes, cidos, solventes, desinfectantes'
    };
    if(categoria && ejemplos[categoria]) {
      ejemplosElement.textContent = ejemplos[categoria];
      ejemplosElement.style.color = '#7A9AB8'; // Azul claro
    } else {
      ejemplosElement.textContent = 'Selecciona una categora para ver ejemplos';
      ejemplosElement.style.color = '#94a3b8'; // Gris
    }
  }

  mostrarJerarquia(id) {
    const repuesto = this.repuestos.find(r => r.id === id);
    if (!repuesto) return;
    
    // Obtener ubicaciones (nuevo formato o antiguo)
    let ubicaciones = [];
    if (repuesto.ubicaciones && Array.isArray(repuesto.ubicaciones) && repuesto.ubicaciones.length > 0) {
      ubicaciones = repuesto.ubicaciones;
    } else {
      // Formato antiguo: crear array con una ubicacin
      ubicaciones = [{
        areaGeneral: repuesto.areaGeneral || repuesto.area,
        subArea: repuesto.subArea,
        sistemaEquipo: repuesto.sistemaEquipo || repuesto.equipo,
        subSistema: repuesto.subSistema || repuesto.sistema,
        seccion: repuesto.seccion,
        detalle: repuesto.detalle || repuesto.detalleUbicacion
      }];
    }
    
    const planta = repuesto.planta || this.plantaBase;
    
    // CONSTRUIR RBOL RAMIFICADO (con nombre del repuesto)
    const arbolHTML = this.construirArbolJerarquia(ubicaciones, planta, repuesto.nombre);
    
    const html = `
      <div class="jerarquia-modal-content" style="width: fit-content; min-width: 600px; max-width: 95vw; max-height: 90vh; background: var(--card-bg); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
        
        <!-- Header -->
        <div class="jerarquia-header" style="padding: 20px 24px; background: var(--primary); border-bottom: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <h3 class="jerarquia-title" style="margin: 0; color: #ffffff; font-size: 1.3rem; font-weight: 600;">
                Ubicacin del Repuesto
            </h3>
            <button onclick="app.closeCustomModal()" 
                    style="background: rgba(255,255,255,0.15); border: none; color: white; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; font-size: 18px; transition: all 0.2s; flex-shrink: 0;"
                    onmouseover="this.style.background='rgba(255,255,255,0.25)'"
                    onmouseout="this.style.background='rgba(255,255,255,0.15)'">?</button>
          </div>
          <div class="jerarquia-info" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div style="font-size: 0.9rem; font-weight: 600; color: #ffffff; word-break: break-word; flex: 1; min-width: 0;">${repuesto.nombre}</div>
            ${repuesto.codSAP ? `<div style="font-size: 0.75rem; color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 4px; white-space: nowrap;">SAP: ${repuesto.codSAP}</div>` : ''}
            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 12px; font-weight: 500; white-space: nowrap;">
              ${ubicaciones.length} ${ubicaciones.length === 1 ? 'Ubicacin' : 'Ubicaciones'}
            </div>
          </div>
        </div>
        
        <!-- rea del rbol con scroll vertical automtico -->
        <div class="jerarquia-body" style="flex: 1; background: var(--bg-secondary); padding: 20px; overflow-y: auto; overflow-x: visible; max-height: calc(90vh - 200px);">
          ${arbolHTML}
        </div>
        
        <!-- Footer -->
        <div style="padding: 14px 24px; background: var(--bg-secondary); border-top: 1px solid var(--border); flex-shrink: 0; display: flex; justify-content: center;">
          <button onclick="app.closeCustomModal()" 
                  style="padding: 12px 48px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 600; transition: all 0.2s;"
                  onmouseover="this.style.opacity='0.9'"
                  onmouseout="this.style.opacity='1'">
            Cerrar
          </button>
        </div>
        
      </div>
    `;
    
    this.showCustomModal(html);
  }
  
  construirArbolJerarquia(ubicaciones, planta, nombreRepuesto) {
    console.log('  Construyendo rbol tipo dendrograma VERTICAL...', ubicaciones);
    if (ubicaciones.length === 0) return '<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 0.95rem;">Sin ubicaciones registradas</div>';
    
    // Estructura de rbol: agrupar ubicaciones por jerarqua comn (CON nombre del repuesto antes del detalle)
    const niveles = ['areaGeneral', 'subArea', 'sistemaEquipo', 'subSistema', 'seccion', 'nombreRepuesto', 'detalle'];
    const nodos = this.construirNodosArbol(ubicaciones, planta, niveles, nombreRepuesto);
    console.log('  Nodos construidos:', nodos);
    
    // Calcular posiciones VERTICALES (hacia abajo)
    let posicionX = 0;
    const nodosConPosicion = [];
    const nivelY = 90; // Espacio vertical entre niveles (reducido de 110 a 90)
    const anchoNodo = 200; // Ancho de nodos (reducido de 240 a 200)
    const altoNodo = 56; // Alto de nodos (reducido de 70 a 56)
    
    const calcularPosiciones = (nodo, nivel = 0) => {
      const y = nivel * nivelY + 50;
      
      if (!nodo.hijos || nodo.hijos.length === 0) {
        // Nodo hoja
        const x = posicionX * (anchoNodo + 30) + 50;
        nodosConPosicion.push({ ...nodo, x, y, nivel });
        posicionX++;
        return x;
      } else {
        // Nodo con hijos
        const posicionesHijos = nodo.hijos.map(hijo => 
          calcularPosiciones(hijo, nivel + 1)
        );
        const xPromedio = (Math.min(...posicionesHijos) + Math.max(...posicionesHijos)) / 2;
        nodosConPosicion.push({ ...nodo, x: xPromedio, y, nivel, posicionesHijos });
        return xPromedio;
      }
    };
    
    // Calcular posiciones de todos los nodos
    nodos.forEach(nodo => calcularPosiciones(nodo));
    
    // Calcular dimensiones del SVG
    const maxX = Math.max(...nodosConPosicion.map(n => n.x)) + anchoNodo + 100;
    const maxY = Math.max(...nodosConPosicion.map(n => n.y)) + altoNodo + 60;
    
    // Generar SVG con lneas y nodos (VERTICAL)
    let svg = `<svg width="${maxX}" height="${maxY}" style="font-family: var(--font-family); display: block; min-width: 100%;">`;
    
    // Definir gradientes y filtros SUAVES
    svg += `
      <defs>
        <filter id="sombra" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    `;
    
    // Dibujar lneas de conexin
    nodosConPosicion.forEach(nodo => {
      if (nodo.hijos && nodo.hijos.length > 0) {
        const nodoCentroX = nodo.x + anchoNodo / 2;
        const nodoCentroYAbajo = nodo.y + altoNodo;
        
        nodo.hijos.forEach((hijo, idx) => {
          const hijoNodo = nodosConPosicion.find(n => n.valor === hijo.valor && n.nivel === nodo.nivel + 1);
          if (hijoNodo) {
            const hijoCentroX = hijoNodo.x + anchoNodo / 2;
            const hijoCentroYArriba = hijoNodo.y;
            
            // Lnea vertical desde el padre
            const yMedio = nodoCentroYAbajo + 20;
            svg += `<line x1="${nodoCentroX}" y1="${nodoCentroYAbajo}" x2="${nodoCentroX}" y2="${yMedio}" stroke="#94a3b8" stroke-width="1.5" opacity="0.5"/>`;
            
            // Lnea horizontal (si hay mltiples hijos)
            if (nodo.hijos.length > 1) {
              if (idx === 0) {
                const ultimoHijo = nodosConPosicion.find(n => n.valor === nodo.hijos[nodo.hijos.length - 1].valor && n.nivel === nodo.nivel + 1);
                if (ultimoHijo) {
                  const ultimoHijoCentroX = ultimoHijo.x + anchoNodo / 2;
                  svg += `<line x1="${hijoCentroX}" y1="${yMedio}" x2="${ultimoHijoCentroX}" y2="${yMedio}" stroke="#94a3b8" stroke-width="1.5" opacity="0.5"/>`;
                }
              }
            }
            
            // Lnea vertical hasta el hijo
            svg += `<line x1="${hijoCentroX}" y1="${yMedio}" x2="${hijoCentroX}" y2="${hijoCentroYArriba}" stroke="#94a3b8" stroke-width="1.5" opacity="0.5"/>`;
          }
        });
      }
    });
    
    // Colores CORPORATIVOS MATE del proyecto (los originales que pediste)
    const coloresPorNivel = [
      { fondo: '#C4A882', borde: '#A68F6D', texto: '#ffffff' }, // Nivel 0 - Empresa (beige/caf mate)
      { fondo: '#6B8499', borde: '#5A7188', texto: '#ffffff' }, // Nivel 1 - rea (azul gris mate)
      { fondo: '#7D8A97', borde: '#6A7784', texto: '#ffffff' }, // Nivel 2 - Sub-rea (gris azulado mate)
      { fondo: '#8897A8', borde: '#7586a7', texto: '#ffffff' }, // Nivel 3 - Sistema (azul acero mate)
      { fondo: '#939FAB', borde: '#808C98', texto: '#ffffff' }, // Nivel 4 - Sub-sistema (gris perla mate)
      { fondo: '#A1B0BC', borde: '#8E9DA9', texto: '#ffffff' }, // Nivel 5 - Seccin (azul claro mate)
      { fondo: '#7FA396', borde: '#6C9083', texto: '#ffffff' }, // Nivel 6 - Repuesto (verde gris mate)
      { fondo: '#6D9488', borde: '#5A8175', texto: '#ffffff' }  // Nivel 7 - Detalle (verde azulado mate)
    ];
    
    // Dibujar nodos SIN INTERACTIVIDAD (solo visualizacin)
    nodosConPosicion.forEach(nodo => {
      const tieneUbicaciones = nodo.ubicaciones && nodo.ubicaciones.length > 0;
      const colores = coloresPorNivel[nodo.nivel] || coloresPorNivel[coloresPorNivel.length - 1];
      
      // Grupo del nodo (sin eventos)
      svg += `<g>`;
      
      // Fondo del nodo
      if (tieneUbicaciones) {
        // Nodo final con ubicacin - Verde corporativo destacado
        svg += `<rect x="${nodo.x}" y="${nodo.y}" width="${anchoNodo}" height="${altoNodo}" rx="6" 
                  fill="#6D9488" 
                  stroke="#5A8175" 
                  stroke-width="2"
                  filter="url(#sombra)"/>`;
      } else {
        // Nodo normal con colores corporativos
        svg += `<rect x="${nodo.x}" y="${nodo.y}" width="${anchoNodo}" height="${altoNodo}" rx="6" 
                  fill="${colores.fondo}" 
                  stroke="${colores.borde}" 
                  stroke-width="1.5"
                  filter="url(#sombra)"/>`;
      }
      
      // Etiqueta del nivel (ms pequea y sutil)
      if (nodo.etiqueta) {
        svg += `<text x="${nodo.x + anchoNodo/2}" y="${nodo.y + 12}" 
                  text-anchor="middle" 
                  fill="rgba(255,255,255,0.5)" 
                  font-size="8" 
                  font-weight="500"
                  letter-spacing="0.5"
                  pointer-events="none">${nodo.etiqueta.toUpperCase()}</text>`;
      }
      
      // Texto del nodo (ms compacto)
      const lineas = this.dividirTextoEnLineas(nodo.valor, 28);
      const yInicial = nodo.y + (lineas.length === 1 ? altoNodo/2 + 4 : altoNodo/2 - 1);
      
      lineas.forEach((linea, idx) => {
        svg += `<text x="${nodo.x + anchoNodo/2}" y="${yInicial + (idx * 14)}" 
                  text-anchor="middle" 
                  dominant-baseline="middle" 
                  fill="#ffffff" 
                  font-size="11.5" 
                  font-weight="600"
                  pointer-events="none">${linea}</text>`;
      });
      
      // Badge de ubicacin (sin icono para no tapar texto)
      if (tieneUbicaciones) {
        svg += `<text x="${nodo.x + anchoNodo/2}" y="${nodo.y + altoNodo - 8}" 
                  text-anchor="middle" 
                  fill="rgba(255,255,255,0.85)" 
                  font-size="7.5" 
                  font-weight="600"
                  letter-spacing="0.3"
                  pointer-events="none">${nodo.ubicaciones.join(', ')}</text>`;
      }
      
      svg += `</g>`;
    });
    
    svg += '</svg>';
    
    return `<div style="width: 100%; height: 100%; overflow: auto; display: flex; align-items: flex-start; justify-content: flex-start; padding: 20px;">
      <div style="min-width: min-content;">${svg}</div>
    </div>`;
  }
  
  // Funcin auxiliar para dividir texto en lneas
  dividirTextoEnLineas(texto, maxCaracteres) {
    if (texto.length <= maxCaracteres) return [texto];
    
    const palabras = texto.split(' ');
    const lineas = [];
    let lineaActual = '';
    
    palabras.forEach(palabra => {
      if ((lineaActual + palabra).length <= maxCaracteres) {
        lineaActual += (lineaActual ? ' ' : '') + palabra;
      } else {
        if (lineaActual) lineas.push(lineaActual);
        lineaActual = palabra;
      }
    });
    
    if (lineaActual) lineas.push(lineaActual);
    return lineas.slice(0, 3); // Mximo 3 lneas
  }

  // Filtrar repuestos por nivel de jerarqua
  filtrarPorJerarquia(campo, valor) {
    console.log(`  Filtrando por ${campo}: "${valor}"`);
    
    // Mapeo de campos del rbol a campos de ubicacin
    const mapaCampos = {
      'planta': 'planta',
      'areaGeneral': 'areaGeneral',
      'subArea': 'subArea',
      'sistemaEquipo': 'sistemaEquipo',
      'subSistema': 'subSistema',
      'seccion': 'seccion',
      'detalle': 'detalle'
    };
    
    const campoReal = mapaCampos[campo] || campo;
    
    // Buscar repuestos que tengan este valor en cualquiera de sus ubicaciones
    const repuestosFiltrados = this.repuestos.filter(repuesto => {
      if (repuesto.ubicaciones && Array.isArray(repuesto.ubicaciones)) {
        return repuesto.ubicaciones.some(ub => ub[campoReal] === valor);
      } else {
        // Formato antiguo
        return repuesto[campoReal] === valor;
      }
    });
    
    console.log(`- Encontrados ${repuestosFiltrados.length} repuestos`);
    
    // Mostrar resultados en modal ampliado
    this.mostrarResultadosFiltro(campo, valor, repuestosFiltrados);
  }

  // Mostrar resultados del filtro en modal ampliado
  mostrarResultadosFiltro(campo, valor, repuestos) {
    const nombreCampo = {
      'planta': 'Empresa',
      'areaGeneral': 'rea General',
      'subArea': 'Sub-rea',
      'sistemaEquipo': 'Sistema/Equipo',
      'subSistema': 'Sub-Sistema',
      'seccion': 'Seccin',
      'detalle': 'Detalle'
    }[campo] || campo;
    
    let html = `
      <div style="padding: clamp(20px, 3vw, 32px); background: var(--card-bg); border-radius: 16px; width: 95vw; max-width: 1800px; height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid var(--border); padding-bottom: 16px; flex-shrink: 0; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: clamp(1.1rem, 2vw, 1.4rem); font-weight: 600;">
              Repuestos en ${nombreCampo}
            </h3>
            <div style="font-size: clamp(0.8rem, 1.5vw, 0.9rem); color: var(--text-secondary); font-weight: 500;">
              "${valor}"
            </div>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <div style="font-size: 0.75rem; color: var(--text-secondary); background: var(--bg-secondary); padding: 6px 14px; border-radius: 20px; font-weight: 600;">
              ${repuestos.length} Repuesto${repuestos.length !== 1 ? 's' : ''}
            </div>
            <button onclick="app.closeCustomModal()" style="background: var(--bg-secondary); border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; color: var(--text-primary); font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='var(--bg-secondary)'">
              Cerrar
            </button>
          </div>
        </div>
        
        <div style="flex: 1; overflow-y: auto; padding-right: 8px;">
    `;
    
    if (repuestos.length === 0) {
      html += `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"> </div>
          <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">No hay repuestos</div>
          <div style="font-size: 0.9rem;">No se encontraron repuestos en esta ubicacin</div>
        </div>
      `;
    } else {
      // Grid de repuestos (responsivo)
      html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); gap: 16px;">';
      
      repuestos.forEach(repuesto => {
        // Obtener imagen principal (buscar formatos FileSystem primero)
        let imagenPrincipal = null;
        if (repuesto.multimedia && repuesto.multimedia.length > 0) {
          const imagenFS = repuesto.multimedia.find(m => m.isFileSystem && m.url);
          imagenPrincipal = imagenFS ? imagenFS.url : repuesto.multimedia[0].url;
        }
        
        html += `
          <div style="background: var(--bg-primary); border: 2px solid var(--border); border-radius: 12px; overflow: hidden; transition: all 0.2s; cursor: pointer;" 
               onclick="app.editRepuesto('${repuesto.id}')"
               onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.15)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            
            ${imagenPrincipal ? `
              <div style="height: 180px; background: var(--bg-secondary); position: relative; overflow: hidden;">
                <img src="${imagenPrincipal}" 
                     style="width: 100%; height: 100%; object-fit: cover;" 
                     onerror="this.parentElement.innerHTML='<div style=\\'height: 180px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 3rem; opacity: 0.3;\\'> </div>'">
              </div>
            ` : `
              <div style="height: 180px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 3rem; opacity: 0.3;">
                 
              </div>
            `}
            
            <div style="padding: 16px;">
              <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary); margin-bottom: 8px; line-height: 1.3;">
                ${repuesto.nombre}
              </div>
              
              ${repuesto.codSAP ? `
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 4px;">
                  <span style="font-weight: 600;">SAP:</span> ${repuesto.codSAP}
                </div>
              ` : ''}
              
              <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                ${repuesto.tipo ? `<span style="font-size: 0.7rem; background: var(--bg-secondary); padding: 4px 8px; border-radius: 6px; color: var(--text-secondary); font-weight: 600;">${repuesto.tipo}</span>` : ''}
                <span style="font-size: 0.7rem; background: ${repuesto.cantidad > repuesto.minimo ? '#d1fae5' : '#fee2e2'}; color: ${repuesto.cantidad > repuesto.minimo ? '#065f46' : '#991b1b'}; padding: 4px 8px; border-radius: 6px; font-weight: 600;">Stock: ${repuesto.cantidad}</span>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
    }
    
    html += `
        </div>
      </div>
    `;
    
    this.showCustomModal(html);
  }
  
  construirNodosArbol(ubicaciones, planta, niveles, nombreRepuesto) {
    // Crear nodo raz (empresa/planta)
    const raiz = {
      nivel: -1,
      campo: 'planta',
      valor: planta || 'Aquachile Antarfood Chonchi',
      etiqueta: 'Empresa',
      hijos: [],
      ubicaciones: []
    };
    
    const etiquetasNiveles = {
      'areaGeneral': 'rea General',
      'subArea': 'Sub-rea',
      'sistemaEquipo': 'Sistema/Equipo',
      'subSistema': 'Sub-Sistema',
      'seccion': 'Seccin',
      'nombreRepuesto': 'Repuesto',
      'detalle': 'Detalle Ubicacin'
    };
    
    // Procesar cada ubicacin
    ubicaciones.forEach((ubicacion, index) => {
      let nodoActual = raiz;
      let ultimoNodoConValor = null;
      
      // Recorrer cada nivel de jerarqua
      niveles.forEach((campo, nivelIdx) => {
        let valor = ubicacion[campo];
        
        // Si es nombreRepuesto, usar el valor pasado como parmetro
        if (campo === 'nombreRepuesto') {
          valor = nombreRepuesto;
        }
        
        if (!valor || valor.trim() === '') return; // Saltar niveles vacos
        
        // Buscar si ya existe un hijo con este valor
        let hijo = nodoActual.hijos.find(h => h.campo === campo && h.valor === valor);
        
        if (!hijo) {
          // Crear nuevo nodo
          hijo = {
            nivel: nivelIdx,
            campo: campo,
            valor: valor,
            etiqueta: etiquetasNiveles[campo] || campo,
            hijos: [],
            ubicaciones: []
          };
          nodoActual.hijos.push(hijo);
        }
        
        ultimoNodoConValor = hijo;
        nodoActual = hijo;
      });
      
      // Marcar la ubicacin en el ltimo nodo con valor
      if (ultimoNodoConValor) {
        ultimoNodoConValor.ubicaciones.push(index + 1);
      }
    });
    
    return [raiz];
  }

  showCustomModal(content) {
    let modal = document.getElementById('customModalOverlay');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'customModalOverlay';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        overflow: auto;
      `;
      modal.onclick = (e) => {
        if (e.target === modal) this.closeCustomModal();
      };
      document.body.appendChild(modal);
    }
    modal.innerHTML = content;
    modal.style.display = 'flex';
    
    // Agregar listener para ESC
    this.addEscapeListener();
  }

  closeCustomModal() {
    const modal = document.getElementById('customModalOverlay');
    if (modal) modal.style.display = 'none';
    this.removeEscapeListener();
  }

  // ===============================================
  // CONTEO INDIVIDUAL DE REPUESTOS
  // ===============================================

  abrirModalConteoIndividual(id) {
    const repuesto = this.repuestos.find(r => r.id === id);
    if (!repuesto) {
      this.showToast('⚠️ Repuesto no encontrado', 'error');
      return;
    }

    const minimo = repuesto.minimo || 5;
    const optimo = repuesto.optimo || minimo * 2;
    const cantidadActual = repuesto.cantidad || 0;
    const estadoStock = cantidadActual === 0 ? 'AGOTADO' : cantidadActual <= minimo ? 'BAJO' : 'OK';
    const colorEstado = cantidadActual === 0 ? '#7a6b6b' : cantidadActual <= minimo ? '#8a7a5a' : '#6b7280';
    const iconoEstado = cantidadActual === 0 ? '❌' : cantidadActual <= minimo ? '⚠️' : '✅';
    
    const ultimoConteo = repuesto.ultimoConteo ? new Date(repuesto.ultimoConteo) : null;
    const fechaFormateada = ultimoConteo ? ultimoConteo.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '';
    const horaFormateada = ultimoConteo ? ultimoConteo.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

    const modalHTML = `
      <div class="modal-backdrop-custom" id="modalConteoIndividual" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div class="modal-dialog-custom" style="max-width: 480px; width: 90%; animation: slideUp 0.2s ease-out;">
          <div class="modal-content-custom" style="border-radius: 2px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.8); background: #252526; border: 1px solid #3e3e42;">
            
            <!-- HEADER CORPORATIVO -->
            <div class="modal-header-custom" style="background: #2d2d30; padding: 16px 20px; border-bottom: 2px solid #3e3e42;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #d4d4d4; text-transform: uppercase; letter-spacing: 0.5px;">Conteo de Stock</h3>
                  <p style="margin: 4px 0 0 0; font-size: 11px; color: #969696; font-weight: 500;">Actualizar cantidad física</p>
                </div>
                <button onclick="window.app.cerrarModalConteoIndividual()" style="background: transparent; border: none; color: #969696; font-size: 24px; cursor: pointer; padding: 0; line-height: 1; transition: color 0.15s; font-weight: 300;" onmouseover="this.style.color='#d4d4d4'" onmouseout="this.style.color='#969696'">×</button>
              </div>
            </div>
            
            <div class="modal-body-custom" style="padding: 20px;">
              
              <!-- INFORMACIÓN DEL PRODUCTO -->
              <div style="background: #1e1e1e; border: 1px solid #3e3e42; padding: 14px; border-radius: 2px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                  <h4 style="margin: 0; font-size: 14px; color: #d4d4d4; font-weight: 600; line-height: 1.4;">${repuesto.nombre}</h4>
                  <span style="background: ${colorEstado}; opacity: 0.95; color: #ffffff; padding: 3px 8px; border-radius: 2px; font-size: 10px; font-weight: 700; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.3px;">${estadoStock}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 11px; color: #969696;">
                  <div><strong style="color: #d4d4d4; font-weight: 600;">Área:</strong> ${repuesto.area || repuesto.areaGeneral || 'N/A'}</div>
                  <div><strong style="color: #d4d4d4; font-weight: 600;">Equipo:</strong> ${repuesto.equipo || repuesto.sistemaEquipo || 'N/A'}</div>
                  ${repuesto.codSAP ? `<div style="grid-column: 1 / -1;"><strong style="color: #d4d4d4; font-weight: 600;">SAP:</strong> <span style="font-family: var(--font-mono);">${repuesto.codSAP}</span></div>` : ''}
                </div>
              </div>

              <!-- CANTIDAD ACTUAL Y MÍNIMO -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                <div style="background: #1e1e1e; border: 2px solid #3e3e42; padding: 14px; border-radius: 2px; text-align: center;">
                  <div style="font-size: 9px; color: #969696; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Stock Actual</div>
                  <div style="font-size: 28px; color: ${colorEstado}; opacity: 0.95; font-weight: 700; line-height: 1;">${cantidadActual}</div>
                  <div style="font-size: 9px; color: #6e7681; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px;">unidades</div>
                </div>
                
                <div style="background: #1e1e1e; border: 2px solid #3e3e42; padding: 14px; border-radius: 2px; text-align: center;">
                  <div style="font-size: 9px; color: #969696; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Mínimo</div>
                  <div style="font-size: 28px; color: #969696; opacity: 0.95; font-weight: 700; line-height: 1;">${minimo}</div>
                  <div style="font-size: 9px; color: #6e7681; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px;">requerido</div>
                </div>
              </div>

              <!-- INFORMACIÓN DE ÚLTIMO CONTEO -->
              ${ultimoConteo ? `
                <div style="background: #1e1e1e; border-left: 3px solid #969696; padding: 10px; border-radius: 0; margin-bottom: 16px;">
                  <div style="font-size: 9px; color: #969696; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Último conteo</div>
                  <div style="font-size: 11px; color: #d4d4d4; font-weight: 600;">${fechaFormateada} • ${horaFormateada}</div>
                </div>
              ` : `
                <div style="background: #332b00; border-left: 3px solid #f59e0b; padding: 10px; border-radius: 0; margin-bottom: 16px;">
                  <div style="font-size: 11px; color: #fbbf24; font-weight: 600;">Sin conteo previo registrado</div>
                </div>
              `}

              <!-- INPUT NUEVA CANTIDAD -->
              <div style="background: #1e1e1e; padding: 16px; border-radius: 2px; border: 1px solid #3e3e42;">
                <label for="cantidadConteoInput" style="display: block; font-size: 10px; font-weight: 700; color: #d4d4d4; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Nueva cantidad física
                </label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <button onclick="document.getElementById('cantidadConteoInput').value = Math.max(0, parseInt(document.getElementById('cantidadConteoInput').value || 0) - 1)" style="background: #2d2d30; border: 1px solid #555555; color: #d4d4d4; width: 40px; height: 40px; border-radius: 2px; cursor: pointer; font-size: 18px; font-weight: 700; transition: all 0.15s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#3e3e42'" onmouseout="this.style.background='#2d2d30'">−</button>
                  <input type="number" 
                         id="cantidadConteoInput" 
                         value="${cantidadActual}" 
                         min="0" 
                         style="flex: 1; padding: 10px; font-size: 24px; font-weight: 700; text-align: center; border: 2px solid #555555; border-radius: 2px; background: #0d0d0d; color: #d4d4d4; transition: border-color 0.15s;"
                         onfocus="this.select(); this.style.borderColor='#5a6b7a'"
                         onblur="this.style.borderColor='#555555'"
                         onkeydown="if(event.key==='Enter'){window.app.guardarConteoIndividual('${id}')}"
                  />
                  <button onclick="document.getElementById('cantidadConteoInput').value = parseInt(document.getElementById('cantidadConteoInput').value || 0) + 1" style="background: #2d2d30; border: 1px solid #555555; color: #d4d4d4; width: 40px; height: 40px; border-radius: 2px; cursor: pointer; font-size: 18px; font-weight: 700; transition: all 0.15s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#3e3e42'" onmouseout="this.style.background='#2d2d30'">+</button>
                </div>
              </div>

              <!-- BOTONES DE ACCIÓN -->
              <div style="display: flex; gap: 8px; margin-top: 20px;">
                <button onclick="window.app.cerrarModalConteoIndividual()" style="flex: 1; background: #2d2d30; border: 1px solid #555555; color: #d4d4d4; padding: 11px; border-radius: 2px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.15s; text-transform: uppercase; letter-spacing: 0.3px;" onmouseover="this.style.background='#3e3e42'" onmouseout="this.style.background='#2d2d30'">
                  Cancelar
                </button>
                <button onclick="window.app.guardarConteoIndividual('${id}')" style="flex: 2; background: #5a6b7a; border: none; color: #ffffff; padding: 11px; border-radius: 2px; cursor: pointer; font-weight: 700; font-size: 12px; transition: all 0.15s; text-transform: uppercase; letter-spacing: 0.3px;" onmouseover="this.style.background='#6a7b8a'" onmouseout="this.style.background='#5a6b7a'">
                  Guardar Conteo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Focus en el input
    setTimeout(() => {
      const input = document.getElementById('cantidadConteoInput');
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  cerrarModalConteoIndividual() {
    const modal = document.getElementById('modalConteoIndividual');
    if (modal) modal.remove();
  }

  async guardarConteoIndividual(id) {
    const input = document.getElementById('cantidadConteoInput');
    if (!input) return;

    const nuevaCantidad = parseInt(input.value) || 0;
    const repuesto = this.repuestos.find(r => r.id === id);
    
    if (!repuesto) {
      this.showToast('⚠️ Error: Repuesto no encontrado', 'error');
      return;
    }

    const cantidadAnterior = repuesto.cantidad || 0;
    const diferencia = nuevaCantidad - cantidadAnterior;
    const signo = diferencia > 0 ? '+' : '';

    // Actualizar datos
    repuesto.cantidad = nuevaCantidad;
    repuesto.ultimoConteo = new Date().toISOString();

    // Guardar en storage
    await this.saveData();
    
    // Cerrar modal
    this.cerrarModalConteoIndividual();

    // Actualizar vista
    await this.renderInventario();

    // Mostrar toast con información
    this.showToast(
      `✅ Conteo guardado: ${nuevaCantidad} unid. (${signo}${diferencia})`,
      'success',
      4000
    );
  }

  addEscapeListener() {
    if (!this.escapeHandler) {
      this.escapeHandler = (e) => {
        if (e.key === 'Escape') {
          // Cerrar lightbox si está activo
          const lightbox = document.getElementById('lightbox');
          if (lightbox && lightbox.classList.contains('active')) {
            this.closeLightbox();
            return;
          }
          
          // Cerrar modal personalizado si está abierto
          const customModal = document.getElementById('customModalOverlay');
          if (customModal && customModal.style.display === 'flex') {
            this.closeCustomModal();
            return;
          }
          
          // Cerrar modal principal si está abierto
          const mainModal = document.getElementById('modal');
          if (mainModal && mainModal.classList.contains('active')) {
            this.closeModal();
            return;
          }
        }
      };
    }
    document.addEventListener('keydown', this.escapeHandler);
  }

  removeEscapeListener() {
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
  }

  // ========================================
  // LIGHTBOX COMPLETO - Con zoom y navegación
  // ========================================
  
  async openLightbox(id) {
    console.log('🖼️ openLightbox llamado con ID:', id);
    
    const repuesto = this.repuestos.find(r => r.id === id);
    console.log('📦 Repuesto encontrado:', repuesto ? repuesto.nombre : 'NO ENCONTRADO');
    
    if (!repuesto) {
      console.error('❌ No se encontró el repuesto con ID:', id);
      return;
    }
    
    if (!repuesto.multimedia || repuesto.multimedia.length === 0) {
      console.warn('⚠️ El repuesto no tiene multimedia');
      this.showToast('⚠️ Este repuesto no tiene imágenes', 'warning');
      return;
    }
    
    this.lightboxMedias = repuesto.multimedia.filter(m => m.type === 'image' || m.type === 'video');
    console.log('🖼️ Medios encontrados:', this.lightboxMedias.length);
    
    if (this.lightboxMedias.length === 0) {
      console.warn('⚠️ No hay imágenes o videos para mostrar');
      this.showToast('⚠️ No hay imágenes disponibles', 'warning');
      return;
    }
    
    this.lightboxIndex = 0;
    
    // Mostrar lightbox primero
    const lightbox = document.getElementById('lightbox');
    console.log('🎬 Activando lightbox...');
    lightbox.classList.add('active');
    
    // Luego cargar la imagen
    console.log('⏳ Cargando imagen...');
    await this.showLightbox();
    console.log('✅ Lightbox mostrado');
  }

  async showLightbox() {
    const media = this.lightboxMedias[this.lightboxIndex];
    const content = document.getElementById('lightboxContent');
    
    // Mostrar loading mientras se carga
    content.innerHTML = '<div style="color: white; text-align: center; padding: 40px; font-size: 16px;">Cargando imagen...</div>';
    
    if (media.type === 'video') {
      content.innerHTML = `<video src="${media.url}" controls autoplay style="max-width: 100%; max-height: 90vh; border-radius: 2px;"></video>`;
    } else {
      // Resolver ruta correcta de imagen
      let imageUrl = media.url;
      console.log('🖼️ URL original:', imageUrl);
      
      // Si la URL es relativa, asegurar que apunte a INVENTARIO_STORAGE
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
        if (imageUrl.startsWith('./')) {
          imageUrl = 'INVENTARIO_STORAGE/' + imageUrl.substring(2);
        } else if (!imageUrl.startsWith('INVENTARIO_STORAGE/')) {
          imageUrl = 'INVENTARIO_STORAGE/' + imageUrl;
        }
      }
      
      console.log('🖼️ URL resuelta:', imageUrl);
      
      // Crear imagen con manejo de errores
      const img = new Image();
      img.onload = () => {
        console.log('✅ Imagen cargada correctamente');
        content.innerHTML = `
          <div id="imageContainer" style="position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 90vh; overflow: hidden;">
            <img id="lightboxImage" 
                 src="${imageUrl}" 
                 style="max-width: 100%; max-height: 90vh; transition: transform 0.2s ease; cursor: grab; border-radius: 2px; object-fit: contain;" 
                 alt="Imagen ampliada">
          </div>
        `;
        
        // Inicializar zoom con scroll
        this.initLightboxZoom();
      };
      
      img.onerror = () => {
        console.error('❌ Error al cargar imagen:', imageUrl);
        content.innerHTML = `
          <div style="color: white; text-align: center; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <div style="font-size: 16px; margin-bottom: 8px;">No se pudo cargar la imagen</div>
            <div style="font-size: 12px; opacity: 0.7;">${imageUrl}</div>
          </div>
        `;
      };
      
      img.src = imageUrl;
    }
    
    // Actualizar contador
    const counter = document.getElementById('lightboxCounter');
    if (counter) {
      counter.textContent = `${this.lightboxIndex + 1} / ${this.lightboxMedias.length}`;
    }
  }
  
  initLightboxZoom() {
    const container = document.getElementById('imageContainer');
    const img = document.getElementById('lightboxImage');
    
    if (!img || !container) return;
    
    let scale = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;
    
    // Zoom con rueda del mouse
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      const newScale = Math.max(0.5, Math.min(5, scale + delta));
      
      // Calcular punto de zoom (donde está el cursor)
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Ajustar traducción para hacer zoom en el punto del cursor
      const scaleChange = newScale / scale;
      translateX = e.clientX - (e.clientX - translateX) * scaleChange;
      translateY = e.clientY - (e.clientY - translateY) * scaleChange;
      
      scale = newScale;
      
      // Resetear posición si zoom = 1
      if (scale === 1) {
        translateX = 0;
        translateY = 0;
        img.style.cursor = 'grab';
      } else {
        img.style.cursor = 'grab';
      }
      
      img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }, { passive: false });
    
    // Arrastre de imagen
    img.addEventListener('mousedown', (e) => {
      if (scale >= 1) {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        img.style.cursor = 'grabbing';
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        img.style.cursor = scale > 1 ? 'grab' : 'grab';
      }
    });
    
    // Doble click para resetear zoom
    img.addEventListener('dblclick', () => {
      scale = 1;
      translateX = 0;
      translateY = 0;
      img.style.cursor = 'grab';
      img.style.transform = `translate(0px, 0px) scale(1)`;
    });
  }

  closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    
    // Limpiar contenido para liberar memoria
    const content = document.getElementById('lightboxContent');
    if (content) {
      content.innerHTML = '';
    }
  }

  async lightboxPrev() {
    this.lightboxIndex = (this.lightboxIndex - 1 + this.lightboxMedias.length) % this.lightboxMedias.length;
    await this.showLightbox();
  }

  async lightboxNext() {
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxMedias.length;
    await this.showLightbox();
  }

  // ===============================================
  // MODAL AGREGAR/EDITAR REPUESTO
  // ===============================================
  
  async openModal(mode, id = null) {
    console.log(`\n📝 ========== ABRIENDO MODAL ==========`);
    console.log(`Modo: ${mode}`);
    console.log(`ID: ${id}`);
    
    this.currentEditingId = id;
    this.currentMultimedia = [];
    this.currentDocuments = [];
    this.multimediaToRemove = []; // Limpiar lista de eliminaciones
    
    // Configurar título
    document.getElementById('modalTitle').textContent = mode === 'edit' ? 'Editar Repuesto' : 'Agregar Repuesto';
    
    // Resetear formulario
    document.getElementById('repuestoForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('documentsList').innerHTML = '';
    
    // Limpiar inputs de archivo
    const imagenFile = document.getElementById('imagenFile');
    const documentos = document.getElementById('documentos');
    if (imagenFile) imagenFile.value = '';
    if (documentos) documentos.value = '';
    
    console.log('🧹 Arrays y previews limpiados');
    
    // Poblar select de Tipo
    this.poblarSelectTipo();
    
    // Poblar Nivel 1 (Planta) - siempre habilitado
    this.cargarNivel(1);
    
    // Deshabilitar niveles 2-8 inicialmente
    for (let i = 2; i <= 8; i++) {
      const select = document.getElementById(`nivel${i}`);
      if (select) {
        if (i < 8) {
          select.innerHTML = '<option value="">Seleccionar...</option>';
        } else {
          select.value = '';
        }
        select.disabled = true;
      }
    }
    
    // Inicializar ubicaciones
    this.ubicacionesActuales = [];
    
    if (mode === 'edit' && id) {
      console.log(`Buscando repuesto con ID: "${id}"`);
      
      const repuesto = this.repuestos.find(r => r.id === id || String(r.id) === String(id));
      
      if (repuesto) {
        console.log(`✅ Repuesto encontrado: ${repuesto.nombre}`);
        
        // Llenar campos básicos
        document.getElementById('repuestoId').value = repuesto.id;
        document.getElementById('codSAP').value = repuesto.codSAP || repuesto.codigo_sap || '';
        document.getElementById('codProv').value = repuesto.codProv || repuesto.codigo_prov || '';
        document.getElementById('tipo').value = repuesto.tipo || '';
        document.getElementById('categoria').value = repuesto.categoria || 'Repuesto';
        document.getElementById('nombre').value = repuesto.nombre || '';
        
        // Campos de stock
        document.getElementById('cantidad').value = repuesto.cantidad || 0;
        document.getElementById('cantidadInstalada').value = repuesto.cantidadInstalada || 0;
        document.getElementById('minimo').value = repuesto.minimo || 5;
        document.getElementById('optimo').value = repuesto.optimo || 10;
        document.getElementById('precio').value = repuesto.precio || 0;
        
        // Datos técnicos
        document.getElementById('datosTecnicos').value = repuesto.datosTecnicos || '';
        
        // Cargar ubicaciones (primera ubicación si existe)
        if (repuesto.ubicaciones && repuesto.ubicaciones.length > 0) {
          await this.cargarUbicacionEnFormulario(repuesto.ubicaciones[0]);
        }
        
        // Cargar multimedia existente
        if (repuesto.multimedia && repuesto.multimedia.length > 0) {
          await this.cargarMultimediaEnPreview(repuesto.multimedia);
        }
        
      } else {
        console.error(`❌ Repuesto no encontrado con ID: "${id}"`);
        this.showToast('❌ Error: Repuesto no encontrado', 'error');
        return;
      }
    } else {
      console.log('🆕 Modo AGREGAR nuevo repuesto');
      // Seleccionar valores por defecto
      document.getElementById('categoria').value = 'Repuesto';
      document.getElementById('minimo').value = 5;
      document.getElementById('optimo').value = 10;
    }
    
    // Mostrar modal
    document.getElementById('modal').classList.add('active');
    
    console.log('========== MODAL ABIERTO ==========\n');
  }
  
  // Poblar select de Tipo con opciones existentes
  poblarSelectTipo() {
    const selectTipo = document.getElementById('tipo');
    if (!selectTipo) return;
    
    // Opciones predefinidas
    const tiposPredefinidos = [
      'Mecánico',
      'Eléctrico',
      'Electrónico',
      'Neumático',
      'Hidráulico',
      'Estructural',
      'Consumible',
      'Filtro',
      'Rodamiento',
      'Sello',
      'Válvula',
      'Sensor',
      'Motor',
      'Correa',
      'Cadena',
      'Engranaje'
    ];
    
    // Obtener tipos únicos de repuestos existentes
    const tiposExistentes = [...new Set(this.repuestos
      .map(r => r.tipo)
      .filter(t => t && t.trim())
    )];
    
    // Combinar y ordenar
    const todosLosTipos = [...new Set([...tiposPredefinidos, ...tiposExistentes])].sort();
    
    // Poblar select
    selectTipo.innerHTML = '<option value="">Seleccionar tipo...</option>';
    todosLosTipos.forEach(tipo => {
      const opt = document.createElement('option');
      opt.value = tipo;
      opt.textContent = tipo;
      selectTipo.appendChild(opt);
    });
  }
  
  // Cargar multimedia existente en preview (modo edición)
  async cargarMultimediaEnPreview(multimedia) {
    if (!multimedia || multimedia.length === 0) return;
    
    console.log(`📸 Cargando ${multimedia.length} imagen(es) existente(s)...`);
    
    const previewContainer = document.getElementById('imagePreview');
    const fs = window.fsManager || fsManager;
    
    for (const media of multimedia) {
      try {
        let imageUrl = null;
        
        // SOLO cargar desde FileSystem
        if (media.url && fs && fs.isConnected) {
          const filename = media.url.replace('./imagenes/', '');
          imageUrl = await fs.loadImage(filename);
        }
        
        if (!imageUrl) {
          console.warn(`⚠️ No se pudo cargar: ${media.filename}`);
          continue;
        }
        
        // Calcular tamaños
        const compressedSizeKB = (media.size / 1024).toFixed(1);
        const originalSizeKB = media.originalSize ? (media.originalSize / 1024).toFixed(1) : compressedSizeKB;
        const reduction = media.originalSize ? ((1 - media.size / media.originalSize) * 100).toFixed(0) : '0';
        
        // Crear preview con atributo especial para identificar imágenes existentes
        const previewItem = document.createElement('div');
        previewItem.className = 'multimedia-preview-item';
        previewItem.setAttribute('data-existing-media', 'true'); // Marcar como existente
        previewItem.innerHTML = `
          <img src="${imageUrl}" alt="${media.originalName}">
          <button type="button" class="multimedia-remove-btn" onclick="app.removeMultimedia('${media.filename}', 'image', true)" title="Eliminar imagen">
            ×
          </button>
          <div class="multimedia-preview-info">
            <div class="multimedia-preview-name" title="${media.originalName}">${media.filename}</div>
            <div class="multimedia-preview-size">
              <span class="size-original" style="text-decoration: line-through; opacity: 0.6;">${originalSizeKB}KB</span>
              <span class="size-arrow" style="margin: 0 4px;">→</span>
              <span class="size-compressed" style="color: #4ade80; font-weight: 600;">${compressedSizeKB}KB</span>
              <span class="size-reduction" style="margin-left: 6px; background: rgba(74, 222, 128, 0.2); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">-${reduction}%</span>
            </div>
          </div>
        `;
        
        previewContainer.appendChild(previewItem);
        console.log(`  ✅ Cargada: ${media.filename}`);
        
      } catch (error) {
        console.error(`❌ Error cargando ${media.filename}:`, error);
      }
    }
  }
  
  // Cargar ubicación en formulario (cascada jerárquica)
  async cargarUbicacionEnFormulario(ubicacion) {
    if (!ubicacion) return;
    
    console.log('📍 Cargando ubicación en formulario:', ubicacion);
    
    // Cargar nivel 1 (Planta)
    const nivel1Select = document.getElementById('nivel1');
    if (nivel1Select && ubicacion.planta) {
      nivel1Select.value = ubicacion.planta;
    }
    
    // Cargar nivel 2 (Área General) si existe
    if (ubicacion.areaGeneral) {
      await this.cargarNivel(2);
      const nivel2Select = document.getElementById('nivel2');
      if (nivel2Select) {
        // Esperar un momento para que se carguen las opciones
        setTimeout(() => {
          nivel2Select.value = ubicacion.areaGeneral;
          
          // Cargar nivel 3 (Sub-área) si existe
          if (ubicacion.subArea) {
            this.cargarNivel(3);
            setTimeout(() => {
              const nivel3Select = document.getElementById('nivel3');
              if (nivel3Select) {
                nivel3Select.value = ubicacion.subArea;
                
                // Continuar con los demás niveles...
                if (ubicacion.sistemaEquipo) {
                  this.cargarNivel(4);
                  setTimeout(() => {
                    document.getElementById('nivel4').value = ubicacion.sistemaEquipo;
                    
                    if (ubicacion.subSistema) {
                      this.cargarNivel(5);
                      setTimeout(() => {
                        document.getElementById('nivel5').value = ubicacion.subSistema;
                        
                        if (ubicacion.seccion) {
                          this.cargarNivel(6);
                          setTimeout(() => {
                            document.getElementById('nivel6').value = ubicacion.seccion;
                            
                            if (ubicacion.subSeccion) {
                              this.cargarNivel(7);
                              setTimeout(() => {
                                document.getElementById('nivel7').value = ubicacion.subSeccion;
                                
                                if (ubicacion.detalles) {
                                  this.cargarNivel(8);
                                  setTimeout(() => {
                                    document.getElementById('nivel8').value = ubicacion.detalles;
                                  }, 50);
                                }
                              }, 50);
                            }
                          }, 50);
                        }
                      }, 50);
                    }
                  }, 50);
                }
              }
            }, 50);
          }
        }, 50);
      }
    }
  }

  closeModal() {
    document.getElementById('modal').classList.remove('active');
  }

  // Cargar opciones del siguiente nivel (cascada)
  cargarNivel(nivel) {
    console.log(`🔄 Cargando nivel ${nivel}...`);
    
    const selectActual = document.getElementById(`nivel${nivel}`);
    if (!selectActual) {
      console.warn(`⚠️ No se encontró select para nivel ${nivel}`);
      return;
    }
    
    // Obtener el valor del nivel anterior para filtrar opciones
    let valorNivelAnterior = null;
    if (nivel > 1) {
      const selectAnterior = document.getElementById(`nivel${nivel - 1}`);
      valorNivelAnterior = selectAnterior?.value;
      
      if (!valorNivelAnterior) {
        console.warn(`⚠️ Nivel anterior (${nivel - 1}) no tiene valor seleccionado`);
        return;
      }
    }
    
    // Cargar opciones según el nivel
    const opciones = this.getOpcionesNivel(nivel, valorNivelAnterior);
    
    // Poblar el select
    if (nivel < 8) {
      selectActual.innerHTML = '<option value="">Seleccionar...</option>';
      opciones.forEach(opcion => {
        const opt = document.createElement('option');
        opt.value = opcion;
        opt.textContent = opcion;
        selectActual.appendChild(opt);
      });
      selectActual.disabled = false;
    } else {
      // Nivel 8 es input text, no select
      selectActual.disabled = false;
      selectActual.placeholder = 'Ej: Pocket 3, Zona A, etc.';
    }
    
    // Limpiar y deshabilitar niveles posteriores
    for (let i = nivel + 1; i <= 8; i++) {
      const selectPosterior = document.getElementById(`nivel${i}`);
      if (selectPosterior) {
        if (i < 8) {
          selectPosterior.innerHTML = '<option value="">Seleccionar...</option>';
          selectPosterior.disabled = true;
        } else {
          selectPosterior.value = '';
          selectPosterior.disabled = true;
        }
      }
    }
    
    console.log(`✅ Nivel ${nivel} cargado con ${opciones.length} opciones`);
  }
  
  // Obtener opciones para un nivel específico (con filtrado por nivel anterior)
  getOpcionesNivel(nivel, valorNivelAnterior = null) {
    // Mapeo de niveles a keys de configuración
    const nivelMap = {
      1: 'planta',        // N1: Empresa/Planta
      2: 'areaGeneral',   // N2: Área
      3: 'subArea',       // N3: Sub-área
      4: 'sistemaEquipo', // N4: Sistema/Equipo
      5: 'subSistema',    // N5: Sub-sistema
      6: 'seccion',       // N6: Sección
      7: 'subSeccion'     // N7: Sub-sección
    };
    
    const key = nivelMap[nivel];
    if (!key) {
      console.warn(`⚠️ Nivel ${nivel} no tiene mapeo de configuración`);
      return [];
    }
    
    // Para nivel 1 (Planta), siempre retornar la planta base
    if (nivel === 1) {
      return [this.plantaBase];
    }
    
    // Obtener opciones desde la configuración predefinida
    let opciones = this.opcionesJerarquiaPredefinidas[key] || [];
    
    // TODO: En el futuro, aquí se puede implementar filtrado basado en valorNivelAnterior
    // Por ejemplo: si nivel=5 (subSistema) y valorNivelAnterior='Grader Marel',
    // solo mostrar subsistemas relevantes a Grader
    
    // Agregar opciones únicas de repuestos existentes
    const opcionesExistentes = this.getOpcionesExistentes(key);
    opciones = [...new Set([...opciones, ...opcionesExistentes])].sort();
    
    return opciones;
  }
  
  // Obtener opciones únicas de repuestos existentes
  getOpcionesExistentes(campo) {
    const valores = new Set();
    
    this.repuestos.forEach(rep => {
      if (rep.ubicaciones && Array.isArray(rep.ubicaciones)) {
        rep.ubicaciones.forEach(ub => {
          if (ub[campo] && ub[campo].trim()) {
            valores.add(ub[campo].trim());
          }
        });
      }
    });
    
    return Array.from(valores);
  }

  // Vincular con área del mapa
  vincularConMapa() {
    console.log('🗺️ Vincular con mapa...');
    // TODO: Implementar vinculación con áreas del mapa
    this.showToast('🚧 Función en desarrollo', 'info');
  }

  // ===============================================
  // GUARDAR REPUESTO (AGREGAR/EDITAR)
  // ===============================================
  
  async saveRepuesto(event) {
    event.preventDefault();
    
    console.log('\n💾 ========== GUARDANDO REPUESTO ==========');
    
    // Obtener valores del formulario
    const formData = {
      codSAP: document.getElementById('codSAP').value.trim(),
      codProv: document.getElementById('codProv').value.trim(),
      tipo: document.getElementById('tipo').value.trim(),
      categoria: document.getElementById('categoria').value.trim(),
      nombre: document.getElementById('nombre').value.trim(),
      cantidad: parseInt(document.getElementById('cantidad').value) || 0,
      cantidadInstalada: parseInt(document.getElementById('cantidadInstalada').value) || 0,
      minimo: parseInt(document.getElementById('minimo').value) || 5,
      optimo: parseInt(document.getElementById('optimo').value) || 10,
      precio: parseFloat(document.getElementById('precio').value) || 0,
      datosTecnicos: document.getElementById('datosTecnicos').value.trim()
    };
    
    // Validaciones básicas
    if (!formData.nombre) {
      this.showToast('❌ El nombre es obligatorio', 'error');
      document.getElementById('nombre').focus();
      return;
    }
    
    if (!formData.categoria) {
      this.showToast('❌ La categoría es obligatoria', 'error');
      document.getElementById('categoria').focus();
      return;
    }
    
    // Validar que al menos nivel 1 y 2 estén seleccionados
    const nivel1 = document.getElementById('nivel1').value.trim();
    const nivel2 = document.getElementById('nivel2').value.trim();
    
    if (!nivel1) {
      this.showToast('❌ Debes seleccionar N1: Empresa/Planta', 'error');
      return;
    }
    
    if (!nivel2) {
      this.showToast('❌ Debes seleccionar N2: Área', 'error');
      return;
    }
    
    // Construir objeto de ubicación jerárquica
    const ubicacion = {
      planta: nivel1,
      areaGeneral: nivel2,
      subArea: document.getElementById('nivel3').value.trim() || '',
      sistemaEquipo: document.getElementById('nivel4').value.trim() || '',
      subSistema: document.getElementById('nivel5').value.trim() || '',
      seccion: document.getElementById('nivel6').value.trim() || '',
      subSeccion: document.getElementById('nivel7').value.trim() || '',
      detalles: document.getElementById('nivel8').value.trim() || ''
    };
    
    console.log('📋 Datos del formulario:', formData);
    console.log('📍 Ubicación jerárquica:', ubicacion);
    
    // Determinar si es edición o nuevo repuesto
    const repuestoId = document.getElementById('repuestoId').value;
    const isEdit = !!repuestoId;
    
    if (isEdit) {
      // MODO EDICIÓN
      console.log(`✏️ Editando repuesto ID: ${repuestoId}`);
      
      const repuesto = this.repuestos.find(r => String(r.id) === String(repuestoId));
      
      if (!repuesto) {
        this.showToast('❌ Error: Repuesto no encontrado', 'error');
        return;
      }
      
      // Actualizar campos
      Object.assign(repuesto, formData);
      
      // Actualizar ubicaciones (usar la primera o crear nueva)
      if (!repuesto.ubicaciones) {
        repuesto.ubicaciones = [];
      }
      
      if (repuesto.ubicaciones.length > 0) {
        Object.assign(repuesto.ubicaciones[0], ubicacion);
      } else {
        repuesto.ubicaciones.push(ubicacion);
      }
      
      // 1. Aplicar eliminaciones de multimedia marcadas
      if (this.multimediaToRemove && this.multimediaToRemove.length > 0) {
        console.log(`🗑️ Eliminando ${this.multimediaToRemove.length} imagen(es) existente(s)`);
        repuesto.multimedia = (repuesto.multimedia || []).filter(
          m => !this.multimediaToRemove.includes(m.filename)
        );
      }
      
      // 2. Procesar SOLO multimedia NUEVA (currentMultimedia)
      if (this.currentMultimedia && this.currentMultimedia.length > 0) {
        console.log(`📸 Procesando ${this.currentMultimedia.length} imagen(es) NUEVA(S)`);
        
        const fs = window.fsManager || fsManager;
        
        // VERIFICAR FileSystem conectado
        if (!fs || !fs.isConnected) {
          this.showToast('❌ Debes conectar FileSystem para guardar imágenes', 'error', 5000);
          console.error('❌ FileSystem NO conectado - imágenes NO guardadas');
          return; // NO guardar sin FileSystem
        }
        
        // Guardar en FileSystem
        const imagesSaved = await this.saveImagesToFileSystem(this.currentMultimedia, repuesto);
        
        if (imagesSaved) {
          // Guardar solo referencias (NO base64)
          const multimediaRefs = this.currentMultimedia.map(img => ({
            tipo: 'image',
            filename: img.filename,
            originalName: img.originalName,
            size: img.size,
            mimeType: img.mimeType,
            uploadDate: img.uploadDate,
            compressed: img.compressed,
            originalSize: img.originalSize,
            url: `./imagenes/${img.filename}`
            // NO incluir data
          }));
          
          const multimediaExistente = repuesto.multimedia || [];
          repuesto.multimedia = [...multimediaExistente, ...multimediaRefs];
          console.log(`✅ Imágenes guardadas en FileSystem: ${repuesto.multimedia.length} total`);
        } else {
          this.showToast('❌ Error guardando imágenes en FileSystem', 'error');
          return; // NO continuar si falla
        }
      }
      
      if (this.currentDocuments && this.currentDocuments.length > 0) {
        // Combinar documentos existentes con nuevos
        const documentosExistentes = repuesto.documentos || [];
        repuesto.documentos = [...documentosExistentes, ...this.currentDocuments];
        console.log(`📎 Agregados ${this.currentDocuments.length} nuevos documentos (total: ${repuesto.documentos.length})`);
      }
      
      // Actualizar fecha de modificación
      repuesto.fechaModificacion = new Date().toISOString();
      
      console.log('✅ Repuesto actualizado:', repuesto.nombre);
      
    } else {
      // MODO AGREGAR NUEVO
      console.log('🆕 Creando nuevo repuesto');
      
      // Verificar código SAP duplicado (si se proporciona)
      if (formData.codSAP) {
        const duplicado = this.repuestos.find(r => 
          r.codSAP === formData.codSAP || r.codigo_sap === formData.codSAP
        );
        
        if (duplicado) {
          const confirmar = confirm(
            `⚠️ CÓDIGO SAP DUPLICADO\n\n` +
            `Ya existe un repuesto con código SAP "${formData.codSAP}":\n` +
            `"${duplicado.nombre}"\n\n` +
            `¿Deseas crear el repuesto de todas formas?`
          );
          
          if (!confirmar) {
            return;
          }
        }
      }
      
      // Generar nuevo ID
      const maxId = this.repuestos.length > 0 
        ? Math.max(...this.repuestos.map(r => parseInt(r.id) || 0))
        : 0;
      const nuevoId = maxId + 1;
      
      // Preparar multimedia - SOLO FileSystem
      let multimediaFinal = [];
      if (this.currentMultimedia && this.currentMultimedia.length > 0) {
        const fs = window.fsManager || fsManager;
        
        if (!fs || !fs.isConnected) {
          this.showToast('❌ Debes conectar FileSystem para guardar imágenes', 'error', 5000);
          return; // NO crear repuesto sin FileSystem para imágenes
        }
        
        const tempRepuesto = { id: nuevoId, ...formData, ubicaciones: [ubicacion] };
        const imagesSaved = await this.saveImagesToFileSystem(this.currentMultimedia, tempRepuesto);
        
        if (imagesSaved) {
          // Solo referencias
          multimediaFinal = this.currentMultimedia.map(img => ({
            tipo: 'image',
            filename: img.filename,
            originalName: img.originalName,
            size: img.size,
            mimeType: img.mimeType,
            uploadDate: img.uploadDate,
            compressed: img.compressed,
            originalSize: img.originalSize,
            url: `./imagenes/${img.filename}`
          }));
        } else {
          this.showToast('❌ Error guardando imágenes', 'error');
          return;
        }
      }
      
      // Crear nuevo repuesto
      const nuevoRepuesto = {
        id: nuevoId,
        ...formData,
        ubicaciones: [ubicacion],
        multimedia: multimediaFinal,
        documentos: this.currentDocuments || [],
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
      };
      
      // Agregar a la lista
      this.repuestos.push(nuevoRepuesto);
      
      console.log('✅ Nuevo repuesto creado:', nuevoRepuesto.nombre, '- ID:', nuevoId);
    }
    
    // Guardar datos
    try {
      const saveSuccess = await this.saveData();
      
      if (saveSuccess !== false) {
        this.showToast(`✅ Repuesto ${isEdit ? 'actualizado' : 'creado'} exitosamente`, 'success');
        
        // Cerrar modal
        this.closeModal();
        
        // Actualizar vista
        this.applyFiltersAndRender();
        
        console.log('========== GUARDADO COMPLETO ==========\n');
      } else {
        this.showToast('⚠️ Repuesto creado pero no guardado (excede límite)', 'warning', 5000);
      }
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      this.showToast('❌ Error al guardar: ' + error.message, 'error');
    }
  }

  // ===============================================
  // MANEJO DE MULTIMEDIA (IMÁGENES Y DOCUMENTOS)
  // ===============================================
  
  async handleMultimedia(event, type) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    console.log(`📎 Procesando ${files.length} archivo(s) de tipo: ${type}`);
    
    if (type === 'image') {
      await this.handleImageUpload(files, event);
    } else if (type === 'document') {
      await this.handleDocumentUpload(files, event);
    }
  }
  
  async handleImageUpload(files, event) {
    const previewContainer = document.getElementById('imagePreview');
    
    for (const file of files) {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        this.showToast(`❌ ${file.name} no es una imagen válida`, 'error');
        continue;
      }
      
      // Validar tamaño original (máximo 10MB antes de comprimir)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.showToast(`❌ ${file.name} excede 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB)`, 'error');
        continue;
      }
      
      try {
        console.log(`📸 Procesando: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
        
        // Comprimir imagen a WebP
        const compressedBase64 = await this.compressImageToWebP(file);
        
        if (!compressedBase64) {
          this.showToast(`❌ Error al comprimir ${file.name}`, 'error');
          continue;
        }
        
        // Calcular tamaño comprimido
        const compressedSize = (compressedBase64.length * 0.75) / 1024; // Aproximado en KB
        const reduction = ((1 - compressedSize / (file.size / 1024)) * 100).toFixed(0);
        
        console.log(`✅ Comprimida: ${file.name} → ${compressedSize.toFixed(1)}KB (${reduction}% reducción)`);
        
        // Generar nombre único con extensión .webp
        const timestamp = Date.now();
        const baseName = file.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
        const filename = `${timestamp}_${baseName}.webp`;
        
        // Agregar a multimedia actual
        if (!this.currentMultimedia) {
          this.currentMultimedia = [];
        }
        
        this.currentMultimedia.push({
          tipo: 'image',
          filename: filename,
          originalName: file.name,
          data: compressedBase64,
          size: Math.round(compressedSize * 1024), // Tamaño en bytes
          mimeType: 'image/webp',
          uploadDate: new Date().toISOString(),
          compressed: true,
          originalSize: file.size
        });
        
        // Crear preview
        const previewItem = document.createElement('div');
        previewItem.className = 'multimedia-preview-item';
        
        // Calcular tamaño original en formato legible
        const originalSizeKB = (file.size / 1024).toFixed(1);
        
        previewItem.innerHTML = `
          <img src="${compressedBase64}" alt="${file.name}">
          <button type="button" class="multimedia-remove-btn" onclick="app.removeMultimedia('${filename}', 'image')" title="Eliminar imagen">
            ×
          </button>
          <div class="multimedia-preview-info">
            <div class="multimedia-preview-name" title="${file.name}">${baseName}.webp</div>
            <div class="multimedia-preview-size">
              <span class="size-original" style="text-decoration: line-through; opacity: 0.6;">${originalSizeKB}KB</span>
              <span class="size-arrow" style="margin: 0 4px;">→</span>
              <span class="size-compressed" style="color: #4ade80; font-weight: 600;">${compressedSize.toFixed(1)}KB</span>
              <span class="size-reduction" style="margin-left: 6px; background: rgba(74, 222, 128, 0.2); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">-${reduction}%</span>
            </div>
          </div>
        `;
        
        previewContainer.appendChild(previewItem);
        
      } catch (error) {
        console.error(`❌ Error procesando ${file.name}:`, error);
        this.showToast(`❌ Error al procesar ${file.name}`, 'error');
      }
    }
    
    // Limpiar input
    event.target.value = '';
    
    this.showToast(`✅ ${files.length} imagen(es) optimizada(s) a WebP`, 'success', 2000);
  }
  
  // Comprimir imagen a WebP con optimización adaptativa
  async compressImageToWebP(file, maxWidth = 800, quality = 0.85) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar manteniendo aspecto
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxWidth) / height;
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          
          // Optimización de renderizado
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Fondo blanco para transparencias
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          
          // Dibujar imagen con suavizado
          ctx.drawImage(img, 0, 0, width, height);

          // Intentar WebP primero (mejor compresión)
          let compressedUrl = null;
          let format = 'webp';
          
          try {
            compressedUrl = canvas.toDataURL('image/webp', quality);
            
            // Si WebP no funciona o es muy grande, probar JPEG
            if (!compressedUrl.startsWith('data:image/webp') || compressedUrl.length > 200000) {
              format = 'jpeg';
              compressedUrl = canvas.toDataURL('image/jpeg', quality);
            }
          } catch (e) {
            // Fallback a JPEG si WebP no está soportado
            format = 'jpeg';
            compressedUrl = canvas.toDataURL('image/jpeg', quality);
          }

          // Optimización adaptativa de calidad
          let currentQuality = quality;
          let iterations = 0;
          const targetSize = 150000; // ~150KB objetivo
          
          while (compressedUrl.length > targetSize && currentQuality > 0.5 && iterations < 5) {
            currentQuality -= 0.08;
            compressedUrl = canvas.toDataURL(`image/${format}`, currentQuality);
            iterations++;
          }
          
          const finalSizeKB = (compressedUrl.length * 0.75 / 1024).toFixed(1);
          console.log(`  → Formato: ${format.toUpperCase()}, ${finalSizeKB}KB, calidad: ${(currentQuality * 100).toFixed(0)}%`);

          resolve(compressedUrl);
        };
        img.onerror = () => {
          console.error('❌ Error cargando imagen para comprimir');
          resolve(null);
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        console.error('❌ Error leyendo archivo');
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }
  
  async handleDocumentUpload(files, event) {
    const documentsContainer = document.getElementById('documentsList');
    
    for (const file of files) {
      // Validar tamaño (máximo 10MB por documento)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.showToast(`❌ ${file.name} excede 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB)`, 'error');
        continue;
      }
      
      try {
        // Leer archivo como base64
        const base64 = await this.fileToBase64(file);
        
        // Generar nombre único
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        
        // Agregar a documentos actuales
        if (!this.currentDocuments) {
          this.currentDocuments = [];
        }
        
        this.currentDocuments.push({
          tipo: 'document',
          filename: filename,
          originalName: file.name,
          data: base64,
          size: file.size,
          mimeType: file.type,
          uploadDate: new Date().toISOString()
        });
        
        // Determinar icono según tipo
        let icon = '📄';
        if (file.type.includes('pdf')) icon = '📕';
        else if (file.type.includes('excel') || file.type.includes('spreadsheet')) icon = '📊';
        else if (file.type.includes('word') || file.type.includes('document')) icon = '📝';
        else if (file.type.includes('video')) icon = '🎥';
        
        // Crear item en lista
        const documentItem = document.createElement('div');
        documentItem.className = 'document-list-item';
        documentItem.innerHTML = `
          <span class="document-icon">${icon}</span>
          <span class="document-name">${file.name}</span>
          <span class="document-size">(${(file.size / 1024).toFixed(1)}KB)</span>
          <button type="button" class="document-remove-btn" onclick="app.removeMultimedia('${filename}', 'document')" title="Eliminar documento">
            ×
          </button>
        `;
        
        documentsContainer.appendChild(documentItem);
        
        console.log(`✅ Documento agregado: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
        
      } catch (error) {
        console.error(`❌ Error procesando ${file.name}:`, error);
        this.showToast(`❌ Error al procesar ${file.name}`, 'error');
      }
    }
    
    // Limpiar input
    event.target.value = '';
    
    this.showToast(`✅ ${files.length} documento(s) agregado(s)`, 'success', 2000);
  }
  
  // Convertir archivo a base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
  
  // Eliminar multimedia del preview
  removeMultimedia(filename, type, isExisting = false) {
    console.log(`🗑️ Eliminando ${type}: ${filename} (existente: ${isExisting})`);
    
    if (type === 'image') {
      // Solo eliminar de currentMultimedia si NO es una imagen existente
      if (!isExisting) {
        this.currentMultimedia = this.currentMultimedia.filter(m => m.filename !== filename);
      } else {
        // Si es existente, marcarla para eliminación del repuesto
        if (!this.multimediaToRemove) {
          this.multimediaToRemove = [];
        }
        this.multimediaToRemove.push(filename);
        console.log(`📌 Marcada para eliminación: ${filename}`);
      }
      
      // Eliminar del preview
      const previewContainer = document.getElementById('imagePreview');
      const items = previewContainer.querySelectorAll('.multimedia-preview-item');
      items.forEach(item => {
        const btn = item.querySelector('.multimedia-remove-btn');
        if (btn && btn.getAttribute('onclick').includes(filename)) {
          item.remove();
        }
      });
      
      this.showToast('🗑️ Imagen eliminada', 'info', 2000);
      
    } else if (type === 'document') {
      // Eliminar de currentDocuments
      this.currentDocuments = this.currentDocuments.filter(d => d.filename !== filename);
      
      // Eliminar de la lista
      const documentsContainer = document.getElementById('documentsList');
      const items = documentsContainer.querySelectorAll('.document-list-item');
      items.forEach(item => {
        const btn = item.querySelector('.document-remove-btn');
        if (btn && btn.getAttribute('onclick').includes(filename)) {
          item.remove();
        }
      });
      
      this.showToast('🗑️ Documento eliminado', 'info', 2000);
    }
  }

  // ===============================================
  // GUARDAR IMÁGENES EN FILESYSTEM
  // ===============================================
  
  async saveImagesToFileSystem(multimedia, repuesto) {
    // Verificar si FileSystem está disponible
    const fs = window.fsManager || fsManager;
    if (!fs || !fs.isConnected) {
      console.log('⚠️ FileSystem no disponible, guardando en JSON');
      return false;
    }
    
    try {
      console.log(`💾 Guardando ${multimedia.length} imagen(es) en FileSystem...`);
      
      for (const media of multimedia) {
        if (!media.data || !media.filename) continue;
        
        // Convertir base64 a Blob
        const base64Data = media.data.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: media.mimeType });
        
        // Guardar en carpeta imagenes/
        const success = await fs.saveImage(blob, media.filename);
        
        if (success) {
          console.log(`  ✅ ${media.filename} guardada (${(blob.size / 1024).toFixed(1)}KB)`);
        } else {
          console.error(`  ❌ Error guardando ${media.filename}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error guardando imágenes en FileSystem:', error);
      return false;
    }
  }

  // ===============================================
  // SINCRONIZACIÓN DE UBICACIONES DESDE EL DOM
  // ===============================================
  
  /**
   * Sincroniza ubicacionesActuales con los valores del DOM
   * Se llama antes de guardar imgenes o el repuesto
   */
  sincronizarUbicacionesDesdeDOM() {
    if (!this.ubicacionesActuales || this.ubicacionesActuales.length === 0) {
      console.warn('  No hay ubicacionesActuales para sincronizar');
      return;
    }
    
    console.log('  Sincronizando ubicaciones desde DOM...');
    this.ubicacionesActuales.forEach((ub, idx) => {
      const inputs = document.querySelectorAll(`[data-ubicacion-id="${ub.id}"]`);
      inputs.forEach(input => {
        const field = input.dataset.field;
        const value = input.value;
        if (ub[field] !== value) {
          console.log(`    Ubicacin ${idx + 1} - ${field}: "${ub[field]}" - "${value}"`);
          ub[field] = value;
        }
      });
    });
    
    // Log del estado actualizado
    console.log('- Ubicaciones sincronizadas:');
    this.ubicacionesActuales.forEach((ub, idx) => {
      console.log(`  ${idx + 1}. rea: "${ub.areaGeneral || '(vaco)'}"`);
    });
  }

  // ===============================================
  // SISTEMA DE ORGANIZACIN AUTOMTICA DE IMGENES
  // ===============================================

  /**
   * Normaliza un nombre para usarlo como nombre de carpeta
   * Elimina caracteres especiales, acentos y espacios
   */
  normalizarNombreCarpeta(texto) {
    if (!texto || texto.trim() === '') return '_SIN_NOMBRE';
    
    return texto
      .trim()
      .toUpperCase()
      // Reemplazar acentos
      .replace(/[]/gi, 'A')
      .replace(/[]/gi, 'E')
      .replace(/[]/gi, 'I')
      .replace(/[]/gi, 'O')
      .replace(/[]/gi, 'U')
      .replace(/[]/gi, 'N')
      // Solo alfanumricos, espacios, guiones y guiones bajos
      .replace(/[^A-Z0-9\s_-]/g, '')
      // Espacios a guiones bajos
      .replace(/\s+/g, '_')
      // Mltiples guiones bajos a uno solo
      .replace(/_+/g, '_')
      // Mximo 50 caracteres
      .substring(0, 50);
  }

  /**
   * Codifica una ruta jerrquica en un nombre de archivo plano
   * Ej: "PLANTA_YAL/EMPARILLADO/archivo.webp" - "PLANTA_YAL__EMPARILLADO__archivo.webp"
   */
  codificarRutaJerarquica(rutaJerarquica) {
    return rutaJerarquica.replace(/\//g, '__');
  }

  /**
   * Decodifica un nombre de archivo plano a ruta jerrquica
   * Ej: "PLANTA_YAL__EMPARILLADO__archivo.webp" - "PLANTA_YAL/EMPARILLADO/archivo.webp"
   */
  decodificarRutaJerarquica(nombreArchivo) {
    return nombreArchivo.replace(/__/g, '/');
  }

  /**
   * Genera un nombre de archivo descriptivo automticamente
   * Formato: SAP_NOMBRE_TIMESTAMP_INDEX.webp
   */
  generarNombreArchivo(repuesto, imageIndex = 0) {
    // 1. Cdigo SAP (mx 20 caracteres)
    const codigoSAP = (repuesto.codSAP || 'SAP_PENDIENTE')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 20);
    
    // 2. Nombre del repuesto (mx 40 caracteres)
    const nombreNormalizado = repuesto.nombre
      .toUpperCase()
      .trim()
      .replace(/[]/gi, 'A')
      .replace(/[]/gi, 'E')
      .replace(/[]/gi, 'I')
      .replace(/[]/gi, 'O')
      .replace(/[]/gi, 'U')
      .replace(/[]/gi, 'N')
      .replace(/[^A-Z0-9\s]/g, '') // Solo letras, nmeros y espacios
      .replace(/\s+/g, '_')        // Espacios - guiones bajos
      .substring(0, 40);
    
    // 3. Timestamp nico
    const timestamp = Date.now();
    
    // 4. ndice (si hay mltiples imgenes)
    const suffix = imageIndex > 0 ? `_${imageIndex + 1}` : '';
    
    // Resultado: SAP_NOMBRE_TIMESTAMP_INDEX.webp
    return `${codigoSAP}_${nombreNormalizado}_${timestamp}${suffix}.webp`;
  }

  /**
   * Genera la ruta jerrquica segn la ubicacin del repuesto
   */
  generarRutaImagen(ubicacion) {
    const partes = ['imagenes']; // Siempre empieza con /imagenes/
    
    // Nivel 1: rea General (OBLIGATORIO)
    if (ubicacion.areaGeneral && ubicacion.areaGeneral.trim() !== '') {
      partes.push(this.normalizarNombreCarpeta(ubicacion.areaGeneral));
    } else {
      partes.push('_SIN_UBICACION');
    }
    
    // Nivel 2: Sistema/Equipo (OPCIONAL - solo si nivelJerarquiaImagenes >= 2)
    if (this.nivelJerarquiaImagenes >= 2 && ubicacion.sistemaEquipo && ubicacion.sistemaEquipo.trim() !== '') {
      partes.push(this.normalizarNombreCarpeta(ubicacion.sistemaEquipo));
    }
    
    // Nivel 3: Sub-Sistema (OPCIONAL - solo si nivelJerarquiaImagenes >= 3)
    if (this.nivelJerarquiaImagenes >= 3 && ubicacion.subSistema && ubicacion.subSistema.trim() !== '') {
      partes.push(this.normalizarNombreCarpeta(ubicacion.subSistema));
    }
    
    return './' + partes.join('/');
  }

  /**
   * Crea las carpetas jerrquicas automticamente si no existen
   */
  async crearCarpetasJerarquicas(ubicacion) {
    console.log('  Creando carpetas jerrquicas...', ubicacion);
    
    try {
      // Verificar que tenemos acceso al FileSystem
      if (!fsManager.isFileSystemMode || !fsManager.directoryHandle) {
        console.error('- No hay acceso al FileSystem');
        console.error('   isFileSystemMode:', fsManager.isFileSystemMode);
        console.error('   directoryHandle:', fsManager.directoryHandle);
        return null;
      }
      
      // Obtener o crear carpeta base de imgenes
      let carpetaActual;
      try {
        carpetaActual = await fsManager.directoryHandle.getDirectoryHandle('imagenes', { create: true });
        console.log('  - Carpeta base imagenes/ accesible');
      } catch (error) {
        console.error('- Error accediendo a carpeta imagenes:', error);
        return null;
      }
      
      // Nivel 1: rea General (obligatorio)
      const areaGeneral = ubicacion.areaGeneral && ubicacion.areaGeneral.trim() !== ''
        ? this.normalizarNombreCarpeta(ubicacion.areaGeneral)
        : '_SIN_UBICACION';

      carpetaActual = await carpetaActual.getDirectoryHandle(areaGeneral, { create: true });
      console.log(`  - Nivel 1 - rea General: ${areaGeneral}`);

      // Nivel 2: Sub-rea (opcional)
      if (this.nivelJerarquiaImagenes >= 2 && ubicacion.subArea && ubicacion.subArea.trim() !== '') {
        const subArea = this.normalizarNombreCarpeta(ubicacion.subArea);
        carpetaActual = await carpetaActual.getDirectoryHandle(subArea, { create: true });
        console.log(`  - Nivel 2 - Sub-rea: ${subArea}`);
      }

      // Nivel 3: Sistema/Equipo (opcional)
      if (this.nivelJerarquiaImagenes >= 3 && ubicacion.sistemaEquipo && ubicacion.sistemaEquipo.trim() !== '') {
        const sistema = this.normalizarNombreCarpeta(ubicacion.sistemaEquipo);
        carpetaActual = await carpetaActual.getDirectoryHandle(sistema, { create: true });
        console.log(`  - Nivel 3 - Sistema/Equipo: ${sistema}`);
      }

      // Nivel 4: Sub-Sistema (opcional)
      if (this.nivelJerarquiaImagenes >= 4 && ubicacion.subSistema && ubicacion.subSistema.trim() !== '') {
        const subSistema = this.normalizarNombreCarpeta(ubicacion.subSistema);
        carpetaActual = await carpetaActual.getDirectoryHandle(subSistema, { create: true });
        console.log(`  - Nivel 4 - Sub-Sistema: ${subSistema}`);
      }

      // Nivel 5: Seccin (opcional)
      if (this.nivelJerarquiaImagenes >= 5 && ubicacion.seccion && ubicacion.seccion.trim() !== '') {
        const seccion = this.normalizarNombreCarpeta(ubicacion.seccion);
        carpetaActual = await carpetaActual.getDirectoryHandle(seccion, { create: true });
        console.log(`  - Nivel 5 - Seccin: ${seccion}`);
      }

      // NOTA: El campo "detalle" es texto libre y NO se usa para crear carpetas
      // Las carpetas jerrquicas terminan en el Nivel 5 (Seccin)

      // Nivel 7: Ubicacin Especfica (opcional - futuro)
      if (this.nivelJerarquiaImagenes >= 7 && ubicacion.ubicacionEspecifica && ubicacion.ubicacionEspecifica.trim() !== '') {
        const ubicacionEspecifica = this.normalizarNombreCarpeta(ubicacion.ubicacionEspecifica);
        carpetaActual = await carpetaActual.getDirectoryHandle(ubicacionEspecifica, { create: true });
        console.log(`  - Nivel 7 - Ubicacin Especfica: ${ubicacionEspecifica}`);
      }
      
      return carpetaActual;
      
    } catch (error) {
      console.error('- Error creando carpetas:', error);
      console.error('   Detalles:', error.message);
      // Si falla, devolver carpeta raz de imgenes como fallback
      try {
        return await fsManager.directoryHandle.getDirectoryHandle('imagenes', { create: true });
      } catch (fallbackError) {
        console.error('- Error en fallback tambin:', fallbackError);
        return null;
      }
    }
  }

  /**
   * Navega a una carpeta por su ruta completa
   */
  async navegarACarpeta(ruta) {
    const partes = ruta.replace('./', '').split('/');
    let carpeta = fsManager.directoryHandle;
    
    for (const parte of partes) {
      carpeta = await carpeta.getDirectoryHandle(parte);
    }
    
    return carpeta;
  }

  /**
   * Limpia carpetas vacas (sin archivos)
   */
  async limpiarCarpetasVacias() {
    console.log('  Limpiando carpetas vacas...');
    
    try {
      if (!fsManager.isFileSystemMode || !fsManager.directoryHandle) {
        console.warn('  No hay acceso al FileSystem para limpiar carpetas');
        return;
      }
      
      const carpetaImagenes = await fsManager.directoryHandle.getDirectoryHandle('imagenes');
      
      // Obtener todas las subcarpetas (reas)
      for await (const [nombre, handle] of carpetaImagenes.entries()) {
        if (handle.kind !== 'directory') continue;
        
        // Contar archivos en la carpeta
        let tieneArchivos = false;
        const carpeta = await carpetaImagenes.getDirectoryHandle(nombre);
        
        for await (const entry of carpeta.values()) {
          if (entry.kind === 'file') {
            tieneArchivos = true;
            break;
          }
        }
        
        // Si est vaca, eliminarla
        if (!tieneArchivos) {
          await carpetaImagenes.removeEntry(nombre, { recursive: true });
          console.log(`   - Carpeta vaca eliminada: ${nombre}`);
        }
      }
      
      console.log('- Limpieza completada');
    } catch (error) {
      console.error('- Error limpiando carpetas:', error);
    }
  }

  /**
   * Mueve imgenes a nueva carpeta si cambi la ubicacin del repuesto
   */
  async moverImagenSiCambiaUbicacion(repuesto, ubicacionesAntiguas, ubicacionesNuevas) {
    if (!fsManager || !fsManager.isFileSystemMode) return;
    if (!ubicacionesAntiguas || !ubicacionesNuevas) return;
    if (ubicacionesAntiguas.length === 0 || ubicacionesNuevas.length === 0) return;
    
    console.log('  Verificando si hay que mover imgenes...');
    
    // Comparar primera ubicacin (la principal)
    const ubicacionAntigua = ubicacionesAntiguas[0];
    const ubicacionNueva = ubicacionesNuevas[0];
    
    // Verificar si cambi el rea general
    const areaAntiguaNorm = this.normalizarNombreCarpeta(ubicacionAntigua.areaGeneral || '');
    const areaNuevaNorm = this.normalizarNombreCarpeta(ubicacionNueva.areaGeneral || '');
    
    if (areaAntiguaNorm === areaNuevaNorm) {
      console.log('    rea no cambi, no es necesario mover imgenes');
      return; // No cambi, no hacer nada
    }
    
    console.log(`    rea cambi: ${areaAntiguaNorm} - ${areaNuevaNorm}`);
    
    // Mover cada imagen
    let imagenesMovidas = 0;
    for (const media of repuesto.multimedia || []) {
      if (media.type !== 'image' || !media.isFileSystem) continue;
      
      try {
        // 1. Obtener nombre del archivo de la URL
        const nombreArchivo = media.url.split('/').pop();
        
        // 2. Buscar archivo en mltiples ubicaciones posibles
        let fileHandle;
        let carpetaAntigua;
        
        // Lista de ubicaciones donde buscar (orden de prioridad)
        const ubicacionesBuscar = [
          { tipo: 'raz', carpeta: fsManager.imagesFolder, descripcion: 'raz de imgenes' },
          { tipo: 'jerarquia_antigua', carpeta: null, descripcion: 'jerarqua antigua', ruta: this.generarRutaImagen(ubicacionAntigua) },
          { tipo: 'jerarquia_nueva', carpeta: null, descripcion: 'jerarqua nueva', ruta: this.generarRutaImagen(ubicacionNueva) }
        ];
        
        for (const ubicacion of ubicacionesBuscar) {
          try {
            if (ubicacion.tipo === 'raz') {
              fileHandle = await ubicacion.carpeta.getFileHandle(nombreArchivo);
              carpetaAntigua = ubicacion.carpeta;
              console.log(`    Archivo encontrado en ${ubicacion.descripcion}`);
              break;
            } else {
              // Para jerarquas, intentar navegar a la carpeta
              try {
                const carpetaJerarquia = await this.navegarACarpeta(ubicacion.ruta);
                fileHandle = await carpetaJerarquia.getFileHandle(nombreArchivo);
                carpetaAntigua = carpetaJerarquia;
                console.log(`    Archivo encontrado en ${ubicacion.descripcion}: ${ubicacion.ruta}`);
                break;
              } catch (navError) {
                // Si no puede navegar a la carpeta, significa que no existe
                console.log(`    Carpeta ${ubicacion.ruta} no existe, omitiendo bsqueda aqu`);
                continue;
              }
            }
          } catch (searchError) {
            console.log(`    Archivo no encontrado en ${ubicacion.descripcion}, continuando bsqueda...`);
            continue;
          }
        }
        
        // Si no se encontr en ninguna ubicacin, continuar con la siguiente imagen
        if (!fileHandle) {
          console.log(`    Archivo ${nombreArchivo} no encontrado en ninguna ubicacin, omitiendo`);
          continue;
        }
        const file = await fileHandle.getFile();
        
        // 3. Crear carpeta nueva (si no existe)
        const carpetaNueva = await this.crearCarpetasJerarquicas(ubicacionNueva);
        
        // 4. Copiar archivo a nueva ubicacin
        const result = await fsManager.saveImageJerarquica(file, nombreArchivo, carpetaNueva);
        
        if (result) {
        // 5. Actualizar TODAS las rutas en el objeto multimedia que coincidan con este archivo
        const rutaNueva = this.generarRutaImagen(ubicacionNueva);
        const nuevaUrl = `${rutaNueva}/${nombreArchivo}`;

        // Buscar y actualizar todas las referencias a este archivo en el repuesto
        let referenciasActualizadas = 0;
        for (const media of repuesto.multimedia || []) {
          if (media.type === 'image' && media.isFileSystem) {
            const mediaFileName = media.url.split('/').pop();
            if (mediaFileName === nombreArchivo) {
              media.url = nuevaUrl;
              referenciasActualizadas++;
              console.log(`    URL actualizada: ${media.url}`);
            }
          }
        }

        console.log(`    Referencias actualizadas: ${referenciasActualizadas}`);          // 6. (Opcional) Eliminar archivo antiguo
          console.log(`    Verificando eliminacin: eliminarImagenAntiguaAlMover = ${this.eliminarImagenAntiguaAlMover}`);
          if (this.eliminarImagenAntiguaAlMover && carpetaAntigua) {
            console.log(`   - Intentando eliminar archivo antiguo: ${nombreArchivo} de carpeta antigua`);
            try {
              await carpetaAntigua.removeEntry(nombreArchivo);
              console.log(`  - Archivo antiguo eliminado: ${nombreArchivo}`);
            } catch (removeError) {
              console.error(`  - Error eliminando archivo antiguo:`, removeError);
            }
          } else {
            console.log(`    Eliminacin desactivada o carpeta antigua no disponible, archivo permanece en ubicacin antigua`);
          }
          
          imagenesMovidas++;
          console.log(`  - Imagen movida: ${nombreArchivo}`);
        }
        
      } catch (error) {
        console.error(`  - Error moviendo imagen:`, error);
        
        // Si el archivo no existe, podra ser que ya fue movido anteriormente
        // o que la referencia est corrupta. Limpiar referencias invlidas
        if (error.name === 'NotFoundError') {
          console.log(`    Archivo ${nombreArchivo} no encontrado, eliminando referencia invlida`);
          
          // Remover la referencia invlida del array multimedia
          const index = repuesto.multimedia.indexOf(media);
          if (index > -1) {
            repuesto.multimedia.splice(index, 1);
            console.log(`  - Referencia invlida eliminada del repuesto`);
          }
        }
        
        // Continuar con las dems imgenes
      }
    }
    
    if (imagenesMovidas > 0) {
      console.log(`- Total de imgenes movidas: ${imagenesMovidas}`);
      this.showToast(`- ${imagenesMovidas} imagen(es) movida(s) a nueva ubicacin`, 'success');
      
      // Limpiar carpetas vacas
      await this.limpiarCarpetasVacias();
    }
  }

  async init() {
    this.showBrowserWarning();
    
    // Renderizar UI de almacenamiento según plataforma (PC o móvil)
    // TODO: Implementar módulo de configuración en v6.0
    /*
    if (typeof configuracion !== 'undefined') {
      setTimeout(() => {
        configuracion.renderStorageUI();
        configuracion.loadICloudPathConfig(); // Cargar ruta iCloud guardada
      }, 100);
    }
    */
    
    await this.loadData();
    this.setupEvents();
    this.setupDelegatedEvents(); // Event delegation para botones con data-attributes
    this.setupPhotoInputs(); // NUEVO: Configurar inputs de foto según plataforma
    this.applyViewModeStyles(); // Aplicar modo de visualización guardado
    this.updateViewModeInfo(); // Actualizar info del modo
    await this.render();
    this.renderFilters();
    
    // Cargar datos de autocompletado guardados o generar desde repuestos
    const savedAutocomplete = localStorage.getItem('autocompleteData');
    if (savedAutocomplete) {
      try {
        this.autocompleteData = JSON.parse(savedAutocomplete);
      } catch (e) {
        console.warn('Error cargando autocomplete guardado, regenerando...', e);
        this.updateAutocompleteData();
      }
    } else {
      this.updateAutocompleteData();
    }
    
    this.setupAutocomplete();
    
    // Setup listener para cambio de equipo (cargar sistemas)
    const equipoInput = document.getElementById('equipo');
    if (equipoInput) {
      equipoInput.addEventListener('blur', () => {
        const equipo = equipoInput.value.trim();
        if (equipo) {
          this.cargarSistemasPorEquipo(equipo);
        }
      });
    }
    
    // Log de plataforma y optimizaciones
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  PLATAFORMA: ${this.isMobile ? 'MVIL' : 'PC'}`);
    console.log(`  ALMACENAMIENTO: ${this.storageMode.toUpperCase()}`);
    console.log(`  File System API: ${this.hasFileSystemAPI ? '- Disponible' : '- No disponible'}`);
    
    if (this.isEdge) {
      if (this.isEdgeIOS) {
        console.log(`  NAVEGADOR: Microsoft Edge iOS (Modo Mvil)`);
        console.log('  Caractersticas activas:');
        console.log('  - IndexedDB para imgenes (~50-100MB)');
        console.log('    Captura de cmara directa');
        console.log('   - Seleccin de galera/iCloud Photos');
        console.log('  - Sincronizacin va JSON');
        console.log('    WebKit (limitado por Apple, no Chromium)');
      } else {
        console.log(`  NAVEGADOR: Microsoft Edge (Optimizado)`);
        console.log('  Optimizaciones activadas:');
        console.log('  - CSS Grid avanzado');
        console.log('  - Backdrop filters');
        console.log('  - Container queries');
        console.log('  - Scroll snap');
        if (this.hasFileSystemAPI) {
          console.log('  - File System Access API completa');
        }
      }
    } else {
      console.log(`  NAVEGADOR: ${this.getBrowserName()} (No optimizado)`);
    }
    console.log(`${'='.repeat(60)}\n`);
  }

  // NUEVO: Configurar inputs de fotos segn plataforma (mvil o PC)
  setupPhotoInputs() {
    const mobileButtons = document.getElementById('mobile-photo-buttons');
    const galleryInput = document.getElementById('galleryInput');
    const oldInput = document.getElementById('imagenFile');
    const multimediaSection = document.querySelector('.multimedia-section');
    
    // MVIL SIN FILESYSTEM: Ocultar toda la seccin de multimedia
    if (this.isMobile && !this.hasFileSystemAPI) {
      console.log('  Modo Mvil Simplificado - Multimedia DESACTIVADA');
      
      // Ocultar toda la seccin de multimedia
      if (multimediaSection) {
        multimediaSection.style.display = 'none';
      }
      
      // Crear mensaje informativo
      const multimediaParent = multimediaSection ? multimediaSection.parentElement : null;
      if (multimediaParent) {
        const existingMessage = document.getElementById('mobile-no-photos-message');
        if (!existingMessage) {
          const messageDiv = document.createElement('div');
          messageDiv.id = 'mobile-no-photos-message';
          messageDiv.style.cssText = `
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid var(--info);
            margin: 16px 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
            line-height: 1.6;
          `;
          messageDiv.innerHTML = `
            <strong style="color: var(--info); display: block; margin-bottom: 6px;">  Modo Mvil Simplificado</strong>
            Las fotos no estn disponibles en dispositivos mviles.<br>
            <strong>Funciones activas:</strong> Ver, Agregar, Editar, Eliminar, Conteo.
            <br><br>
              <strong>Para fotos:</strong> Usa la versin de PC con todas las funcionalidades.
          `;
          multimediaSection.parentNode.insertBefore(messageDiv, multimediaSection);
        }
      }
      
      return; // Salir - no configurar inputs de fotos
    }
    
    // MVIL CON FILESYSTEM (no debera pasar, pero por si acaso)
    if (this.isMobile && this.hasFileSystemAPI) {
      // MVIL: Mostrar botones cmara + galera
      if (mobileButtons) {
        mobileButtons.style.display = 'flex';
      }
      if (galleryInput) {
        galleryInput.style.display = 'none'; // Ocultar input directo
      }
      if (oldInput) {
        oldInput.style.display = 'none';
      }
      if (multimediaSection) {
        multimediaSection.style.display = 'block';
      }
      console.log('  Inputs de foto configurados para MVIL (Cmara + Galera)');
    } 
    // PC: Mostrar todo normalmente
    else {
      // PC: Mostrar solo input de galera (sin botones)
      if (mobileButtons) {
        mobileButtons.style.display = 'none';
      }
      if (galleryInput) {
        galleryInput.style.display = 'block'; // Mostrar input directo
      }
      if (oldInput) {
        oldInput.style.display = 'none';
      }
      if (multimediaSection) {
        multimediaSection.style.display = 'block';
      }
      console.log('  Inputs de foto configurados para PC (Galera)');
    }
  }

  // Event delegation para manejar todos los clicks en botones con data-action
  setupDelegatedEvents() {
    // Clicks en botones
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      
      const action = target.dataset.action;
      const id = target.dataset.id;
      
      if (action === 'edit') {
        this.openModal('edit', id);
      } else if (action === 'delete') {
        if (confirm('Eliminar este repuesto?')) {
          this.deleteRepuesto(id);
        }
      } else if (action === 'lightbox') {
        console.log(' - Abriendo lightbox para ID:', id);
        this.openLightbox(id);
      } else if (action === 'contar') {
        this.abrirModalConteoIndividual(id);
      } else if (action === 'goto-card') {
        this.irATarjeta(id);
      } else if (action === 'goto-map') {
        e.preventDefault();
        e.stopPropagation();
        const codigo = target.dataset.codigo;
        if (codigo) {
          this.locateRepuestoInMap(codigo);
        }
      }
    });

    // Change events en inputs (conteo)
    document.addEventListener('change', (e) => {
      const target = e.target;
      if (!target.dataset || !target.dataset.action) return;
      
      const action = target.dataset.action;
      const id = target.dataset.id;
      
      if (action === 'update-conteo') {
        this.updateConteo(id, target.value);
      }
    });

    // Listener para teclado - controles del lightbox
    document.addEventListener('keydown', (e) => {
      const lightbox = document.getElementById('lightbox');
      const isLightboxActive = lightbox && lightbox.classList.contains('active');
      
      if (!isLightboxActive) return;
      
      // ESC - Cerrar lightbox
      if (e.key === 'Escape' || e.key === 'Esc') {
        console.log('  ESC presionado - cerrando lightbox');
        this.closeLightbox();
        return;
      }
      
      // Flecha IZQUIERDA - Imagen anterior
      if (e.key === 'ArrowLeft' || e.key === 'Left') {
        console.log('  - Flecha izquierda - imagen anterior');
        e.preventDefault(); // Evitar scroll de pgina
        this.lightboxPrev();
        return;
      }
      
      // Flecha DERECHA - Imagen siguiente
      if (e.key === 'ArrowRight' || e.key === 'Right') {
        console.log('  - Flecha derecha - imagen siguiente');
        e.preventDefault(); // Evitar scroll de pgina
        this.lightboxNext();
        return;
      }
    });
  }

  async cleanBase64ImagesFromLocalStorage() {
    // Limpiar imgenes base64 del localStorage cuando estamos en modo FileSystem
    if (!fsManager.isFileSystemMode) return;
    
    try {
      const localData = localStorage.getItem('inventarioData');
      if (!localData) return;
      
      const data = JSON.parse(localData);
      let limpiadas = 0;
      let tamaoAntes = new Blob([localData]).size;
      
      // Eliminar todas las imgenes base64
      data.forEach(item => {
        if (item.multimedia && item.multimedia.length > 0) {
          const multimediaLimpia = item.multimedia.filter(media => {
            const esBase64 = media.url && media.url.startsWith('data:image');
            if (esBase64) {
              limpiadas++;
              console.log(`  Limpiando base64 de: ${item.nombre}`);
            }
            return !esBase64; // Mantener solo rutas de FileSystem
          });
          item.multimedia = multimediaLimpia;
        }
      });
      
      if (limpiadas > 0) {
        const datosLimpios = JSON.stringify(data);
        localStorage.setItem('inventarioData', datosLimpios);
        
        const tamaoDespues = new Blob([datosLimpios]).size;
        const liberado = ((tamaoAntes - tamaoDespues) / 1024).toFixed(2);
        
        console.log(`  Limpiadas ${limpiadas} imgenes base64 del localStorage (${liberado} KB liberados)`);
      } else {
        console.log('- localStorage ya est limpio (no hay imgenes base64)');
      }
    } catch (error) {
      console.warn('  Error limpiando localStorage:', error);
    }
  }

  async loadData() {
    // PRIORIDAD 1: Intentar cargar desde FileSystem si est activo
    if (fsManager.isFileSystemMode) {
      console.log('- Modo FileSystem activo, intentando cargar desde archivo...');
      try {
        const fileHandle = await fsManager.directoryHandle.getFileHandle('inventario.json');
        const file = await fileHandle.getFile();
        const content = await file.text();
        const rawData = JSON.parse(content);
        
        console.log(`- Cargados ${rawData.length} repuestos desde FileSystem`);
        this.repuestos = rawData.map((item, index) => {
          if (!item.id || item.id === 'undefined' || item.id === 'null') {
            item.id = `repuesto-${Date.now()}-${index}`;
          } else {
            item.id = String(item.id);
          }
          if (!item.multimedia || !Array.isArray(item.multimedia)) {
            item.multimedia = [];
          }
          return item;
        });
        
        //   DIAGNSTICO: Contar repuestos con/sin imgenes
        const conImagenes = this.repuestos.filter(r => r.multimedia && r.multimedia.length > 0).length;
        const sinImagenes = this.repuestos.length - conImagenes;
        console.log(`  [DIAGNSTICO] Repuestos CON imgenes: ${conImagenes}`);
        console.log(`  [DIAGNSTICO] Repuestos SIN imgenes: ${sinImagenes}`);
        
        //   SANITIZAR REFERENCIAS INVLIDAS ANTES DE RENDERIZAR
        await this.sanitizeImageReferences();
        

        return; // Salir, ya cargamos desde FileSystem
      } catch (error) {
        console.warn('  No se pudo cargar desde FileSystem:', error.message);
        console.log('Intentando cargar desde localStorage como fallback...');
      }
    }
    
    // PRIORIDAD 2: MVIL SIN FILESYSTEM - Cargar desde datos embebidos
    if (this.isMobile && !this.hasFileSystemAPI) {
      console.log('  Modo Mvil detectado - Cargando desde datos embebidos...');
      
      // Verificar si hay datos embebidos
      if (typeof EMBEDDED_DATA !== 'undefined' && EMBEDDED_DATA.repuestos && EMBEDDED_DATA.repuestos.length > 0) {
        console.log(`- Cargados ${EMBEDDED_DATA.repuestos.length} repuestos desde datos embebidos`);
        
        this.repuestos = EMBEDDED_DATA.repuestos.map((item, index) => {
          if (!item.id || item.id === 'undefined' || item.id === 'null') {
            item.id = `repuesto-${Date.now()}-${index}`;
          } else {
            item.id = String(item.id);
          }
          //   IMPORTANTE: Forzar multimedia vaco en mvil
          item.multimedia = [];
          return item;
        });
        
        console.log(`  Modo Mvil Simplificado: ${this.repuestos.length} repuestos sin multimedia`);
        console.log(`  ltima actualizacin: ${EMBEDDED_DATA.lastUpdate || 'Desconocida'}`);
        
        // Guardar en localStorage para ediciones locales
        localStorage.setItem('inventarioData', JSON.stringify(this.repuestos));
        
        //   SANITIZAR REFERENCIAS INVLIDAS ANTES DE RENDERIZAR
        await this.sanitizeImageReferences();
        

        return; // Salir, ya cargamos desde datos embebidos
      } else {
        console.warn('  No hay datos embebidos, intentando localStorage...');
      }
    }
    
    // FALLBACK: Cargar desde localStorage
    const saved = localStorage.getItem('inventarioData');
    if (saved) {
      try {
        const rawData = JSON.parse(saved);
        console.log(`Cargando ${rawData.length} repuestos desde localStorage`);
        
        // NORMALIZAR IDs: Asegurar que todos los repuestos tengan IDs vlidos
        this.repuestos = rawData.map((item, index) => {
          // Si no tiene ID o es invlido, generar uno nuevo
          if (!item.id || item.id === 'undefined' || item.id === 'null') {
            item.id = `repuesto-${Date.now()}-${index}`;
            console.log(`  ID generado para "${item.nombre}": ${item.id}`);
          } else {
            // Convertir ID a string para consistencia
            item.id = String(item.id);
          }
          
          // Asegurar que multimedia existe como array
          if (!item.multimedia || !Array.isArray(item.multimedia)) {
            item.multimedia = [];
          }
          
          return item;
        });
        
        console.log(`- ${this.repuestos.length} repuestos cargados correctamente`);
        
        // Verificar IDs nicos
        const idsSet = new Set(this.repuestos.map(r => r.id));
        if (idsSet.size !== this.repuestos.length) {
          console.warn('  Se detectaron IDs duplicados, regenerando...');
          this.repuestos = this.repuestos.map((r, i) => {
            r.id = `repuesto-${Date.now()}-${i}`;
            return r;
          });
          this.saveData(); // Guardar con IDs corregidos
        }
        
        //   SANITIZAR REFERENCIAS INVLIDAS ANTES DE RENDERIZAR
        await this.sanitizeImageReferences();
        
      } catch (e) {
        console.error('- Error al cargar datos:', e);
        this.loadDefaultData();
      }
    } else {
      console.log('  Sin datos guardados, iniciando vaco');
      this.loadDefaultData();
    }
    
  }

  // ===================================================================
  // ACTIVAR FILESYSTEM MANUAL
  // ===================================================================
  async activarFileSystem() {
    try {
      console.log('🗂️ Activando FileSystem Access API...');
      this.showToast('Selecciona la carpeta INVENTARIO_STORAGE', 'info');
      
      // Llamar al método selectFolder de fsManager
      const success = await fsManager.selectFolder();
      
      if (success) {
        this.showToast('✅ FileSystem activado correctamente', 'success');
        console.log('✅ FileSystem conectado:', fsManager.folderPath);
        
        // Recargar datos desde FileSystem
        console.log('🔄 Recargando datos desde FileSystem...');
        await this.loadData();
        await this.render();
        
        this.showToast('✅ Datos recargados desde carpeta', 'success');
      } else {
        this.showToast('❌ No se pudo activar FileSystem', 'error');
      }
    } catch (error) {
      console.error('❌ Error activando FileSystem:', error);
      this.showToast('Error: ' + error.message, 'error');
    }
  }

  async saveData() {
    try {
      const fs = window.fsManager || fsManager;
      
      //   MÓVIL: Actualizar EMBEDDED_DATA automáticamente
      if (this.isMobile && !this.hasFileSystemAPI && typeof EMBEDDED_DATA !== 'undefined') {
        console.log('  Actualizando EMBEDDED_DATA en memoria...');
        EMBEDDED_DATA.repuestos = this.repuestos.map(r => {
          const { multimedia, ...sinMultimedia } = r;
          return sinMultimedia;
        });
        EMBEDDED_DATA.lastUpdate = new Date().toISOString();
        console.log('✅ EMBEDDED_DATA actualizado:', EMBEDDED_DATA.repuestos.length, 'repuestos');
      }

      // MODO FILESYSTEM: Guardar en archivo
      if (fs && fs.isFileSystemMode) {
        console.log('💾 Guardando en FileSystem...');
        const success = await fs.saveJSON(this.repuestos);
        if (success !== false) {
          this.showToast('✅ Guardado en carpeta (sin límites)', 'success', 2000);
          console.log('✅ Datos guardados en FileSystem');
          return true;
        }
        // Si falla FileSystem, continuar con localStorage como fallback
        console.warn('⚠️ FileSystem falló, usando localStorage como fallback');
      }
      
      // MODO LOCALSTORAGE: Guardar en navegador
      const dataString = JSON.stringify(this.repuestos);
      const sizeInMB = (dataString.length / (1024 * 1024)).toFixed(2);
      
      console.log('Intentando guardar en localStorage:', sizeInMB, 'MB');
      
      // Verificar si excede lmite ANTES de intentar guardar
      if (sizeInMB > 9) {
        console.error(`- Archivo demasiado grande: ${sizeInMB}MB (lmite: ~10MB)`);
        this.showToast(`- DATOS NO GUARDADOS: ${sizeInMB}MB excede lmite de navegador (10MB)`, 'error', 8000);
        
        // Mostrar dilogo con opciones
        const opciones = confirm(
          `  PROBLEMA CRTICO\n\n` +
          ` Tamao: ${sizeInMB}MB\n` +
          ` Lmite navegador: ~10MB\n` +
          ` Repuestos: ${this.repuestos.length}\n\n` +
          `- TUS CAMBIOS SE PERDERN AL REFRESCAR\n\n` +
          `SOLUCIONES:\n` +
          `1. Activar "  Modo Carpeta" (capacidad ilimitada)\n` +
          `2. Exportar JSON sin imgenes\n` +
          `3. Reducir cantidad de repuestos\n\n` +
          `Exportar AHORA los datos actuales (sin imgenes)?`
        );
        
        if (opciones) {
          this.exportJSONSinImagenes();
        }
        return false; // Indicar que NO se guard
      }
      
      localStorage.setItem('inventarioData', dataString);
      
      // Advertencias por tamao
      if (sizeInMB > 7) {
        this.showToast(`  ADVERTENCIA: ${sizeInMB}MB/10MB - Activa "  Modo Carpeta" para sin lmites`, 'warning', 6000);
      } else if (sizeInMB > 4) {
        this.showToast(`Guardado: ${sizeInMB}MB`, 'info', 3000);
      }
      
      console.log('- Datos guardados en localStorage');
      return true; // Indicar xito
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        const sizeInMB = (JSON.stringify(this.repuestos).length / (1024 * 1024)).toFixed(2);
        this.showToast(`- LMITE EXCEDIDO (${sizeInMB}MB). Activa "  Modo Carpeta"!`, 'error', 10000);
        console.error('- LocalStorage lleno. Tamao:', sizeInMB, 'MB');
      } else {
        this.showToast('- Error al guardar: ' + error.message, 'error');
        console.error('Error guardando:', error);
      }
      return false;
    }
  }

  setupEvents() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchView(btn.dataset.view));
    });

    document.getElementById('searchInput')?.addEventListener('input', () => {
      this.inventoryFocusId = null;
      this.currentPage = 1;
      this.renderInventario();
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-chip')) {
        document.querySelectorAll('.filter-chip').forEach(f => f.classList.remove('active'));
        e.target.classList.add('active');
        this.currentPage = 1;
        this.renderInventario();
      }
    });

    document.getElementById('btnIniciarConteo')?.addEventListener('click', () => this.iniciarConteo());
    document.getElementById('btnFinalizarConteo')?.addEventListener('click', () => this.finalizarConteo());

    // Listener para resize - Recalcular paginacin en modo auto
    let resizeTimeout;
    window.addEventListener('resize', () => {
      // Solo recalcular si estamos en modo auto (tanto viewMode como itemsPerPage)
      if (this.viewMode === 'auto' && this.itemsPerPage === 'auto') {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          console.log('  Recalculando paginacin responsive...');
          this.updateViewModeInfo(); // Actualizar info de dispositivo detectado
          this.currentPage = 1; // Resetear a primera pgina
          this.renderInventario();
        }, 500); // Debounce de 500ms
      }
    });
  }

  switchTab(tabName) {
    // Remover active de todas las pesta?as
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Activar la pesta?a seleccionada
    const selectedTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(tabName);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
    
    this.currentTab = tabName;
    
    // Acciones espec?ficas seg?n la pesta?a
    if (tabName === 'inventario') {
      this.renderInventario();
    } else if (tabName === 'conteo') {
      this.renderConteo();
    } else if (tabName === 'jerarquia') {
      this.renderJerarquia();
    } else if (tabName === 'mapa') {
      setTimeout(() => {
        if (mapController && mapController.currentMap) {
          mapController.render();
        }
      }, 100);
    } else if (tabName === 'analitica') {
      this.renderStats();
    } else if (tabName === 'valores') {
      this.renderValores();
    } else if (tabName === 'configuracion') {
      // TODO: Implementar módulo configuracion completo
      // if (typeof configuracion !== 'undefined') {
      //   configuracion.renderStorageUI();
      // }
      console.log('📋 TAB Configuración cargado (modo básico)');
    }
  }

  switchView(view) {
    this.currentView = view;
    
    // Actualizar botones
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.view-btn[data-view="${view}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    this.renderInventario();
  }

  async renderStats() {
    const statsGridEl = document.getElementById('statsGrid');
    const statsDetailsEl = document.getElementById('statsDetails');
    if (!statsGridEl || !statsDetailsEl) {
      return;
    }

    const formatNumber = (value, options = {}) => {
      const number = Number(value);
      return Number.isFinite(number) ? number.toLocaleString('es-ES', options) : '0';
    };

    const formatCurrency = (value) => '$' + formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formatPercent = (value, total) => {
      if (!total || total <= 0) return '0%';
      const percent = (value / total) * 100;
      return `${percent.toFixed(1)}%`;
    };

    const sanitize = (text) => {
      if (text === null || text === undefined) return '-';
      return text.toString().replace(/[&<>"']/g, (char) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[char] || char;
      });
    };

    const ensureAggregate = (map, key, template) => {
      if (!map.has(key)) {
        map.set(key, { ...template });
      }
      return map.get(key);
    };

    const summary = {
      total: 0,
      sinStock: 0,
      bajoStock: 0,
      ok: 0,
      valorTotal: 0,
      conMultimedia: 0,
      areas: new Map(),
      equipos: new Map(),
      tipos: new Map(),
      sinStockList: [],
      bajoStockList: []
    };

    this.repuestos.forEach(item => {
      const cantidad = Number(item.cantidad);
      const safeCantidad = Number.isFinite(cantidad) ? cantidad : 0;
      const minimoRaw = item.minimo ?? item.stockMinimo;
      const minimo = Number(minimoRaw);
      const threshold = Number.isFinite(minimo) && minimo > 0 ? minimo : 0;
      const precioNumber = Number(item.precio);
      const precio = Number.isFinite(precioNumber) ? precioNumber : 0;
      const valorItem = precio * Math.max(safeCantidad, 0);
      const safeValor = Number.isFinite(valorItem) ? valorItem : 0;
      const multimediaCount = Array.isArray(item.multimedia)
        ? item.multimedia.length
        : (item.multimedia ? 1 : 0);

      summary.total += 1;
      summary.valorTotal += safeValor;
      if (multimediaCount > 0) {
        summary.conMultimedia += 1;
      }

      const areaKey = (item.area && item.area.toString().trim()) ? item.area.toString().trim() : 'Sin area';
      const equipoKey = (item.equipo && item.equipo.toString().trim()) ? item.equipo.toString().trim() : 'Sin equipo';
      const tipoKey = (item.tipo && item.tipo.toString().trim()) ? item.tipo.toString().trim() : 'Sin tipo';

      const area = ensureAggregate(summary.areas, areaKey, { total: 0, valor: 0, sinStock: 0, bajoStock: 0, ok: 0 });
      const equipo = ensureAggregate(summary.equipos, equipoKey, { total: 0, valor: 0, sinStock: 0, bajoStock: 0 });
      const tipo = ensureAggregate(summary.tipos, tipoKey, { total: 0, valor: 0 });

      area.total += 1;
      area.valor += safeValor;
      equipo.total += 1;
      equipo.valor += safeValor;
      tipo.total += 1;
      tipo.valor += safeValor;

      const baseItem = {
        nombre: item.nombre || item.descripcion || 'Sin nombre',
        area: areaKey,
        equipo: equipoKey,
        cantidad: safeCantidad,
        minimo: threshold,
        valor: safeValor
      };
    if(safeCantidad <= 0) {
        summary.sinStock += 1;
        area.sinStock += 1;
        equipo.sinStock += 1;
        summary.sinStockList.push(baseItem);
      } else if (threshold > 0 && safeCantidad <= threshold) {
        summary.bajoStock += 1;
        area.bajoStock += 1;
        equipo.bajoStock += 1;
        summary.bajoStockList.push({
          ...baseItem,
          deficit: threshold - safeCantidad,
          cobertura: threshold > 0 ? (safeCantidad / threshold) : 1
        });
      } else {
        summary.ok += 1;
        area.ok += 1;
      }
    });

    const total = summary.total;
    const sinStock = summary.sinStock;
    const bajoStock = summary.bajoStock;
    const stockOk = summary.ok;
    const criticidad = sinStock + bajoStock;
    const valorTotal = summary.valorTotal;
    const valorPromedio = total > 0 ? (valorTotal / total) : 0;
    const saludStock = total > 0 ? (stockOk / total) * 100 : 0;
    const cobertura = total > 0 ? (summary.conMultimedia / total) * 100 : 0;
    const totalAreas = summary.areas.size;
    const totalEquipos = summary.equipos.size;
    const totalTipos = summary.tipos.size;

    const sinStockAreas = new Set(summary.sinStockList.map(item => item.area)).size;
    const lowStockAreas = new Set(summary.bajoStockList.map(item => item.area)).size;
    const totalLowStockValue = summary.bajoStockList.reduce((acc, item) => acc + item.valor, 0);
    const avgCoverageRaw = summary.bajoStockList.length ? summary.bajoStockList.reduce((acc, item) => acc + (item.cobertura || 0), 0) / summary.bajoStockList.length : 0;
    const avgCoveragePercent = Math.max(0, Math.min(100, avgCoverageRaw * 100));
    const avgDeficit = summary.bajoStockList.length ? summary.bajoStockList.reduce((acc, item) => acc + (item.deficit || 0), 0) / summary.bajoStockList.length : 0;
    const valorHealthy = Math.max(0, valorTotal - totalLowStockValue);

    let nivelAlerta = 'SIN DATOS';
    let colorAlerta = 'var(--gray-500)';
    if (total > 0) {
      const ratio = criticidad / total;
      if (ratio >= 0.3) {
        nivelAlerta = 'ALTO';
        colorAlerta = 'var(--danger)';
      } else if (ratio >= 0.15) {
        nivelAlerta = 'MEDIO';
        colorAlerta = 'var(--warning)';
      } else {
        nivelAlerta = 'BAJO';
        colorAlerta = 'var(--success)';
      }
    }

    if (total === 0) {
      statsGridEl.innerHTML = `
        <div class="stats-card" style="grid-column: span 2; text-align: center; padding: 24px;">
          <div class="stat-value">0</div>
          <div class="stat-label">Repuestos cargados</div>
          <div style="margin-top: 10px; color: var(--text-secondary); font-size: 0.9rem;">
            Importa o crea repuestos para visualizar las metricas.
          </div>
        </div>
      `;
      statsDetailsEl.innerHTML = `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; color: var(--text-secondary);">
          No hay datos disponibles para calcular estadisticas.
        </div>
      `;
      return;
    }

    statsGridEl.innerHTML = `
      <div class="stats-card" style="background: #5a6b7a; color: white; border: none;">
        <div class="stat-value">${formatNumber(total)}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9);">Repuestos totales</div>
        <div style="margin-top: 8px; font-size: 0.85rem; color: rgba(255,255,255,0.7);">Promedio: ${formatCurrency(valorPromedio)}</div>
      </div>
      <div class="stats-card" style="border-left: 4px solid #5a7a5a;">
        <div class="stat-value" style="color: #5a7a5a;">${formatCurrency(valorTotal)}</div>
        <div class="stat-label">Valor inventario</div>
        <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">${totalAreas} areas | ${totalEquipos} equipos | ${totalTipos} tipos</div>
      </div>
      <div class="stats-card" style="border-left: 4px solid #8a5a5a;">
        <div class="stat-value" style="color: #8a5a5a;">${formatNumber(sinStock)}</div>
        <div class="stat-label">Sin stock</div>
        <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">${formatPercent(sinStock, total)} del total</div>
      </div>
      <div class="stats-card" style="border-left: 4px solid #8a7a5a;">
        <div class="stat-value" style="color: #8a7a5a;">${formatNumber(bajoStock)}</div>
        <div class="stat-label">Stock critico</div>
        <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">${formatPercent(bajoStock, total)} del total</div>
      </div>
      <div class="stats-card" style="border-left: 4px solid #5a7a5a;">
        <div class="stat-value" style="color: #5a7a5a;">${saludStock.toFixed(1)}%</div>
        <div class="stat-label">Salud de stock</div>
        <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">Nivel: <span style="color: ${colorAlerta}; font-weight: 600;">${nivelAlerta}</span></div>
      </div>
      <div class="stats-card" style="border-left: 4px solid #6a7a8a;">
        <div class="stat-value" style="color: #6a7a8a;">${cobertura.toFixed(1)}%</div>
        <div class="stat-label">Cobertura multimedia</div>
        <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">${formatNumber(summary.conMultimedia)} con imagenes</div>
      </div>
    `;

    const branches = [
      {
        title: 'Stock saludable',
        value: stockOk,
        percent: total > 0 ? (stockOk / total) * 100 : 0,
        color: '#5a7a5a',  // Verde grisáceo
        detail: `Valor en stock: ${formatCurrency(valorHealthy)}`
      },
      {
        title: 'Stock bajo',
        value: bajoStock,
        percent: total > 0 ? (bajoStock / total) * 100 : 0,
        color: '#8a7a5a',  // Naranja grisáceo
        detail: `Cobertura media: ${avgCoveragePercent.toFixed(0)}% | Deficit medio: ${formatNumber(avgDeficit.toFixed(1))}`
      },
      {
        title: 'Sin stock',
        value: sinStock,
        percent: total > 0 ? (sinStock / total) * 100 : 0,
        color: '#8a5a5a',  // Rojo grisáceo
        detail: `Areas afectadas: ${formatNumber(sinStockAreas)}`
      }
    ];

    const createDonut = (percent, color, caption, detail) => {
      const clamped = Math.max(0, Math.min(100, percent));
      const radius = 32;
      const circumference = 2 * Math.PI * radius;
      const dashOffset = circumference * (1 - clamped / 100);
      return `
        <div class="donut-container">
          <div class="donut-chart">
            <svg viewBox="0 0 80 80" class="donut-svg">
              <circle class="donut-bg" cx="40" cy="40" r="${radius}" />
              <circle class="donut-value" cx="40" cy="40" r="${radius}" stroke="${color}"
                stroke-dasharray="${circumference.toFixed(2)}"
                stroke-dashoffset="${dashOffset.toFixed(2)}" />
            </svg>
            <div class="donut-center"><span>${clamped.toFixed(0)}%</span></div>
          </div>
          <div class="donut-caption">${caption}</div>
          <div class="donut-detail">${detail}</div>
        </div>
      `;
    };

    const flowBranches = branches.map(branch => `
      <div class="flow-branch">
        <div class="flow-branch-header">
          <span class="flow-branch-dot" style="background:${branch.color};"></span>
          <div>
            <div class="flow-branch-label">${branch.title}</div>
            <div class="flow-branch-value">${formatNumber(branch.value)} repuestos</div>
          </div>
        </div>
        ${createDonut(branch.percent, branch.color, formatPercent(branch.value, total), branch.detail)}
      </div>
    `).join('');

    const flowSection = `
      <div class="stats-flow">
        <div class="flow-header">
          <div class="flow-header-icon">&#128230;</div>
          <div>
            <div style="font-weight: 600; color: var(--text-primary);">Flujo de stock</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">Visualizacion del recorrido del inventario segun criticidad.</div>
          </div>
        </div>
        <div class="flow-layout">
          <div class="flow-node">
            <div class="flow-node-title">Inventario total</div>
            <div class="flow-node-value">${formatNumber(total)}</div>
            <div class="flow-node-sub">${formatCurrency(valorTotal)}</div>
          </div>
          <div class="flow-arrow">
            <svg width="64" height="10" viewBox="0 0 64 10" preserveAspectRatio="none">
              <line x1="0" y1="5" x2="58" y2="5" stroke="var(--border-color)" stroke-width="2" stroke-linecap="round"></line>
              <polygon points="58,1 64,5 58,9" fill="var(--border-color)"></polygon>
            </svg>
          </div>
          <div class="flow-branches">
            ${flowBranches}
          </div>
        </div>
      </div>
    `;

    const sinStockHighlights = summary.sinStockList
      .slice()
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    const bajoStockHighlights = summary.bajoStockList
      .slice()
      .sort((a, b) => {
        const ratioA = a.cobertura || 1;
        const ratioB = b.cobertura || 1;
        return ratioA - ratioB;
      })
      .slice(0, 5);

    const renderAlerts = (items, accentColor, emptyText, formatter) => {
      if (!items.length) {
        return `<div style="padding: 12px; border-radius: 10px; border: 1px dashed var(--border-color); color: var(--text-secondary); font-size: 0.85rem;">${emptyText}</div>`;
      }
      return items.map(item => formatter(item, accentColor)).join('');
    };

    const renderSinStockItem = (item, accentColor) => `
      <div style="background: var(--bg-secondary); border: 1px solid ${accentColor}; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <strong style="color: ${accentColor};">${sanitize(item.nombre)}</strong>
          <span style="font-size: 0.75rem; color: var(--text-secondary);">${sanitize(item.area)}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">Equipo: ${sanitize(item.equipo)}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">Valor comprometido: ${formatCurrency(item.valor)}</div>
      </div>
    `;

    const renderBajoStockItem = (item, accentColor) => {
      const coberturaPorc = item.cobertura !== undefined ? Math.max(0, Math.min(1, item.cobertura)) * 100 : 0;
      return `
        <div style="background: var(--bg-secondary); border: 1px solid ${accentColor}; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="color: ${accentColor};">${sanitize(item.nombre)}</strong>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">${sanitize(item.area)}</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Equipo: ${sanitize(item.equipo)}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Stock: ${formatNumber(item.cantidad)} / ${formatNumber(item.minimo)}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">Cobertura: ${coberturaPorc.toFixed(0)}% | Deficit: ${formatNumber(item.deficit)}</div>
        </div>
      `;
    };

    const areaCards = Array.from(summary.areas.entries())
      .map(([area, stats]) => ({
        area,
        ...stats,
        salud: stats.total > 0 ? (stats.ok / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6)
      .map(areaStat => {
        const totalArea = areaStat.total || 1;
        const pctOk = (areaStat.ok / totalArea) * 100;
        const pctBajo = (areaStat.bajoStock / totalArea) * 100;
        const pctSin = (areaStat.sinStock / totalArea) * 100;
        return `
          <div style="padding: 18px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-secondary); display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #5a6b7a; font-size: 1.05rem;">${sanitize(areaStat.area)}</strong>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">${formatNumber(areaStat.total)} repuestos | ${formatCurrency(areaStat.valor)}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 1.1rem; font-weight: 600; color: #5a7a5a;">${pctOk.toFixed(0)}%</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">saludable</div>
              </div>
            </div>
            <div style="display: flex; height: 8px; border-radius: 6px; overflow: hidden; background: var(--bg-tertiary);">
              <div style="width: ${pctOk}%; background: #5a7a5a;" title="${formatNumber(areaStat.ok)} OK"></div>
              <div style="width: ${pctBajo}%; background: #8a7a5a;" title="${formatNumber(areaStat.bajoStock)} Bajo stock"></div>
              <div style="width: ${pctSin}%; background: #8a5a5a;" title="${formatNumber(areaStat.sinStock)} Sin stock"></div>
            </div>
            <div style="display: flex; gap: 12px; font-size: 0.78rem;">
              <span style="color: #5a7a5a;">${formatNumber(areaStat.ok)} OK</span>
              <span style="color: #8a7a5a;">${formatNumber(areaStat.bajoStock)} Bajo</span>
              <span style="color: #8a5a5a;">${formatNumber(areaStat.sinStock)} Sin</span>
            </div>
          </div>
        `;
      })
      .join('');

    const equiposCriticos = Array.from(summary.equipos.entries())
      .map(([equipo, stats]) => ({
        equipo,
        ...stats,
        alertas: (stats.sinStock || 0) + (stats.bajoStock || 0)
      }))
      .filter(e => e.alertas > 0)
      .sort((a, b) => b.alertas - a.alertas || b.valor - a.valor)
      .slice(0, 6)
      .map(item => `
        <div style="padding: 14px; border-radius: 10px; border: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.4); display: flex; flex-direction: column; gap: 6px;">
          <strong style="color: var(--warning);">${sanitize(item.equipo)}</strong>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">
            Alertas: <span style="color: var(--danger); font-weight: 600;">${formatNumber(item.alertas)}</span> | Valor: ${formatCurrency(item.valor)}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">
            ${formatNumber(item.sinStock || 0)} sin stock | ${formatNumber(item.bajoStock || 0)} bajo stock
          </div>
        </div>
      `)
      .join('');

    const healthSection = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
        <h3 style="margin-bottom: 16px; color: var(--primary); display: flex; align-items: center; gap: 10px;">Salud general del inventario</h3>
        <div style="margin-bottom: 16px;">
          <div style="display: flex; height: 12px; border-radius: 6px; overflow: hidden;">
            <div style="width: ${(stockOk / total) * 100}%; background: var(--success);" title="${formatNumber(stockOk)} OK"></div>
            <div style="width: ${(bajoStock / total) * 100}%; background: var(--warning);" title="${formatNumber(bajoStock)} Bajo stock"></div>
            <div style="width: ${(sinStock / total) * 100}%; background: var(--danger);" title="${formatNumber(sinStock)} Sin stock"></div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-size: 0.82rem; color: var(--text-secondary);">
          <div><strong style="color: var(--success);">${formatPercent(stockOk, total)}</strong> inventario saludable</div>
          <div><strong style="color: var(--warning);">${formatPercent(bajoStock, total)}</strong> en nivel bajo</div>
          <div><strong style="color: var(--danger);">${formatPercent(sinStock, total)}</strong> sin stock</div>
          <div><strong style="color: ${colorAlerta};">${nivelAlerta}</strong> nivel de alerta</div>
          <div><strong>${formatNumber(totalAreas + totalEquipos + totalTipos)}</strong> clasificaciones unicas</div>
          <div><strong>${formatPercent(summary.conMultimedia, total)}</strong> cobertura multimedia</div>
        </div>
      </div>
    `;

    const alertsSection = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
        <h3 style="margin-bottom: 16px; color: #5a6b7a; display: flex; align-items: center; gap: 10px;">Alertas rapidas</h3>
        <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
          <div>
            <h4 style="margin-bottom: 12px; color: #8a5a5a;">Sin stock (${formatNumber(sinStock)})</h4>
            ${renderAlerts(sinStockHighlights, '#8a5a5a', 'No hay repuestos en estado critico.', renderSinStockItem)}
          </div>
          <div>
            <h4 style="margin-bottom: 12px; color: #8a7a5a;">Stock bajo (${formatNumber(bajoStock)})</h4>
            ${renderAlerts(bajoStockHighlights, '#8a7a5a', 'No hay repuestos con stock bajo.', renderBajoStockItem)}
            <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-secondary);">Promedio de coberturas: ${avgCoveragePercent.toFixed(0)}% | Areas afectadas: ${formatNumber(lowStockAreas)}</div>
          </div>
        </div>
      </div>
    `;

    const areaSection = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
        <h3 style="margin-bottom: 16px; color: var(--primary); display: flex; align-items: center; gap: 10px;">Areas con mayor movimiento</h3>
        <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
          ${areaCards || "<div style='color: var(--text-secondary); font-size: 0.9rem;'>No hay areas registradas.</div>"}
        </div>
      </div>
    `;

    const equiposSection = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
        <h3 style="margin-bottom: 16px; color: var(--primary); display: flex; align-items: center; gap: 10px;">Equipos con alertas</h3>
        <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
          ${equiposCriticos || "<div style='color: var(--text-secondary); font-size: 0.9rem;'>No hay equipos con alertas activas.</div>"}
        </div>
      </div>
    `;

    statsDetailsEl.innerHTML = `
      <div class="stats-sections">
        ${flowSection}
        ${healthSection}
        ${alertsSection}
        ${areaSection}
        ${equiposSection}
      </div>
    `;
  }

  exportJSON() {
    if (this.repuestos.length === 0) {
      this.showToast('  No hay datos para exportar', 'warning');
      return;
    }

    try {
      const data = {
        repuestos: this.repuestos,
        mapa: this.mapObjects,
        fecha: new Date().toISOString(),
        version: '2.0'
      };

      console.log('Exportando JSON con', this.repuestos.length, 'repuestos');
      
      const jsonString = JSON.stringify(data, null, 2);
      const sizeInMB = (jsonString.length / (1024 * 1024)).toFixed(2);
      
      console.log('Tamao del archivo:', sizeInMB, 'MB');
      
      // Mostrar informacin sobre el tamao
      if (parseFloat(sizeInMB) > 10) {
        this.showToast(`Exportando archivo grande (${sizeInMB}MB)...`, 'info');
      }
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventario_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);

      this.showToast(`JSON exportado (${sizeInMB}MB)`, 'success');
      console.log('Exportacin completada:', sizeInMB, 'MB');
    } catch (error) {
      console.error('Error exportando JSON:', error);
      this.showToast('- Error al exportar: ' + error.message, 'error');
    }
  }

  exportJSONSinImagenes() {
    if (this.repuestos.length === 0) {
      this.showToast('  No hay datos para exportar', 'warning');
      return;
    }

    try {
      // Crear copia de repuestos SIN multimedia
      const repuestosSinImagenes = this.repuestos.map(r => ({
        id: r.id,
        codSAP: r.codSAP,
        codProv: r.codProv,
        tipo: r.tipo,
        nombre: r.nombre,
        area: r.area,
        equipo: r.equipo,
        cantidad: r.cantidad,
        minimo: r.minimo,
        precio: r.precio,
        multimedia: [] // Vaco - sin imgenes
      }));

      const data = {
        repuestos: repuestosSinImagenes,
        mapa: this.mapObjects,
        fecha: new Date().toISOString(),
        version: '2.0',
        nota: '  EXPORTACIN SIN IMGENES - Datos reducidos para navegador'
      };

      const jsonString = JSON.stringify(data, null, 2);
      const sizeInMB = (jsonString.length / (1024 * 1024)).toFixed(2);
      
      console.log('Exportando SIN imgenes:', sizeInMB, 'MB');
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventario_SIN_IMAGENES_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);

      this.showToast(`- JSON sin imgenes exportado (${sizeInMB}MB) - ${this.repuestos.length} repuestos`, 'success', 6000);
      console.log('- Exportacin SIN imgenes completada:', sizeInMB, 'MB');
    } catch (error) {
      console.error('Error exportando JSON sin imgenes:', error);
      this.showToast('- Error al exportar: ' + error.message, 'error');
    }
  }

  importJSON(event) {
    const file = event.target.files[0];
    if (!file) {
      console.log('No se seleccion archivo para importar');
      return;
    }

    console.log('Importando archivo:', file.name, file.size);
    
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    
    // Advertencia informativa pero no bloqueante
    if (fileSizeInMB > 50) {
      if (!confirm(`Archivo muy grande (${fileSizeInMB}MB).\n\n  Esto podra tardar varios segundos.\n\n- El sistema soporta archivos grandes.\n\nContinuar con la importacin?`)) {
        event.target.value = '';
        return;
      }
    } else if (fileSizeInMB > 10) {
      this.showToast(`Importando ${fileSizeInMB}MB - Puede tardar unos segundos...`, 'info');
    }

    this.showToast('  Importando datos...', 'info');
    
    const reader = new FileReader();
    reader.onerror = (e) => {
      console.error('Error leyendo archivo:', e);
      this.showToast('- Error al leer archivo', 'error');
      event.target.value = '';
    };
    reader.onload = (e) => {
      try {
        console.log('Parseando JSON...');
        const data = JSON.parse(e.target.result);
        
        let repuestosList = [];
        if (data.repuestos && Array.isArray(data.repuestos)) {
          repuestosList = data.repuestos;
          console.log('Formato: objeto con propiedad repuestos');
        } else if (Array.isArray(data)) {
          repuestosList = data;
          console.log('Formato: array directo');
        } else {
          console.error('Formato no reconocido:', typeof data);
          this.showToast('  Formato invlido', 'warning');
          event.target.value = '';
          return;
        }

        console.log('Repuestos encontrados:', repuestosList.length);

        if (!confirm(`Importar ${repuestosList.length} repuestos- Esto reemplazar los datos actuales.`)) {
          event.target.value = '';
          return;
        }

        this.repuestos = repuestosList.map((item, index) => {
          const repuesto = {
            id: item.id || `imported-${Date.now()}-${index}`,
            codSAP: item.codSAP || '',
            codProv: item.codProv || '',
            tipo: item.tipo || '',
            nombre: item.nombre || item.tipo || '',
            area: item.area || 'General',
            equipo: item.equipo || 'Sin equipo',
            cantidad: parseInt(item.cantidad) || 0,
            minimo: parseInt(item.minimo || item.stockMinimo) || 5,
            precio: parseFloat(item.precio) || 0,
            multimedia: item.multimedia || []
          };
          
          console.log(`- Item ${index + 1}: ${repuesto.nombre} (ID: ${repuesto.id}, Multimedia: ${repuesto.multimedia.length})`);
          return repuesto;
        });

        if (data.mapa && Array.isArray(data.mapa)) {
          this.mapObjects = data.mapa;
          localStorage.setItem('mapData', JSON.stringify(this.mapObjects));
          console.log('Objetos de mapa importados:', this.mapObjects.length);
        }

        console.log('Guardando datos...');
        this.saveData();
        this.updateAutocompleteData();
        this.render();
        this.renderFilters();
        
        console.log('Importacin completada exitosamente');
        this.showToast(`- ${this.repuestos.length} repuestos importados`, 'success');
      } catch (error) {
        console.error('Error durante importacin:', error);
        this.showToast('- Error al importar: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  exportExcel() {
    if (this.repuestos.length === 0) {
      this.showToast('  No hay datos para exportar', 'warning');
      return;
    }

    try {
      console.log('Exportando Excel profesional con', this.repuestos.length, 'repuestos');
      
      // HOJA 1: INVENTARIO COMPLETO
      const inventarioData = this.repuestos.map(r => ({
        'Cdigo SAP': r.codSAP || '',
        ' - Cdigo Proveedor': r.codProv || '',
        'Tipo': r.tipo || '',
        'Nombre': r.nombre || '',
        'rea': r.area || '',
        'Equipo': r.equipo || '',
        'Cantidad': r.cantidad || 0,
        '  Stock Mnimo': r.minimo || 5,
        'Precio Unitario': r.precio || 0,
        '  Valor Total': (r.precio || 0) * (r.cantidad || 0),
        '  Estado': r.cantidad === 0 ? 'SIN STOCK' : 
                     r.cantidad <= (r.minimo || 5) ? 'STOCK BAJO' : 'OK',
        ' - Multimedia': (r.multimedia || []).length,
        'Documentos': (r.multimedia || []).filter(m => m.type === 'document').length
      }));

      // HOJA 2: RESUMEN Y ESTADSTICAS
      const sinStock = this.repuestos.filter(r => r.cantidad === 0).length;
      const stockBajo = this.repuestos.filter(r => r.cantidad > 0 && r.cantidad <= (r.minimo || 5)).length;
      const stockOk = this.repuestos.length - sinStock - stockBajo;
      const valorTotal = this.repuestos.reduce((sum, r) => sum + ((r.precio || 0) * (r.cantidad || 0)), 0);
      
      const resumenData = [
        { 'Indicador': 'Total Repuestos', 'Valor': this.repuestos.length },
        { 'Indicador': '- Stock OK', 'Valor': stockOk },
        { 'Indicador': '  Stock Bajo', 'Valor': stockBajo },
        { 'Indicador': '  Sin Stock', 'Valor': sinStock },
        { 'Indicador': '', 'Valor': '' },
        { 'Indicador': 'Valor Total Inventario', 'Valor': `$${valorTotal.toFixed(2)}` },
        { 'Indicador': 'Valor Promedio por Repuesto', 'Valor': `$${(valorTotal / this.repuestos.length).toFixed(2)}` },
        { 'Indicador': '', 'Valor': '' },
        { 'Indicador': '  Fecha de Exportacin', 'Valor': new Date().toLocaleDateString('es-ES', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
          hour: '2-digit', minute: '2-digit' 
        }) }
      ];

      //   HOJA 3: REPUESTOS POR REA
      const areaStats = {};
      this.repuestos.forEach(r => {
        if (!areaStats[r.area]) {
          areaStats[r.area] = { cantidad: 0, valor: 0, sinStock: 0 };
        }
        areaStats[r.area].cantidad++;
        areaStats[r.area].valor += (r.precio || 0) * (r.cantidad || 0);
        if (r.cantidad === 0) areaStats[r.area].sinStock++;
      });
      
      const areaData = Object.entries(areaStats).map(([area, stats]) => ({
        'rea': area,
        'Total Repuestos': stats.cantidad,
        '  Sin Stock': stats.sinStock,
        'Valor Total': `$${stats.valor.toFixed(2)}`
      }));

      // HOJA 4: REPUESTOS POR EQUIPO
      const equipoStats = {};
      this.repuestos.forEach(r => {
        if (!equipoStats[r.equipo]) {
          equipoStats[r.equipo] = { cantidad: 0, valor: 0, stockBajo: 0 };
        }
        equipoStats[r.equipo].cantidad++;
        equipoStats[r.equipo].valor += (r.precio || 0) * (r.cantidad || 0);
        if (r.cantidad <= (r.minimo || 5)) equipoStats[r.equipo].stockBajo++;
      });
      
      const equipoData = Object.entries(equipoStats).map(([equipo, stats]) => ({
        'Equipo': equipo,
        'Total Repuestos': stats.cantidad,
        '  Stock Bajo/Sin Stock': stats.stockBajo,
        'Valor Total': `$${stats.valor.toFixed(2)}`
      }));

      //   HOJA 5: ALERTAS (Sin Stock y Stock Bajo)
      const alertasData = this.repuestos
        .filter(r => r.cantidad <= (r.minimo || 5))
        .map(r => ({
          '  Prioridad': r.cantidad === 0 ? 'CRTICA' : 'MEDIA',
          'Cdigo SAP': r.codSAP || '',
          'Nombre': r.nombre,
          'Stock Actual': r.cantidad,
          '  Stock Mnimo': r.minimo || 5,
          '  Dficit': (r.minimo || 5) - r.cantidad,
          'rea': r.area,
          'Equipo': r.equipo
        }))
        .sort((a, b) => a['Stock Actual'] - b['Stock Actual']);

      //   CREAR LIBRO DE EXCEL
      const wb = XLSX.utils.book_new();
      
      // Agregar hojas
      const ws1 = XLSX.utils.json_to_sheet(inventarioData);
      const ws2 = XLSX.utils.json_to_sheet(resumenData);
      const ws3 = XLSX.utils.json_to_sheet(areaData);
      const ws4 = XLSX.utils.json_to_sheet(equipoData);
      const ws5 = XLSX.utils.json_to_sheet(alertasData);
      
      // Configurar anchos de columnas
      ws1['!cols'] = [
        { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 30 }, { wch: 15 },
        { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 10 }, { wch: 10 }
      ];
      ws2['!cols'] = [{ wch: 35 }, { wch: 25 }];
      ws3['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
      ws4['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
      ws5['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 20 }];
      
      //   HOJA 6: ESTADO DEL STOCK (Grfico Circular)
      const grafEstadoStock = [
        { 'Categora': 'Stock OK', 'Cantidad': stockOk, 'Porcentaje': parseFloat(((stockOk / this.repuestos.length) * 100).toFixed(1)) },
        { 'Categora': 'Stock Bajo', 'Cantidad': stockBajo, 'Porcentaje': parseFloat(((stockBajo / this.repuestos.length) * 100).toFixed(1)) },
        { 'Categora': 'Sin Stock', 'Cantidad': sinStock, 'Porcentaje': parseFloat(((sinStock / this.repuestos.length) * 100).toFixed(1)) }
      ];
      
      const ws6 = XLSX.utils.json_to_sheet(grafEstadoStock);
      ws6['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }];
      
      //   HOJA 7: TOP REAS (Grfico de Barras)
      const topAreas = Object.entries(areaStats)
        .sort((a, b) => b[1].cantidad - a[1].cantidad)
        .slice(0, 10)
        .map(([area, stats]) => ({
          'rea': area,
          'Total Repuestos': stats.cantidad,
          'Sin Stock': stats.sinStock,
          'Valor': parseFloat(stats.valor.toFixed(2))
        }));
      
      const ws7 = XLSX.utils.json_to_sheet(topAreas);
      ws7['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
      
      //   HOJA 8: TOP EQUIPOS (Grfico de Barras Horizontal)
      const topEquipos = Object.entries(equipoStats)
        .sort((a, b) => b[1].valor - a[1].valor)
        .slice(0, 10)
        .map(([equipo, stats]) => ({
          'Equipo': equipo,
          'Valor Total': parseFloat(stats.valor.toFixed(2)),
          'Cantidad': stats.cantidad,
          'Alertas': stats.stockBajo
        }));
      
      const ws8 = XLSX.utils.json_to_sheet(topEquipos);
      ws8['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
      
      //   HOJA 9: DISTRIBUCIN POR TIPO (Grfico Circular)
      const tipoStats = {};
      this.repuestos.forEach(r => {
        const tipo = r.tipo || 'Sin Tipo';
        if (!tipoStats[tipo]) {
          tipoStats[tipo] = { cantidad: 0, valor: 0 };
        }
        tipoStats[tipo].cantidad++;
        tipoStats[tipo].valor += (r.precio || 0) * (r.cantidad || 0);
      });
      
      const grafTipos = Object.entries(tipoStats)
        .sort((a, b) => b[1].cantidad - a[1].cantidad)
        .map(([tipo, stats]) => ({
          'Tipo': tipo,
          'Cantidad': stats.cantidad,
          'Porcentaje': parseFloat(((stats.cantidad / this.repuestos.length) * 100).toFixed(1)),
          'Valor': parseFloat(stats.valor.toFixed(2))
        }));
      
      const ws9 = XLSX.utils.json_to_sheet(grafTipos);
      ws9['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
      
      //   HOJA 10: TOP REPUESTOS MS VALIOSOS (Grfico de Barras)
      const topValiosos = this.repuestos
        .map(r => ({
          nombre: r.nombre,
          codSAP: r.codSAP || '',
          valor: (r.precio || 0) * (r.cantidad || 0),
          cantidad: r.cantidad,
          precio: r.precio || 0
        }))
        .filter(r => r.valor > 0) // Solo los que tienen valor
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 15)
        .map(r => ({
          'Repuesto': r.nombre.substring(0, 35),
          'Cdigo SAP': r.codSAP,
          'Valor Total': parseFloat(r.valor.toFixed(2)),
          'Cantidad': r.cantidad,
          'Precio Unit': parseFloat(r.precio.toFixed(2))
        }));
      
      const ws10 = XLSX.utils.json_to_sheet(topValiosos);
      ws10['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
      
      XLSX.utils.book_append_sheet(wb, ws1, 'Inventario');
      XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');
      XLSX.utils.book_append_sheet(wb, ws3, '  Por rea');
      XLSX.utils.book_append_sheet(wb, ws4, 'Por Equipo');
      XLSX.utils.book_append_sheet(wb, ws5, '- Alertas');
      XLSX.utils.book_append_sheet(wb, ws6, '- Graf-Estado Stock');
      XLSX.utils.book_append_sheet(wb, ws7, '  Graf-Top reas');
      XLSX.utils.book_append_sheet(wb, ws8, '  Graf-Top Equipos');
      XLSX.utils.book_append_sheet(wb, ws9, '- Graf-Por Tipo');
      XLSX.utils.book_append_sheet(wb, ws10, '  Graf-Top Valiosos');
      
      // Generar archivo
      const fechaHora = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `Inventario_${fechaHora}.xlsx`;
      
      XLSX.writeFile(wb, filename);
      
      this.showToast(`- Excel exportado con 10 hojas: ${filename}`, 'success', 4000);
      console.log('- Exportacin Excel completada:', filename);
      console.log(`   Inventario: ${inventarioData.length} repuestos`);
      console.log(`   Resumen: KPIs generales`);
      console.log(`     Por rea: ${areaData.length} reas`);
      console.log(`   Por Equipo: ${equipoData.length} equipos`);
      console.log(`     Alertas: ${alertasData.length} alertas`);
      console.log(`     Grficos: 5 hojas listas para visualizar`);
      
    } catch (error) {
      console.error('- Error exportando Excel:', error);
      this.showToast('- Error al exportar: ' + error.message, 'error');
    }
  }

  togglePrecio() {
    const checkbox = document.getElementById('togglePrecio');
    this.showPrecio = checkbox.checked;
    this.render();
  }

  showStorageInfo() {
    const dataString = JSON.stringify(this.repuestos);
    const sizeInMB = (dataString.length / (1024 * 1024)).toFixed(2);
    const totalImages = this.repuestos.reduce((sum, r) => sum + (r.multimedia ? r.multimedia.filter(m => m.type === 'image').length : 0), 0);
    const totalDocs = this.repuestos.reduce((sum, r) => sum + (r.multimedia ? r.multimedia.filter(m => m.type === 'document').length : 0), 0);
    
    // Detectar si est en modo FileSystem
    const isFileSystemMode = fsManager && fsManager.isFileSystemMode;
    
    const bgCard = '#1e293b';
    const textColor = '#f8fafc';
    const borderColor = '#334155';
    const bgSection = '#0f172a';
    const textSecondary = '#cbd5e1';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    
    modal.innerHTML = `
      <div style="background: ${bgCard}; border-radius: 16px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 32px; border: 2px solid ${borderColor};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="color: #60a5fa; margin: 0;">Informacin de Almacenamiento</h2>
          <button onclick="this.closest('div[style*=fixed]').remove()" style="background: #334155; border: none; font-size: 1.5rem; cursor: pointer; color: ${textColor}; width: 36px; height: 36px; border-radius: 8px; transition: all 0.2s;">?</button>
        </div>
        
        ${isFileSystemMode ? `
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);">
          <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 2rem;">8</span> MODO CARPETA ACTIVO
          </div>
          <div style="font-size: 0.95rem; opacity: 0.95;">  Carpeta: ${fsManager.folderPath || 'Conectada'}</div>
          <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 6px;">- Capacidad ilimitada | Datos en disco</div>
        </div>
        
        <div style="background: ${bgSection}; padding: 16px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #10b981;">
          <div style="font-size: 1.2rem; font-weight: 600; color: ${textColor}; margin-bottom: 4px;">Solo Metadata en Memoria</div>
          <div style="font-size: 2rem; font-weight: 700; color: #10b981;">${sizeInMB} MB</div>
          <div style="color: ${textSecondary}; font-size: 0.85rem; margin-top: 4px;">Las imgenes NO cuentan para este tamao</div>
        </div>
        ` : `
        <div style="background: ${bgSection}; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
          <div style="font-size: 2.5rem; font-weight: 700; color: #60a5fa; margin-bottom: 8px;">${sizeInMB} MB</div>
          <div style="color: ${textColor}; font-size: 1.1rem; font-weight: 600;">Tamao en LocalStorage</div>
          <div style="color: ${textSecondary}; font-size: 0.85rem; margin-top: 4px;">  Lmite: ~10MB | Incluye imgenes en base64</div>
        </div>
        `}
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div style="background: ${bgSection}; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid ${borderColor};">
            <div style="font-size: 1.8rem; font-weight: 700; color: #60a5fa;">${this.repuestos.length}</div>
            <div style="color: ${textColor}; font-size: 0.9rem; margin-top: 4px;">Repuestos</div>
          </div>
          <div style="background: ${bgSection}; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid ${borderColor};">
            <div style="font-size: 1.8rem; font-weight: 700; color: #22d3ee;">${totalImages}</div>
            <div style="color: ${textColor}; font-size: 0.9rem; margin-top: 4px;">Imgenes</div>
          </div>
          <div style="background: ${bgSection}; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid ${borderColor};">
            <div style="font-size: 1.8rem; font-weight: 700; color: #fbbf24;">${totalDocs}</div>
            <div style="color: ${textColor}; font-size: 0.9rem; margin-top: 4px;">Documentos</div>
          </div>
        </div>
        
        ${isFileSystemMode ? `
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 8px;">8 MODO CARPETA - SIN LMITES</div>
          <div style="font-size: 0.95rem; line-height: 1.6;">
            - <strong>Capacidad ilimitada:</strong> 1,000+ imgenes sin problema<br>
              <strong>Almacenamiento:</strong> inventario.json + carpeta imagenes/<br>
            <strong>Portable:</strong> Copia la carpeta completa a otro PC<br>
            <strong>Imgenes:</strong> Archivos WebP en disco (no en memoria)<br>
              <strong>Sin lmites:</strong> Solo depende del espacio en disco
          </div>
        </div>
        
        <div style="background: var(--info); color: white; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 8px;">Cmo llevar tu inventario a otro PC?</div>
          <div style="font-size: 0.95rem; line-height: 1.6;">
            <strong>1.</strong> Copia la carpeta completa donde seleccionaste guardar<br>
            <strong>2.</strong> Llvala a otro PC (USB, nube, red)<br>
            <strong>3.</strong> Abre este HTML y activa "Modo Carpeta"<br>
            <strong>4.</strong> Selecciona la carpeta copiada<br>
            <strong>5.</strong> Listo! Todo tu inventario estar disponible
          </div>
        </div>
        ` : `
        <div style="background: var(--info); color: white; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 8px;">INFO Lmites del Sistema</div>
          <div style="font-size: 0.95rem; line-height: 1.6;">
             LocalStorage: ~5-10MB segn navegador<br>
             Archivos JSON: Sin lmite (exportar/importar)<br>
             <strong>Imgenes: Formato WebP</strong> (mejor que JPEG)<br>
             Compresin inteligente: 800px, calidad 85%, ~100KB<br>
             Sistema optimizado para 500+ repuestos con fotos
          </div>
        </div>
        
        <div style="background: var(--success); color: white; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 8px;">- Tecnologa de Compresin</div>
          <div style="font-size: 0.95rem; line-height: 1.6;">
            <strong>WebP:</strong> 30% ms ligero que JPEG con mejor calidad<br>
            <strong>Fallback:</strong> JPEG de alta calidad si WebP no disponible<br>
            <strong>Optimizacin:</strong> 800px mx, calidad adaptativa 85-50%<br>
            <strong>Resultado:</strong> Imgenes ntidas de ~100KB<br>
            <strong>Reduccin tpica:</strong> 80-95% del tamao original
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 8px;">  Muchas imgenes- Activa MODO CARPETA</div>
          <div style="font-size: 0.95rem; line-height: 1.6;">
            Click en <strong>"  Modo Carpeta"</strong> (esquina inferior derecha)<br>
            - Capacidad ILIMITADA | Portable | Sin lmites de 10MB
          </div>
        </div>
        `}
        
        <div style="background: var(--warning); color: white; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 8px;">  Tip Profesional</div>
          <div style="font-size: 0.95rem; line-height: 1.6;">
            <strong>Para archivos muy grandes (>50MB):</strong><br>
             El sistema los soporta sin problemas<br>
             La importacin puede tardar 5-10 segundos<br>
             Todo se mantiene embebido en el HTML+JSON<br>
             Puedes tener cientos de fotos sin problema<br>
             Solo el LocalStorage temporal tiene lmite
          </div>
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button onclick="app.exportJSON(); this.closest('div[style*=fixed]').remove();" style="flex: 1; padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem; transition: all 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
            Exportar Ahora
          </button>
          <button onclick="this.closest('div[style*=fixed]').remove();" style="flex: 1; padding: 14px; background: #334155; color: ${textColor}; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem; transition: all 0.2s;" onmouseover="this.style.background='#475569'" onmouseout="this.style.background='#334155'">
            Cerrar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  diagnosticIDs() {
    console.log('\n========== DIAGNSTICO DE IDs ==========');
    console.log(`Total de repuestos: ${this.repuestos.length}\n`);
    
    const problemas = [];
    const idsMap = new Map();
    
    this.repuestos.forEach((r, index) => {
      const idInfo = {
        index: index,
        id: r.id,
        tipo: typeof r.id,
        nombre: r.nombre || 'Sin nombre',
        codSAP: r.codSAP || 'Sin cdigo',
        multimedia: r.multimedia?.length || 0
      };
      
      console.log(`[${index}] ID: "${r.id}" (${typeof r.id})`);
      console.log(`     ${r.codSAP} - ${r.nombre}`);
      console.log(`     Multimedia: ${r.multimedia?.length || 0} items`);
      
      // Detectar problemas
      if (!r.id) {
        problemas.push(`- Repuesto ${index} sin ID: ${r.nombre}`);
      } else if (r.id === 'undefined' || r.id === 'null') {
        problemas.push(`  Repuesto ${index} con ID invlido: ${r.id}`);
      } else if (idsMap.has(r.id)) {
        problemas.push(`  ID duplicado "${r.id}": ndices ${idsMap.get(r.id)} y ${index}`);
      }
      
      idsMap.set(r.id, index);
    });
    
    console.log('\nRESUMEN:');
    console.log(`- IDs nicos: ${idsMap.size}`);
    console.log(`Total repuestos: ${this.repuestos.length}`);
    console.log(`  Problemas encontrados: ${problemas.length}`);
    
    if (problemas.length > 0) {
      console.log('\n  PROBLEMAS DETECTADOS:');
      problemas.forEach(p => console.log(p));
      
      const fixear = confirm(`Se encontraron ${problemas.length} problema(s) con los IDs.\n\nQuieres regenerar todos los IDs automticamente?\n\n(Esto solucionar los problemas pero cambiar los IDs)`);
      
      if (fixear) {
        console.log('\nRegenerando IDs...');
        this.repuestos = this.repuestos.map((r, i) => {
          const oldId = r.id;
          r.id = `repuesto-${Date.now()}-${i}`;
          console.log(`  "${oldId}" - "${r.id}"`);
          return r;
        });
        
        this.saveData();
        this.render();
        this.showToast('- IDs regenerados correctamente', 'success');
        console.log('- IDs regenerados y guardados');
      }
    } else {
      console.log('- No se encontraron problemas');
      this.showToast('- Todos los IDs estn correctos', 'success');
    }
    
    console.log('========== FIN DIAGNSTICO ==========\n');
  }

  showExportMenu() {
    const menu = document.createElement('div');
    menu.style.cssText = 'position: fixed; top: 80px; right: 20px; background: var(--bg-secondary); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(59, 130, 246, 0.3); padding: 8px; z-index: 10000; min-width: 220px; border: 1px solid var(--border-color);';
    
    const btnStyle = `width: 100%; padding: 12px; background: transparent; border: none; text-align: left; cursor: pointer; border-radius: 8px; font-weight: 600; color: var(--text-primary); transition: all 0.2s;`;
    const hoverBg = 'var(--bg-tertiary)';
    
    // Mostrar opcin de limpieza solo si FileSystem est activo
    const cleanBtn = fsManager.isFileSystemMode ? `
      <div style="border-top: 1px solid var(--border-color); margin: 4px 0; padding-top: 4px;">
        <button onclick="app.cleanOrphanImages(); this.parentElement.parentElement.remove();" style="${btnStyle} color: #f59e0b;" onmouseover="this.style.background='${hoverBg}'" onmouseout="this.style.background='transparent'">
           - Limpiar Imgenes Hurfanas
        </button>
      </div>
    ` : '';
    
    menu.innerHTML = `
      <button onclick="app.exportJSON(); this.parentElement.remove();" style="${btnStyle}" onmouseover="this.style.background='${hoverBg}'" onmouseout="this.style.background='transparent'">
          Exportar JSON
      </button>
      <button onclick="app.exportExcel(); this.parentElement.remove();" style="${btnStyle}" onmouseover="this.style.background='${hoverBg}'" onmouseout="this.style.background='transparent'">
          Exportar Excel
      </button>
      ${cleanBtn}
    `;
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 100);
  }

  async cleanOrphanImages() {
    if (!fsManager.isFileSystemMode) {
      this.showToast('  Funcin solo disponible en modo FileSystem', 'warning');
      return;
    }
    
    const confirm1 = confirm(
      '  Limpieza de Imgenes Hurfanas\n\n' +
      'Esta funcin buscar y eliminar imgenes que estn en la carpeta\n' +
      'pero que ya no estn vinculadas a ningn producto.\n\n' +
      '  Esta accin NO se puede deshacer.\n\n' +
      'Deseas continuar?'
    );
    
    if (!confirm1) return;
    
    this.showToast('  Analizando carpeta de imgenes...', 'info', 3000);
    
    try {
      const result = await fsManager.cleanOrphanImages(this.repuestos);
      
      if (result.orphans === 0) {
        this.showToast('- No se encontraron imgenes hurfanas. Carpeta limpia.', 'success', 5000);
        return;
      }
      
      const sizeMB = (result.size / 1024 / 1024).toFixed(2);
      
      const message = 
        ` - Limpieza completada:\n\n` +
        ` Imgenes hurfanas: ${result.orphans}\n` +
        ` Eliminadas exitosamente: ${result.deleted}\n` +
        ` Errores: ${result.failed}\n` +
        ` Espacio liberado: ${sizeMB} MB\n\n` +
        `- Tu carpeta est ms limpia y optimizada.`;
      
      alert(message);
      this.showToast(`- ${result.deleted} imgenes hurfanas eliminadas (${sizeMB} MB liberados)`, 'success', 6000);
      
    } catch (error) {
      console.error('Error en limpieza:', error);
      this.showToast('- Error durante la limpieza: ' + error.message, 'error');
    }
  }

  showToast(msg, type = 'info', customDuration = null) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = msg;
    
    // Color del borde segn tipo
    const borderColor = type === 'success' ? '#10b981' : 
                        type === 'warning' ? '#f59e0b' : 
                        type === 'error' ? '#ef4444' : 
                        '#3b82f6';
    
    toast.style.borderLeftColor = borderColor;
    
    //   APILAMIENTO: Calcular posicin segn toasts existentes
    const existingToasts = document.querySelectorAll('.toast');
    let totalOffset = 20; // Offset inicial desde abajo
    
    existingToasts.forEach(existingToast => {
      const height = existingToast.offsetHeight || 60; // altura estimada
      totalOffset += height + 12; // 12px de separacin entre toasts
    });
    
    toast.style.bottom = `${totalOffset}px`;
    
    document.body.appendChild(toast);
    
    // Duracin: usar customDuration si se proporciona, sino segn tipo
    const duration = customDuration || (type === 'error' ? 5000 : 3000);
    
    // Remover con animacin
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        toast.remove();
        // Reajustar posiciones de toasts restantes
        this.repositionToasts();
      }, 300);
    }, duration);
  }

  repositionToasts() {
    const toasts = document.querySelectorAll('.toast');
    let offset = 20;
    
    toasts.forEach(toast => {
      toast.style.bottom = `${offset}px`;
      const height = toast.offsetHeight || 60;
      offset += height + 12;
    });
  }

  // Método principal de renderizado
  async render() {
    if (this.currentTab === 'inventario') {
      await this.renderInventario();
    } else if (this.currentTab === 'conteo') {
      this.renderConteo();
    } else if (this.currentTab === 'jerarquia') {
      this.renderJerarquia();
    } else if (this.currentTab === 'analitica') {
      await this.renderStats();
    } else if (this.currentTab === 'valores') {
      this.renderValores();
    }
  }

  // Renderizar vista de inventario
  async renderInventario() {
    const cardsContainer = document.getElementById('cardsGrid');
    const listContainer = document.getElementById('listView');
    
    if (!cardsContainer || !listContainer) {
      console.warn('Containers cardsGrid o listView no encontrados');
      return;
    }

    // Aplicar filtros desde los dropdowns
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterArea = document.getElementById('filterArea')?.value || '';
    const filterEquipo = document.getElementById('filterEquipo')?.value || '';
    const filterTipo = document.getElementById('filterTipo')?.value || '';
    const filterStock = document.getElementById('filterStock')?.value || '';

    let filtered = this.repuestos.filter(r => {
      // Filtro de búsqueda
      const matchSearch = !searchTerm || 
        (r.nombre && r.nombre.toLowerCase().includes(searchTerm)) ||
        (r.codSAP && r.codSAP.toLowerCase().includes(searchTerm)) ||
        (r.codProv && r.codProv.toLowerCase().includes(searchTerm)) ||
        (r.area && r.area.toLowerCase().includes(searchTerm)) ||
        (r.equipo && r.equipo.toLowerCase().includes(searchTerm));

      // Filtro de área
      const matchArea = !filterArea || (r.area || r.areaGeneral) === filterArea;
      
      // Filtro de equipo
      const matchEquipo = !filterEquipo || (r.equipo || r.sistemaEquipo) === filterEquipo;
      
      // Filtro de tipo
      const matchTipo = !filterTipo || r.tipo === filterTipo;

      // Filtro de stock
      let matchStock = true;
      if (filterStock) {
        const cantidad = r.cantidad || 0;
        const minimo = r.minimo || 0;
        const optimo = r.optimo || (minimo * 2);
        
        if (filterStock === 'agotado') {
          matchStock = cantidad === 0;
        } else if (filterStock === 'critico') {
          matchStock = cantidad > 0 && cantidad < minimo;
        } else if (filterStock === 'adecuado') {
          matchStock = cantidad >= minimo && cantidad < optimo;
        } else if (filterStock === 'optimo') {
          matchStock = cantidad >= optimo;
        }
      }

      return matchSearch && matchArea && matchEquipo && matchTipo && matchStock;
    });

    this.filteredRepuestos = filtered;

    // Resetear a página 1 cuando cambian filtros
    if (!this.currentPage) this.currentPage = 1;

    // Renderizar según la vista activa
    if (this.currentView === 'cards') {
      cardsContainer.style.display = 'grid';
      listContainer.style.display = 'none';
      
      // PAGINACIÓN: 18 items por página (6 columnas x 3 filas)
      const itemsPerPage = 18;
      const startIndex = (this.currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedItems = filtered.slice(startIndex, endIndex);
      
      await this.renderCards(cardsContainer, paginatedItems);
      this.renderPagination(filtered.length);
    } else if (this.currentView === 'list') {
      cardsContainer.style.display = 'none';
      listContainer.style.display = 'block';
      this.renderList(listContainer, filtered);
    }
  }

  // Renderizar paginación
  renderPagination(totalItems) {
    const paginationTop = document.getElementById('paginationTop');
    const paginationBottom = document.getElementById('paginationBottom');
    
    if (!paginationTop && !paginationBottom) return;

    const itemsPerPage = 18; // 6 columnas x 3 filas
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Generar HTML de paginación con layout de 3 columnas
    let html = '';
    
    if (totalPages <= 1 && totalItems > 0) {
      // Mostrar solo contador y vista cuando hay 1 página o menos
      html = `
        <div class="pagination-left">
          <span class="pagination-info">${totalItems} items</span>
        </div>
        <div class="pagination-center"></div>
        <div class="pagination-right">
          <label class="view-label">Vista:</label>
          <div class="view-btns">
            <button class="view-btn ${this.currentView === 'cards' ? 'active' : ''}" data-view="cards">
              Tarjetas
            </button>
            <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" data-view="list">
              Lista
            </button>
          </div>
        </div>
      `;
      
      if (paginationTop) {
        paginationTop.style.display = 'grid';
        paginationTop.className = 'pagination-container';
        paginationTop.innerHTML = html;
      }
      if (paginationBottom) {
        paginationBottom.style.display = 'grid';
        paginationBottom.className = 'pagination-container';
        paginationBottom.innerHTML = html;
      }
      return;
    }

    if (totalPages > 1) {
      // Layout completo: contador | botones paginación | vista
      let paginationButtons = `
        <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="app.goToPage(1)">‹‹</button>
        <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="app.goToPage(${this.currentPage - 1})">‹</button>
      `;

      // Botones de páginas
      const maxButtons = 5;
      let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
      let endPage = Math.min(totalPages, startPage + maxButtons - 1);

      if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        paginationButtons += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="app.goToPage(${i})">${i}</button>`;
      }

      paginationButtons += `
        <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="app.goToPage(${this.currentPage + 1})">›</button>
        <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="app.goToPage(${totalPages})">››</button>
      `;

      html = `
        <div class="pagination-left">
          <span class="pagination-info">${totalItems} items</span>
        </div>
        <div class="pagination-center">
          ${paginationButtons}
        </div>
        <div class="pagination-right">
          <label class="view-label">Vista:</label>
          <div class="view-btns">
            <button class="view-btn ${this.currentView === 'cards' ? 'active' : ''}" data-view="cards">
              Tarjetas
            </button>
            <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" data-view="list">
              Lista
            </button>
          </div>
        </div>
      `;

      // Mostrar paginación
      if (paginationTop) {
        paginationTop.style.display = 'grid';
        paginationTop.className = 'pagination-container';
        paginationTop.innerHTML = html;
      }
      if (paginationBottom) {
        paginationBottom.style.display = 'grid';
        paginationBottom.className = 'pagination-container';
        paginationBottom.innerHTML = html;
      }
    } else {
      // Ocultar si no hay items
      if (paginationTop) paginationTop.style.display = 'none';
      if (paginationBottom) paginationBottom.style.display = 'none';
    }
  }

  goToPage(page) {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.renderInventario();
  }

  // Renderizar tarjetas con diseño mejorado y limpio
  async renderCards(container, repuestos) {
    if (!container) return;

    if (repuestos.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary); grid-column: 1 / -1;">
          <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;">📦</div>
          <p style="font-size: 18px; margin: 0;">No se encontraron repuestos</p>
          <p style="font-size: 14px; margin: 10px 0 0 0; opacity: 0.7;">Intenta ajustar los filtros</p>
        </div>
      `;
      return;
    }

    // Renderizar repuestos (ya vienen paginados desde renderInventario)
    const cards = await Promise.all(repuestos.map(async (rep) => {
      // Cargar imagen
      const imageURL = await this.getFirstImage(rep.multimedia || rep.imagenes);
      
      // Calcular estado de stock con lógica completa
      const cantidad = rep.cantidad || 0;
      const minimo = rep.minimo || 5;
      const optimo = rep.optimo || minimo * 2;
      const cantidadInstalada = rep.cantidadInstalada || 0;
      
      let stockStatus = '';
      let stockColor = '';
      let porcentajeBarra = 0;
      let textoStock = '';
      
      // Calcular ancho de barra visual (stock actual en relación al óptimo, con extensión para excedentes)
      const anchoMaximoBarra = optimo * 1.2; // Permitir mostrar hasta 120% del óptimo
      const porcentajeBarraVisual = Math.min((cantidad / anchoMaximoBarra) * 100, 100);

      if (cantidad === 0) {
        stockStatus = 'AGOTADO';
        stockColor = '#945a5a';  // Rojo corporativo
        porcentajeBarra = 0;
        textoStock = `Sin stock (mínimo requerido: ${minimo})`;
      } else if (cantidad < minimo) {
        stockStatus = 'BAJO STOCK';
        stockColor = '#8a7a5a';  // Naranja/ámbar
        porcentajeBarra = porcentajeBarraVisual;
        textoStock = `${cantidad} unid. (faltan ${minimo - cantidad} para el mínimo)`;
      } else if (cantidad >= minimo && cantidad < optimo) {
        stockStatus = 'ADECUADO';
        stockColor = '#6b7a7a';  // Gris verdoso
        porcentajeBarra = porcentajeBarraVisual;
        textoStock = `${cantidad} unid. (entre mínimo y óptimo)`;
      } else if (cantidad >= optimo && cantidad <= optimo * 1.2) {
        stockStatus = 'ÓPTIMO';
        stockColor = '#527a65';  // Verde corporativo
        porcentajeBarra = porcentajeBarraVisual;
        textoStock = `${cantidad} unid. (nivel óptimo alcanzado)`;
      } else {
        stockStatus = 'EXCEDENTE';
        stockColor = '#5a7a94';  // Azul corporativo
        porcentajeBarra = 100;
        textoStock = `${cantidad} unid. (${cantidad - optimo} sobre el óptimo)`;
      }

      // Calcular porcentaje para display (no usado actualmente)
      const porcentajeDisplay = minimo > 0 ? Math.round((cantidad / minimo) * 100) : 0;

      // Formatear fecha del último conteo - Tamaño ajustado
      let ultimoConteoHTML = '';
      if (rep.ultimoConteo) {
        const fecha = new Date(rep.ultimoConteo);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const horaFormateada = fecha.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        ultimoConteoHTML = `
          <div style="font-size: 10px; color: var(--text-tertiary); padding: 8px 0 4px 0; text-align: right; font-weight: 500; letter-spacing: 0.3px; line-height: 1.4;">
            <span style="color: var(--text-secondary); font-weight: 600;">Último conteo:</span>
            <span style="font-family: var(--font-mono); font-size: 11px; margin-left: 6px;">${fechaFormateada} · ${horaFormateada}</span>
          </div>
        `;
      }

      // Datos técnicos - Diseño moderno colapsable
      let datosTecnicosHTML = '';
      if (rep.datosTecnicos && rep.datosTecnicos.trim() !== '') {
        // Detectar si tiene múltiples líneas o bullets
        const lineas = rep.datosTecnicos.split('\n').filter(l => l.trim());
        const esLista = lineas.some(l => l.trim().startsWith('-') || l.trim().startsWith('•'));
        
        let contenidoHTML = '';
        if (esLista) {
          // Renderizar como lista con bullets
          contenidoHTML = lineas.map(linea => {
            const textoLimpio = linea.replace(/^[-•]\s*/, '').trim();
            if (!textoLimpio) return '';
            return `<div style="display: flex; gap: 6px; margin-bottom: 4px;">
              <span style="color: var(--primary); font-weight: 700; flex-shrink: 0;">▪</span>
              <span style="flex: 1; line-height: 1.5;">${textoLimpio}</span>
            </div>`;
          }).filter(Boolean).join('');
        } else {
          // Renderizar como texto simple
          contenidoHTML = `<div style="line-height: 1.6; white-space: pre-line;">${rep.datosTecnicos}</div>`;
        }
        
        datosTecnicosHTML = `
          <details style="margin-top: 10px; border: 1px solid var(--border-primary); border-radius: var(--radius-md); overflow: hidden; background: var(--bg-tertiary);">
            <summary style="padding: 8px 12px; cursor: pointer; user-select: none; font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-input); transition: all 0.2s;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px;">⚙️</span>
                Datos Técnicos
              </span>
              <span style="font-size: 10px; opacity: 0.6;">▼</span>
            </summary>
            <div style="padding: 10px 12px; font-size: 11px; color: var(--text-secondary); font-family: var(--font-family);">
              ${contenidoHTML}
            </div>
          </details>
        `;
      }

      // Botones de mapa - AMBOS SIEMPRE visibles
      let botonVerMapaHTML = '';
      let botonAnadirUbicacionHTML = '';
      
      if (rep.ubicaciones && rep.ubicaciones.length > 0) {
        botonVerMapaHTML = `
          <button class="card-btn" onclick="window.app?.verRepuestoEnMapa('${rep.id}')" style="flex: 1; padding: 8px 12px; border: 1px solid var(--primary); background: var(--primary); color: white; border-radius: var(--radius-md); cursor: pointer; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; transition: all 0.2s; display: flex; align-items: center; justify-content: center;">
            Ver en Mapa (${rep.ubicaciones.length})
          </button>
        `;
      } else {
        botonVerMapaHTML = `
          <button class="card-btn" onclick="alert('No hay ubicaciones registradas')" style="flex: 1; padding: 8px 12px; border: 1px solid var(--border-secondary); background: var(--bg-tertiary); color: var(--text-tertiary); border-radius: var(--radius-md); cursor: not-allowed; font-size: 11px; font-weight: 500; letter-spacing: 0.3px; opacity: 0.6; display: flex; align-items: center; justify-content: center;">
            Ver en Mapa (0)
          </button>
        `;
      }
      
      botonAnadirUbicacionHTML = `
        <button class="card-btn" onclick="window.app?.agregarUbicacionMapa('${rep.id}')" style="flex: 1; padding: 8px 12px; border: 1px solid var(--border-accent); background: transparent; color: var(--text-secondary); border-radius: var(--radius-md); cursor: pointer; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; transition: all 0.2s; display: flex; align-items: center; justify-content: center;">
          Añadir Ubicación
        </button>
      `;
      
      let botonesMapaHTML = `
        <div style="display: flex; gap: 6px; margin-top: 8px;">
          ${botonVerMapaHTML}
          ${botonAnadirUbicacionHTML}
        </div>
      `;

      // Indicador de galería de imágenes
      let galeriaIndicador = '';
      if (rep.imagenes && rep.imagenes.length > 1) {
        galeriaIndicador = `
          <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; backdrop-filter: blur(4px);">
            📸 ${rep.imagenes.length} fotos
          </div>
        `;
      }

      return `
        <div class="repuesto-card" data-id="${rep.id}" style="background: #252526; border-radius: 2px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.6); transition: all 0.2s; border: 1px solid #3e3e42;">
          
          <!-- Imagen -->
          <div class="card-image" style="width: 100%; height: 160px; background: #1e1e1e; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; cursor: pointer; border-bottom: 1px solid #3e3e42;" ${imageURL ? `data-action="lightbox" data-id="${rep.id}"` : ''}>
            ${imageURL ? `<img src="${imageURL}" alt="${rep.nombre || 'Imagen'}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="font-size: 11px; color: #6e7681; font-weight: 600; letter-spacing: 0.5px;">SIN IMAGEN</div>'}
            ${(rep.multimedia && rep.multimedia.length > 1) ? `
              <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0, 0, 0, 0.8); color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; backdrop-filter: blur(4px); box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                +${rep.multimedia.length - 1}
              </div>
            ` : ''}
            ${rep.tipo ? `
              <div style="position: absolute; top: 6px; left: 6px; background: rgba(0, 122, 204, 0.95); color: #ffffff; padding: 3px 8px; border-radius: 2px; font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                ${rep.tipo}
              </div>
            ` : ''}
          </div>

          <!-- Contenido -->
          <div class="card-content" style="padding: 12px;">
            
            <!-- Header: Título + Códigos -->
            <div style="margin-bottom: 10px; border-bottom: 1px solid #3e3e42; padding-bottom: 8px;">
              <h3 style="margin: 0 0 6px 0; font-size: 13px; color: #d4d4d4; font-weight: 700; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-transform: uppercase; letter-spacing: 0.3px;">
                ${rep.nombre || 'SIN NOMBRE'}
              </h3>
              
              <!-- Códigos SAP y Proveedor con botones copiar -->
              <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
                ${rep.codSAP || rep.codigo_sap ? `
                  <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-input); padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-secondary);">
                    <span style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; flex-shrink: 0;">SAP:</span>
                    <span style="font-size: 13px; color: var(--text-primary); font-family: var(--font-mono); font-weight: 600; letter-spacing: 0.3px; flex: 1;">${rep.codSAP || rep.codigo_sap}</span>
                    <button onclick="navigator.clipboard.writeText('${(rep.codSAP || rep.codigo_sap).replace(/'/g, "\\'")}').then(() => { const btn = event.target; const original = btn.innerHTML; btn.innerHTML = '<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'var(--success)\\' stroke-width=\\'2\\'><polyline points=\\'20 6 9 17 4 12\\'></polyline></svg>'; setTimeout(() => { btn.innerHTML = original; }, 1000); })" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px 4px; transition: all 0.15s; display: flex; align-items: center; line-height: 0;" title="Copiar código SAP">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                ` : ''}
                ${rep.codProv || rep.codigo_prov ? `
                  <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-input); padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-secondary);">
                    <span style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; flex-shrink: 0;">Prov:</span>
                    <span style="font-size: 13px; color: var(--text-primary); font-family: var(--font-mono); font-weight: 600; letter-spacing: 0.3px; flex: 1;">${rep.codProv || rep.codigo_prov}</span>
                    <button onclick="navigator.clipboard.writeText('${(rep.codProv || rep.codigo_prov).replace(/'/g, "\\'")}').then(() => { const btn = event.target; const original = btn.innerHTML; btn.innerHTML = '<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'var(--success)\\' stroke-width=\\'2\\'><polyline points=\\'20 6 9 17 4 12\\'></polyline></svg>'; setTimeout(() => { btn.innerHTML = original; }, 1000); })" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px 4px; transition: all 0.15s; display: flex; align-items: center; line-height: 0;" title="Copiar código proveedor">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                ` : ''}
              </div>
              
              <!-- Botones de mapa SIEMPRE visibles debajo de los códigos -->
              <div style="margin-top: 8px;">
                ${botonesMapaHTML}
              </div>
            </div>

            <!-- Sección Stock -->
            <div style="background: #1e1e1e; padding: 10px; border-radius: 2px; margin-bottom: 10px; border-left: 3px solid ${stockColor}; border: 1px solid #2d2d30;">
              
              <!-- Header: Estado con valor -->
              <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 9px; color: #969696; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Estado</span>
                <span style="font-size: 10px; color: ${stockColor}; font-weight: 700; letter-spacing: 0.3px;">${stockStatus}</span>
              </div>
              
              <!-- Barra de progreso visual con marcadores -->
              <div style="position: relative; margin-bottom: 12px;">
                <!-- Barra de fondo -->
                <div style="width: 100%; height: 8px; background: #0d0d0d; border-radius: 1px; position: relative; overflow: visible;">
                  <!-- Barra de progreso actual (stock en relación a 120% del óptimo) -->
                  <div style="height: 100%; width: ${porcentajeBarra}%; background: ${stockColor}; opacity: 0.95; transition: width 0.3s ease; border-radius: 1px;"></div>
                  
                  ${minimo === optimo ? `
                    <!-- Marcador combinado cuando Min = Ópt -->
                    <div style="position: absolute; left: ${(optimo / (optimo * 1.2)) * 100}%; top: -2px; width: 2px; height: 12px; background: linear-gradient(to bottom, #e67e22 0%, #e67e22 50%, #27ae60 50%, #27ae60 100%); z-index: 2;" title="Min/Ópt: ${optimo}"></div>
                  ` : `
                    <!-- Marcador en Mínimo (posición relativa al rango 0-120% óptimo) -->
                    <div style="position: absolute; left: ${(minimo / (optimo * 1.2)) * 100}%; top: -2px; width: 2px; height: 12px; background: #e67e22; z-index: 2;" title="Mínimo: ${minimo}"></div>
                    <!-- Marcador en Óptimo (posición relativa al rango 0-120% óptimo) -->
                    <div style="position: absolute; left: ${(optimo / (optimo * 1.2)) * 100}%; top: -2px; width: 2px; height: 12px; background: #27ae60; z-index: 2;" title="Óptimo: ${optimo}"></div>
                  `}
                </div>
                
                <!-- Indicador de excedente al final de la barra (cuando stock > óptimo) -->
                ${cantidad > optimo ? `
                  <div style="position: absolute; right: -50px; top: 0; background: ${stockColor}; color: white; padding: 2px 6px; border-radius: 2px; font-size: 9px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    +${cantidad - optimo}
                  </div>
                ` : ''}
                
                <!-- Etiquetas de los marcadores -->
                <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 8px; color: #6e7681; font-weight: 600; font-family: var(--font-family);">
                  <span>0</span>
                  ${minimo === optimo ? `
                    <span style="position: absolute; left: ${(optimo / (optimo * 1.2)) * 100}%; transform: translateX(-50%); color: #e67e22;">Min/Ópt: ${optimo}</span>
                  ` : `
                    <span style="position: absolute; left: ${(minimo / (optimo * 1.2)) * 100}%; transform: translateX(-50%); color: #e67e22;">Min: ${minimo}</span>
                    <span style="position: absolute; left: ${(optimo / (optimo * 1.2)) * 100}%; transform: translateX(-50%); color: #27ae60;">Ópt: ${optimo}</span>
                  `}
                  <span style="color: #6e7681; opacity: 0.5;">${Math.round(optimo * 1.2)}</span>
                </div>
                
                <!-- Indicador de excedente al final de la barra (cuando stock > óptimo) -->
                ${cantidad > optimo ? `
                  <div style="position: absolute; right: -50px; top: -2px; background: ${stockColor}; color: white; padding: 2px 6px; border-radius: 2px; font-size: 9px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    +${cantidad - optimo}
                  </div>
                ` : ''}
              </div>
              
              <!-- Texto descriptivo SIEMPRE enmarcado con color según estado -->
              <div style="margin-top: 8px; padding: 6px 8px; background: ${
                cantidad === 0 ? 'rgba(148, 90, 90, 0.15)' :        // Rojo para agotado
                cantidad < minimo ? 'rgba(138, 122, 90, 0.15)' :    // Ámbar para bajo stock
                cantidad < optimo ? 'rgba(107, 122, 122, 0.15)' :   // Gris verdoso para adecuado
                cantidad <= optimo * 1.2 ? 'rgba(82, 122, 101, 0.15)' : // Verde para óptimo
                'rgba(90, 122, 148, 0.15)'                          // Azul para excedente
              }; border: 1px solid ${
                cantidad === 0 ? 'rgba(148, 90, 90, 0.3)' :
                cantidad < minimo ? 'rgba(138, 122, 90, 0.3)' :
                cantidad < optimo ? 'rgba(107, 122, 122, 0.3)' :
                cantidad <= optimo * 1.2 ? 'rgba(82, 122, 101, 0.3)' :
                'rgba(90, 122, 148, 0.3)'
              }; border-radius: var(--radius-sm);">
                <div style="font-size: 10px; color: ${stockColor}; font-weight: 600; line-height: 1.4; letter-spacing: 0.2px;">
                  ${textoStock}
                </div>
              </div>
              
              <!-- Grid KPI con marco visual -->
              <div style="display: grid; grid-template-columns: repeat(${cantidadInstalada > 0 ? '4' : '3'}, 1fr); gap: 6px; margin-top: 10px; padding: 10px 8px 8px 8px; border-top: 2px solid var(--border-accent); background: rgba(0,0,0,0.2); border-radius: 0 0 2px 2px;">
                ${cantidadInstalada > 0 ? `
                  <div style="text-align: center;">
                    <div style="font-size: 8px; color: #6e7681; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; font-weight: 600;">Uso</div>
                    <div style="font-size: 19px; font-weight: 800; color: #d4d4d4;">${cantidadInstalada}</div>
                  </div>
                ` : ''}
                <div style="text-align: center;">
                  <div style="font-size: 8px; color: #6e7681; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; font-weight: 600;">Min</div>
                  <div style="font-size: 19px; font-weight: 800; color: #d4d4d4;">${minimo}</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 8px; color: #6e7681; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; font-weight: 600;">Stock</div>
                  <div style="font-size: 19px; font-weight: 800; color: ${stockColor}; opacity: 0.95;">${cantidad}</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 8px; color: #6e7681; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; font-weight: 600;">Ópt</div>
                  <div style="font-size: 19px; font-weight: 800; color: #d4d4d4;">${optimo}</div>
                </div>
              </div>
              
              <!-- Último conteo inline -->
              ${ultimoConteoHTML}
            </div>

            <!-- Datos técnicos -->
            ${datosTecnicosHTML}
          </div>

          <!-- Footer: Botones de acción equilibrados -->
          <div class="card-footer" style="padding: 10px 12px; background: var(--bg-input); border-top: 1px solid var(--border-primary);">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; width: 100%;">
              <button class="card-btn" data-action="edit" data-id="${rep.id}" style="padding: 8px 12px; border: 1px solid var(--border-accent); background: transparent; color: var(--text-secondary); border-radius: var(--radius-md); font-weight: 600; font-size: 11px; cursor: pointer; transition: all var(--transition-fast); letter-spacing: 0.3px; display: flex; align-items: center; justify-content: center;">
                Editar
              </button>
              <button class="card-btn" data-action="contar" data-id="${rep.id}" style="padding: 8px 12px; border: none; background: var(--success); color: white; border-radius: var(--radius-md); font-weight: 600; font-size: 11px; cursor: pointer; transition: all var(--transition-fast); letter-spacing: 0.3px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-xs);">
                Contar
              </button>
              <button class="card-btn" data-action="delete" data-id="${rep.id}" style="padding: 8px 12px; border: 1px solid var(--danger); background: transparent; color: var(--danger); border-radius: var(--radius-md); font-weight: 600; font-size: 11px; cursor: pointer; transition: all var(--transition-fast); letter-spacing: 0.3px; display: flex; align-items: center; justify-content: center;">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
    }));

    container.innerHTML = cards.join('');
  }

  // Renderizar lista
  renderList(container, repuestos) {
    if (!container) return;

    if (repuestos.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;">📋</div>
          <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 8px;">No hay repuestos</div>
        </div>
      `;
      return;
    }

    const rows = repuestos.map(r => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 12px;">${r.codSAP || '-'}</td>
        <td style="padding: 12px; font-weight: 600;">${r.nombre}</td>
        <td style="padding: 12px;">${r.tipo || '-'}</td>
        <td style="padding: 12px; text-align: center; font-weight: 700; color: ${r.cantidad === 0 ? '#C76B6B' : r.cantidad <= (r.minimo || 5) ? '#D4976C' : '#6B8E7F'};">${r.cantidad}</td>
        <td style="padding: 12px; text-align: center;">${r.minimo || 5}</td>
        <td style="padding: 12px;">
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-sm btn-primary" data-action="edit" data-id="${r.id}">✏️</button>
            <button class="btn btn-sm btn-info" data-action="contar" data-id="${r.id}">🔢</button>
            <button class="btn btn-sm btn-danger" data-action="delete" data-id="${r.id}">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div style="overflow-x: auto; padding: 20px;">
        <table style="width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 12px; overflow: hidden;">
          <thead style="background: var(--bg-secondary);">
            <tr>
              <th style="padding: 14px; text-align: left;">Código SAP</th>
              <th style="padding: 14px; text-align: left;">Nombre</th>
              <th style="padding: 14px; text-align: left;">Tipo</th>
              <th style="padding: 14px; text-align: center;">Stock</th>
              <th style="padding: 14px; text-align: center;">Mínimo</th>
              <th style="padding: 14px; text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  // Aplicar estilos según modo de vista
  applyViewModeStyles() {
    // Método placeholder - puedes implementar estilos personalizados aquí
    console.log('Modo de vista:', this.viewMode || 'auto');
  }

  // Actualizar información del modo de vista
  updateViewModeInfo() {
    const viewModeInfo = document.getElementById('viewModeInfo');
    if (viewModeInfo) {
      const mode = this.viewMode || 'auto';
      const isMobile = this.isMobile ? 'Móvil' : 'PC';
      viewModeInfo.textContent = `Modo: ${mode} (${isMobile})`;
    }
  }

  // Renderizar filtros
  renderFilters() {
    // Poblar dropdowns de filtros con datos únicos de los repuestos
    const filterArea = document.getElementById('filterArea');
    const filterEquipo = document.getElementById('filterEquipo');
    const filterTipo = document.getElementById('filterTipo');
    const filterStock = document.getElementById('filterStock');
    
    if (!filterArea || !filterEquipo || !filterTipo) return;

    // Obtener valores únicos
    const areas = [...new Set(this.repuestos.map(r => r.area || r.areaGeneral).filter(Boolean))].sort();
    const equipos = [...new Set(this.repuestos.map(r => r.equipo || r.sistemaEquipo).filter(Boolean))].sort();
    const tipos = [...new Set(this.repuestos.map(r => r.tipo).filter(Boolean))].sort();

    // Poblar dropdown de Áreas
    filterArea.innerHTML = `
      <option value="">Todas las Áreas (${this.repuestos.length})</option>
      ${areas.map(area => {
        const count = this.repuestos.filter(r => (r.area || r.areaGeneral) === area).length;
        return `<option value="${area}">${area} (${count})</option>`;
      }).join('')}
    `;

    // Poblar dropdown de Equipos
    filterEquipo.innerHTML = `
      <option value="">Todos los Equipos (${this.repuestos.length})</option>
      ${equipos.map(equipo => {
        const count = this.repuestos.filter(r => (r.equipo || r.sistemaEquipo) === equipo).length;
        return `<option value="${equipo}">${equipo} (${count})</option>`;
      }).join('')}
    `;

    // Poblar dropdown de Tipos
    filterTipo.innerHTML = `
      <option value="">Todos los Tipos (${this.repuestos.length})</option>
      ${tipos.map(tipo => {
        const count = this.repuestos.filter(r => r.tipo === tipo).length;
        return `<option value="${tipo}">${tipo} (${count})</option>`;
      }).join('')}
    `;

    // Event listeners para todos los dropdowns (incluyendo Stock)
    [filterArea, filterEquipo, filterTipo, filterStock].forEach(select => {
      if (select) {
        select.addEventListener('change', () => {
          this.currentPage = 1;
          this.renderInventario();
        });
      }
    });
  }

  // Renderizar vista de conteo
  renderConteo() {
    const container = document.getElementById('conteo');
    if (!container) return;

    if (!this.conteoActivo) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 3rem; margin-bottom: 16px;">📋</div>
          <h3 style="margin-bottom: 16px;">Conteo de Inventario</h3>
          <button id="btnIniciarConteo" class="btn btn-primary" style="padding: 14px 32px; font-size: 1rem;">
            Iniciar Conteo
          </button>
        </div>
      `;
    } else {
      const rows = this.repuestos.map(r => `
        <tr>
          <td style="padding: 12px;">${r.codSAP || '-'}</td>
          <td style="padding: 12px; font-weight: 600;">${r.nombre}</td>
          <td style="padding: 12px; text-align: center;">${r.cantidad}</td>
          <td style="padding: 12px;">
            <input type="number" 
                   class="form-control" 
                   value="${this.conteoData[r.id] || 0}"
                   data-action="update-conteo"
                   data-id="${r.id}"
                   style="width: 100px; padding: 8px;">
          </td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>Conteo en Progreso</h3>
            <button id="btnFinalizarConteo" class="btn btn-success">Finalizar Conteo</button>
          </div>
          <table style="width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 12px;">
            <thead style="background: var(--bg-secondary);">
              <tr>
                <th style="padding: 14px;">Código SAP</th>
                <th style="padding: 14px;">Nombre</th>
                <th style="padding: 14px; text-align: center;">Stock Sistema</th>
                <th style="padding: 14px; text-align: center;">Conteo Real</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }
  }

  // Iniciar conteo
  iniciarConteo() {
    this.conteoActivo = true;
    this.conteoData = {};
    this.renderConteo();
  }

  // Finalizar conteo
  finalizarConteo() {
    if (!confirm('¿Actualizar el stock con los valores del conteo?')) return;

    let actualizados = 0;
    Object.entries(this.conteoData).forEach(([id, cantidad]) => {
      const repuesto = this.repuestos.find(r => r.id === id);
      if (repuesto) {
        repuesto.cantidad = parseInt(cantidad) || 0;
        actualizados++;
      }
    });

    this.conteoActivo = false;
    this.conteoData = {};
    this.saveData();
    this.renderConteo();
    this.showToast(`✅ ${actualizados} repuestos actualizados`, 'success');
  }

  // Actualizar conteo
  updateConteo(id, value) {
    this.conteoData[id] = parseInt(value) || 0;
  }

  // Renderizar jerarquía
  renderJerarquia() {
    const container = document.getElementById('jerarquia');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 16px;">🏗️</div>
        <h3>Vista de Jerarquía</h3>
        <p style="color: var(--text-secondary);">Funcionalidad en desarrollo</p>
      </div>
    `;
  }

  // Renderizar valores
  renderValores() {
    const container = document.getElementById('valores');
    if (!container) return;

    const valorTotal = this.repuestos.reduce((sum, r) => {
      const precio = parseFloat(r.precio) || 0;
      const cantidad = parseInt(r.cantidad) || 0;
      return sum + (precio * cantidad);
    }, 0);

    const conPrecio = this.repuestos.filter(r => r.precio && r.precio > 0).length;

    container.innerHTML = `
      <div style="padding: 20px;">
        <h3 style="margin-bottom: 20px; color: var(--text-primary); font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">VALOR DEL INVENTARIO</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <div style="background: var(--bg-secondary); padding: 24px; border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="font-size: 2rem; font-weight: 700; color: #5a7a5a; margin-bottom: 8px;">
              $${valorTotal.toLocaleString('es-CL', { minimumFractionDigits: 2 })}
            </div>
            <div style="color: var(--text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">VALOR TOTAL</div>
          </div>
          <div style="background: var(--bg-secondary); padding: 24px; border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="font-size: 2rem; font-weight: 700; color: #6a7a8a; margin-bottom: 8px;">
              ${conPrecio}
            </div>
            <div style="color: var(--text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">REPUESTOS CON PRECIO</div>
          </div>
          <div style="background: var(--bg-secondary); padding: 24px; border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="font-size: 2rem; font-weight: 700; color: #5a6b7a; margin-bottom: 8px;">
              $${conPrecio > 0 ? (valorTotal / conPrecio).toLocaleString('es-CL', { minimumFractionDigits: 2 }) : '0'}
            </div>
            <div style="color: var(--text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">VALOR PROMEDIO</div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================
  // MÉTODOS DE AUTOCOMPLETADO
  // ============================================
  
  updateAutocompleteData() {
    // Genera datos para autocompletado desde repuestos
    if (!this.repuestos || this.repuestos.length === 0) return;
    
    this.autocompleteData = {
      nombres: [...new Set(this.repuestos.map(r => r.nombre).filter(Boolean))],
      equipos: [...new Set(this.repuestos.map(r => r.equipo).filter(Boolean))],
      sistemas: [...new Set(this.repuestos.map(r => r.sistema).filter(Boolean))],
      ubicaciones: [...new Set(this.repuestos.map(r => r.ubicacion).filter(Boolean))],
      tipos: [...new Set(this.repuestos.map(r => r.tipo).filter(Boolean))],
      marcas: [...new Set(this.repuestos.map(r => r.marca).filter(Boolean))]
    };
    
    // Guardar en localStorage
    try {
      localStorage.setItem('autocompleteData', JSON.stringify(this.autocompleteData));
    } catch (e) {
      console.warn('Error guardando autocomplete:', e);
    }
  }

  setupAutocomplete() {
    // Configura autocompletado para inputs del formulario
    const inputs = [
      { id: 'nombre', data: 'nombres' },
      { id: 'equipo', data: 'equipos' },
      { id: 'sistema', data: 'sistemas' },
      { id: 'ubicacion', data: 'ubicaciones' },
      { id: 'tipo', data: 'tipos' },
      { id: 'marca', data: 'marcas' }
    ];

    inputs.forEach(({ id, data }) => {
      const input = document.getElementById(id);
      if (!input || !this.autocompleteData?.[data]) return;

      const datalistId = `${id}-datalist`;
      let datalist = document.getElementById(datalistId);
      
      if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = datalistId;
        input.parentNode.appendChild(datalist);
        input.setAttribute('list', datalistId);
      }

      datalist.innerHTML = this.autocompleteData[data]
        .map(value => `<option value="${value}">`)
        .join('');
    });
  }

  cargarSistemasPorEquipo(equipo) {
    // Filtra sistemas según el equipo seleccionado
    if (!equipo || !this.repuestos) return;

    const sistemasDelEquipo = [...new Set(
      this.repuestos
        .filter(r => r.equipo === equipo)
        .map(r => r.sistema)
        .filter(Boolean)
    )];

    const sistemaInput = document.getElementById('sistema');
    const datalistId = 'sistema-datalist';
    let datalist = document.getElementById(datalistId);
    
    if (!datalist) {
      datalist = document.createElement('datalist');
      datalist.id = datalistId;
      sistemaInput.parentNode.appendChild(datalist);
      sistemaInput.setAttribute('list', datalistId);
    }

    datalist.innerHTML = sistemasDelEquipo
      .map(value => `<option value="${value}">`)
      .join('');
  }
  
  // ===============================================
  // OPTIMIZAR IMÁGENES EXISTENTES
  // ===============================================
  
  async optimizarImagenesExistentes() {
    if (!fsManager || !fsManager.isConnected) {
      this.showToast('❌ Debes conectar el FileSystem primero', 'error');
      return;
    }
    
    console.log('\n🔧 ========== OPTIMIZANDO IMÁGENES EXISTENTES ==========');
    
    // Filtrar repuestos con imágenes
    const repuestosConImagenes = this.repuestos.filter(r => 
      r.multimedia && r.multimedia.length > 0
    );
    
    if (repuestosConImagenes.length === 0) {
      this.showToast('ℹ️ No hay repuestos con imágenes', 'info');
      return;
    }
    
    let totalImagenes = 0;
    let imagenesOptimizadas = 0;
    let errores = 0;
    
    this.showToast(`🔄 Iniciando optimización de imágenes...`, 'info', 3000);
    
    for (const repuesto of repuestosConImagenes) {
      console.log(`\n📦 Procesando: ${repuesto.nombre}`);
      
      for (let i = 0; i < repuesto.multimedia.length; i++) {
        const media = repuesto.multimedia[i];
        totalImagenes++;
        
        try {
          // Verificar si ya está optimizada (WebP y comprimida)
          if (media.compressed && media.mimeType === 'image/webp') {
            console.log(`  ✓ Ya optimizada: ${media.filename}`);
            continue;
          }
          
          console.log(`  🔄 Optimizando: ${media.filename || media.originalName}`);
          
          // Cargar imagen desde FileSystem
          let imageUrl;
          if (media.url) {
            const filename = media.url.replace('./imagenes/', '');
            imageUrl = await fsManager.loadImage(filename);
          } else if (media.data) {
            imageUrl = media.data;
          }
          
          if (!imageUrl) {
            console.warn(`  ⚠️ No se pudo cargar: ${media.filename}`);
            errores++;
            continue;
          }
          
          // Convertir a Blob para procesar
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], media.originalName || media.filename || 'imagen.jpg', {
            type: media.mimeType || 'image/jpeg'
          });
          
          // Comprimir a WebP
          const compressedBase64 = await this.compressImageToWebP(file);
          
          if (!compressedBase64) {
            console.error(`  ❌ Error comprimiendo: ${media.filename}`);
            errores++;
            continue;
          }
          
          // Crear nuevo nombre de archivo WebP
          const timestamp = Date.now();
          const newFilename = `${timestamp}_optimized_${media.originalName || 'imagen'}.webp`;
          
          // Calcular tamaños
          const compressedSize = Math.round((compressedBase64.length * 0.75));
          const originalSize = media.size || file.size;
          
          // Guardar en FileSystem
          const base64Data = compressedBase64.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteArray = new Uint8Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteArray[j] = byteCharacters.charCodeAt(j);
          }
          const newBlob = new Blob([byteArray], { type: 'image/webp' });
          
          await fsManager.saveImage(newBlob, newFilename);
          
          // Actualizar metadata del repuesto
          repuesto.multimedia[i] = {
            tipo: 'image',
            filename: newFilename,
            originalName: media.originalName || media.filename || 'imagen.jpg',
            size: compressedSize,
            mimeType: 'image/webp',
            uploadDate: new Date().toISOString(),
            compressed: true,
            originalSize: originalSize,
            url: `./imagenes/${newFilename}`
          };
          
          imagenesOptimizadas++;
          
          const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(0);
          console.log(`  ✅ Optimizada: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (-${reduction}%)`);
          
        } catch (error) {
          console.error(`  ❌ Error procesando ${media.filename}:`, error);
          errores++;
        }
      }
    }
    
    // Guardar cambios
    await fsManager.saveData('repuestos', this.repuestos);
    
    console.log(`\n✅ Optimización completa:`);
    console.log(`   Total: ${totalImagenes} imágenes`);
    console.log(`   Optimizadas: ${imagenesOptimizadas}`);
    console.log(`   Errores: ${errores}`);
    
    this.showToast(
      `✅ Optimización completa: ${imagenesOptimizadas}/${totalImagenes} imágenes procesadas`,
      'success',
      5000
    );
    
    // Recargar vista
    this.aplicarFiltros();
  }
}

console.log('=== INVENTARIO PRO - INICIANDO ===');
console.log('Versin: 2.0');


export default InventarioCompleto;
