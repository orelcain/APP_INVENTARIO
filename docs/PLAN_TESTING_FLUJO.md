# 🧪 Plan de Testing - Flujo de Trabajo Completo
**Versión v6.0 - Testing End-to-End**  
**Fecha:** 21 de noviembre de 2024

---

## 🎯 OBJETIVO

Validar que el **flujo de trabajo completo** funciona correctamente desde la creación del repuesto hasta su visualización con ubicaciones completas.

---

## 📋 PRE-REQUISITOS

### Entorno
- ✅ Servidor local corriendo (puerto 8080)
- ✅ Navegador con consola de desarrollo abierta (F12)
- ✅ `window.app` disponible en consola

### Datos Necesarios
- ✅ Al menos 1 mapa creado en el sistema
- ✅ Jerarquía configurada con áreas/sistemas

---

## 🧪 CASOS DE PRUEBA

### **TEST 1: Creación Básica de Repuesto**

**Objetivo:** Verificar que el botón "Guardar y Asignar Jerarquía" aparece y funciona

**Pasos:**
1. Ir a tab **Inventario**
2. Click en **"+ Nuevo Repuesto"**
3. Llenar datos mínimos:
   - Código: `TEST-001`
   - Nombre: `Repuesto de Prueba`
   - Tipo: `Mecánico`
   - Stock: `10`
4. **Verificar:** Botón "Guardar y Asignar Jerarquía" visible
5. Click en el botón

**Resultado Esperado:**
- ✅ Modal se cierra
- ✅ Tab cambia a **Jerarquía**
- ✅ Panel flotante aparece (derecha)
- ✅ Panel muestra nombre del repuesto: "Repuesto de Prueba"
- ✅ Toast: "Repuesto creado. Selecciona un nodo..."

**Consola debe mostrar:**
```javascript
📦 Repuesto creado: TEST-001
🎯 Flujo activado: repuestoId = <id>
```

---

### **TEST 2: Asignación de Jerarquía**

**Objetivo:** Verificar selección de nodo y asignación correcta

**Pasos:**
1. **Desde el estado del TEST 1** (panel flotante visible)
2. Navegar árbol jerárquico
3. Expandir: Empresa → Área → Sub-Área → Sistema
4. Click en un **Sistema** (ej: "Motor Principal")

**Resultado Esperado:**
- ✅ Nodo se resalta con **borde verde 3px**
- ✅ Background verde transparente
- ✅ Scroll automático al nodo
- ✅ Botón "Asignar a este nodo" se habilita
- ✅ Info del nodo aparece en panel

**Consola debe mostrar:**
```javascript
👆 Nodo seleccionado: sistema_0_1_2
```

5. Click en **"Asignar a este nodo"**

**Resultado Esperado:**
- ✅ Toast: "✅ Repuesto asignado a <nombre nodo>"
- ✅ Panel se cierra con animación
- ✅ Confirm aparece: "¿Deseas continuar para ubicarlo en el mapa?"

**Consola debe mostrar:**
```javascript
🔍 Parseando nodeId: sistema_0_1_2
📍 Ubicación extraída: { areaGeneral: "...", subArea: "...", sistemaEquipo: "..." }
💾 Datos guardados exitosamente
```

---

### **TEST 3: Asignación de Mapa**

**Objetivo:** Verificar carga de mapa y colocación de marcador

**Pasos:**
1. **Desde el confirm del TEST 2**
2. Click **"Aceptar"** (continuar al mapa)

**Resultado Esperado:**
- ✅ Tab cambia a **Mapa**
- ✅ Panel flotante de mapa aparece
- ✅ Lista de mapas disponibles se muestra
- ✅ Cada mapa tiene: icono 🗺️, nombre, metadata (zonas • marcadores)

3. Click en un **mapa de la lista**

**Resultado Esperado:**
- ✅ Mapa se resalta con borde verde
- ✅ Check ✓ aparece a la derecha
- ✅ Canvas carga la imagen del mapa
- ✅ Toast: "📍 Mapa <nombre> cargado. Haz clic en el canvas..."
- ✅ Progreso visual: Paso 1 ✅, Paso 3 activo

**Consola debe mostrar:**
```javascript
🗺️ Cargando mapa: <mapaId>
⚙️ Modo marcador activado
```

4. **Hacer clic en el canvas** (dentro del mapa visible)

**Resultado Esperado:**
- ✅ Coordenadas aparecen en panel: "X: 123.4, Y: 567.8"
- ✅ Progreso visual: Paso 3 ✅
- ✅ Botón "Asignar Mapa" se habilita
- ✅ Toast: "📍 Marcador colocado correctamente"

