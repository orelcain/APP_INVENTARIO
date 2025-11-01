# 🚀 GUÍA DE DESARROLLO v6.0

**Fecha:** 31 de octubre de 2025  
**Estado:** ✅ Proyecto organizado y listo para continuar desarrollo

---

## 📂 UBICACIÓN DE TRABAJO

```bash
# Carpeta de trabajo principal
d:\APP_INVENTARIO\v6.0\

# Archivo principal
d:\APP_INVENTARIO\v6.0\inventario_v6.0.html

# Módulos
d:\APP_INVENTARIO\v6.0\modules\
  ├── core.js      (5,193 líneas)
  ├── storage.js   (853 líneas)
  └── mapa.js      (1,246 líneas)
```

---

## 🎯 INICIO RÁPIDO

### Opción 1: Script Automático
```bash
cd d:\APP_INVENTARIO\v6.0
.\INICIAR_v6.0.bat
```

### Opción 2: Abrir Directamente
```bash
# Doble click en:
d:\APP_INVENTARIO\v6.0\inventario_v6.0.html
```

### Opción 3: Desde VS Code
1. Abrir carpeta: `d:\APP_INVENTARIO\v6.0`
2. Abrir `inventario_v6.0.html`
3. Click derecho → "Open with Live Server"

---

## 📋 FLUJO DE TRABAJO RECOMENDADO

### 1️⃣ **Antes de empezar** (Cada sesión)
```bash
# Verificar que estás en v6.0
pwd  # Debe mostrar: d:\APP_INVENTARIO\v6.0

# Verificar archivos principales
ls inventario_v6.0.html
ls modules/
ls INVENTARIO_STORAGE/

# Abrir VS Code
code .
```

### 2️⃣ **Durante el desarrollo**
- ✅ Editar solo archivos en `v6.0/`
- ✅ NO tocar archivos de la raíz (v5.4.0)
- ✅ Guardar cambios frecuentemente
- ✅ Probar en navegador (F5 para recargar)
- ✅ Verificar consola (F12) por errores

### 3️⃣ **Después de cada cambio**
```bash
# Probar en navegador
Start-Process "inventario_v6.0.html"

# Verificar errores en VS Code
# (pestaña "Problemas")

# Si hay cambios importantes, documentar en:
docs/PROGRESO_v6.0.md
```

---

## 🔧 TAREAS PENDIENTES POR PRIORIDAD

### 🔴 ALTA PRIORIDAD (Hacer primero)
- [ ] Verificar carga de 57 repuestos en navegador
- [ ] Probar tab Jerarquía con datos reales
- [ ] Debuggear errores de consola (si existen)
- [ ] Probar filtros y búsqueda en Jerarquía

### 🟡 MEDIA PRIORIDAD (Siguiente)
- [ ] Implementar tab Valores (desglose precios)
- [ ] Completar controles UI del Mapa
- [ ] Agregar export PDF/Excel (portable)
- [ ] Probar con más repuestos (100+)

### 🟢 BAJA PRIORIDAD (Cuando haya tiempo)
- [ ] Tab Configuración (settings)
- [ ] CSS polish (skeleton loaders)
- [ ] Animaciones adicionales
- [ ] PWA features

---

## 📝 DÓNDE EDITAR CADA COSA

### HTML (inventario_v6.0.html)
```
Estructura:
- Líneas 1-900:    CSS (variables, estilos)
- Líneas 900-1200: HTML tabs (inventario, jerarquía, mapa)
- Líneas 1200-1560: Modal y lightbox
- Líneas 1560-1604: Scripts (imports e inicialización)
```

**Editar para:**
- Agregar nuevos tabs
- Modificar estructura HTML
- Cambiar estilos CSS
- Ajustar imports

### core.js (modules/core.js)
```javascript
Contiene:
- class InventarioCompleto
- Métodos CRUD
- renderInventario()
- renderJerarquia()
- Filtros y búsquedas
- Export PDF/Excel
```

**Editar para:**
- Agregar nueva funcionalidad de repuestos
- Modificar lógica de filtros
- Cambiar renderizado de vistas
- Agregar nuevos métodos

### storage.js (modules/storage.js)
```javascript
Contiene:
- fsManager (FileSystem Access API)
- mapStorage (gestión de mapas)
- Backups automáticos
- Serialización JSON
```

**Editar para:**
- Cambiar lógica de guardado
- Modificar estructura de datos
- Agregar nuevos tipos de almacenamiento

### mapa.js (modules/mapa.js)
```javascript
Contiene:
- mapController
- Canvas interactivo
- Zoom, pan, dibujo
- Marcadores y zonas
```

**Editar para:**
- Agregar nuevas herramientas de dibujo
- Modificar comportamiento del mapa
- Cambiar estilos visuales

---

## 🧪 CÓMO PROBAR CAMBIOS

