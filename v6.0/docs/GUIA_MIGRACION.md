# 📋 GUÍA DE MIGRACIÓN - PASO A PASO

## ✅ Lo que ya está hecho

### Fase 1: Nueva Arquitectura (Completada)
- ✅ EventBus para comunicación entre módulos
- ✅ StateManager para estado reactivo
- ✅ Sistema de validación y sanitización
- ✅ Manejo de errores robusto
- ✅ 50+ funciones auxiliares (helpers + formatters)
- ✅ CSS modularizado en 3 archivos
- ✅ PWA con service worker

### Fase 2: Módulos Mejorados (Completada)
- ✅ `app/modules/storage.js` - FileSystem mejorado con eventos
- ✅ `app/modules/core-enhanced.js` - Wrapper de InventarioCompleto
- ✅ `app/modules/mapa-enhanced.js` - MapController mejorado

---

## 🔄 CÓMO MIGRAR (Sin romper nada)

### Opción 1: Usar módulos mejorados gradualmente

**1. Mantén tu HTML original funcionando:**
```html
<!-- inventario_v5.4.0.html sigue igual -->
<script type="module">
  import InventarioCompleto from './modules/core.js';
  // Tu código existente sin cambios
</script>
```

**2. En un HTML NUEVO, usa los módulos mejorados:**
```html
<!-- inventario_v6.0.html (NUEVO) -->
<script type="module">
  // Importar versiones mejoradas
  import fsManager from './app/modules/storage.js';
  import InventarioEnhanced from './app/modules/core-enhanced.js';
  import mapController from './app/modules/mapa-enhanced.js';
  
  // Usar igual que antes, pero con superpoderes
  const app = new InventarioEnhanced();
  await app.init();
</script>
```

---

## 🎯 VENTAJAS de usar módulos mejorados

### Storage (`app/modules/storage.js`)
```javascript
import fsManager from './app/modules/storage.js';
import { Events } from './app/core/EventBus.js';

// Antes: No sabías cuándo se conectaba
await fsManager.selectFolder();

// Ahora: Recibes eventos
eventBus.on(Events.STORAGE_CONNECTED, (data) => {
  console.log('✅ Conectado a:', data.path);
  // Auto-cargar datos, actualizar UI, etc.
});

// JSON validado automáticamente
const data = await fsManager.readJSONFile('inventario.json');
// Si el JSON está corrupto, lanza error descriptivo
```

### Core Enhanced (`app/modules/core-enhanced.js`)
```javascript
import InventarioEnhanced from './app/modules/core-enhanced.js';

const app = new InventarioEnhanced();

// Agregar con validación automática
await app.addRepuesto({
  codSAP: '12345',
  descripcion: 'Rodamiento SKF',
  stock: 10
});
// ✅ Valida, sanitiza XSS, emite eventos, actualiza StateManager

// Buscar mejorado
const results = app.searchRepuestos('rodamiento', {
  fields: ['descripcion', 'codProv'],
  caseSensitive: false
});

// Filtros avanzados
const criticos = app.filterRepuestos({ criticoOnly: true });

// Estadísticas automáticas
const stats = app.getStats();
console.log(`Total: ${stats.total}, Críticos: ${stats.criticos}`);

// Exportar a CSV
const csv = app.exportData('csv');
```

### Mapa Enhanced (`app/modules/mapa-enhanced.js`)
```javascript
import mapController from './app/modules/mapa-enhanced.js';

// Agregar zona con eventos
await mapController.addZone({
  nombre: 'Sala de Compresores',
  color: '#ff5722',
  shape: 'polygon',
  coords: [{ x: 100, y: 100 }, { x: 200, y: 100 }, ...]
});
// ✅ Emite MAP_ZONE_ADDED, actualiza StateManager

// Buscar zona por clic
const zona = mapController.findZoneByPoint(150, 150);
if (zona) {
  console.log('Clic en zona:', zona.nombre);
}

// Estadísticas
const stats = mapController.getZoneStats();
console.log(`Total zonas: ${stats.total}, Visibles: ${stats.visibles}`);
```

---

## 🚀 PLAN DE MIGRACIÓN RECOMENDADO

### Paso 1: Probar módulos nuevos en paralelo (1 semana)
- ✅ Crea `inventario_v6.0.html` nuevo
- ✅ Importa módulos mejorados
- ✅ Prueba funcionalidad básica
- ⚠️ NO toques `inventario_v5.4.0.html` todavía