**Consola debe mostrar:**
```javascript
📍 Click capturado: { x: 123.4, y: 567.8 }
```

5. Click en **"Asignar Mapa"**

**Resultado Esperado:**
- ✅ Toast: "✅ Ubicación en mapa asignada correctamente"
- ✅ Panel se cierra
- ✅ Confirm: "¿Deseas ver el repuesto en el inventario?"

**Consola debe mostrar:**
```javascript
💾 ubicacionMapa guardada: { tipo: "mapa", mapaId: "...", coordenadas: {...} }
📊 estado_ubicacion: "completo"
📈 progreso_flujo: "Ubicado"
```

---

### **TEST 4: Visualización en Tarjeta**

**Objetivo:** Verificar que la tarjeta muestra toda la información

**Pasos:**
1. **Desde el confirm del TEST 3**
2. Click **"Aceptar"** (ver en inventario)

**Resultado Esperado:**
- ✅ Tab cambia a **Inventario**
- ✅ Repuesto "TEST-001" visible en lista/cards
- ✅ Bloque **"📍 Ubicación Completa"** presente
- ✅ Badge: **"Ubicado"** (verde)
- ✅ Jerarquía mostrada: "Area → SubArea → Sistema"
- ✅ Mapa mostrado: "Coordenadas: (123.4, 567.8)"
- ✅ **4 botones** visibles:
   - 🌳 Ver en Jerarquía
   - 🗺️ Ver en Mapa
   - ✏️ Editar Ubicación
   - (No debe haber botón "+ Asignar")

**HTML esperado:**
```html
<div style="background: rgba(59, 130, 246, 0.08);">
  <div>📍 Ubicación Completa</div>
  <div style="background: rgba(34, 197, 94, 0.15);">Ubicado</div>
  ...
</div>
```

---

### **TEST 5: Navegación - Ver en Jerarquía**

**Objetivo:** Verificar navegación desde tarjeta a jerarquía

**Pasos:**
1. **Desde la tarjeta del TEST 4**
2. Click en **"🌳 Ver en Jerarquía"**

**Resultado Esperado:**
- ✅ Tab cambia a **Jerarquía**
- ✅ Árbol se expande hasta el nodo correspondiente
- ✅ Nodo resaltado con **borde verde 3px**
- ✅ Scroll automático al nodo
- ✅ Toast: "📍 Repuesto ubicado en: Area → SubArea → Sistema"

**Consola debe mostrar:**
```javascript
🔍 Buscando nodo para: { areaGeneral: "...", subArea: "...", sistemaEquipo: "..." }
✅ Nodo encontrado: sistema_0_1_2
```

---

### **TEST 6: Navegación - Ver en Mapa**

**Objetivo:** Verificar navegación desde tarjeta a mapa con zoom

**Pasos:**
1. Volver a tab **Inventario**
2. Buscar repuesto "TEST-001"
3. Click en **"🗺️ Ver en Mapa"**

**Resultado Esperado:**
- ✅ Tab cambia a **Mapa**
- ✅ Mapa se carga automáticamente
- ✅ Vista hace **zoom 2x**
- ✅ Vista se centra en coordenadas del marcador
- ✅ Toast: "📍 Repuesto ubicado en mapa <nombre> - Marcador resaltado"

**Consola debe mostrar:**
```javascript
🗺️ Cargando mapa: <mapaId>
🎯 Haciendo pan a: (123.4, 567.8)
🔍 Aplicando zoom: 2.0
```

---

### **TEST 7: Editar Ubicación**

**Objetivo:** Verificar que el modal se abre en Step 4

**Pasos:**
1. Volver a tab **Inventario**
2. Buscar repuesto "TEST-001"
3. Click en **"✏️ Editar Ubicación"**

**Resultado Esperado:**
- ✅ Modal se abre
- ✅ **Step 4** (Ubicaciones) activo automáticamente
- ✅ Ubicaciones actuales mostradas
- ✅ Toast: "💡 Ahora puedes editar las ubicaciones..."

---

### **TEST 8: Flujo con Repuesto Sin Ubicación**

**Objetivo:** Verificar vista alternativa en tarjeta

**Pasos:**
1. Crear nuevo repuesto **sin asignar ubicación**
2. Guardar solo con "Guardar" (no continuar al flujo)
3. Volver a Inventario

**Resultado Esperado:**
- ✅ Tarjeta muestra bloque con **fondo amarillo**
- ✅ Mensaje: "⚠️ Sin ubicación en jerarquía"
- ✅ **1 botón**: "+ Asignar a Jerarquía"
- ✅ Badge: "Borrador" o "Listo para ubicar"

4. Click en **"+ Asignar a Jerarquía"**

