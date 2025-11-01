# 🧪 PRUEBAS v6.0 - PASO A PASO

## 📋 **CHECKLIST DE FUNCIONALIDADES**

### ✅ **Fase 1: Verificación Visual (SIN datos)**

1. **Abrir `inventario_v6.0.html`**
   - ✅ Debe cargar sin errores en consola
   - ✅ Ver header con logo "Inventario Pro v6.0"
   - ✅ Ver 6 tabs: Inventario, Jerarquía, Mapa, Estadísticas, Valores, Configuración

2. **TAB INVENTARIO** (activo por defecto)
   - ✅ Botón verde **"+ Agregar Repuesto"** (arriba izquierda)
   - ✅ Toggle **"Precio"** (checkbox)
   - ✅ Botones **"📇 Tarjetas"** y **"📋 Lista"**
   - ✅ Botón **"💾 FileSystem"** (indicador de storage)
   - ✅ Buscador con 🔍
   - ✅ Contenedor de **filtros chips** (vacío inicialmente)
   - ✅ Selectores de filtro: Áreas, Equipos, Tipos, Stock
   - ✅ Mensaje **"📦 No hay repuestos"** en el centro

3. **MODAL (Click en "Agregar Repuesto")**
   - ✅ Se abre modal con título "Agregar Repuesto"
   - ✅ Campo **Código SAP** (obligatorio)
   - ✅ Campo **Código Proveedor**
   - ✅ Campo **Tipo**
   - ✅ Select **Categoría** (Repuesto, Insumo, Herramienta, EPP, Químico)
   - ✅ Campo **Nombre/Descripción** (obligatorio)
   - ✅ Sección **"Ubicaciones del Repuesto"**
   - ✅ Botón **"+ Agregar Ubicación"**
   - ✅ Contenedor vacío `ubicacionesContainer` (se llena al hacer click)
   - ✅ Campos: Stock Actual, Instalados, Mínimo, Óptimo, Precio
   - ✅ Textarea **Datos Técnicos**
   - ✅ Input **📸 Imágenes** (file multiple)
   - ✅ Input **📎 Documentos** (file multiple)
   - ✅ Botones **"💾 Guardar"** y **"❌ Cancelar"**

4. **LIGHTBOX** (inicialmente oculto)
   - ✅ Existe el elemento `<div id="lightbox">`
   - ✅ Botones: X (cerrar), ‹ (anterior), › (siguiente)
   - ✅ Contenedor de imagen
   - ✅ Contador de imágenes

---

### ✅ **Fase 2: Prueba de Navegación**

5. **TAB JERARQUÍA**
   - ✅ Cambiar al tab "🏗️ Jerarquía"
   - ✅ Ver mensaje "Vista de Jerarquía - Funcionalidad en desarrollo"
   
6. **TAB MAPA**
   - ✅ Cambiar al tab "🗺️ Mapa"
   - ✅ Ver título "Mapa de Ubicaciones"
   - ✅ Ver `<canvas id="mapCanvas">` (fondo gris oscuro)
   
7. **TAB ESTADÍSTICAS**
   - ✅ Cambiar al tab "📊 Estadísticas"
   - ✅ Ver contenedores `statsGrid` y `statsDetails` (vacíos sin datos)
   
8. **TAB VALORES**
   - ✅ Cambiar al tab "💰 Valores"
   - ✅ Ver cards con "Valor Total: $0", "Repuestos con Precio: 0", "Valor Promedio: $0"
   
9. **TAB CONFIGURACIÓN**
   - ✅ Cambiar al tab "⚙️ Configuración"
   - ✅ Ver mensaje placeholder

---

### ✅ **Fase 3: Funcionalidad Core (CON datos)**

**⚠️ REQUISITO:** Tener carpeta `INVENTARIO_STORAGE` con datos

10. **Conexión a FileSystem**
    - ✅ Al iniciar, la app debe cargar datos de `INVENTARIO_STORAGE/inventario.json`
    - ✅ Verificar en **Consola del Navegador** (F12):
      ```
      🚀 Inventario Pro v6.0 - Cargando módulos originales...
      📦 Iniciando aplicación...
      ✅ Aplicación v6.0 lista (usando core original + EventBus mejoras)
      ```
    - ✅ Si hay repuestos, deben aparecer en tarjetas

11. **Agregar Repuesto**
    - ✅ Click en **"+ Agregar Repuesto"**
    - ✅ Llenar campos obligatorios:
      - Código SAP: `TEST001`
      - Categoría: `Repuesto`
      - Nombre: `Repuesto de Prueba v6.0`
      - Stock Actual: `10`
      - Mínimo: `5`
    - ✅ Click **"+ Agregar Ubicación"**
    - ✅ Debe aparecer un formulario con:
      - Empresa: "Aquachile Antarfood Chonchi" (readonly)
      - Área General (obligatorio)
      - Sub-área
      - Sistema/Equipo
      - Sub-Sistema
      - Sección
      - Detalle
    - ✅ Llenar **Área General**: `Área de Prueba`
    - ✅ Click **"💾 Guardar"**
    - ✅ Debe:
      - Cerrar modal
      - Aparecer nuevo repuesto en el grid
      - Guardarse en `inventario.json`
      - Mostrar toast de confirmación

12. **Editar Repuesto**
    - ✅ Click en **"✏️ Editar"** de cualquier tarjeta
    - ✅ Modal debe abrirse CON DATOS CARGADOS
    - ✅ Verificar que las ubicaciones se cargan correctamente
    - ✅ Modificar un campo (ej: aumentar Stock)
    - ✅ Guardar
    - ✅ Verificar que los cambios se reflejan

