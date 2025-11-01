# 🧪 PRUEBAS v6.0 - Paso a Paso

## ✅ Funcionalidades Implementadas (Fase 1)

### 1. **Interfaz Base**
- ✅ 6 pestañas de navegación
- ✅ Diseño neumórfico oscuro (igual a v5.4.0)
- ✅ Toolbar con botones
- ✅ Filtros múltiples
- ✅ Vista tarjetas/lista
- ✅ Paginación automática

### 2. **Modal Agregar/Editar**
- ✅ Formulario completo con validación
- ✅ Campos: Código SAP, Proveedor, Tipo, Categoría
- ✅ Descripción y jerarquía (Área, Equipo, Sistema)
- ✅ Stock, Instalados, Mínimo, Óptimo
- ✅ Precio y datos técnicos
- ✅ Guardar nuevo repuesto
- ✅ Editar repuesto existente (click en tarjeta)

### 3. **Arquitectura Modular**
- ✅ Usa `InventarioEnhanced` (con validación automática)
- ✅ Usa `fsManager` mejorado (con eventos)
- ✅ EventBus para comunicación
- ✅ Toast notifications automáticas
- ✅ Manejo de errores robusto

---

## 🧪 CÓMO PROBAR

### Paso 1: Conectar Storage
1. Abre `inventario_v6.0.html` en el navegador
2. Click en el botón "🔌" (connection button)
3. Selecciona la carpeta `INVENTARIO_STORAGE`
4. Verifica que el icono cambie a "✅"
5. Debe aparecer toast: "📂 Conectado: ..."

### Paso 2: Agregar Repuesto
1. Click en "➕ Agregar"
2. Llena el formulario:
   - **Código SAP**: TEST001
   - **Categoría**: Repuesto
   - **Descripción**: Rodamiento SKF 6205
   - **Área**: Producción
   - **Equipo**: Compresor 01
   - **Stock Actual**: 10
   - **Mínimo**: 5
3. Click "💾 Guardar"
4. Debe aparecer toast: "Repuesto agregado correctamente"
5. La tarjeta debe aparecer en el grid

### Paso 3: Editar Repuesto
1. Click sobre la tarjeta recién creada
2. Debe abrirse el modal con los datos cargados
3. Modifica el stock (ej: cambiar a 3)
4. Click "💾 Guardar"
5. Debe aparecer toast: "Repuesto actualizado correctamente"
6. La tarjeta debe reflejar el cambio (icono ⚠️ si está bajo mínimo)

### Paso 4: Probar Filtros
1. Agregar 2-3 repuestos más con diferentes áreas/tipos
2. Usar los filtros de área, equipo, tipo
3. Verificar que el grid se actualice
4. Probar filtro de stock (Críticos, Agotados)

### Paso 5: Probar Búsqueda
1. Escribir en el buscador
2. Debe filtrar en tiempo real
3. Probar con código, descripción, área

### Paso 6: Cambiar Vista
1. Click en "Lista"
2. Debe mostrar tabla en lugar de tarjetas
3. Click en "Tarjetas" para volver

### Paso 7: Verificar Paginación
1. Si hay más de 21 items, debe aparecer paginación
2. Navegar entre páginas
3. Verificar contador "Página X de Y"

---

## ⚠️ PROBLEMAS CONOCIDOS

### ❌ **No Implementado Aún**
- Múltiples ubicaciones por repuesto
- Carga de imágenes/documentos
- Tabs: Jerarquía, Mapa, Stats, Valores, Configuración
- Exportar a PDF/Excel/CSV
- Backups automáticos
- Sistema de mapas interactivo

### 🔄 **En Progreso**
- Modal funcional ✅
- CRUD básico ✅
- Filtros ✅
- Búsqueda ✅
- Vistas ✅

---

## 📋 PRÓXIMOS PASOS

### Fase 2: Completar Inventario
1. Agregar botón eliminar en modal
2. Implementar carga de imágenes
3. Agregar documentos adjuntos
4. Múltiples ubicaciones
5. Lightbox para imágenes

### Fase 3: Tabs Adicionales
1. Tab Jerarquía (vista árbol)
2. Tab Mapa (canvas interactivo)
3. Tab Stats (gráficos y estadísticas)
4. Tab Valores (gestión de precios)
5. Tab Configuración (opciones)

### Fase 4: Funciones Avanzadas
1. Exportar PDF/Excel/CSV
2. Backups automáticos
3. Restaurar backups
4. Historial de cambios
5. Búsqueda avanzada

---

## 🐛 REPORTAR PROBLEMAS

Si encuentras algún error durante las pruebas:

1. Abre la consola del navegador (F12)
2. Copia el error completo
3. Anota los pasos exactos para reproducir
4. Revisa que la v5.4.0 siga funcionando (backup seguro)

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] Se conecta correctamente a INVENTARIO_STORAGE
- [ ] Se puede agregar repuesto nuevo
- [ ] Se puede editar repuesto haciendo click
- [ ] Los filtros funcionan correctamente
- [ ] El buscador filtra en tiempo real
- [ ] Cambiar entre vista tarjetas/lista funciona
- [ ] La paginación aparece cuando hay muchos items
- [ ] Los toasts se muestran correctamente
- [ ] Los iconos de stock cambian según nivel (✅⚠️🔴)
- [ ] Los datos se guardan en el archivo JSON

---

## 🎯 OBJETIVO FINAL

Tener una **v6.0 completamente funcional** que:
- Replique TODAS las funciones de v5.4.0
- Use arquitectura modular por dentro
- Mantenga el mismo diseño y UX
- Sea más fácil de mantener y extender
- Tenga validación y manejo de errores robusto

**Progreso actual: ~20%** (base funcional lista)
