# Sistema de Actualización de Versiones - Inventario PWA

## 🚀 Nuevo Sistema Automático v6.102

### ✨ Características

1. **Versión Centralizada**: Un solo lugar donde cambiar la versión
2. **Auto-detección**: La PWA detecta nuevas versiones automáticamente cada 60 segundos
3. **Banner Interactivo**: Notificación visual con botón "Actualizar Ahora"
4. **Script de Actualización**: Comando único para actualizar todo

---

## 📝 Cómo Actualizar la Versión

### Método 1: Script Automático (Recomendado)

```powershell
.\update-version.ps1 -NewVersion "v6.103"
```

El script hará:
- ✅ Actualizar `window.APP_VERSION` en index.html
- ✅ Actualizar `CACHE_NAME` en service-worker.js
- ✅ Sincronizar a carpeta docs/
- ✅ (Opcional) Commit y push automático

### Método 2: Manual

Si prefieres hacerlo manual:

1. **Abrir** `v6.0/index.html`
2. **Buscar** línea ~20287: `window.APP_VERSION = 'v6.XXX';`
3. **Cambiar** a la nueva versión
4. **Abrir** `v6.0/service-worker.js`
5. **Buscar** líneas 8-9:
   ```javascript
   const CACHE_NAME = 'inventario-v6.XXX';
   const DYNAMIC_CACHE = 'inventario-dynamic-v6.XXX';
   ```
6. **Cambiar** a la nueva versión
7. **Sincronizar**:
   ```powershell
   Copy-Item v6.0\index.html docs\index.html -Force
   Copy-Item v6.0\service-worker.js docs\service-worker.js -Force
   ```
8. **Commit y Push**:
   ```powershell
   git add .
   git commit -m "v6.XXX - Descripción del cambio"
   git push origin main
   ```

---

## 🔄 Cómo Funciona la Auto-Actualización

### En PC (Navegador)

1. Usuario abre la aplicación
2. Service Worker verifica actualizaciones cada 60 segundos
3. Si hay nueva versión:
   - Descarga en segundo plano
   - Muestra banner en la parte superior
   - Usuario hace clic en "⚡ Actualizar Ahora"
   - Recarga con nueva versión

### En PWA Móvil

1. Usuario abre la PWA
2. Verificación automática cada 60 segundos
3. Banner aparece arriba:
   ```
   🎉 Nueva versión v6.XXX disponible
   Haz clic en actualizar para obtener las últimas mejoras
   [⚡ Actualizar Ahora] [Más tarde]
   ```
4. Usuario toca "Actualizar Ahora"
5. PWA se actualiza instantáneamente

### Auto-Update Habilitado

Si `window.autoUpdateEnabled = true`:
- Banner muestra cuenta regresiva de 5 segundos
- Se actualiza automáticamente sin intervención

---

## 🎯 Ventajas del Nuevo Sistema

| Antes | Ahora |
|-------|-------|
| ❌ 5 lugares diferentes para actualizar | ✅ 1 constante central |
| ❌ Limpiar caché manualmente | ✅ Auto-detección cada 60s |
| ❌ No saber si hay actualización | ✅ Banner visible con botón |
| ❌ Recargar página manualmente | ✅ Un clic actualiza todo |
| ❌ Proceso tedioso | ✅ Script automático |

---

## 📋 Checklist de Actualización

- [ ] Cambiar `window.APP_VERSION` en index.html (o usar script)
- [ ] Cambiar `CACHE_NAME` en service-worker.js (o usar script)
- [ ] Sincronizar a docs/
- [ ] Commit con mensaje descriptivo
- [ ] Push a GitHub
- [ ] Esperar 2-3 minutos (GitHub Pages)
- [ ] Verificar en móvil que aparezca el banner
- [ ] Hacer clic en "Actualizar Ahora"
- [ ] Confirmar versión correcta en badge

---

## 🐛 Troubleshooting

### "El banner no aparece en móvil"

**Solución:**
1. Cierra completamente la PWA
2. Espera 3 minutos (GitHub Pages)
3. Abre de nuevo
4. Espera 60 segundos (primera verificación)

### "Sigue mostrando versión anterior"

**Solución:**
```javascript
// En consola del navegador:
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
// Luego recargar la página
```

### "El script update-version.ps1 da error"

**Solución:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\update-version.ps1 -NewVersion "v6.103"
```

---

## 📱 Experiencia del Usuario

1. **Sin actualización pendiente**:
   - App funciona normal
   - Badge muestra versión actual

2. **Nueva versión disponible**:
   - Banner aparece automáticamente
   - Usuario decide cuándo actualizar
   - Proceso toma 1 segundo

3. **Actualización completada**:
   - Badge actualizado
   - Nuevas funciones disponibles
   - Sin perder datos locales

---

## 🔧 Configuración Avanzada

### Cambiar intervalo de verificación

En `index.html`, línea ~73780:
```javascript
// Verificar cada 60 segundos (60000ms)
setInterval(() => {
  registration.update();
}, 60000); // Cambiar a 30000 para 30 segundos
```

### Habilitar auto-update global

En consola o configuración:
```javascript
window.autoUpdateEnabled = true;
localStorage.setItem('autoUpdate', 'true');
```

---

## 📊 Historial de Versiones

- **v6.102** - Sistema de auto-actualización con banner interactivo
- **v6.101** - Árbol jerárquico móvil expandible + upload Firebase
- **v6.100** - Diagnósticos Firebase mejorados

---

## 💡 Próximas Mejoras

- [ ] Changelog automático en el banner
- [ ] Notificación push cuando hay actualización
- [ ] Rollback a versión anterior
- [ ] A/B testing de versiones
