// ========================================
// SERVICE WORKER - PWA Offline Support
// Cache de recursos para funcionamiento sin conexión
// ========================================

const CACHE_NAME = 'inventario-v6.0.0';
const CACHE_VERSION = 1;

// Recursos para cachear
const STATIC_RESOURCES = [
  './',
  './index.html',
  './manifest.json',
  
  // Estilos
  './styles/variables.css',
  './styles/main.css',
  './styles/components.css',
  './styles/inline-refactor.css',
  
  // Módulos Core
  './app/core/EventBus.js',
  './app/core/StateManager.js',
  
  // Módulos
  './app/modules/storage.js',
  './app/modules/mapa.js',
  './app/modules/core.js',
  
  // Utilidades
  './app/utils/validation.js',
  './app/utils/errorHandler.js',
  './app/utils/helpers.js',
  './app/utils/formatters.js',
  
  // Librerías (se cargarán bajo demanda)
  // './app/lib/jspdf.min.js',
  // './app/lib/xlsx.min.js',
  // './app/lib/jszip.min.js'
];

// Recursos que siempre se buscan en la red primero
const NETWORK_FIRST = [
  '/INVENTARIO_STORAGE/',
  '/api/'
];

// ============================================
// INSTALACIÓN
// ============================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando recursos estáticos');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('[Service Worker] Instalación completada');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch((error) => {
        console.error('[Service Worker] Error en instalación:', error);
      })
  );
});

// ============================================
// ACTIVACIÓN
// ============================================

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Eliminar cachés antiguos
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('inventario-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activación completada');
        return self.clients.claim(); // Tomar control inmediato
      })
  );
});

// ============================================
// FETCH - ESTRATEGIAS DE CACHÉ
// ============================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar peticiones a otros orígenes
  if (url.origin !== location.origin) {
    return;
  }
  
  // Ignorar peticiones de FileSystem API
  if (url.pathname.includes('INVENTARIO_STORAGE')) {
    return;
  }
  
  // Network First para recursos dinámicos
  if (NETWORK_FIRST.some(path => url.pathname.includes(path))) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Cache First para recursos estáticos
  event.respondWith(cacheFirst(request));
});

// ============================================
// ESTRATEGIA: CACHE FIRST
// ============================================

async function cacheFirst(request) {
  try {
    // Buscar en caché
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[Service Worker] Cache hit:', request.url);
      
      // Actualizar caché en background
      updateCache(request);
      
      return cachedResponse;
    }
    
    // Si no está en caché, buscar en red
    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    // Cachear respuesta si es exitosa
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('[Service Worker] Error en cacheFirst:', error);
    
    // Fallback a offline page si existe
    const offlineResponse = await caches.match('./offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Respuesta de error genérica
    return new Response('Offline - Recurso no disponible', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// ============================================
// ESTRATEGIA: NETWORK FIRST
// ============================================

async function networkFirst(request) {
  try {
    // Intentar red primero
    const networkResponse = await fetch(request);
    
    // Cachear respuesta si es exitosa
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('[Service Worker] Network failed, trying cache:', request.url);
    
    // Si falla la red, buscar en caché
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Respuesta de error
    return new Response('Offline - Recurso no disponible', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// ============================================
// ACTUALIZAR CACHÉ EN BACKGROUND
// ============================================

async function updateCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse);
      console.log('[Service Worker] Cache updated:', request.url);
    }
  } catch (error) {
    // Silenciar errores de actualización en background
  }
}

// ============================================
// MENSAJES
// ============================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// ============================================
// SINCRONIZACIÓN EN BACKGROUND
// ============================================

self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    console.log('[Service Worker] Sincronizando datos...');
    // Aquí se puede implementar lógica de sincronización
    // Por ejemplo, enviar datos pendientes cuando se recupere la conexión
  } catch (error) {
    console.error('[Service Worker] Error en sincronización:', error);
  }
}

// ============================================
// NOTIFICACIONES PUSH (Opcional para futuro)
// ============================================

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Notificación',
    icon: './assets/icons/icon-192x192.png',
    badge: './assets/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: './assets/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: './assets/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Inventario Visual PRO', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

console.log('[Service Worker] Cargado correctamente v' + CACHE_VERSION);
