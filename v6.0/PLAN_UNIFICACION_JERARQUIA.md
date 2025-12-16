# PLAN DE UNIFICACIÓN DE JERARQUÍA - 7 NIVELES
**Fecha**: 19 de noviembre de 2025  
**Objetivo**: Unificar jerarquía en Inventario, Jerarquía y Mapas bajo un sistema único de 7 niveles

---

## 📋 ESTRUCTURA OBJETIVO

```
N1: Empresa          (nuevo nivel raíz)
N2: Áreas           (antes: nivel1 en mapas, planta en inventario)
N3: Sub-áreas       (antes: nivel2 en mapas, areaGeneral en inventario)
N4: Sistema         (antes: nivel3 en mapas, sistemaEquipo en inventario)
N5: Sub-sistema     (antes: nivel4 en mapas, subSistema en inventario)
N6: Sección         (antes: nivel5 en mapas, seccion en inventario)
N7: Sub-sección     (antes: detalle en inventario)
```

---

## 🎯 FASE 1: PREPARACIÓN Y ANÁLISIS

### 1.1 Backup Completo
- [ ] Crear backup de `zonas.json`
- [ ] Crear backup de `repuestos.json`
- [ ] Crear backup de `mapas.json`
- [ ] Crear backup de `JERARQUIA_STORAGE/jerarquia.json` (si existe)
- [ ] Timestamp: `backup_unificacion_YYYYMMDD_HHMMSS/`

**Ubicación**: `INVENTARIO_STORAGE/backups/unificacion/`

### 1.2 Auditoría de Datos Actuales
- [ ] Analizar todos los valores únicos en `zona.jerarquia` (zonas.json)
- [ ] Analizar campos jerarquía en repuestos.json
- [ ] Analizar estructura `jerarquiaData` en app.js
- [ ] Identificar inconsistencias y valores huérfanos
- [ ] Documentar mapeo de migración

**Output**: `AUDITORIA_JERARQUIA_ACTUAL.json`

### 1.3 Análisis de Dependencias
- [ ] Listar funciones que leen `zona.jerarquia.*`
- [ ] Listar funciones que leen campos de inventario (`planta`, `areaGeneral`, etc.)
- [ ] Listar funciones que leen `jerarquiaData`
- [ ] Identificar event listeners relacionados
- [ ] Mapear flujo de datos entre módulos

**Output**: `DEPENDENCIAS_JERARQUIA.md`

---

## 🔧 FASE 2: MIGRACIÓN DE DATOS

### 2.1 Script de Migración - zonas.json
**Archivo**: `scripts/migrate-zonas-7niveles.cjs`

- [ ] Crear función de validación pre-migración
- [ ] Implementar transformación:
  ```javascript
  // ANTES (5 niveles)
  jerarquia: {
    nivel1: "Planta Principal",    // → nivel2
    nivel2: "Eviscerado",          // → nivel3
    nivel3: "Grader",              // → nivel4
    nivel4: "Pocket 1 al 4",       // → nivel5
    nivel5: "Sistema Neumático"    // → nivel6
  }
  
  // DESPUÉS (7 niveles)
  jerarquia: {
    nivel1: "Empresa X",           // ← NUEVO (valor por defecto)
    nivel2: "Planta Principal",    // ← era nivel1
    nivel3: "Eviscerado",          // ← era nivel2
    nivel4: "Grader",              // ← era nivel3
    nivel5: "Pocket 1 al 4",       // ← era nivel4
    nivel6: "Sistema Neumático",   // ← era nivel5
    nivel7: null                   // ← NUEVO (opcional)
  }
  ```
- [ ] Agregar validación post-migración
- [ ] Log de cambios realizados
- [ ] Modo dry-run (simular sin escribir)

**Tests**:
- [ ] Validar que todas las zonas tengan 7 campos
- [ ] Verificar que nivel1 sea "Empresa X" en todas
- [ ] Comprobar que no se perdieron datos

### 2.2 Script de Migración - repuestos.json
**Archivo**: `scripts/migrate-repuestos-7niveles.cjs`

