# API de Integración - Hierarchy Sync

## 📋 Guía Rápida de Integración

### **Paso 1: Importar Archivos**

En `index.html`, agregar:

```html
<!-- CSS de jerarquía -->
<link rel="stylesheet" href="styles/mapas-hierarchy.css">
```

En `modules/app.js`, importar:

```javascript
import { HierarchySync } from './hierarchy-sync.js';
```

---

### **Paso 2: Inicializar en Tab Mapas**

```javascript
// En la función que inicializa el Tab Mapas
function initTabMapas() {
  const container = document.getElementById('hierarchy-tree-container');
  const mapasData = await loadMapasData();
  const zonasData = await loadZonasData();
  
  // Crear instancia
  window.hierarchySync = new HierarchySync(container, mapasData, zonasData);
  
  // Inicializar
  window.hierarchySync.init();
  
  // Suscribirse a eventos
  window.hierarchySync.on('node-selected', (event) => {
    console.log('Nodo seleccionado:', event.detail);
    // Aquí actualizar otros componentes
  });
  
  window.hierarchySync.on('map-canvas-update', (event) => {
    const mapa = event.detail.mapa;
    // Actualizar canvas con el mapa
    renderMapOnCanvas(mapa);
  });
}
```

---

### **Paso 3: HTML del Contenedor**

Agregar en el Tab Mapas:

```html
<div class="mapas-tab">
  <!-- Búsqueda global -->
  <div class="global-search-container">
    <input 
      type="text" 
      class="global-search-input" 
      placeholder="🔎 Buscar en jerarquía..."
      oninput="window.hierarchySync.filter(this.value)"
    >
  </div>
  
  <!-- Contenedor de jerarquía -->
  <div id="hierarchy-tree-container" class="area-tree">
    <!-- Se renderiza dinámicamente -->
  </div>
</div>
```

---

## 📖 API Completa

### **Constructor**

```javascript
new HierarchySync(containerElement, mapasData, zonasData)
```

**Parámetros:**
- `containerElement` (HTMLElement): Contenedor donde se renderizará la jerarquía
- `mapasData` (Array): Array de mapas
- `zonasData` (Array): Array de zonas con jerarquía

---

### **Métodos Públicos**

#### **init()**
Inicializa el sistema y renderiza la jerarquía.

```javascript
hierarchySync.init();
```

---

#### **filter(searchTerm)**
Filtra la jerarquía por término de búsqueda.

```javascript
hierarchySync.filter('eviscerado');
// Resalta "Eviscerado" y toda su rama
```

---

#### **navigateToNode(nodeName)**
Navega a un nodo específico (scroll + selección).

```javascript
hierarchySync.navigateToNode('Grader');
```

---

#### **renderTree(hierarchyData)**
Renderiza el árbol con datos personalizados.

```javascript
const customData = {
  name: 'Planta',
  nivel: 1,
  children: [...]
};
hierarchySync.renderTree(customData);
```

---

#### **getSelectedNode()**
Obtiene el nodo actualmente seleccionado.

```javascript
const selected = hierarchySync.getSelectedNode();
// { name: 'Eviscerado', mapId: 12345, level: 2, hasMap: true }
```

---

#### **on(eventName, callback)**
Suscribirse a eventos.

```javascript
hierarchySync.on('node-selected', (event) => {
  console.log(event.detail);
});
```

**Eventos disponibles:**
- `node-selected`: Se selecciona un nodo
- `map-canvas-update`: Se debe actualizar el canvas

---

#### **off(eventName, callback)**
Desuscribirse de eventos.

```javascript
const handler = (e) => console.log(e);
hierarchySync.on('node-selected', handler);
hierarchySync.off('node-selected', handler);
```

---

#### **destroy()**
Destruir instancia y limpiar.

```javascript
hierarchySync.destroy();
```

---

## 🔄 Sistema de Eventos Globales

### **Configurar EventTarget Global**

En `app.js` (al inicio):

```javascript
// Sistema de eventos global de la app
window.appEvents = new EventTarget();
```

---

### **Emitir Evento desde Tab Mapas**

Ya está implementado automáticamente. Cada vez que se selecciona un nodo:

```javascript
window.appEvents.dispatchEvent(new CustomEvent('hierarchy-node-selected', {
  detail: {
    source: 'mapas-tab',
    action: 'node-selected',
    data: {
      name: 'Eviscerado',
      mapId: 12345,
      level: 2,
      hasMap: true,
      timestamp: '2025-11-20T...'
    }
  }
}));
```

---

### **Escuchar en Otros Tabs**

#### **Tab Inventario**

```javascript
// Filtrar inventario cuando se selecciona un nodo
window.appEvents.addEventListener('hierarchy-node-selected', (event) => {
  const { name, mapId } = event.detail.data;
  
  // Filtrar equipos de ese nodo
  filtrarInventarioPorNodo(name);
});
```

---

#### **Tab Jerarquía**

```javascript
// Expandir y resaltar nodo en vista de jerarquía
window.appEvents.addEventListener('hierarchy-node-selected', (event) => {
  const { name } = event.detail.data;
  
  // Expandir árbol hasta ese nodo
  expandirYResaltarNodo(name);
});
```

