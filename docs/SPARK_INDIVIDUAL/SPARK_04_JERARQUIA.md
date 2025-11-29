# 📄 DOCUMENTO 5/11: SPARK_04_JERARQUIA.md

**Tamaño:** 18.3 KB | **Líneas:** 706
**Posición:** 5 de 11

⏩ **DOCUMENTO INTERMEDIO** - Continúa leyendo...

---

# 🌳 Sistema de Jerarquía - 8 Niveles

**Módulo 4/8** - Árbol visual, búsqueda y navegación  
**Líneas en index.html:** 47000-50500

---

## 📋 CONTENIDO

1. [Vista General](#vista-general)
2. [Estructura de 8 Niveles](#estructura-de-8-niveles)
3. [Renderizado del Árbol](#renderizado-del-árbol)
4. [Sistema de Búsqueda](#sistema-de-búsqueda)
5. [Expansión y Navegación](#expansión-y-navegación)
6. [Parser de NodeId](#parser-de-nodeid)
7. [Integración con Mapas](#integración-con-mapas)

---

## 🎯 VISTA GENERAL

### Dos Sistemas de Jerarquía

```
SISTEMA DUAL (Unificado en v6.0)
├── 1. Jerarquía Organizacional (zonas.json)
│   └── Representa PLANTA FÍSICA real
│       - 8 niveles de ubicación
│       - Asociado a mapas
│       - Usado para navegación
│
└── 2. Jerarquía Genérica (repuestos.ubicaciones[])
    └── Representa CLASIFICACIÓN lógica
        - Misma estructura de 8 niveles
        - Guardada en cada repuesto
        - Sincronizada con sistema 1
```

### Los 8 Niveles

```
Nivel 1: Planta General          (ej: "Planta Completa")
Nivel 2: Área General            (ej: "Área Industrial Norte")
Nivel 3: Sub-Área                (ej: "Sala de Producción A")
Nivel 4: Sistema/Equipo          (ej: "Línea de Montaje #1")
Nivel 5: Sub-Sistema             (ej: "Brazo Robótico R3")
Nivel 6: Componente Principal    (ej: "Motor Principal M1")
Nivel 7: Sub-Componente          (ej: "Encoder Rotatorio")
Nivel 8: Elemento Específico     (ej: "Rodamiento 6205-2RS")
```

### HTML Base

```html
<!-- Línea 15280 en index.html -->
<div id="jerarquiaContent" class="tab-content">
  <!-- Header con búsqueda -->
  <div class="jerarquia-header">
    <div class="search-container">
      <input 
        type="text"
        id="jerarquiaSearchInput"
        placeholder="🔍 Buscar en jerarquía..."
        autocomplete="off"
        oninput="app.handleJerarquiaSearch(this.value)">
      
      <div id="jerarquiaSearchResults" class="search-autocomplete"></div>
    </div>

    <div class="jerarquia-buttons">
      <button onclick="app.expandAllNodes()">Expandir Todo</button>
      <button onclick="app.collapseAllNodes()">Contraer Todo</button>
      <button onclick="app.exportJerarquia()">Exportar JSON</button>
    </div>
  </div>

  <!-- Árbol visual -->
  <div id="jerarquiaTree" class="jerarquia-tree"></div>
</div>
```

---

## 📊 ESTRUCTURA DE 8 NIVELES

### Objeto Jerarquía Completo

```javascript
// Estructura guardada en repuesto.ubicaciones[0]
{
  // Nivel 1: Planta
  plantaGeneral: "Planta Completa",
  
  // Nivel 2: Área
  areaGeneral: "Área Industrial Norte",
  
  // Nivel 3: Sub-Área
  subArea: "Sala de Producción A",
  
  // Nivel 4: Sistema/Equipo
  sistemaEquipo: "Línea de Montaje #1",
  
  // Nivel 5: Sub-Sistema
  subSistema: "Brazo Robótico R3",
  
  // Nivel 6: Componente
  componentePrincipal: "Motor Principal M1",
  
  // Nivel 7: Sub-Componente
  subComponente: "Encoder Rotatorio",
  
  // Nivel 8: Elemento
  elementoEspecifico: "Rodamiento 6205-2RS",
  
  // Metadatos
  nodeId: "planta_area_subarea_sistema_subsistema_componente_subcomponente_elemento",
  fechaCreacion: "2025-11-27T10:30:00Z",
  tipo: "ubicacion" // o "clasificacion"
}
```

### Ejemplo Real

```javascript
// Repuesto: Filtro de aire comprimido
{
  id: "R001",
  nombre: "Filtro de aire 1/4\"",
  codSAP: "FLT-AIR-025",
  ubicaciones: [{
    plantaGeneral: "Planta Completa",
    areaGeneral: "Área de Compresores",
    subArea: "Sala Principal",
    sistemaEquipo: "Compresor Atlas Copco GA37",
    subSistema: "Sistema de Filtración",
    componentePrincipal: "Filtro Principal",
    subComponente: "Cartucho Filtrante",
    elementoEspecifico: "Elemento Coalescente",
    nodeId: "planta_compresores_principal_ga37_filtracion_principal_cartucho_coalescente"
  }]
}
```

---

## 🌲 RENDERIZADO DEL ÁRBOL

### Función Principal: renderJerarquiaTree()

```javascript
// Línea 47100 en index.html
renderJerarquiaTree() {
  const container = document.getElementById('jerarquiaTree');
  if (!container) return;

  // 1. Construir estructura desde repuestos
  const treeData = this.buildJerarquiaTreeData();
  
  // 2. Renderizar HTML recursivo
  container.innerHTML = this.renderJerarquiaNode(treeData, 1);
  
  // 3. Restaurar estado de expansión
  this.restoreExpansionState();
}
```

### Construcción de Datos del Árbol

```javascript
// Línea 47200 en index.html
buildJerarquiaTreeData() {
  const tree = {
    nivel: 0,
    nombre: 'Planta Completa',
    nodeId: 'root',
    children: new Map(),
    repuestos: []
  };

  // Recorrer cada repuesto
  this.repuestos.forEach(repuesto => {
    if (!repuesto.ubicaciones || repuesto.ubicaciones.length === 0) {
      return; // Sin ubicación, skip
    }

    const ubicacion = repuesto.ubicaciones[0];
    let currentNode = tree;

    // Construir jerarquía nivel por nivel
    const niveles = [
      { key: 'plantaGeneral', value: ubicacion.plantaGeneral },
      { key: 'areaGeneral', value: ubicacion.areaGeneral },
      { key: 'subArea', value: ubicacion.subArea },
      { key: 'sistemaEquipo', value: ubicacion.sistemaEquipo },
      { key: 'subSistema', value: ubicacion.subSistema },
      { key: 'componentePrincipal', value: ubicacion.componentePrincipal },
      { key: 'subComponente', value: ubicacion.subComponente },
      { key: 'elementoEspecifico', value: ubicacion.elementoEspecifico }
    ];

    niveles.forEach((nivel, index) => {
      if (!nivel.value) return;

      // Crear nodo si no existe
      if (!currentNode.children.has(nivel.value)) {
        currentNode.children.set(nivel.value, {
          nivel: index + 1,
          nombre: nivel.value,
          nodeId: this.generateNodeId(niveles.slice(0, index + 1)),
          children: new Map(),
          repuestos: []
        });
      }

      currentNode = currentNode.children.get(nivel.value);
    });

    // Agregar repuesto al nodo final
    currentNode.repuestos.push(repuesto);
  });

  return tree;
}
```

### Renderizado Recursivo de Nodos

```javascript
// Línea 47450 en index.html
renderJerarquiaNode(node, nivel) {
  if (!node.children || node.children.size === 0) {
    // Nodo hoja: mostrar repuestos
    return this.renderRepuestosList(node.repuestos, node.nodeId);
  }

  // Nodo rama: mostrar children
  const isExpanded = this.expandedNodes.has(node.nodeId);
  const childrenArray = Array.from(node.children.values());
  const totalRepuestos = this.countRepuestos(node);

  return `
    <div class="jerarquia-node nivel-${nivel}" data-node-id="${node.nodeId}">
      <!-- Header del nodo -->
      <div class="node-header" onclick="app.toggleNode('${node.nodeId}')">
        <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
        <span class="node-icon">${this.getIconForLevel(nivel)}</span>
        <span class="node-name">${node.nombre}</span>
        <span class="node-badge">${totalRepuestos} repuestos</span>
      </div>

      <!-- Children (ocultos si collapsed) -->
      <div class="node-children" style="display: ${isExpanded ? 'block' : 'none'}">
        ${childrenArray.map(child => 
          this.renderJerarquiaNode(child, nivel + 1)
        ).join('')}
      </div>
    </div>
  `;
}
```

### Lista de Repuestos en Nodo

```javascript
// Línea 47650 en index.html
renderRepuestosList(repuestos, nodeId) {
  if (!repuestos || repuestos.length === 0) {
    return '';
  }

  return `
    <div class="repuestos-list">
      ${repuestos.map(r => `
        <div class="repuesto-item" data-id="${r.id}">
          <div class="repuesto-icon">📦</div>
          <div class="repuesto-info">
            <strong>${r.nombre}</strong>
            <span>${r.codSAP}</span>
          </div>
          <div class="repuesto-actions">
            <button onclick="app.verRepuestoEnJerarquia('${r.id}')">
              👁️ Ver
            </button>
            ${r.ubicacionesMapa?.length > 0 ? `
              <button onclick="app.verRepuestoEnMapa('${r.id}')">
                🗺️ Mapa
              </button>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
```

---

## 🔍 SISTEMA DE BÚSQUEDA

### Construcción del Índice

```javascript
// Línea 60465 en index.html
buildJerarquiaSearchIndex() {
  this.jerarquiaSearchIndex = [];

  this.repuestos.forEach(repuesto => {
    if (!repuesto.ubicaciones || repuesto.ubicaciones.length === 0) {
      return;
    }

    const ubicacion = repuesto.ubicaciones[0];
    
    // Construir path completo
    const path = [
      ubicacion.plantaGeneral,
      ubicacion.areaGeneral,
      ubicacion.subArea,
      ubicacion.sistemaEquipo,
      ubicacion.subSistema,
      ubicacion.componentePrincipal,
      ubicacion.subComponente,
      ubicacion.elementoEspecifico
    ].filter(Boolean).join(' → ');

    // Agregar al índice
    this.jerarquiaSearchIndex.push({
      id: repuesto.id,
      nombre: repuesto.nombre,
      codigo: repuesto.codSAP,
      path: path,
      nodeId: ubicacion.nodeId,
      searchText: `${repuesto.nombre} ${repuesto.codSAP} ${path}`.toLowerCase()
    });
  });
}
```

### Búsqueda con Autocompletado

```javascript
// Línea 60600 en index.html
handleJerarquiaSearch(query) {
  const resultsContainer = document.getElementById('jerarquiaSearchResults');
  
  if (!query || query.length < 2) {
    resultsContainer.style.display = 'none';
    return;
  }

  const queryLower = query.toLowerCase();
  
  // Buscar en índice
  const results = this.jerarquiaSearchIndex
    .filter(item => item.searchText.includes(queryLower))
    .slice(0, 10); // Máximo 10 resultados

  if (results.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results">Sin resultados</div>';
    resultsContainer.style.display = 'block';
    return;
  }

  // Renderizar resultados
  resultsContainer.innerHTML = results.map(item => `
    <div class="search-result-item" onclick="app.selectSearchResult('${item.id}')">
      <div class="result-name">${this.highlightQuery(item.nombre, query)}</div>
      <div class="result-code">${item.codigo}</div>
      <div class="result-path">${this.highlightQuery(item.path, query)}</div>
    </div>
  `).join('');

  resultsContainer.style.display = 'block';
}
```

### Selección de Resultado

```javascript
// Línea 60750 en index.html
selectSearchResult(repuestoId) {
  // Ocultar autocomplete
  document.getElementById('jerarquiaSearchResults').style.display = 'none';
  
  // Limpiar input
  document.getElementById('jerarquiaSearchInput').value = '';
  
  // Navegar a repuesto
  this.verRepuestoEnJerarquia(repuestoId);
}
```

---

## 🧭 EXPANSIÓN Y NAVEGACIÓN

### Navegar a Repuesto

```javascript
// Línea 48494 en index.html
verRepuestoEnJerarquia(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto || !repuesto.ubicaciones || repuesto.ubicaciones.length === 0) {
    this.showToast('⚠️ Repuesto sin ubicación en jerarquía', 'warning');
    return;
  }

  // 1. Cambiar a tab Jerarquía
  this.switchTab('jerarquia');

  // 2. Expandir path completo
  const ubicacion = repuesto.ubicaciones[0];
  const pathToExpand = this.buildPathToNode(ubicacion);
  
  pathToExpand.forEach(nodeId => {
    this.expandedNodes.add(nodeId);
  });

  // 3. Re-renderizar árbol
  this.renderJerarquiaTree();

  // 4. Scroll y highlight del repuesto
  setTimeout(() => {
    const element = document.querySelector(`[data-id="${repuestoId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight');
      
      setTimeout(() => {
        element.classList.remove('highlight');
      }, 2000);
    }
  }, 100);
}
```

### Expandir Path Completo

```javascript
// Línea 48620 en index.html
buildPathToNode(ubicacion) {
  const path = [];
  const niveles = [
    'plantaGeneral',
    'areaGeneral',
    'subArea',
    'sistemaEquipo',
    'subSistema',
    'componentePrincipal',
    'subComponente',
    'elementoEspecifico'
  ];

  let nodeIdParts = [];
  
  niveles.forEach(nivel => {
    if (ubicacion[nivel]) {
      nodeIdParts.push(this.slugify(ubicacion[nivel]));
      path.push(nodeIdParts.join('_'));
    }
  });

  return path;
}
```

### Toggle de Nodo

```javascript
// Línea 47850 en index.html
toggleNode(nodeId) {
  if (this.expandedNodes.has(nodeId)) {
    this.expandedNodes.delete(nodeId);
  } else {
    this.expandedNodes.add(nodeId);
  }

  // Guardar estado
  localStorage.setItem('expandedNodes', 
    JSON.stringify(Array.from(this.expandedNodes))
  );

  // Re-renderizar solo el nodo afectado
  const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
  if (nodeElement) {
    const childrenContainer = nodeElement.querySelector('.node-children');
    const expandIcon = nodeElement.querySelector('.expand-icon');
    
    if (this.expandedNodes.has(nodeId)) {
      childrenContainer.style.display = 'block';
      expandIcon.textContent = '▼';
    } else {
      childrenContainer.style.display = 'none';
      expandIcon.textContent = '▶';
    }
  }
}
```

### Expandir/Contraer Todo

```javascript
// Línea 48000 en index.html
expandAllNodes() {
  // Obtener todos los nodeIds del árbol
  const allNodeIds = this.getAllNodeIds();
  
  allNodeIds.forEach(nodeId => {
    this.expandedNodes.add(nodeId);
  });

  this.renderJerarquiaTree();
  this.showToast('✅ Árbol expandido completamente', 'success');
}

collapseAllNodes() {
  this.expandedNodes.clear();
  this.renderJerarquiaTree();
  this.showToast('✅ Árbol contraído completamente', 'success');
}

getAllNodeIds() {
  const nodeIds = [];
  
  const traverse = (node) => {
    if (node.nodeId && node.nodeId !== 'root') {
      nodeIds.push(node.nodeId);
    }
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  };

  const treeData = this.buildJerarquiaTreeData();
  traverse(treeData);
  
  return nodeIds;
}
```

---

## 🔑 PARSER DE NODEID

### Generar NodeId

```javascript
// Línea 48150 en index.html
generateNodeId(niveles) {
  return niveles
    .map(n => this.slugify(n.value))
    .filter(Boolean)
    .join('_');
}

slugify(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')           // Espacios → _
    .replace(/[^\w\-]+/g, '')       // Quitar caracteres especiales
    .replace(/\_\_+/g, '_')         // Múltiples _ → uno solo
    .replace(/^_+/, '')             // Quitar _ inicial
    .replace(/_+$/, '');            // Quitar _ final
}
```

### Parsear NodeId a Jerarquía

```javascript
// Línea 48250 en index.html
parseNodeId(nodeId) {
  const parts = nodeId.split('_');
  const niveles = [
    'plantaGeneral',
    'areaGeneral',
    'subArea',
    'sistemaEquipo',
    'subSistema',
    'componentePrincipal',
    'subComponente',
    'elementoEspecifico'
  ];

  const jerarquia = {};
  
  parts.forEach((part, index) => {
    if (index < niveles.length) {
      jerarquia[niveles[index]] = this.deslugify(part);
    }
  });

  return jerarquia;
}

deslugify(slug) {
  // Intentar reconstruir texto original
  return slug
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize
}
```

---

## 🗺️ INTEGRACIÓN CON MAPAS

### Sincronización Jerarquía ↔ Mapa

```javascript
// Línea 49500 en index.html
syncJerarquiaConMapa(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto) return;

  // Verificar que tenga ambas ubicaciones
  const tieneJerarquia = repuesto.ubicaciones?.length > 0;
  const tieneMapa = repuesto.ubicacionesMapa?.length > 0;

  if (tieneJerarquia && tieneMapa) {
    const ubicacion = repuesto.ubicaciones[0];
    const ubicacionMapa = repuesto.ubicacionesMapa[0];

    // Sincronizar jerarquía del mapa con jerarquía del repuesto
    ubicacionMapa.jerarquia = {
      plantaGeneral: ubicacion.plantaGeneral,
      areaGeneral: ubicacion.areaGeneral,
      subArea: ubicacion.subArea,
      sistemaEquipo: ubicacion.sistemaEquipo,
      subSistema: ubicacion.subSistema,
      componentePrincipal: ubicacion.componentePrincipal,
      subComponente: ubicacion.subComponente,
      elementoEspecifico: ubicacion.elementoEspecifico
    };

    // Guardar cambios
    this.guardarTodo();
  }
}
```

### Botón "Ver en Mapa"

```javascript
// Línea 49650 en index.html
verRepuestoEnMapa(repuestoId) {
  const repuesto = this.repuestos.find(r => r.id === repuestoId);
  if (!repuesto || !repuesto.ubicacionesMapa || repuesto.ubicacionesMapa.length === 0) {
    this.showToast('⚠️ Repuesto sin ubicación en mapa', 'warning');
    return;
  }

  const ubicacionMapa = repuesto.ubicacionesMapa[0];

  // 1. Cambiar a tab Mapas
  this.switchTab('mapas');

  // 2. Cargar mapa correcto
  if (ubicacionMapa.mapaId !== mapController.currentMapId) {
    mapController.loadMap(ubicacionMapa.mapaId);
  }

  // 3. Pan a coordenadas
  setTimeout(() => {
    mapController.panTo(
      ubicacionMapa.coordenadas.x,
      ubicacionMapa.coordenadas.y,
      1.5 // Zoom
    );

    // 4. Highlight temporal
    mapController.highlightPoint(
      ubicacionMapa.coordenadas.x,
      ubicacionMapa.coordenadas.y
    );
  }, 300);
}
```

---

## 📚 FUNCIONES CLAVE

### Top 10 Funciones de Jerarquía

| Función | Línea | Propósito |
|---------|-------|-----------|
| `renderJerarquiaTree()` | 47100 | Renderiza árbol completo |
| `buildJerarquiaTreeData()` | 47200 | Construye estructura de datos |
| `buildJerarquiaSearchIndex()` | 60465 | Crea índice de búsqueda |
| `verRepuestoEnJerarquia()` | 48494 | Navega y expande a repuesto |
| `handleJerarquiaSearch()` | 60600 | Búsqueda con autocompletado |
| `toggleNode()` | 47850 | Expande/contrae nodo |
| `expandAllNodes()` | 48000 | Expande todo el árbol |
| `generateNodeId()` | 48150 | Genera ID único de nodo |
| `parseNodeId()` | 48250 | Convierte nodeId a jerarquía |
| `syncJerarquiaConMapa()` | 49500 | Sincroniza con sistema de mapas |

---

**Continúa con:** [`SPARK_05_MAPAS.md`](./SPARK_05_MAPAS.md)


================================================================================

## ⏭️ SIGUIENTE: SPARK_05_MAPAS.md