13. **Filtros**
    - ✅ Debe aparecer barra de **chips de filtro** con tipos únicos
    - ✅ Click en un chip (ej: "Filtro (5)")
    - ✅ Debe filtrar y mostrar solo repuestos de ese tipo
    - ✅ Chip debe cambiar de color a azul (activo)

14. **Búsqueda**
    - ✅ Escribir en el buscador (ej: "bomba")
    - ✅ Debe filtrar repuestos en tiempo real
    - ✅ Mostrar solo los que coincidan

15. **Vistas Tarjetas/Lista**
    - ✅ Click en **"📋 Lista"**
    - ✅ Cambiar a vista de tabla
    - ✅ Click en **"📇 Tarjetas"**
    - ✅ Volver a vista de tarjetas

16. **Lightbox (con imágenes)**
    - ✅ Si un repuesto tiene imágenes:
      - Click en la imagen de la tarjeta
      - Debe abrir lightbox a pantalla completa
      - Probar botones ‹ / › (navegar)
      - Probar ESC para cerrar
      - Probar X para cerrar

17. **Eliminar Repuesto**
    - ✅ Click en **"🗑️"** de una tarjeta
    - ✅ Debe pedir confirmación
    - ✅ Aceptar → debe eliminarse
    - ✅ Verificar que se elimina de `inventario.json`

---

### ✅ **Fase 4: Pruebas Avanzadas**

18. **Múltiples Ubicaciones**
    - ✅ Editar repuesto
    - ✅ Click **"+ Agregar Ubicación"** (2da vez)
    - ✅ Debe aparecer segunda columna con ubicación
    - ✅ Llenar ambas ubicaciones con datos diferentes
    - ✅ Guardar
    - ✅ Verificar en `inventario.json` que tiene array `ubicaciones[]`

19. **Subir Imágenes** (PC con FileSystem)
    - ✅ En modal, seleccionar imágenes (📸)
    - ✅ Debe mostrar previews
    - ✅ Guardar repuesto
    - ✅ Verificar que se crean en `INVENTARIO_STORAGE/imagenes/`
    - ✅ Formato debe ser WebP comprimido
    - ✅ Ruta debe ser jerárquica: `imagenes/AREA_GENERAL/archivo.webp`

20. **Toggle Precio**
    - ✅ Activar toggle "Precio"
    - ✅ Debe aparecer columna de precio en vista lista
    - ✅ Desactivar → debe ocultarse

21. **Estadísticas**
    - ✅ Ir a tab **"📊 Estadísticas"**
    - ✅ Con datos, debe mostrar:
      - Total de repuestos
      - Críticos / Bajo stock / Agotados
      - Gráficos de distribución
      - Valor total del inventario

22. **Mapa (si hay datos de mapa)**
    - ✅ Ir a tab **"🗺️ Mapa"**
    - ✅ Si hay mapa guardado, debe cargarse en canvas
    - ✅ Ver zonas dibujadas
    - ✅ (Funcionalidad completa requiere mapController)

---

## 🐛 **ERRORES COMUNES**

### Error: "app.openModal is not a function"
**Causa:** La instancia `window.app` no se creó correctamente  
**Solución:** Verificar en consola que se ejecutó `window.app = new InventarioCompleto()`

### Error: "Cannot read property 'innerHTML' of null"
**Causa:** Falta un elemento HTML con ID específico  
**Solución:** Buscar en consola qué ID falta y agregarlo al HTML

### Error: Modal no muestra ubicaciones
**Causa:** El `ubicacionesContainer` no existe o no tiene el ID correcto  
**Solución:** Verificar `<div id="ubicacionesContainer">` en el modal

### Error: Imágenes no se guardan
**Causa:** FileSystem API no tiene permisos  
**Solución:** 
1. Verificar que estás en navegador compatible (Chrome/Edge)
2. Verificar que diste permisos a la carpeta

---

## 📊 **RESULTADOS ESPERADOS**

| Funcionalidad | v5.4.0 | v6.0 | Estado |
|---------------|--------|------|--------|
| Agregar repuesto | ✅ | ✅ | 100% |
| Editar repuesto | ✅ | ✅ | 100% |
| Eliminar repuesto | ✅ | ✅ | 100% |
| Múltiples ubicaciones | ✅ | ✅ | 100% |
| Subir imágenes | ✅ | ✅ | 100% |
| Lightbox | ✅ | ✅ | 100% |
| Filtros | ✅ | ✅ | 100% |
| Búsqueda | ✅ | ✅ | 100% |
| Vistas (cards/list) | ✅ | ✅ | 100% |
| Jerarquía | ✅ | ⏳ | Pendiente |
| Mapa interactivo | ✅ | ⏳ | Básico |
| Estadísticas | ✅ | ✅ | 100% |
| Valores | ✅ | ✅ | 100% |
| Exportar PDF/Excel | ✅ | ⏳ | Pendiente |
| Backups automáticos | ✅ | ✅ | 100% (heredado) |

---

## 🎯 **PRÓXIMOS PASOS**

1. ✅ **Completar tabs avanzados** (Jerarquía completa, Mapa completo)
2. ✅ **Agregar exportación** (PDF, Excel, CSV)
3. ✅ **Mejorar UI visual** (copiar CSS faltante de v5.4.0)
4. ✅ **Optimizar rendimiento** (lazy loading de imágenes)
5. ✅ **Agregar PWA** (Service Worker para modo offline)

---

## 📞 **REPORTE DE BUGS**

Si encuentras algún error durante las pruebas, anota:

- **Paso donde ocurrió** (número de la lista)
- **Mensaje de error** (consola F12)
- **Comportamiento esperado vs observado**
- **Captura de pantalla** (si aplica)

---

**Última actualización:** 31 de octubre de 2025  
**Versión probada:** v6.0 (arquitectura modular)  
**Responsable:** Copilot (GitHub)
