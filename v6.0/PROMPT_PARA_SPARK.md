# 🤖 PROMPT PARA GITHUB COPILOT SPARK

**Copia y pega este prompt en Spark para crear la app completa**

---

## 📋 PROMPT OPTIMIZADO

```
Crea una aplicación web completa de gestión de inventario industrial con las siguientes especificaciones:

ARQUITECTURA:
- Single Page Application (SPA) con HTML5, CSS3 y JavaScript vanilla (sin frameworks)
- Diseño responsive mobile-first con grid de 6 columnas
- Dark mode por defecto con paleta de colores moderna
- Sistema de tabs para navegación (Inventario, Jerarquía, Mapas)

FUNCIONALIDADES PRINCIPALES:

1. TAB INVENTARIO:
   - CRUD completo de repuestos con wizard modal de 7 pasos
   - Grid de cards 6 columnas responsive con paginación (24 items/página)
   - Búsqueda global con filtros avanzados (nombre, SAP, categoría, jerarquía)
   - Lightbox para galería de imágenes con zoom/pan y thumbnails
   - Sistema de toasts para notificaciones
   - Exportar a Excel/CSV

2. TAB JERARQUÍA:
   - Árbol jerárquico visual de 8 niveles expandible/colapsable:
     * Nivel 1: Planta General
     * Nivel 2: Área General
     * Nivel 3: SubÁrea General
     * Nivel 4: Sistema General
     * Nivel 5: SubSistema General
     * Nivel 6: Sección General
     * Nivel 7: SubSección General
     * Nivel 8: Equipo Específico
   - Búsqueda en árbol con autocompletado y highlighting
   - Click en nodo navega a repuestos asociados
   - Contador de repuestos por nodo
   - Sincronización bidireccional con Tab Inventario y Mapas

3. TAB MAPAS:
   - Canvas HTML5 interactivo con zoom/pan suave
   - Carga de imágenes de planos (PNG/JPG)
   - Dibujo de zonas poligonales con coordenadas
   - Marcadores de ubicación con popup de info
   - Asignación de repuestos a zonas/marcadores
   - Minimap overlay para navegación
   - Breadcrumb de mapas activos
   - Hit detection preciso para clicks en zonas
   - Sincronización con jerarquía (zonas tienen nodos jerárquicos)

ALMACENAMIENTO DE DATOS:

Usar Cloudinary para imágenes (fotos de repuestos y mapas):
- Configurar upload directo desde navegador (unsigned preset)
- Generar thumbnails automáticos (300x300px)
- Transformaciones on-the-fly para optimización
- Implementar CloudinaryService class con:
  * uploadImage(file, options) - Upload con progress bar
  * uploadMultiple(files) - Upload batch
  * getThumbnailUrl(publicId) - Generar URL de thumbnail
  * getTransformedUrl(publicId, transforms) - URLs con transformaciones

Estructura de datos JSON para localStorage:
- repuestos.json (array de repuestos)
- mapas.json (array de mapas)
- zonas.json (array de zonas)
- jerarquia.json (árbol de nodos)

MODELO DE DATOS:

Repuesto {
  id: string (único),
  codSAP: string,
  nombre: string,
  descripcion: string,
  multimedia: [{ 
    id, type, name, url, thumbnailUrl, cloudinaryId, 
    size, width, height, uploadDate, source 
  }],
  nivel1-nivel8: string (jerarquía de 8 niveles),
  ubicaciones: [{ nivel1-nivel8, mapaId, zonaId, coordX, coordY }],
  cantidadActual: number,
  stockMinimo: number,
  stockMaximo: number,
  unidadMedida: string,
  categoria: string,
  criticidad: string,
  proveedor: { nombre, contacto, email, telefono },
  especificacionesTecnicas: { key: value },
  ultimaActualizacion: timestamp,
  creadoPor: string,
  notas: string
}

Mapa {
  id: string,
  name: string,
  imagePath: string (Cloudinary URL),
  thumbnailUrl: string,
  width: number,
  height: number,
  jerarquia: { nivel1-nivel8 },
  zonas: [zonaId],
  createdAt: timestamp
}

Zona {
  id: string,
  mapaId: string,
  nombre: string,
  type: "polygon" | "circle" | "rectangle",
  coordinates: [[x, y]],
  color: string,
  jerarquia: { nivel1-nivel8 },
  repuestosAsignados: [repuestoId],
  descripcion: string
}

FLUJO DE TRABAJO INTEGRADO (v6.0.1):

Fase 1 (Crear): Usuario crea repuesto en wizard de 7 pasos
  → Paso 1: Datos básicos (SAP, nombre, descripción)
  → Paso 2: Fotos (upload a Cloudinary con progress)
  → Paso 3: Categoría y criticidad
  → Paso 4: Ubicaciones (asignar jerarquía de 8 niveles)
  → Paso 5: Stock (cantidad, mínimo, máximo)
  → Paso 6: Especificaciones técnicas
  → Paso 7: Proveedor y notas
  → Botón "Guardar y Continuar a Jerarquía" al finalizar

Fase 2 (Ubicar): Navega automáticamente a Tab Jerarquía
  → Expandir árbol hasta el nodo del repuesto
  → Highlight del nodo seleccionado
  → Mostrar panel flotante con info del repuesto
  → Botón "Continuar a Mapas" si hay mapa asociado

Fase 3 (Marcar): Navega a Tab Mapas
  → Cargar mapa asociado a la jerarquía
  → Mostrar zonas existentes
  → Permitir marcar ubicación precisa del repuesto
  → Guardar coordenadas (x, y) en el repuesto
  → Toast de confirmación "✅ Repuesto ubicado completamente"

SINCRONIZACIÓN CROSS-TAB:

- Click en repuesto en Inventario → Highlight en Jerarquía + Mostrar en Mapa
- Click en nodo en Jerarquía → Filtrar Inventario + Cargar Mapa asociado
- Click en zona en Mapa → Mostrar repuestos asignados + Expandir nodo en Jerarquía
- Usar EventTarget global (window.appEvents) para comunicación entre tabs

COMPONENTES UI:

Wizard Modal (resizable y draggable):
- Timeline visual con 7 pasos numerados
- Validación por paso antes de avanzar
- Navegación: Anterior, Siguiente, Guardar
- Persistencia temporal de datos (sessionStorage)
- Indicador de progreso visual

Toast System:
- 4 tipos: success (verde), error (rojo), warning (amarillo), info (azul)
- Auto-dismiss en 3-5 segundos
- Stack vertical en esquina superior derecha
- Animaciones de entrada/salida suaves
- Botón de cierre manual

Lightbox:
- Galería full-screen con flechas navegación
- Zoom con rueda del mouse (0.5x a 4x)
- Pan con drag cuando zoom > 1
- Thumbnails en barra inferior
- Contador "N / Total"
- Botón de descarga de imagen original
- Cierre con ESC o click fuera

OPTIMIZACIONES:

- Lazy loading de imágenes con Intersection Observer
- Debounce en búsqueda (300ms)
- Virtual scrolling para listas largas (>100 items)
- Caché de renderizado de árbol jerárquico
- Web Workers para operaciones pesadas (opcional)
- Service Worker para funcionamiento offline (opcional)

DEPLOYMENT:

- Configurar para Netlify/Vercel (archivo netlify.toml incluido)
- Variables de entorno para Cloudinary:
  * CLOUDINARY_CLOUD_NAME
  * CLOUDINARY_UPLOAD_PRESET
- Build optimizado con minificación
- Gzip compression habilitado
- CDN para assets estáticos

ESTILOS CSS:

Variables CSS custom properties:
--primary: #4f46e5
--secondary: #818cf8
--success: #10b981
--danger: #ef4444
--warning: #f59e0b
--info: #3b82f6
--bg-primary: #0f172a
--bg-secondary: #1e293b
--text-primary: #f1f5f9
--text-secondary: #cbd5e1
--text-muted: #94a3b8
--border: #334155
--radius-sm: 6px
--radius-md: 10px
--radius-lg: 16px
--shadow-sm: 0 1px 3px rgba(0,0,0,0.3)
--shadow-md: 0 4px 12px rgba(0,0,0,0.4)
--shadow-lg: 0 10px 30px rgba(0,0,0,0.5)

REQUISITOS TÉCNICOS:

- Compatible con Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Responsive: Desktop (1920px), Tablet (768px), Mobile (375px)
- Accesibilidad WCAG 2.1 AA
- Soporte de teclado (Tab, Enter, ESC, flechas)
- Loading states en todas las operaciones async
- Error handling robusto con try-catch
- Console.log detallado para debugging

ESTRUCTURA DE ARCHIVOS:

/
├── index.html (app principal)
├── netlify.toml (configuración deployment)
├── README.md
├── modules/
│   ├── cloudinary-service.js
│   ├── hierarchy-sync.js
│   ├── map-enhancements.js
│   └── modal-resizable.js
├── styles/
│   ├── main.css
│   ├── mapas-hierarchy.css
│   └── components.css
└── data/
    ├── repuestos.json (vacío inicial)
    ├── mapas.json (vacío inicial)
    └── zonas.json (vacío inicial)

DOCUMENTACIÓN INCLUIDA:

Lee y sigue EXACTAMENTE las especificaciones de estos 11 documentos markdown:
1. SPARK_00_INDEX.md - Índice maestro
2. SPARK_01_GUIA_RAPIDA.md - Arquitectura general
3. SPARK_02_MODELOS_DATOS.md - Estructuras de datos
4. SPARK_03_INVENTARIO.md - Tab Inventario
5. SPARK_04_JERARQUIA.md - Sistema de jerarquía 8 niveles
6. SPARK_05_MAPAS.md - Canvas y mapas interactivos
7. SPARK_06_FLUJO_V601.md - Flujo guiado 3 fases
8. SPARK_07_FUNCIONES_TOP30.md - Funciones críticas
9. SPARK_08_COMPONENTES_UI.md - Wizard, Toasts, Lightbox
10. SPARK_09_SCRIPTS_HERRAMIENTAS.md - Scripts Node.js
11. SPARK_10_CLOUDINARY_DEPLOYMENT.md - Cloudinary + Deploy

PRIORIDADES DE IMPLEMENTACIÓN:

1. Setup básico: HTML structure + CSS variables + Layout responsive
2. Módulo Cloudinary: cloudinary-service.js con upload funcional
3. Tab Inventario: Grid de cards + CRUD + Wizard 7 pasos
4. Tab Jerarquía: Árbol 8 niveles + Búsqueda + Navegación
5. Tab Mapas: Canvas + Zoom/Pan + Zonas + Marcadores
6. Sincronización cross-tab: EventTarget + Navegación integrada
7. Flujo guiado v6.0.1: 3 fases (Crear → Ubicar → Marcar)
8. Componentes UI: Toast + Lightbox + Modal resizable
9. Persistencia: localStorage + Cloudinary
10. Deploy: Configurar Netlify + Variables entorno

FUNCIONES CRÍTICAS A IMPLEMENTAR:

- guardarTodo() - Persistir datos en localStorage
- cargarTodo() - Cargar datos al iniciar
- renderInventario() - Renderizar grid de repuestos
- renderCards() - Generar HTML de cada card
- buildJerarquiaSearchIndex() - Indexar árbol para búsqueda
- renderJerarquiaTree() - Renderizar árbol jerárquico
- verRepuestoEnJerarquia(id) - Navegar a repuesto en árbol
- loadMap(mapId) - Cargar mapa en canvas
- drawZones() - Dibujar zonas en canvas
- handleZoneClick(x, y) - Detectar click en zona
- saveAndContinueToJerarquia() - Fase 1 → Fase 2 del flujo
- continuarAMapa() - Fase 2 → Fase 3 del flujo
- handleFileUpload() - Upload a Cloudinary con progress
- showToast(message, type) - Mostrar notificación
- abrirLightbox(repuestoId, index) - Abrir galería de imágenes

TESTING:

Crea datos de ejemplo para testing (5 repuestos, 2 mapas, 3 zonas):
- Repuesto 1: "Rodamiento SKF 6205-2RS" en Planta Principal > Producción > Eviscerado > Máquina A
- Repuesto 2: "Motor WEG 5HP" en Planta Principal > Mantenimiento > Taller
- Repuesto 3: "Sensor de temperatura PT100" en Planta Principal > Producción > Congelado
- Mapa 1: "Plano Planta Principal - Piso 1" con 2 zonas
- Mapa 2: "Plano Área Eviscerado" con 1 zona

ENTREGABLES FINALES:

✅ Aplicación web 100% funcional lista para publicar
✅ Todos los tabs operativos (Inventario, Jerarquía, Mapas)
✅ Flujo guiado completo funcionando
✅ Cloudinary integrado y probado
✅ Datos de ejemplo cargados
✅ README.md con instrucciones de uso
✅ Archivo netlify.toml configurado
✅ Sin errores en consola
✅ Responsive en móvil, tablet y desktop
✅ Listo para agregar credenciales de Cloudinary y deployar

IMPORTANTE:
- Sigue AL PIE DE LA LETRA las especificaciones de los 11 documentos SPARK_*.md
- NO inventes funcionalidades no documentadas
- Implementa TODAS las funciones listadas en SPARK_07_FUNCIONES_TOP30.md
- La sincronización cross-tab es CRÍTICA, debe funcionar perfectamente
- El wizard de 7 pasos debe ser idéntico al especificado en SPARK_08
- El árbol jerárquico debe tener EXACTAMENTE 8 niveles como en SPARK_04
- El canvas de mapas debe incluir zoom/pan como en SPARK_05
- Cloudinary debe estar integrado como en SPARK_10

¡Crea la aplicación completa y funcional ahora!
```

