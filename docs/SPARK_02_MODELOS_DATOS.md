# 📊 Modelos de Datos - APP Inventario v6.0

**Módulo 2/5** - Estructuras de datos completas  
**Fecha:** 27 de noviembre de 2025

---

## 📋 ÍNDICE

1. [Estructura de Repuesto](#estructura-de-repuesto)
2. [Estructura de Mapa](#estructura-de-mapa)
3. [Estructura de Zona](#estructura-de-zona)
4. [Estructura de Jerarquía](#estructura-de-jerarquía)
5. [LocalStorage](#localstorage)
6. [IndexedDB](#indexeddb)
7. [FileSystem](#filesystem)

---

## 🔧 ESTRUCTURA DE REPUESTO

### Modelo Completo

```javascript
{
  // ===== IDENTIFICACIÓN =====
  "id": "17613843384470.6770781112528935",  // Timestamp único
  "codSAP": "REP-001",                      // Código SAP (obligatorio)
  "codProv": "PROV-ABC",                    // Código proveedor (opcional)
  "tipo": "Eléctrico",                      // Tipo de repuesto
  "categoria": "Repuesto",                  // Categoría fija
  "nombre": "Chumacera Ovalada de 2 pernos FL206",  // Nombre descriptivo
  
  // ===== UBICACIONES (NUEVO FORMATO v6.0) =====
  "ubicaciones": [
    {
      "areaGeneral": "Planta Principal",
      "subArea": "Filete",
      "sistemaEquipo": "Cinta Curva ( Estructura )",
      "subSistema": "",                     // Opcional
      "seccion": "",                        // Opcional
      "detalle": "",                        // Opcional
      "cantidadEnUbicacion": 4,            // Cantidad en esta ubicación
      "jerarquiaPath": [                   // Path completo en jerarquía
        {
          "id": "nivel1-1763524403524-e313",
          "name": "Aquachile Antarfood Chonchi",
          "level": "planta",
          "storageKey": "nivel1"
        },
        {
          "id": "nivel2-1763524403524-ad1a",
          "name": "Planta Principal",
          "level": "areaGeneral",
          "storageKey": "nivel2"
        },
        {
          "id": "nivel3-1763524403524-7339",
          "name": "Filete",
          "level": "subArea",
          "storageKey": "nivel3"
        },
        {
          "id": "nivel4-1763524403524-99d1",
          "name": "Cinta Curva ( Estructura )",
          "level": "sistemaEquipo",
          "storageKey": "nivel4"
        }
      ]
    }
  ],
  
  // ===== UBICACIONES EN MAPAS (NUEVO v6.0.1) =====
  "ubicacionesMapa": [
    {
      "tipo": "mapa",
      "mapaId": 1760411932641,
      "zonaId": null,                       // Opcional: ID de zona
      "coordenadas": {
        "x": 3236.7,
        "y": 1675.2
      },
      "numeroCorrelativo": 1,               // Número de instancia (si hay múltiples)
      "fechaAsignacion": "2025-11-21T10:30:00.000Z"
    }
  ],
  
  // ===== CAMPOS LEGACY (Compatibilidad v5.x) =====
  "planta": "Aquachile Antarfood Chonchi",  // Deprecated
  "areaGeneral": "Planta Principal",        // Deprecated
  "subArea": "Filete",                      // Deprecated
  "sistemaEquipo": "Cinta Curva",           // Deprecated
  "subSistema": "",                         // Deprecated
  "seccion": "",                            // Deprecated
  "detalle": "",                            // Deprecated
  "area": "Planta Principal",               // Deprecated
  "equipo": "Cinta Curva ( Estructura )",   // Deprecated
  "sistema": "",                            // Deprecated
  "detalleUbicacion": "",                   // Deprecated
  
  // ===== STOCK Y CANTIDADES =====
  "cantidad": 0,                            // Cantidad actual en bodega
  "cantidadInstalada": 4,                   // Cantidad instalada en planta
  "minimo": 5,                              // Stock mínimo requerido
  "optimo": 10,                             // Stock óptimo deseado
  
  // ===== INFORMACIÓN ECONÓMICA =====
  "precio": 0,                              // Precio unitario (0 = sin precio)
  
  // ===== INFORMACIÓN TÉCNICA =====
  "datosTecnicos": "- Rodamiento SUC 206\n- Chumacera ovalada FL206\n- Eje 30 mm",
  
  // ===== MULTIMEDIA =====
  "multimedia": [
    {
      "type": "image",
      "url": "./imagenes/1763398441608_Pendiente_Chumacera_Ovalada_de_2_pernos__foto1.webp",
      "name": "chumacera ovalada de 2 pernos FL 206.jpg",
      "size": 109078,
      "isFileSystem": true
    }
  ],
  
  // ===== ESTADOS (NUEVO v6.0.1) =====
  "estado_ubicacion": "completo",           // sin_ubicacion | jerarquia_sola | mapa_solo | completo
  "progreso_flujo": "Ubicado",             // Borrador | Listo para ubicar | Ubicado
  
  // ===== METADATOS =====
  "ultimaModificacion": "2025-11-19T03:53:38.295Z",
  "ultimoConteo": null                     // Timestamp del último conteo físico
}
```

### Campos Obligatorios vs Opcionales

```javascript
// ✅ OBLIGATORIOS (validación en formulario)
{
  id: string,              // Auto-generado
  codSAP: string,          // Input requerido
  nombre: string,          // Input requerido
  categoria: "Repuesto",   // Valor fijo
}

// ⚠️ OPCIONALES (pueden estar vacíos)
{
  codProv: string,         // Código proveedor
  tipo: string,            // Tipo de repuesto
  ubicaciones: array,      // Puede ser []
  ubicacionesMapa: array,  // Puede ser []
  cantidad: number,        // Default 0
  cantidadInstalada: number, // Default 0
  minimo: number,          // Default 0
  optimo: number,          // Default 0
  precio: number,          // Default 0
  datosTecnicos: string,   // Puede estar vacío
  multimedia: array,       // Puede ser []
}

// 🤖 AUTO-CALCULADOS (no se ingresan manualmente)
{
  estado_ubicacion: string,   // Calculado en runtime
  progreso_flujo: string,     // Calculado en runtime
  ultimaModificacion: string, // Timestamp automático
}
```

### Tipos de Estado de Ubicación

```javascript
// estado_ubicacion: string
// Calculado por: app.calcularEstadoUbicacion(repuesto)

"sin_ubicacion"     // Sin ubicaciones[] ni ubicacionesMapa[]
"jerarquia_sola"    // Con ubicaciones[] pero sin ubicacionesMapa[]
"mapa_solo"         // Con ubicacionesMapa[] pero sin ubicaciones[]
"completo"          // Con ambos: ubicaciones[] Y ubicacionesMapa[]

// Lógica de cálculo:
function calcularEstadoUbicacion(repuesto) {
  const tieneJerarquia = repuesto.ubicaciones && repuesto.ubicaciones.length > 0;
  const tieneMapa = repuesto.ubicacionesMapa && repuesto.ubicacionesMapa.length > 0;
  
  if (tieneJerarquia && tieneMapa) return 'completo';
  if (tieneJerarquia) return 'jerarquia_sola';
  if (tieneMapa) return 'mapa_solo';
  return 'sin_ubicacion';
}
```

### Tipos de Progreso de Flujo

```javascript
// progreso_flujo: string
// Calculado por: app.calcularProgresoFlujo(repuesto)

"Borrador"             // Sin ubicación en jerarquía ni mapa
"Listo para ubicar"    // Con ubicación en jerarquía, sin mapa
"Ubicado"              // Con ubicación en mapa (completo)

// Lógica de cálculo:
function calcularProgresoFlujo(repuesto) {
  const estado = app.calcularEstadoUbicacion(repuesto);
  
  if (estado === 'sin_ubicacion') return 'Borrador';
  if (estado === 'jerarquia_sola') return 'Listo para ubicar';
  if (estado === 'mapa_solo' || estado === 'completo') return 'Ubicado';
  
  return 'Borrador'; // Fallback
}
```

### Ejemplos Reales del Sistema

#### Repuesto SIN Ubicación

```javascript
{
  "id": "1234567890123",
  "codSAP": "REP-NEW-001",
  "nombre": "Repuesto Nuevo Sin Ubicar",
  "categoria": "Repuesto",
  "ubicaciones": [],                    // ← Vacío
  "ubicacionesMapa": [],                // ← Vacío
  "cantidad": 10,
  "minimo": 5,
  "optimo": 15,
  "multimedia": [],
  "estado_ubicacion": "sin_ubicacion",  // ← Auto-calculado
  "progreso_flujo": "Borrador"          // ← Auto-calculado
}
```

#### Repuesto CON Jerarquía, SIN Mapa

```javascript
{
  "id": "1234567890124",
  "codSAP": "REP-PARTIAL-002",
  "nombre": "Repuesto Con Jerarquía Solamente",
  "categoria": "Repuesto",
  "ubicaciones": [
    {
      "areaGeneral": "Planta Industrial",
      "subArea": "Producción",
      "sistemaEquipo": "Línea 1",
      "cantidadEnUbicacion": 5
    }
  ],                                    // ← Con datos
  "ubicacionesMapa": [],                // ← Vacío
  "estado_ubicacion": "jerarquia_sola", // ← Auto-calculado
  "progreso_flujo": "Listo para ubicar" // ← Auto-calculado
}
```

#### Repuesto COMPLETO (Jerarquía + Mapa)

```javascript
{
  "id": "17613843384470",
  "codSAP": "REP-COMPLETE-003",
  "nombre": "Repuesto Completamente Ubicado",
  "categoria": "Repuesto",
  "ubicaciones": [
    {
      "areaGeneral": "Planta Principal",
      "subArea": "Filete",
      "sistemaEquipo": "Cinta Curva",
      "cantidadEnUbicacion": 4
    }
  ],                                    // ← Con datos
  "ubicacionesMapa": [
    {
      "tipo": "mapa",
      "mapaId": 1760411932641,
      "coordenadas": { "x": 3236.7, "y": 1675.2 }
    }
  ],                                    // ← Con datos
  "estado_ubicacion": "completo",       // ← Auto-calculado
  "progreso_flujo": "Ubicado"           // ← Auto-calculado
}
```

---

## 🗺️ ESTRUCTURA DE MAPA

### Modelo Completo

```javascript
{
  // ===== IDENTIFICACIÓN =====
  "id": 1760411932641,                  // Timestamp único
  "name": "Planta Principal",           // Nombre descriptivo
  
  // ===== IMAGEN =====
  "imagePath": "imagenes/mapas/map_1760411932641.png",
  "width": 9362,                        // Ancho en pixels
  "height": 6623,                       // Alto en pixels
  
  // ===== METADATOS =====
  "createdAt": "2025-10-14T03:18:52.886Z",
  "updatedAt": "2025-11-15T00:21:05.263Z",
  
  // ===== JERARQUÍA ASOCIADA =====
  "jerarquiaPath": [
    {
      "id": "AQ-IN",
      "nivel": "empresa"
    },
    {
      "id": "PCHO",
      "nivel": "area"
    }
  ],
  
  // ===== CONFIGURACIÓN =====
  "allowFreeLevel": false,              // Permitir sin jerarquía (debug)
  "mapLevel": "area"                    // Nivel en jerarquía: empresa | area | subArea | etc.
}
```

### Ejemplo Real: Mapa de Empresa

```javascript
{
  "id": 1763209400991,
  "name": "Recinto Aquachile Antarfood",
  "imagePath": "imagenes/mapas/map_1763209400991.png",
  "width": 18725,
  "height": 13245,
  "createdAt": "2025-11-15T12:23:21.221Z",
  "updatedAt": "2025-11-15T12:23:38.348Z",
  "jerarquiaPath": [
    {
      "id": "AQ-IN",
      "nivel": "empresa"
    }
  ],
  "allowFreeLevel": false,
  "mapLevel": "empresa"                 // ← Mapa de nivel empresa (vista general)
}
```

### Ejemplo Real: Mapa de Área

```javascript
{
  "id": 1760411932641,
  "name": "Planta Principal",
  "imagePath": "imagenes/mapas/map_1760411932641.png",
  "width": 9362,
  "height": 6623,
  "createdAt": "2025-10-14T03:18:52.886Z",
  "updatedAt": "2025-11-15T00:21:05.263Z",
  "jerarquiaPath": [
    {
      "id": "AQ-IN",
      "nivel": "empresa"
    },
    {
      "id": "PCHO",
      "nivel": "area"                   // ← Mapa de nivel área (detallado)
    }
  ],
  "allowFreeLevel": false,
  "mapLevel": "area"
}
```

### Niveles de Mapa Posibles

```javascript
// mapLevel: string

"empresa"       // Vista general de toda la empresa
"area"          // Vista de un área específica (más común)
"subArea"       // Vista de sub-área (detalle)
"sistema"       // Vista de sistema específico (muy detallado)
// ... más niveles según jerarquía

// Uso:
// - Mapas de nivel empresa: Planos generales, layout completo
// - Mapas de nivel área: Detalles de producción, secciones
// - Mapas de nivel sistema: Diagramas técnicos, equipos específicos
```

---

## 📍 ESTRUCTURA DE ZONA

### Modelo Completo

```javascript
{
  // ===== IDENTIFICACIÓN =====
  "id": 1761002703272,                  // Timestamp único
  "mapId": 1760411932641,               // ID del mapa padre
  "name": "Pocket Grader",              // Nombre de la zona
  
  // ===== VISUAL =====
  "color": "#10b981",                   // Color de relleno (hex)
  "opacity": 0.35,                      // Opacidad (0.0 - 1.0)
  
  // ===== GEOMETRÍA =====
  "points": [
    {
      "x": 3236.779313981518,
      "y": 1675.254350186932
    },
    {
      "x": 3433.928228080213,
      "y": 1678.6599826724691
    },
    {
      "x": 3437.870555089753,
      "y": 1836.3504588629453
    },
    {
      "x": 3239.116701597045,
      "y": 1836.6481817672113
    }
  ],                                    // Polígono cerrado (último punto = primer punto)
  
  // ===== JERARQUÍA ASOCIADA =====
  "jerarquia": {
    "nivel1": "Aquachile Antarfood",    // Empresa
    "nivel2": "Planta Principal",       // Área General
    "nivel3": "Eviscerado",             // Sub-Área
    "nivel4": "Grader",                 // Sistema/Equipo
    "nivel5": "Pocket 1 al 4",          // Sub-Sistema
    "nivel6": "Sistema Neumático",      // Sección
    "nivel7": null                      // Sub-Sección (opcional)
  },
  
  // ===== EQUIPOS/REPUESTOS =====
  "equipos": [],                        // Array de IDs de repuestos en esta zona
  
  // ===== METADATOS =====
  "createdAt": "2025-10-20T23:25:03.272Z",
  "updatedAt": "2025-10-21T22:47:43.198Z",
  
  // ===== CATEGORIZACIÓN =====
  "category": "maquina",                // maquina | area | storage | office | etc.
  
  // ===== POSICIÓN DE LABEL =====
  "labelOffsetX": 0,                    // Offset X del label (pixels)
  "labelOffsetY": 0                     // Offset Y del label (pixels)
}
```

### Tipos de Categorías

```javascript
// category: string

"maquina"       // Máquina o equipo
"area"          // Área de trabajo
"storage"       // Almacenamiento/bodega
"office"        // Oficina
"bathroom"      // Baño
"hallway"       // Pasillo
"parking"       // Estacionamiento
"green_space"   // Área verde
"danger_zone"   // Zona peligrosa
"restricted"    // Acceso restringido

// Uso:
// - Filtros por categoría en UI
// - Colores automáticos según tipo
// - Iconos específicos por categoría
```

### Detección de Click en Zona (Hit Detection)

```javascript
// Algoritmo: Ray Casting para polígonos
function isPointInZone(x, y, zone) {
  const points = zone.points;
  let inside = false;
  
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

// Uso en mapController:
canvas.addEventListener('click', (e) => {
  const mapX = convertScreenToMapX(e.clientX);
  const mapY = convertScreenToMapY(e.clientY);
  
  const zona = mapStorage.state.zonas.find(z => 
    z.mapId === currentMapId && isPointInZone(mapX, mapY, z)
  );
  
  if (zona) {
    console.log('Click en zona:', zona.name);
    showZoneInfo(zona);
  }
});
```

---

## 🌳 ESTRUCTURA DE JERARQUÍA

### Jerarquía de 8 Niveles

```javascript
// Niveles disponibles:
1. Empresa/Planta
2. Área General
3. Sub-Área
4. Sistema/Equipo
5. Sub-Sistema
6. Sección
7. Sub-Sección
8. Detalle

// Ejemplo completo:
Aquachile Antarfood Chonchi              // Nivel 1: Empresa
└─ Planta Principal                      // Nivel 2: Área General
   └─ Eviscerado                         // Nivel 3: Sub-Área
      └─ Grader                          // Nivel 4: Sistema/Equipo
         └─ Pocket 1 al 4                // Nivel 5: Sub-Sistema
            └─ Sistema Neumático         // Nivel 6: Sección
               └─ Válvulas de Control    // Nivel 7: Sub-Sección
                  └─ Válvula Principal   // Nivel 8: Detalle
```

### Modelo de Jerarquía Anidada

```javascript
// app.jerarquiaAnidada (estructura global)
{
  "areas": [
    {
      "id": "empresa_0",                // ID único del nodo
      "nombre": "Aquachile Antarfood Chonchi",
      "level": "empresa",
      "children": [
        {
          "id": "empresa_0_area_0",
          "nombre": "Planta Principal",
          "level": "area",
          "children": [
            {
              "id": "empresa_0_area_0_subarea_0",
              "nombre": "Eviscerado",
              "level": "subArea",
              "children": [
                {
                  "id": "empresa_0_area_0_subarea_0_sistema_0",
                  "nombre": "Grader",
                  "level": "sistema",
                  "children": [
                    {
                      "id": "empresa_0_area_0_subarea_0_sistema_0_subsistema_0",
                      "nombre": "Pocket 1 al 4",
                      "level": "subSistema",
                      "children": [
                        {
                          "id": "empresa_0_area_0_subarea_0_sistema_0_subsistema_0_seccion_0",
                          "nombre": "Sistema Neumático",
                          "level": "seccion",
                          "children": []
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "empresa_0_area_1",
          "nombre": "Planta Secundaria",
          "level": "area",
          "children": []
        }
      ]
    }
  ]
}
```

### Construcción de NodeId

```javascript
// Formato: nivel_índice1_nivel_índice2_...

// Ejemplos:
"empresa_0"                             // Primera empresa (índice 0)
"empresa_0_area_1"                      // Segunda área de primera empresa
"empresa_0_area_1_subarea_2"           // Tercera sub-área de segunda área
"empresa_0_area_1_subarea_2_sistema_3" // Cuarto sistema de tercera sub-área

// Lógica de construcción:
function construirNodeId(path) {
  // path = ['empresa', 0, 'area', 1, 'subarea', 2]
  let id = '';
  for (let i = 0; i < path.length; i += 2) {
    const level = path[i];      // 'empresa', 'area', 'subarea'
    const index = path[i + 1];  // 0, 1, 2
    id += (id ? '_' : '') + level + '_' + index;
  }
  return id;
  // → "empresa_0_area_1_subarea_2"
}
```

### Parsing de NodeId a Ubicación

```javascript
// Función: app.extraerUbicacionDesdeNodoId(nodeId)
// Líneas: 48580-48730 en index.html

function extraerUbicacionDesdeNodoId(nodeId) {
  // Ejemplo input: "empresa_0_area_1_subarea_2_sistema_3"
  
  // 1. Split por '_' y parsear niveles
  const parts = nodeId.split('_');
  // → ['empresa', '0', 'area', '1', 'subarea', '2', 'sistema', '3']
  
  // 2. Crear pares [nivel, índice]
  const pairs = [];
  for (let i = 0; i < parts.length; i += 2) {
    pairs.push({
      level: parts[i],        // 'empresa', 'area', etc.
      index: parseInt(parts[i + 1])  // 0, 1, 2, etc.
    });
  }
  // → [
  //     { level: 'empresa', index: 0 },
  //     { level: 'area', index: 1 },
  //     { level: 'subarea', index: 2 },
  //     { level: 'sistema', index: 3 }
  //   ]
  
  // 3. Navegar jerarquía anidada
  let current = app.jerarquiaAnidada.areas[pairs[0].index]; // Empresa
  const ubicacion = {
    planta: current.nombre
  };
  
  // 4. Recorrer niveles restantes
  for (let i = 1; i < pairs.length; i++) {
    const pair = pairs[i];
    const child = current.children[pair.index];
    
    if (!child) {
      console.error('No se encontró child en índice', pair.index);
      break;
    }
    
    // Mapear nivel a campo de ubicación
    switch (pair.level) {
      case 'area':
        ubicacion.areaGeneral = child.nombre;
        break;
      case 'subarea':
        ubicacion.subArea = child.nombre;
        break;
      case 'sistema':
        ubicacion.sistemaEquipo = child.nombre;
        break;
      case 'subsistema':
        ubicacion.subSistema = child.nombre;
        break;
      case 'seccion':
        ubicacion.seccion = child.nombre;
        break;
      case 'subseccion':
        ubicacion.subSeccion = child.nombre;
        break;
      case 'detalle':
        ubicacion.detalle = child.nombre;
        break;
    }
    
    current = child;
  }
  
  return ubicacion;
  // → {
  //     planta: "Aquachile Antarfood Chonchi",
  //     areaGeneral: "Planta Principal",
  //     subArea: "Eviscerado",
  //     sistemaEquipo: "Grader"
  //   }
}
```

### Áreas Genéricas

```javascript
// IDs especiales para áreas sin jerarquía
"generic_root_area_0"           // Primera área genérica
"generic_root_area_1"           // Segunda área genérica
"generic_root_area_0_1"         // Primer sub-nivel de primera área

// Ejemplo completo:
{
  "id": "generic_root_area_0",
  "nombre": "Uso General",
  "level": "generic",
  "children": [
    {
      "id": "generic_root_area_0_0",
      "nombre": "Pernos y Tornillos",
      "children": []
    },
    {
      "id": "generic_root_area_0_1",
      "nombre": "Desoxidantes",
      "children": []
    }
  ]
}

// Visual en árbol:
📦 Uso General (generic)
  ├─ 📦 Pernos y Tornillos
  └─ 📦 Desoxidantes

// VS organizacional:
🏢 Aquachile Antarfood (empresa)
  └─ 🏭 Planta Principal (área)
     └─ ⚙️ Eviscerado (sub-área)
```

---

## 💾 LOCALSTORAGE

### Claves y Estructuras

```javascript
// ===== DATOS PRINCIPALES =====

// Repuestos (backup de FileSystem)
localStorage.getItem('inventario')
// Formato: JSON array de repuestos
// Tamaño: ~500 KB (57 repuestos con multimedia)

// Mapas (backup de FileSystem)
localStorage.getItem('mapas')
// Formato: JSON array de mapas
// Tamaño: ~5 KB (2 mapas)

// Zonas (backup de FileSystem)
localStorage.getItem('zonas')
// Formato: JSON array de zonas
// Tamaño: ~30 KB (30 zonas)

// ===== ESTADOS DE UI =====

// Estado de expansión del árbol de jerarquía
localStorage.getItem('jerarquia_expand_state')
// Formato: JSON object { nodeId: boolean }
// Ejemplo:
{
  "empresa_0": true,                    // Empresa expandida
  "empresa_0_area_0": true,             // Área expandida
  "empresa_0_area_0_subarea_0": false,  // Sub-área colapsada
  "generic_root_area_0": true           // Área genérica expandida
}

// Estado de expansión de listas de repuestos
localStorage.getItem('jerarquia_repuestos_expand_state')
// Formato: JSON object { nodeId: boolean }
// Ejemplo:
{
  "empresa_0_area_0_subarea_0_sistema_0": true,  // Lista visible
  "empresa_0_area_0_subarea_0_sistema_1": false  // Lista oculta
}

// ===== CONFIGURACIÓN DE USUARIO =====

// Modo de vista
localStorage.getItem('viewMode')
// Valores: 'auto' | 'mobile' | 'desktop'
// Default: 'auto'

// Items por página
localStorage.getItem('itemsPerPage')
// Valores: 'auto' | número (18, 21, 24, etc.)
// Default: 'auto'

// Paleta de jerarquía
localStorage.getItem('currentJerarquiaPalette')
// Valores: 'palette-visual' | 'palette-8'
// Default: 'palette-visual'

// ===== NOTIFICACIONES =====

// Notificaciones persistentes
localStorage.getItem('notifications')
// Formato: JSON array de objetos
// Ejemplo:
[
  {
    "id": "notif_1732742400000",
    "type": "success",
    "title": "Repuesto guardado",
    "message": "PARADA EMERGENCIA guardado exitosamente",
    "timestamp": "2025-11-27T10:00:00.000Z",
    "read": false
  }
]

// ===== CACHÉ =====

// Thumbnails de mapas
localStorage.getItem('map_thumbnails')
// Formato: JSON object { mapId: base64DataUrl }

// Stats de mapas (histórico)
localStorage.getItem('mapStatsPrevious')
// Formato: JSON object { mapas: 2, areas: 30, marcadores: 15 }

// Historial de búsqueda
localStorage.getItem('search_history')
// Formato: JSON array de strings
```

### Funciones de Gestión

```javascript
// Guardar en localStorage
function saveToLocalStorage(key, data) {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
    console.log(`✅ Guardado en localStorage: ${key} (${json.length} bytes)`);
  } catch (error) {
    console.error('❌ Error guardando en localStorage:', error);
    if (error.name === 'QuotaExceededError') {
      alert('⚠️ Almacenamiento lleno. Limpia datos antiguos.');
    }
  }
}

// Cargar desde localStorage
function loadFromLocalStorage(key, defaultValue = null) {
  try {
    const json = localStorage.getItem(key);
    if (json === null) return defaultValue;
    return JSON.parse(json);
  } catch (error) {
    console.error('❌ Error cargando desde localStorage:', error);
    return defaultValue;
  }
}

// Limpiar localStorage (útil para debugging)
function clearLocalStorage() {
  const keysToKeep = [
    'fileSystemDirectoryHandle',  // No borrar handle de FileSystem
    'viewMode',                    // Mantener configuración usuario
    'itemsPerPage'
  ];
  
  Object.keys(localStorage).forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Eliminado: ${key}`);
    }
  });
}
```

---

## 🗄️ INDEXEDDB

### Base de Datos: `inventario-db`

```javascript
// Configuración
const DB_NAME = 'inventario-db';
const DB_VERSION = 1;

// Object Stores (tablas)
'directory-handles'  // Handles de FileSystem Access API
'images'             // Blob URLs de imágenes
'thumbnails'         // Miniaturas generadas
```

### Object Store: `directory-handles`

```javascript
// Almacena handles de FileSystem Access API
{
  key: 'inventario-storage',        // ID único
  value: FileSystemDirectoryHandle  // Handle de carpeta
}

// Uso:
async function storeDirectoryHandle(handle) {
  const db = await openDB();
  const tx = db.transaction('directory-handles', 'readwrite');
  await tx.objectStore('directory-handles').put(handle, 'inventario-storage');
  await tx.done;
}

async function getDirectoryHandle() {
  const db = await openDB();
  return await db.get('directory-handles', 'inventario-storage');
}
```

### Object Store: `images`

```javascript
// Almacena blob URLs de imágenes cargadas
{
  key: 'imagenes/1763398441608_Pendiente_Chumacera_Ovalada.webp',
  value: {
    url: 'blob:http://localhost:8080/abc123-def456',
    timestamp: 1732742400000,
    size: 109078
  }
}

// Uso:
async function storeBlobUrl(filename, blobUrl, size) {
  const db = await openDB();
  const tx = db.transaction('images', 'readwrite');
  await tx.objectStore('images').put({
    url: blobUrl,
    timestamp: Date.now(),
    size: size
  }, filename);
  await tx.done;
}

async function getBlobUrl(filename) {
  const db = await openDB();
  const record = await db.get('images', filename);
  return record ? record.url : null;
}
```

### Object Store: `thumbnails`

```javascript
// Almacena thumbnails de mapas (100x100px)
{
  key: 1760411932641,  // mapId
  value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
}

// Uso:
async function storeThumbnail(mapId, dataUrl) {
  const db = await openDB();
  const tx = db.transaction('thumbnails', 'readwrite');
  await tx.objectStore('thumbnails').put(dataUrl, mapId);
  await tx.done;
}

async function getThumbnail(mapId) {
  const db = await openDB();
  return await db.get('thumbnails', mapId);
}
```

---

## 📂 FILESYSTEM

### Estructura de Carpetas

```
INVENTARIO_STORAGE/
├── inventario.json         (57 repuestos, ~500 KB)
├── mapas.json             (2 mapas, ~5 KB)
├── zonas.json             (30 zonas, ~30 KB)
├── repuestos.json         (backup legacy)
├── imagenes/
│   ├── 1763398441608_Pendiente_Chumacera_Ovalada_de_2_pernos__foto1.webp
│   ├── 1763398455431_Pendiente_Cinta_Curva_foto1.webp
│   └── ... (52 archivos, ~15 MB total)
│   └── mapas/
│       ├── map_1760411932641.png  (9362x6623, ~8 MB)
│       └── map_1763209400991.png  (18725x13245, ~25 MB)
├── backups/
│   ├── automaticos/
│   │   ├── backup_2025-11-19_02-19-00/
│   │   ├── backup_2025-11-19_02-35-36/
│   │   └── ... (últimos 20 backups)
│   ├── fase3_cleanup/
│   ├── mapas/
│   ├── migracion/
│   ├── unificacion/
│   └── zonas/
└── logs/                   (vacío - logs eliminados)
```

### Formato de Archivos JSON

```javascript
// inventario.json
[
  { ...repuesto1 },
  { ...repuesto2 },
  ...
]

// mapas.json
[
  { ...mapa1 },
  { ...mapa2 }
]

// zonas.json
[
  { ...zona1 },
  { ...zona2 },
  ...
]
```

### Sistema de Backups Automáticos

```javascript
// Estructura de backup:
backups/automaticos/backup_YYYY-MM-DD_HH-MM-SS/
├── inventario.json
├── mapas.json
└── zonas.json

// Ejemplo:
backups/automaticos/backup_2025-11-19_02-19-00/
├── inventario.json  (snapshot del momento)
├── mapas.json
└── zonas.json

// Límite: Últimos 20 backups
// Antigüedad: Se eliminan automáticamente los más viejos
```

---

## 🔄 SINCRONIZACIÓN DE DATOS

### Flujo de Guardado

```
1. Usuario modifica datos (crear/editar repuesto)
   ↓
2. app.guardarTodo() invocada
   ↓
3. Guardar en FileSystem (primario)
   await fsManager.saveInventario(app.repuestos)
   ↓
4. Guardar en localStorage (backup)
   localStorage.setItem('inventario', JSON.stringify(app.repuestos))
   ↓
5. Crear backup automático (si hay inactividad)
   backupManager.marcarCambiosPendientes()
   ↓
6. Emitir evento de sincronización
   appEvents.dispatchEvent('data-changed')
   ↓
7. ✅ Datos persistidos en 3 lugares:
   - FileSystem (primario)
   - localStorage (backup rápido)
   - Backup automático (histórico)
```

### Flujo de Carga

```
1. Aplicación inicia
   ↓
2. Verificar FileSystem conectado
   if (fsManager.isFileSystemMode) { ... }
   ↓
3. Cargar desde FileSystem (primario)
   app.repuestos = await fsManager.loadInventario()
   ↓
4. Si FileSystem falla → cargar desde localStorage
   app.repuestos = JSON.parse(localStorage.getItem('inventario'))
   ↓
5. Restaurar estados de UI
   restoreTreeState()
   restoreFilters()
   ↓
6. Renderizar UI
   app.renderInventario()
   app.renderJerarquiaTree()
   ↓
7. ✅ Aplicación lista
```

---

## 📚 PRÓXIMOS PASOS

**Continúa con:** [`FUNCIONES_CORE.md`](./FUNCIONES_CORE.md) para ver las funciones principales con código completo.

---

**Documentación de Modelos de Datos Completa** ✅
