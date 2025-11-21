# Flujo de Trabajo Completo para Crear, Ubicar y Gestionar Repuestos  
**Versión inicial – Diseñado para implementación en Inventario v6.0**

---

# 🎯 OBJETIVO GENERAL

Establecer un **flujo de trabajo claro, guiado y coherente** que permita al usuario:

1. Crear repuestos con datos básicos.
2. Asignarlos correctamente a la **jerarquía estructural** (Empresa → Área → Sistema → …).
3. Ubicarlos en el **mapa**, eligiendo:
   - La **zona/área del mapa** correspondiente al nivel jerárquico.
   - El **marcador** (punto) que indica su posición exacta dentro de esa zona.
4. Acceder posteriormente al repuesto desde:
   - Inventario  
   - Jerarquía  
   - Mapas  

Y que el usuario pueda encontrar fácilmente dónde está, qué jerarquía tiene y qué ubicación espacial ocupa.

---

# 🧩 ESTADOS INTERNOS DEL REPUESTO

Para facilitar validaciones y guías en la UI:

- `estado_ubicacion`:
  - **sin_ubicacion** → sin jerarquía ni mapa  
  - **jerarquia_sola** → tiene jerarquía, falta mapa  
  - **mapa_solo** → tiene mapa, falta jerarquía  
  - **completo** → jerarquía + mapa

- `progreso_flujo` (etiqueta visible al usuario):
  - **Borrador**
  - **Listo para ubicar**
  - **Ubicado**

---

# 🧭 FLUJO PRINCIPAL: CREACIÓN COMPLETA DE UN REPUESTO

## PASO 1 – Crear repuesto (Tab **Inventario**)

### Datos mínimos obligatorios
- Código o ID  
- Nombre  
- Tipo o categoría  
- Stock actual / mínimo  
- Descripción corta (opcional, pero útil)

Al guardar:
- El repuesto se crea con:
  - `estado_ubicacion = "sin_ubicacion"`  
- La app muestra:
  > **Repuesto creado. Ahora asigna su jerarquía.**

Botón principal:
### ➜ **GUARDAR Y CONTINUAR → ASIGNAR JERARQUÍA**

---

## PASO 2 – Asignar jerarquía (Tab **Jerarquía**)

La app abre la jerarquía con el repuesto **preseleccionado**.

### Flujo del usuario
1. Navega por la estructura jerárquica:
   - Empresa  
   - Área  
   - Sub-área  
   - Sistema  
   - Sub-sistema  
   - Equipo  
   - Sección  
   - Sub-sección  

2. Selecciona el **nivel final** donde pertenece el repuesto.

3. Botón:
   ### ➜ **ASIGNAR REPUESTO A ESTE NODO**

La app almacena:
- `jerarquia_nodo_id`
- Ruta completa (para breadcrumbs y filtros)

Actualización de estado:
- Si estaba en “sin_ubicacion” → pasa a “jerarquia_sola”.
- Si ya tenía marcador → “completo”.

Mensaje:
> **Jerarquía asignada correctamente.**

Botón destacado:
### ➜ **CONTINUAR → ASIGNAR EN MAPA**

---

## PASO 3 – Asignar mapa y marcador (Tab **Mapa**)  
*(Aquí agregamos la parte que tú pediste, Danilo, sobre áreas dibujadas y marcadores)*

Al abrir esta Tab desde Jerarquía:
- Si el nodo jerárquico **tiene un área asociada**, la app hace **zoom automático** a esa zona.  
- Si no tiene área asociada:
  > “Este nivel jerárquico aún no tiene una zona de mapa asignada. Selecciona una zona para continuar.”

---

## 🖼️ ZONAS DEL MAPA (Áreas Dibujadas)

Cada nivel jerárquico relevante debe poder vincularse con una zona del mapa.

### Si el repuesto NO tiene zona asignada:
Flujo:
1. Usuario selecciona una zona dibujada del mapa (polígono).
2. App muestra:
   > **¿Asignar esta zona al nivel jerárquico seleccionado?**

3. Si confirma:
   - Guarda `mapa_zona_id`
   - Relaciona jerarquía ↔ zona del mapa
   - Pasa al paso de agregar marcador

---

# 📍 MARCADORES (Puntos en la zona)

### Flujo:
1. Botón:
   ### ➜ **AGREGAR MARCADOR**

2. Usuario hace click dentro de la zona.
3. App abre un panel:
   - Nombre del repuesto  
   - Coordenadas del punto  
   - Opciones:
     - `GUARDAR MARCADOR`
     - `CANCELAR`

4. Al guardar:
   - Se guarda:
     - `mapa_marker_id` *(o coords X/Y)*  
     - `mapa_zona_id`  
   - Se actualiza estado:
     - Si tenía jerarquía → `completo`
     - Si no → `mapa_solo`

Mensaje:
> **Marcador asignado correctamente.**

Botones:
- `VOLVER A INVENTARIO`
- `VER DETALLE DEL REPUESTO`

---

# 🧱 PASO 4 – Vista final del repuesto (Tab Inventario)

Se muestra:

### Bloque: “Ubicación Completa”
- **Jerarquía:** Ruta completa  
- **Mapa:** Zona + marcador  
- Botones rápidos:
  - `VER EN MAPA`
  - `VER EN JERARQUÍA`
  - `EDITAR UBICACIÓN`
  - `EDITAR JERARQUÍA`

---

# ✏️ EDICIÓN DE REPUESTOS EXISTENTES

## EDITAR JERARQUÍA
- Resalta nodo actual.
- Botones:
  - `CAMBIAR NIVEL`
  - `QUITAR JERARQUÍA`

Si se cambia:
- Recalcula el área en el mapa si el nodo tiene otra zona.
- Puede pedir confirmación:
  > **Este cambio puede requerir actualizar la zona o el marcador. ¿Deseas continuar?**

---

## EDITAR UBICACIÓN EN MAPA
- Muestra la zona actual (si existe).
- Si NO tiene zona:
  - Permite asignarla igual que en el flujo principal.

### Acciones:
- `MOVER MARCADOR`
- `ELIMINAR MARCADOR`
- `CAMBIAR ZONA`

---

# 🔍 BÚSQUEDA Y LOCALIZACIÓN

## Desde Inventario
Cada tarjeta tiene:
- `VER EN MAPA`
- `VER EN JERARQUÍA`

Si falta jerarquía o mapa:
- La app guía automáticamente al paso faltante.

---

## Desde Jerarquía
- Click en nodo → lista de repuestos.
- Cada repuesto:
  - `VER EN MAPA`
  - `VER DETALLE`

---

## Desde el Mapa
- Click en un marcador:
  - Mini ficha del repuesto  
  - Botones directos:
    - `VER EN INVENTARIO`
    - `VER JERARQUÍA`

---

# ✔️ VERSIÓN PARA COPILOT / DOCUMENTACIÓN

Este archivo está escrito de forma directa y clara para que:

- GitHub Copilot pueda usarlo como referencia funcional.
- El flujo sea fácil de implementar en tu arquitectura modular v6.0.
- Los usuarios finales puedan seguirlo sin confundirse.

---

¿Quieres que lo convierta también en una **guía paso a paso ilustrada**?  
¿O quieres otra versión más técnica enfocada en funciones y eventos de tu sistema?  