### 1. Prueba Rápida (después de cada edit)
```bash
# Guardar archivo (Ctrl+S)
# Recargar navegador (F5)
# Verificar consola (F12)
```

### 2. Prueba Completa (antes de commit)
```bash
# Abrir inventario_v6.0.html
# Seguir pasos en:
docs/PRUEBAS_v6.0_PASO_A_PASO.md

# Verificar:
- [x] Carga inicial sin errores
- [x] 57 repuestos aparecen
- [x] Todos los tabs funcionan
- [x] Filtros y búsqueda ok
- [x] Modal abre y cierra
- [x] Sin errores en consola
```

### 3. Prueba con Datos Reales
```bash
# Conectar carpeta:
INVENTARIO_STORAGE/

# Agregar repuesto nuevo
# Editar repuesto existente
# Eliminar repuesto
# Probar filtros complejos
# Verificar que se guarda
```

---

## 📚 DOCUMENTACIÓN ÚTIL

### Para entender el código
```
v6.0/README.md                         - Guía general del proyecto
v6.0/docs/IMPLEMENTACION_v6.0_COMPLETA.md  - Resumen técnico completo
ESTRUCTURA_CARPETAS.md                 - Organización del proyecto
```

### Para seguir progreso
```
v6.0/docs/PROGRESO_v6.0.md             - Tracking de tareas
v6.0/docs/SESION_COMPLETA_v6.0.md      - Historia de desarrollo
```

### Para probar
```
v6.0/docs/PRUEBAS_v6.0_PASO_A_PASO.md  - 22 pasos de verificación
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### ❌ Problema: No cargan los repuestos
```
Causa: Carpeta INVENTARIO_STORAGE no conectada
Solución:
1. Click "Conectar Carpeta"
2. Seleccionar: v6.0/INVENTARIO_STORAGE
3. Permitir acceso
```

### ❌ Problema: Error en consola "Cannot find module"
```
Causa: Rutas de imports incorrectas
Solución:
1. Verificar que estás en v6.0/
2. Los imports deben ser: ./modules/core.js
3. NO deben ser: ../modules/core.js
```

### ❌ Problema: Cambios en CSS no se ven
```
Causa: Cache del navegador
Solución:
1. Ctrl+Shift+R (recarga forzada)
2. O: F12 → Network → Disable cache
```

### ❌ Problema: FileSystem API no funciona
```
Causa: Navegador no compatible
Solución:
1. Usar Chrome, Edge o Brave
2. Safari NO soporta FileSystem Access API
3. Firefox tiene soporte limitado
```

---

## 💡 CONSEJOS Y MEJORES PRÁCTICAS

### ✅ Hacer
1. **Trabajar siempre en `v6.0/`** - No tocar la raíz
2. **Probar frecuentemente** - F5 en navegador
3. **Verificar consola** - F12 para errores
4. **Documentar cambios** - En PROGRESO_v6.0.md
5. **Backup antes de cambios grandes** - Copiar v6.0/ a v6.0_backup/

### ❌ No hacer
1. **NO editar v5.4.0** - Es el backup
2. **NO modificar INVENTARIO_STORAGE de raíz** - Usar el de v6.0/
3. **NO commitear sin probar** - Siempre verificar primero
4. **NO borrar documentación** - Es referencia importante
5. **NO mezclar versiones** - Mantener separación clara

---

## 🎓 GUÍA RÁPIDA DE GIT

### Commit de cambios
```bash
git add v6.0/
git commit -m "feat: implementar tab Valores"
git push origin main
```

### Ver cambios
```bash
git status
git diff v6.0/inventario_v6.0.html
```

### Crear backup antes de cambios grandes
```bash
# Crear rama de backup
git checkout -b backup-antes-de-refactor
git checkout main

# O copiar carpeta
cp -r v6.0 v6.0_backup_$(date +%Y%m%d)
```

---

## 📞 RECURSOS ADICIONALES

### Documentación MDN
- FileSystem Access API: https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- ES6 Modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

### Herramientas Útiles
- VS Code Extensions:
  - Live Server (para desarrollo)
  - ESLint (para linting)
  - Prettier (para formateo)

---

## ✅ CHECKLIST ANTES DE CADA SESIÓN

- [ ] Abrir VS Code en `d:\APP_INVENTARIO\v6.0`
- [ ] Verificar que `inventario_v6.0.html` está presente
- [ ] Abrir `docs/PROGRESO_v6.0.md` para ver pendientes
- [ ] Iniciar navegador con `INICIAR_v6.0.bat`
- [ ] Abrir consola del navegador (F12)
- [ ] Listo para trabajar! 🚀

---

**¡Feliz desarrollo! 🎉**

Recuerda: Si algo falla, siempre puedes volver a v5.4.0 en la raíz.