- [ ] Mapear campos antiguos a nuevos:
  ```javascript
  // ANTES
  {
    planta: "Planta Principal",         // → nivel2
    areaGeneral: "Eviscerado",          // → nivel3
    subArea: "Grader",                  // → nivel4
    sistemaEquipo: "Pocket 1 al 4",     // → nivel5
    subSistema: "Sistema Neumático",    // → nivel6
    seccion: "Bomba Principal",         // → nivel6 o nivel7 (evaluar)
    detalle: "Detalle específico"       // → nivel7
  }
  
  // DESPUÉS
  {
    jerarquia: {
      nivel1: "Empresa X",
      nivel2: "Planta Principal",
      nivel3: "Eviscerado",
      nivel4: "Grader",
      nivel5: "Pocket 1 al 4",
      nivel6: "Sistema Neumático",
      nivel7: "Detalle específico"
    }
  }
  ```
- [ ] Mantener campos antiguos como deprecated (compatibilidad temporal)
- [ ] Agregar flag `_migrated: true`
- [ ] Log de transformaciones

**Tests**:
- [ ] Validar que todos los repuestos tengan campo `jerarquia`
- [ ] Verificar mapping correcto de valores
- [ ] Comprobar integridad de datos

### 2.3 Migración de jerarquiaData
- [ ] Verificar estructura actual en localStorage/archivo
- [ ] Migrar a formato unificado de 7 niveles
- [ ] Establecer "Empresa X" como raíz N1
- [ ] Reubicar todos los niveles existentes

---

## 🏗️ FASE 3: REFACTORIZACIÓN DE CÓDIGO

### 3.1 Módulo Central de Jerarquía
**Nuevo archivo**: `modules/jerarquia-manager.js`

- [ ] Crear clase `JerarquiaManager`
- [ ] Implementar estructura de 7 niveles:
  ```javascript
  const JERARQUIA_CONFIG = {
    nivel1: { label: 'Empresa', key: 'empresa' },
    nivel2: { label: 'Área', key: 'area' },
    nivel3: { label: 'Sub-área', key: 'subArea' },
    nivel4: { label: 'Sistema', key: 'sistema' },
    nivel5: { label: 'Sub-sistema', key: 'subSistema' },
    nivel6: { label: 'Sección', key: 'seccion' },
    nivel7: { label: 'Sub-sección', key: 'subSeccion' }
  };
  ```
- [ ] Métodos:
  - [ ] `getNivel(nivel)` - Obtener opciones de un nivel
  - [ ] `setNivel(nivel, valor)` - Establecer valor en nivel
  - [ ] `getFullPath(objeto)` - Obtener path completo N1→N7
  - [ ] `validateJerarquia(objeto)` - Validar estructura
  - [ ] `normalizeJerarquia(objeto)` - Normalizar formato antiguo→nuevo
  - [ ] `getDescendants(nivel, valor)` - Obtener hijos de un nodo
  - [ ] `syncJerarquia()` - Sincronizar entre pestañas
- [ ] Sistema de eventos:
  - [ ] `jerarquia:changed`
  - [ ] `jerarquia:node-added`
  - [ ] `jerarquia:node-removed`
  - [ ] `jerarquia:sync-complete`

### 3.2 Actualizar app.js - Inventario
**Ubicación**: `modules/app.js`

- [ ] Eliminar campos antiguos de `areaJerarquiaFieldOrder`
- [ ] Actualizar a sistema de 7 niveles
- [ ] Modificar funciones de lectura:
  - [ ] `cargarRepuestos()` - Leer nueva estructura
  - [ ] `guardarRepuesto()` - Guardar en nuevo formato
  - [ ] `filtrarPorJerarquia()` - Usar niveles unificados
  - [ ] `renderRepuestoRow()` - Mostrar jerarquía completa
- [ ] Implementar compatibilidad backward:
  ```javascript
  // Leer formato antiguo y convertir al nuevo
  if (repuesto.planta && !repuesto.jerarquia) {
    repuesto.jerarquia = normalizeOldFormat(repuesto);
  }
  ```
- [ ] Actualizar UI:
  - [ ] Formulario de creación/edición (7 selectores)
  - [ ] Tabla de visualización (mostrar path completo)
  - [ ] Filtros (7 niveles disponibles)

### 3.3 Actualizar app.js - Pestaña Jerarquía
**Ubicación**: `modules/app.js` (sección Jerarquía)

