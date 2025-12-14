# 🚀 GUÍA DE DEPLOYMENT - APP INVENTARIO

## Arquitectura de Archivos

```
APP_INVENTARIO-2/
├── v6.0/               ← 📝 DESARROLLO (editar aquí)
│   ├── index.html
│   ├── service-worker.js
│   ├── manifest.json
│   └── ...
│
├── docs/               ← 🌐 GITHUB PAGES (deployment)
│   ├── index.html      ← Copia de v6.0/
│   ├── service-worker.js
│   └── ...
│
└── sync-to-docs.ps1    ← 🔄 Script de sincronización
```

## ⚠️ REGLA DE ORO

> **NUNCA edites directamente en `docs/`**
> 
> Siempre edita en `v6.0/` y luego sincroniza a `docs/`

## Proceso de Deployment

### 1. Desarrollar en v6.0/
```bash
# Editar archivos en v6.0/
code v6.0/index.html
```

### 2. Actualizar versión del Service Worker
```javascript
// v6.0/service-worker.js - LÍNEA 8
const CACHE_NAME = 'inventario-v6.XXX';  // ← Incrementar
const DYNAMIC_CACHE = 'inventario-dynamic-v6.XXX';
```

### 3. Sincronizar a docs/
```powershell
# Opción A: Script automático
.\sync-to-docs.ps1

# Opción B: Manual
Copy-Item v6.0\index.html docs\
Copy-Item v6.0\service-worker.js docs\
Copy-Item v6.0\manifest.json docs\
```

### 4. Commit y Push
```bash
git add .
git commit -m "v6.XXX - Descripción del cambio"
git push origin main
```

### 5. Verificar Deployment
1. Esperar 2-5 minutos (GitHub Pages cache)
2. Abrir: https://orelcain.github.io/APP_INVENTARIO/?v=XXXX
3. Verificar en consola: `Version: v6.XXX`

## Forzar Actualización en Cliente

Si el usuario no ve los cambios:

### Opción 1: Limpiar Service Worker (DevTools)
1. F12 → Application → Service Workers
2. Click "Unregister"
3. F12 → Application → Storage → Clear site data
4. Recargar página

### Opción 2: Hard Reload
- Chrome/Edge: `Ctrl + Shift + R`
- Firefox: `Ctrl + F5`

### Opción 3: Modo Incógnito
- Nueva ventana incógnito sin cache previo

## Checklist Pre-Deploy

- [ ] Actualizar versión en `service-worker.js` (CACHE_NAME)
- [ ] Actualizar badge de versión en `index.html`
- [ ] Ejecutar `.\sync-to-docs.ps1`
- [ ] Verificar: `git diff docs/`
- [ ] Commit con mensaje descriptivo
- [ ] Push a origin/main
- [ ] Verificar deployment en browser incógnito

## Troubleshooting

### Problema: Usuario ve versión antigua
**Causa**: Service Worker cacheó versión anterior

**Solución**:
1. Incrementar `CACHE_NAME` en service-worker.js
2. Sincronizar a docs/
3. Push
4. Usuario debe limpiar SW o esperar auto-update

### Problema: GitHub Pages no actualiza
**Causa**: CDN cache (5-10 min)

**Solución**:
- Esperar o usar URL con query param: `?nocache=XXX`

### Problema: Cambios en v6.0/ no aparecen en producción
**Causa**: Olvidaste sincronizar a docs/

**Solución**:
```powershell
.\sync-to-docs.ps1 -Commit -Push
```

## Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| v6.100 | 2025-12-14 | Enhanced Firebase sync diagnostics |
| v6.099 | 2025-12-13 | Sistema OCR Híbrido Inteligente |
| v6.098 | 2025-12-12 | FIX sincronización Firebase |

---

📅 Última actualización: 2025-12-14
