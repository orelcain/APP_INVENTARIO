# Solución: Tracking Prevention en Edge

## Problema
Al abrir `index.html` con protocolo `file://`, Edge bloquea acceso a `localStorage`:

```
Tracking Prevention blocked access to storage for <URL>
```

## Soluciones

### Opción 1: Desactivar Tracking Prevention (Recomendado para desarrollo)

1. **Abre Edge Settings**:
   - URL: `edge://settings/privacy`
   - O clic en `⋯` → `Settings` → `Privacy, search, and services`

2. **Modifica "Tracking prevention"**:
   - Cambia de `Balanced` a **`Basic`**
   - O desactiva completamente: Toggle OFF

3. **Recarga la página**: `Ctrl+F5`

### Opción 2: Agregar Excepción de Sitio

1. **Settings** → `Cookies and site permissions`
2. **Manage and delete cookies** → `See all cookies and site data`
3. **Add** → `file://` → Allow

### Opción 3: Usar Servidor Local (Producción)

```powershell
# Desde v6.0/
npx http-server -p 8080 --cors
```

Luego abre: `http://localhost:8080`

## Verificación

Después de aplicar, deberías ver en consola:

```
✅ Sistema de eventos global creado
✅ HierarchySync cargado y disponible globalmente
✅ Jerarquía de mapas inicializada correctamente
```

**Sin** advertencias de "Tracking Prevention blocked".

---

**Nota**: Las advertencias NO impiden que la app funcione con FileSystem API, pero pueden afectar `localStorage` para preferencias UI.