- [ ] Actualizar `jerarquiaLevelConfig` a 7 niveles
- [ ] Modificar funciones:
  - [ ] `cargarJerarquiaData()` - Leer estructura unificada
  - [ ] `guardarJerarquiaData()` - Guardar 7 niveles
  - [ ] `renderJerarquiaTree()` - Renderizar árbol completo
  - [ ] `agregarNodoJerarquia()` - Permitir 7 niveles
  - [ ] `eliminarNodoJerarquia()` - Actualizar referencias
- [ ] Sincronización con Inventario y Mapas
- [ ] Validación de integridad (no permitir N4 sin N3, etc.)

### 3.4 Actualizar Mapas/Zonas
**Ubicación**: `modules/app.js` (mapController)

- [ ] Actualizar funciones de lectura de zonas:
  - [ ] `cargarZonas()` - Leer 7 niveles
  - [ ] `guardarZona()` - Guardar 7 niveles
  - [ ] `renderAreaList()` - Mostrar path completo
  - [ ] `filterByJerarquia()` - Filtrar por 7 niveles
- [ ] Actualizar UI:
  - [ ] Formulario de zona (7 selectores jerárquicos)
  - [ ] Panel lateral (mostrar path N1→N7)
  - [ ] Tooltips con jerarquía completa
- [ ] Sincronización bidireccional:
  - [ ] Crear zona → Actualizar jerarquiaData
  - [ ] Cambio en Jerarquía → Actualizar zonas afectadas
  - [ ] Eliminar nodo → Warning de zonas huérfanas

### 3.5 Sistema de Sincronización Global
**Nuevo**: Event system unificado

- [ ] Implementar bus de eventos:
  ```javascript
  // Al cambiar jerarquía
  window.dispatchEvent(new CustomEvent('jerarquia:sync', {
    detail: { nivel, valor, action: 'add|remove|update' }
  }));
  ```
- [ ] Listeners en cada pestaña:
  - [ ] Inventario escucha cambios → Actualiza filtros
  - [ ] Jerarquía escucha cambios → Actualiza árbol
  - [ ] Mapas escucha cambios → Actualiza zonas
- [ ] Caché compartido:
  - [ ] `cachedJerarquiaStructure` unificado
  - [ ] Invalidación automática en cambios
  - [ ] Refresh en cambio de pestaña

---

## 🎨 FASE 4: ACTUALIZACIÓN DE UI

### 4.1 Formularios y Selectores
- [ ] Crear componente reutilizable `JerarquiaSelector`
- [ ] 7 selectores en cascada (N1→N2→...→N7)
- [ ] Carga dinámica de opciones según padre
- [ ] Validación: No permitir N4 sin N3
- [ ] Botón "Limpiar jerarquía"
- [ ] Breadcrumb visual: `Empresa > Planta > Eviscerado > ...`

### 4.2 Visualización en Tablas
- [ ] Columna "Jerarquía" con path completo
- [ ] Tooltip expandido con 7 niveles
- [ ] Badges por nivel (colores diferenciados N1-N7)
- [ ] Filtro rápido por cualquier nivel

### 4.3 Prototipo de Mapas
- [ ] Actualizar `prototype-mapas.html` con 7 niveles
- [ ] Sección "Lista de Mapas" (sin cambios)
- [ ] Sección "Jerarquía Completa" con 7 niveles:
  - [ ] N1 Empresa (raíz única)
  - [ ] N2-N7 anidados con indicadores de mapas
  - [ ] Diseño diferenciado (con mapa vs sin mapa)

---

## ✅ FASE 5: TESTING Y VALIDACIÓN

### 5.1 Tests Unitarios
- [ ] Test migración zonas.json (valores correctos, sin pérdida)
- [ ] Test migración repuestos.json (mapping correcto)
- [ ] Test jerarquiaManager (CRUD, validación, normalización)
- [ ] Test sincronización entre pestañas
- [ ] Test compatibilidad backward (leer formato antiguo)

### 5.2 Tests de Integración
- [ ] Crear repuesto con jerarquía 7 niveles → Guardar → Cargar
- [ ] Crear zona en mapa con jerarquía → Verificar en Jerarquía
- [ ] Eliminar nodo en Jerarquía → Verificar warning en Mapas
- [ ] Filtrar inventario por cada nivel (N1-N7)
- [ ] Cambiar de pestaña → Verificar sincronización

### 5.3 Tests de UI
- [ ] Selectores en cascada funcionan correctamente
- [ ] Breadcrumbs muestran path completo
- [ ] Badges de nivel se muestran correctamente
- [ ] Filtros por jerarquía funcionan
- [ ] Tooltips muestran info completa