### Paso 2: Migrar componentes uno por uno (2 semanas)
1. **Storage**: Reemplaza imports de `./modules/storage.js` → `./app/modules/storage.js`
2. **Core**: Reemplaza `InventarioCompleto` → `InventarioEnhanced`
3. **Mapa**: Reemplaza imports de mapa

### Paso 3: Actualizar UI (1 semana)
- Usar nuevo CSS de `styles/main.css` y `styles/components.css`
- Aprovechar utilidades de `app/utils/helpers.js`
- Integrar toasts de error automáticos

### Paso 4: Testing exhaustivo (1 semana)
- Probar todas las funciones críticas
- Verificar que no se pierde data
- Comparar con versión 5.4.0

### Paso 5: Deprecar versión antigua
- Renombrar `inventario_v5.4.0.html` → `inventario_v5.4.0_OLD_BACKUP.html`
- Usar `inventario_v6.0.html` como principal

---

## ⚠️ REGLAS DE ORO

1. **NUNCA borres `inventario_v5.4.0.html`** hasta estar 100% seguro
2. **SIEMPRE haz backup** antes de cambiar algo
3. **PRUEBA en archivos nuevos** primero
4. **Migra gradualmente**, no todo de golpe
5. **Documenta cambios** que hagas

---

## 🛠️ COMPATIBILIDAD

### ✅ Código que sigue funcionando:
```javascript
// Todo el código existente funciona igual
import InventarioCompleto from './modules/core.js';
const app = new InventarioCompleto();
app.repuestos = []; // Sigue funcionando
app.cargarInventario(); // Sigue funcionando
```

### ✨ Código nuevo opcional:
```javascript
// Puedes usar las nuevas capacidades cuando quieras
import InventarioEnhanced from './app/modules/core-enhanced.js';
const app = new InventarioEnhanced();
app.addRepuesto({ ... }); // Nuevo método con validación
app.getStats(); // Nuevo método
```

---

## 📊 COMPARACIÓN

| Característica | v5.4.0 Original | v6.0 Mejorada |
|---------------|-----------------|---------------|
| **Archivo principal** | 35,891 líneas 😱 | Modular 📁 |
| **Validación de datos** | ❌ | ✅ |
| **Manejo de errores** | Básico | Robusto 🛡️ |
| **Eventos entre módulos** | ❌ | ✅ EventBus |
| **Estado centralizado** | ❌ | ✅ StateManager |
| **Sanitización XSS** | ❌ | ✅ |
| **PWA / Offline** | ❌ | ✅ |
| **CSS modular** | Todo inline | 3 archivos |
| **Utilities** | Dispersas | 50+ funciones |
| **Testing** | Difícil | Fácil (módulos) |

---

## 🎓 PRÓXIMOS PASOS SUGERIDOS

1. **Lee esta guía completa** 📖
2. **Crea `inventario_v6.0.html`** basado en `index.html`
3. **Importa módulos mejorados** uno por uno
4. **Prueba funcionalidad básica** (conectar, agregar, buscar)
5. **Compara resultados** con v5.4.0
6. **Decide si migrar** completamente o usar ambas versiones

---

## 💡 TIPS

- Los módulos mejorados **extienden** los originales, no los reemplazan
- Puedes usar `InventarioEnhanced` que hereda de `InventarioCompleto`
- Todos los métodos viejos siguen existiendo
- Los nuevos métodos son opcionales
- EventBus y StateManager funcionan en segundo plano

---

## 🆘 SI ALGO SALE MAL

1. **Vuelve a `inventario_v5.4.0.html`** (siempre funciona)
2. **Revisa consola** para ver errores
3. **Verifica imports** estén correctos
4. **Compara** con ejemplos de esta guía
5. **Restaura backup** si es necesario

---

## 🎉 CONCLUSIÓN

**No tienes que migrar nada si no quieres**. Los módulos mejorados están listos para cuando decidas usarlos. Puedes:

- Seguir usando v5.4.0 como siempre ✅
- Probar v6.0 en paralelo ✅
- Migrar gradualmente ✅
- Mezclar ambas versiones ✅

**¡Tú decides el ritmo! Sin presión, sin romper nada.** 🚀