**Resultado Esperado:**
- ✅ Tab cambia a Jerarquía
- ✅ Panel flotante aparece
- ✅ Flujo de asignación se activa

---

## 🐛 PUNTOS DE VERIFICACIÓN EN CONSOLA

### Variables de Estado
```javascript
// Verificar repuesto en flujo
console.log(app.repuestoEnFlujo);
// Debe mostrar: "rep_<id>"

// Verificar mapa seleccionado
console.log(app.mapaSeleccionadoFlujo);
// Debe mostrar: "<mapaId>"

// Verificar modo marcador
console.log(app.modoColocarMarcador);
// Debe mostrar: true

// Verificar marcador colocado
console.log(app.marcadorColocadoFlujo);
// Debe mostrar: { x: 123.4, y: 567.8 }
```

### Datos del Repuesto
```javascript
// Encontrar repuesto
const repuesto = app.repuestos.find(r => r.codigo === 'TEST-001');
console.log(repuesto);

// Verificar ubicaciones
console.log(repuesto.ubicaciones);
// Debe tener array con 1 objeto { areaGeneral, subArea, ... }

// Verificar ubicaciones mapa
console.log(repuesto.ubicacionesMapa);
// Debe tener array con 1 objeto { tipo: "mapa", mapaId, coordenadas }

// Verificar estados
console.log(repuesto.estado_ubicacion); // "completo"
console.log(repuesto.progreso_flujo);   // "Ubicado"
```

---

## ✅ CHECKLIST FINAL

### Funcionalidades Básicas
- [ ] Crear repuesto con botón "Guardar y Asignar Jerarquía"
- [ ] Panel flotante de jerarquía aparece correctamente
- [ ] Selección visual de nodo funciona
- [ ] Asignación guarda en repuesto.ubicaciones[]
- [ ] Transición a mapa funciona

### Integración con Mapa
- [ ] Panel flotante de mapa aparece
- [ ] Lista de mapas carga correctamente
- [ ] Selección de mapa carga canvas
- [ ] Click en canvas captura coordenadas
- [ ] Asignación guarda en repuesto.ubicacionesMapa[]

### Visualización y Navegación
- [ ] Tarjeta muestra bloque "Ubicación Completa"
- [ ] Badge de progreso correcto (color y texto)
- [ ] Jerarquía mostrada correctamente
- [ ] Información de mapa mostrada
- [ ] 4 botones visibles (con ubicación completa)
- [ ] "Ver en Jerarquía" funciona y resalta nodo
- [ ] "Ver en Mapa" funciona y hace zoom
- [ ] "Editar Ubicación" abre modal en Step 4

### Estados y Cálculos
- [ ] estado_ubicacion se calcula correctamente
- [ ] progreso_flujo se calcula correctamente
- [ ] Repuesto sin ubicación muestra vista alternativa
- [ ] Botón "+ Asignar a Jerarquía" funciona

### Persistencia
- [ ] Datos se guardan en localStorage/JSON
- [ ] Recargar página mantiene ubicaciones
- [ ] Export/Import mantiene estructura

---

## 🚨 PROBLEMAS CONOCIDOS Y WORKAROUNDS

### 1. Mapa no carga imagen
**Síntoma:** Canvas queda negro/gris  
**Causa:** Ruta de imagen incorrecta o permisos  
**Solución:** Verificar `mapa.image` en consola

### 2. Coordenadas incorrectas
**Síntoma:** Marcador aparece en lugar equivocado  
**Causa:** Conversión pantalla→mapa incorrecta  
**Solución:** Verificar `mapController.state.scale` y `offsetX/Y`

### 3. Panel no aparece
**Síntoma:** Panel flotante no visible  
**Causa:** CSS no cargado o z-index incorrecto  
**Solución:** Verificar `display: flex` y `z-index: 1500`

### 4. Botones no responden
**Síntoma:** Click no hace nada  
**Causa:** onclick binding incorrecto  
**Solución:** Verificar `window.app` en consola

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica | Target | Resultado |
|---------|--------|-----------|
| Tests pasados | 8/8 | ___ |
| Funcionalidades | 100% | ___ |
| Sin errores consola | Sí | ___ |
| Flujo completo < 2min | Sí | ___ |
| Datos persisten | Sí | ___ |

---

## 📝 REGISTRO DE TESTING

**Tester:** ___________________  
**Fecha:** ___________________  
**Navegador:** ___________________  
**Versión:** v6.0

**Observaciones:**
```




```

**Errores Encontrados:**
```




```

**Estado Final:** ⬜ Aprobado  ⬜ Rechazado  ⬜ Con observaciones

---

**Documento generado automáticamente**  
*Para reportar problemas, agregar en consola: `app.reportBug('<descripción>')`*