### 5.4 Validación de Datos
- [ ] Todas las zonas tienen 7 campos de jerarquía
- [ ] Todas las zonas tienen nivel1 = "Empresa X"
- [ ] Todos los repuestos tienen campo `jerarquia`
- [ ] No hay valores null en niveles intermedios (N3 sin N2)
- [ ] Integridad referencial: Valores existen en jerarquiaData

---

## 🚀 FASE 6: DESPLIEGUE Y LIMPIEZA

### 6.1 Migración Productiva
- [ ] Ejecutar scripts de migración en orden:
  1. `migrate-zonas-7niveles.cjs`
  2. `migrate-repuestos-7niveles.cjs`
  3. `migrate-jerarquia-data.cjs`
- [ ] Validar logs de migración (sin errores)
- [ ] Verificar backups creados correctamente
- [ ] Probar app con datos migrados

### 6.2 Actualización de Documentación
- [ ] Actualizar README.md con nueva estructura
- [ ] Documentar API de JerarquiaManager
- [ ] Guía de migración para usuarios
- [ ] Changelog detallado

### 6.3 Limpieza de Código Legacy
**⚠️ SOLO después de validar funcionamiento completo**

- [ ] Eliminar campos deprecated de repuestos:
  - [ ] `planta`, `areaGeneral`, `subArea`, etc.
- [ ] Eliminar funciones de compatibilidad backward
- [ ] Eliminar flags `_migrated`
- [ ] Limpiar comentarios de migración
- [ ] Optimizar código duplicado

### 6.4 Monitoreo Post-Migración
- [ ] Verificar funcionamiento 24h después
- [ ] Revisar logs de errores
- [ ] Feedback de usuario
- [ ] Ajustes finales

---

## 📊 MÉTRICAS DE ÉXITO

- ✅ Todas las zonas migradas correctamente (0 errores)
- ✅ Todos los repuestos migrados correctamente (0 errores)
- ✅ Sincronización entre pestañas funciona en tiempo real
- ✅ UI muestra 7 niveles correctamente
- ✅ Filtros funcionan en los 3 módulos
- ✅ No hay regresiones (funcionalidad previa intacta)
- ✅ Backups creados y validados
- ✅ Documentación actualizada

---

## 🔄 ROLLBACK PLAN

**Si algo falla:**

1. **Detener migración inmediatamente**
2. **Restaurar desde backup**:
   ```powershell
   Copy-Item "backups/unificacion/zonas.json" "INVENTARIO_STORAGE/zonas.json"
   Copy-Item "backups/unificacion/repuestos.json" "INVENTARIO_STORAGE/repuestos.json"
   ```
3. **Revertir cambios de código** (git checkout)
4. **Analizar logs de error**
5. **Corregir script de migración**
6. **Reintentar con dry-run**

---

## ⏱️ ESTIMACIÓN DE TIEMPO

| Fase | Tiempo Estimado | Dependencias |
|------|----------------|--------------|
| Fase 1: Preparación | 2-3 horas | - |
| Fase 2: Migración Datos | 3-4 horas | Fase 1 |
| Fase 3: Refactorización | 8-10 horas | Fase 2 |
| Fase 4: UI | 4-5 horas | Fase 3 |
| Fase 5: Testing | 3-4 horas | Fase 4 |
| Fase 6: Despliegue | 2-3 horas | Fase 5 |
| **TOTAL** | **22-29 horas** | - |

---

## 📝 NOTAS IMPORTANTES

1. **Backup es crítico**: No proceder sin backups validados
2. **Migración incremental**: Una fase a la vez, validar antes de continuar
3. **Dry-run primero**: Todos los scripts deben probarse en modo simulación
4. **Compatibilidad temporal**: Mantener lectura de formato antiguo hasta validar migración completa
5. **Sincronización es clave**: El sistema debe actualizarse en tiempo real entre pestañas
6. **Testing exhaustivo**: Validar cada escenario antes de despliegue

---

## 🎯 PRÓXIMO PASO

**Iniciar Fase 1.1**: Crear backups completos de todos los archivos JSON

```powershell
# Comando para ejecutar
node scripts/create-backup-unificacion.cjs
```

¿Procedemos con la Fase 1?