---

#### **Canvas de Mapas**

```javascript
// Cargar mapa en canvas
window.appEvents.addEventListener('hierarchy-node-selected', (event) => {
  const { mapId, hasMap } = event.detail.data;
  
  if (hasMap && mapId) {
    cargarMapaEnCanvas(mapId);
  }
});
```

---

## 🎨 Personalización CSS

### **Variables Disponibles**

Las siguientes variables CSS están disponibles en `:root`:

```css
:root {
  --primary: #5b8bb4;
  --primary-light: #7ba5c8;
  --text-primary: #e6e9ef;
  --text-secondary: #b8bec8;
  --text-muted: #8a909a;
  --border-color: #2d333d;
}
```

---

### **Sobrescribir Estilos**

Para personalizar, crear reglas más específicas:

```css
/* Cambiar color de resaltado de búsqueda */
.mapas-tab .node-header.search-match {
  background: rgba(255, 165, 0, 0.2); /* Naranja */
  box-shadow: inset 0 0 0 1px rgba(255, 165, 0, 0.4);
}

/* Cambiar estilo de nodo seleccionado */
.mapas-tab .node-header.selected {
  background: rgba(139, 92, 246, 0.15); /* Púrpura */
  box-shadow: inset 0 0 0 2px rgba(139, 92, 246, 0.4);
}
```

---

## 🧪 Ejemplo de Integración Completa

```javascript
// En modules/app.js

import { HierarchySync } from './hierarchy-sync.js';

// Sistema de eventos global
window.appEvents = new EventTarget();

// Función de inicialización del Tab Mapas
async function initTabMapas() {
  // Cargar datos
  const mapasData = await fetch('./INVENTARIO_STORAGE/mapas.json').then(r => r.json());
  const zonasData = await fetch('./INVENTARIO_STORAGE/zonas.json').then(r => r.json());
  
  // Obtener contenedor
  const container = document.getElementById('hierarchy-tree-container');
  
  // Crear instancia
  window.hierarchySync = new HierarchySync(container, mapasData, zonasData);
  
  // Inicializar
  window.hierarchySync.init();
  
  // Escuchar evento de selección de nodo
  window.hierarchySync.on('node-selected', (event) => {
    const { name, mapId, hasMap } = event.detail.data;
    
    console.log(`✅ Nodo seleccionado: ${name}`);
    
    // Actualizar UI según sea necesario
    updateBreadcrumb(name);
    updateStats(name);
  });
  
  // Escuchar evento de actualización de canvas
  window.hierarchySync.on('map-canvas-update', (event) => {
    const mapa = event.detail.mapa;
    renderMapOnCanvas(mapa);
  });
  
  console.log('✅ Tab Mapas inicializado');
}

// Sincronización desde otros tabs
window.appEvents.addEventListener('inventario-item-selected', (event) => {
  const { nodoJerarquia } = event.detail;
  
  // Navegar al nodo en la jerarquía
  if (window.hierarchySync) {
    window.hierarchySync.navigateToNode(nodoJerarquia);
  }
});

// Llamar al inicializar la app
document.addEventListener('DOMContentLoaded', () => {
  initTabMapas();
});
```

---

## 🐛 Debugging

### **Logs de Consola**

El módulo emite logs útiles:

```
✅ HierarchySync inicializado
✅ Árbol de jerarquía renderizado
🎯 Click en nodo: { name: 'Eviscerado', mapId: 12345, ... }
📡 Evento de sincronización emitido: { ... }
🔍 Búsqueda: "evis" - 2 coincidencias
🗺️ Actualizando canvas del mapa: 12345
📍 Mapa encontrado: { nombre: 'Planta Principal', ... }
```

---

### **Verificar Eventos**

```javascript
// Verificar que el sistema de eventos funciona
window.appEvents.addEventListener('hierarchy-node-selected', (e) => {
  console.log('📨 Evento recibido en app:', e.detail);
});

// Simular selección manual
window.hierarchySync.navigateToNode('Eviscerado');
```

---

## ⚠️ Consideraciones

### **Rendimiento**

- El árbol se renderiza **una sola vez** al inicializar
- La búsqueda usa **DOM nativo** (muy rápido)
- El resaltado de ramas es **O(n)** donde n = profundidad del árbol

### **Compatibilidad**

- Requiere **ES6+** (import/export)
- Compatible con navegadores modernos
- No requiere librerías externas

### **Memoria**

- Memoria aproximada: **~2-5 MB** con 1000+ nodos
- Se recomienda **lazy loading** para jerarquías muy grandes (>5000 nodos)

---

## 📚 Recursos Adicionales

- **Documentación completa:** `docs/SISTEMA_SINCRONIZACION_MAPAS.md`
- **Prototipo funcional:** `v6.0/prototype-mapas.html`
- **Ejemplos de código:** Ver prototipo para uso real

---

## 🆘 Soporte

Si encuentras problemas:

1. Verificar que los imports están correctos
2. Revisar logs de consola
3. Validar estructura HTML (debe tener clase `.mapas-tab`)
4. Asegurar que `window.appEvents` está definido antes de usar

---

**Última actualización:** 20 Nov 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para producción
