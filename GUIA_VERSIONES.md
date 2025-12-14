# 🚀 Guía Rápida - Sistema de Versiones

## ✨ Flujo de Trabajo Estándar

### 1️⃣ Antes de empezar a trabajar

```powershell
# Validar que todo esté sincronizado
.\validate-version.ps1
```

✅ **Resultado esperado:** "TODAS LAS VERSIONES SINCRONIZADAS"

---

### 2️⃣ Hacer cambios en el código

- Edita archivos en `v6.0/`
- Prueba localmente
- Asegúrate que funcione correctamente

---

### 3️⃣ Actualizar versión y desplegar

```powershell
# Un solo comando hace todo
.\update-version.ps1 -NewVersion "v6.105"
```

**El script automáticamente:**
- ✅ Actualiza `window.APP_VERSION` en index.html
- ✅ Actualiza `CACHE_NAME` en service-worker.js
- ✅ Sincroniza a carpeta docs/
- ✅ Te pregunta si hacer commit/push
- ✅ Despliega a GitHub Pages

---

### 4️⃣ Verificar en móvil (2-3 minutos después)

**En la PWA:**
1. Banner aparecerá automáticamente: "🎉 Nueva versión v6.105 disponible"
2. Toca "⚡ Actualizar Ahora"
3. Verifica que el badge muestre v6.105

---

## 🔧 Comandos Disponibles

### Actualizar versión (Automático)
```powershell
.\update-version.ps1 -NewVersion "v6.105"
```

### Validar sincronización
```powershell
.\validate-version.ps1
```

### Ver versión actual
```powershell
git log -1 --oneline
```

---

## 📋 Convenciones de Versionado

### Formato: `v6.XXX`
- **v6.100** - v6.101 - v6.102 ... v6.199
- **v6.200** - Próxima versión mayor

### Cuándo incrementar:
- **+1** - Fix menor (botón roto, error visual)
- **+1** - Feature pequeño (nuevo campo, mejora UI)
- **+5** - Feature grande (nuevo módulo, refactorización)
- **+10** - Release importante (cambio de arquitectura)

### Ejemplos:
```
v6.103 - Fix botón editar
v6.104 - Sistema de versiones robusto
v6.105 - Agregar campo "proveedor"
v6.110 - Módulo de reportes completo
v6.120 - Migración a Firebase v2
```

---

## 🐛 Troubleshooting

### "Versiones desincronizadas"

**Solución:**
```powershell
.\update-version.ps1 -NewVersion "v6.XXX"  # Usar versión más alta
```

### "El script no encuentra archivos"

**Solución:**
```powershell
# Ejecutar desde la raíz del proyecto
cd D:\APP_INVENTARIO-2
.\update-version.ps1 -NewVersion "v6.XXX"
```

### "Banner no aparece en móvil"

**Solución:**
1. Espera 3 minutos (GitHub Pages)
2. Cierra completamente la PWA
3. Abre de nuevo
4. Espera 60 segundos (verificación automática)

---

## 📊 Checklist de Release

Antes de cada actualización:

- [ ] ✅ Validar versión actual: `.\validate-version.ps1`
- [ ] 🧪 Probar cambios localmente
- [ ] 📝 Decidir número de versión nuevo
- [ ] 🚀 Ejecutar: `.\update-version.ps1 -NewVersion "v6.XXX"`
- [ ] ⏱️ Esperar 2-3 minutos
- [ ] 📱 Probar en móvil/PWA
- [ ] ✅ Verificar badge de versión
- [ ] 📋 Documentar cambios importantes

---

## 💡 Tips

### Commit Messages Claros
```bash
v6.105 - Fix: Botón guardar no funcionaba
v6.106 - Feat: Agregar filtro por proveedor
v6.107 - Refactor: Optimizar carga de imágenes
v6.108 - Docs: Actualizar guía de usuario
```

### Ver Historial de Versiones
```powershell
git log --oneline --grep="^v6\."
```

### Rollback a Versión Anterior
```powershell
git checkout <commit-hash> -- v6.0/index.html v6.0/service-worker.js
.\update-version.ps1 -NewVersion "v6.XXX"  # Versión anterior
```

---

## 🎯 Resumen

**Flujo simple en 3 pasos:**

1. `.\validate-version.ps1` → Verificar estado
2. Hacer cambios → Editar código
3. `.\update-version.ps1 -NewVersion "v6.XXX"` → Desplegar

**¡Eso es todo!** El sistema maneja todo automáticamente.
