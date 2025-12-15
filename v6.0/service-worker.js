/**
 * Service Worker para PWA - Inventario de Repuestos
 * Maneja cache offline y actualizaciones en segundo plano
 * 
 * ⚠️ IMPORTANTE: Al actualizar la versión, cambiar:
 * 1. CACHE_NAME y DYNAMIC_CACHE abajo
 * 2. window.APP_VERSION en index.html
 * 3. version.json (build number)
 * 
 * v6.131 - Forms -15%, Wizard compacto, Toasts -20%, iPhone Pro optimizado
 */

const CACHE_NAME = 'inventario-v6.139';
const DYNAMIC_CACHE = 'inventario-dynamic-v6.139';

// Archivos esenciales para funcionar offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './config/firebase-config.js',
  './modules/firebase-service.js',
  './modules/firebase-storage-adapter.js',
  './modules/firebase-image-storage.js',
  './modules/custom-auth.js',
  './modules/login-ui.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// URLs de Firebase y APIs que NO se deben cachear
const NO_CACHE_URLS = [
  'firebaseio.com',
  'googleapis.com',
  'firebasestorage.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'version.json'  // ⚠️ NUNCA cachear - usado para verificación de versión
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Instalando Service Worker v6.119...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [SW] Cacheando archivos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ [SW] Instalación completada - ACTIVANDO INMEDIATAMENTE');
        // ⚡ FORZAR skipWaiting() automáticamente para actualizar SIN esperar al usuario
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ [SW] Error en instalación:', error);
      })
  );
});

// Escuchar mensaje para activar el SW cuando el usuario lo solicite
self.addEventListener('message', (event) => {
  console.log('📨 [SW] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ [SW v6.086] Forzando actualización inmediata - skipWaiting()');
    self.skipWaiting();
  }
});

// Activación - limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('🚀 [SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ [SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ [SW] Activación completada');
        // ⚡ Tomar control de TODAS las páginas inmediatamente
        return self.clients.claim();
      })
      .then(() => {
        console.log('⚡ [SW] Control tomado de todas las páginas');
        // Notificar a todos los clientes que hay nueva versión
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NEW_VERSION',
              version: CACHE_NAME
            });
          });
        });
      })
  );
});

// Interceptar requests de red
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;
  
  // 🚫 IGNORAR: URLs de extensiones del navegador (chrome-extension://, moz-extension://, etc.)
  if (!requestUrl.startsWith('http://') && !requestUrl.startsWith('https://')) {
    return; // No interceptar, dejar que el navegador lo maneje
  }
  
  // No cachear requests de Firebase/APIs
  if (NO_CACHE_URLS.some(url => requestUrl.includes(url))) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // No cachear requests POST
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Estrategia: Network First, fallback to Cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la respuesta es válida, guardar en cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              // Solo cachear URLs http/https válidas
              try {
                if (event.request.url.startsWith('http')) {
                  cache.put(event.request, responseClone);
                }
              } catch (e) {
                console.warn('[SW] No se pudo cachear:', event.request.url);
              }
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si no hay red, buscar en cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Si es una navegación, mostrar página offline
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            // Para imágenes, retornar placeholder
            if (event.request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#2d3748" width="200" height="200"/><text fill="#718096" font-family="Arial" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Sin conexión</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
          });
      })
  );
});

// Escuchar mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
});

// Notificaciones push (preparado para futuro)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Nueva notificación',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './'
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Inventario', options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || './';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Si ya hay una ventana abierta, enfocarla
          for (const client of windowClients) {
            if (client.url.includes('index.html') && 'focus' in client) {
              return client.focus();
            }
          }
          // Si no hay ventana, abrir una nueva
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Sincronización en segundo plano (cuando vuelva la conexión)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-inventory') {
    event.waitUntil(
      // Aquí se pueden sincronizar cambios pendientes
      Promise.resolve()
    );
  }
});

console.log('📱 [SW] Service Worker cargado');