---

## 📝 NOTAS PARA EL USUARIO

### Antes de pegar en Spark:

1. ✅ Asegúrate de tener los 11 archivos SPARK_*.md en el proyecto
2. ✅ Crea cuenta gratuita en Cloudinary (https://cloudinary.com/users/register_free)
3. ✅ Configura un Upload Preset "unsigned" llamado `inventario_app`
4. ✅ Anota tu Cloud Name y Upload Preset

### Después de que Spark genere la app:

1. Reemplazar en el código:
   ```javascript
   const CLOUDINARY_CONFIG = {
     cloudName: 'dxyz123abc',        // ← TU CLOUD NAME
     uploadPreset: 'inventario_app'  // ← TU UPLOAD PRESET
   };
   ```

2. Probar localmente:
   ```bash
   npx serve .
   # O abrir index.html directamente en navegador
   ```

3. Deployar en Netlify:
   ```bash
   # Arrastrar carpeta a https://app.netlify.com/drop
   # O conectar repo GitHub
   ```

4. ✅ ¡Listo para usar en producción!

---

## 🎯 COMANDOS DE PRUEBA

Una vez generada la app, probar en consola:

```javascript
// Ver estado
console.log(app.repuestos.length);
console.log(app.jerarquiaActiva);
console.log(mapController.currentMapId);

// Crear repuesto de prueba
app.openModal();

// Buscar en jerarquía
app.buildJerarquiaSearchIndex();
app.filterJerarquia('eviscerado');

// Navegar
app.verRepuestoEnJerarquia('rep_001');

// Upload test
// (Usar botón de "Seleccionar archivos" en el wizard)
```

---

**¡Este prompt le dará a Spark TODA la información necesaria para crear la app completa!** 🚀
