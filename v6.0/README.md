# v6.0 - Sistema de Inventario con Ubicaciones Múltiples

## Historial de Versiones

### v49 - Correlativos Globales y Toggle de Repuestos (19-nov-2025)
**Cambios:**
- ✅ **Correlativos globales**: Los repuestos se numeran globalmente (#1 al #8) independientemente de la ubicación
- ✅ **Botón toggle de repuestos**: A la derecha del nombre del nodo aparece 📦 para colapsar/expandir la lista de repuestos
- ✅ **Estado persistente**: El estado de colapso de repuestos se guarda en localStorage

**Ejemplo visual:**
```
📦 Grader  📦(4)  ▸  [Editar] [+ Sub-Sistema]
  ├─ 📦 PARADA EMERGENCIA #1  🗺️ ✅ 5/5
  ├─ 📦 PARADA EMERGENCIA #2  📍 ✅ 5/5
  └─ ...

📦 Cinta Transversal  📦(4)  ▸
  ├─ 📦 PARADA EMERGENCIA #3  🗺️ ✅ 5/5
  ├─ 📦 PARADA EMERGENCIA #4  📍 ✅ 5/5
  ├─ 📦 PARADA EMERGENCIA #5  📍 ✅ 5/5
  └─ 📦 PARADA EMERGENCIA #6  📍 ⚠️ 5/5

📦 Filete  📦(2)  ▸
  ├─ 📦 PARADA EMERGENCIA #7  📍 ✅ 5/5
  └─ 📦 PARADA EMERGENCIA #8  📍 ✅ 5/5
```

**Lógica de correlativos:**
- Si hay 8 "PARADA EMERGENCIA" en TOTAL (en diferentes ubicaciones)
- Se numeran del #1 al #8 **globalmente**
- El orden es según aparecen en el array `ubicaciones[]` del repuesto
- Cada `cantidadEnUbicacion` genera N filas consecutivas

### v48 - Correlativos Individuales (#1, #2, #3, #4) (19-nov-2025)
**Cambios:**
- ✅ **Filas separadas por instancia**: En Tab Jerarquía, cada instancia se muestra en su propia fila con badge #1, #2, #3, #4
- ✅ **Selector de correlativo en mapas**: Al asignar marcador, si hay múltiples instancias, se muestra selector para elegir qué correlativo se está marcando
- ✅ **Campo numeroCorrelativo persistido**: Se guarda en `ubicacion.numeroCorrelativo` el correlativo asignado a cada marcador
- ✅ **Click individual**: Cada fila de repuesto es clickeable con información de su instancia específica

**Ejemplo visual:**
```
📦 Grader > Cinta Larga Grader
  📦 PARADA EMERGENCIA CON CAJA #1  🗺️ ✅ 5/5
  📦 PARADA EMERGENCIA CON CAJA #2  📍 ✅ 5/5
  📦 PARADA EMERGENCIA CON CAJA #3  🗺️ ✅ 5/5
  📦 PARADA EMERGENCIA CON CAJA #4  📍 ⚠️ 5/5
```

**Flujo de asignación de marcador:**
1. Usuario hace click en área del mapa
2. Selecciona repuesto "PARADA EMERGENCIA CON CAJA"
3. Sistema detecta que tiene 4 instancias en esa ubicación
4. Muestra selector: `#1  #2  #3  #4`
5. Usuario selecciona `#3`
6. Marcador se crea con `numeroCorrelativo: 3`

### v47 - Persistencia de Cantidad y Correlativos por Ubicación (19-nov-2025)
**Cambios:**
- ✅ **Persistencia de cantidadEnUbicacion**: El campo `cantidadEnUbicacion` ahora se guarda correctamente en cada ubicación del repuesto
- ✅ **Indicadores individuales**: Los badges ×N ahora muestran la cantidad específica en cada ubicación (no el total global)
- ✅ **Badge gris ×1**: Cuando un repuesto tiene ×1 en esta ubicación pero más en otras, muestra badge gris con tooltip informativo
- ✅ **Tooltip informativo**: Hover sobre badge muestra "×N en esta ubicación (×M total global)"

**Modelo de datos:**
```javascript
{
  nombre: "PARADA EMERGENCIA CON CAJA",
  ubicaciones: [
    {
      areaGeneral: "Planta Principal",
      subArea: "Eviscerado",
      sistemaEquipo: "Grader",
      cantidadEnUbicacion: 3,  // ← Ahora persiste
      jerarquiaPath: [...]
    },
    {
      areaGeneral: "Planta Principal",
      subArea: "Filete",
      cantidadEnUbicacion: 2  // ← Ahora persiste
    }
  ]
}
```

**Ejemplo visual en Tab Jerarquía:**
- Planta Principal > Eviscerado > Grader → PARADA EMERGENCIA **×3** 
- Planta Principal > Filete → PARADA EMERGENCIA **×2**
- Badge muestra cantidad local, tooltip muestra: "×3 en esta ubicación (×5 total global)"

### v46 - UI Limpia de Ubicaciones (19-nov-2025)

## Estructura
```
v6.0-modular/
├── index.html          (HTML limpio con referencias)
├── package.json        (Dependencias)
├── vite.config.js      (Configuracion de build)
├── modules/
│   └── app.js          (JavaScript modular)
├── styles/
│   └── main.css        (CSS separado)
└── dist/               (Version compilada - se genera con 'npm run build')
```

## Instalacion y Uso

### 1. Instalar dependencias
```powershell
cd v6.0-modular
npm install
```

### 2. Desarrollo (con hot reload)
```powershell
npm run dev
```
Abre automaticamente en http://localhost:3000

### 3. Build para produccion
```powershell
npm run build
```
Genera carpeta `dist/` optimizada:
- Minificacion automatica
- Eliminacion de console.log
- Code splitting
- Cache busting con hashes
- **Reduccion esperada: -60% de tamaño**

### 4. Preview de build
```powershell
npm run preview
```

## Comparacion

### ANTES (v6.0/inventario_v6.0_portable.html)
- **Tamaño:** 1,796 KB (1.75 MB)
- **Lineas:** 51,589
- **Estructura:** Monolitico (todo en un archivo)
- **Carga:** Lenta (descarga todo de una vez)
- **Cache:** Malo (cambio minimo = recargar todo)

### DESPUES (v6.0-modular/dist/ compilado)
- **Tamaño estimado:** ~600 KB (-66%)
- **Estructura:** Modular (HTML + CSS + JS separados)
- **Carga:** Rapida (carga progresiva)
- **Cache:** Excelente (solo recarga lo que cambio)
- **Optimizaciones:**
  - Sin console.log en produccion
  - CSS y JS minificados
  - Nombres con hash para cache
  - Separacion en chunks

## Notas
- Mantener `../INVENTARIO_STORAGE/` para datos
- Copiar `manifest.json` si necesario
- La version original sigue en `../v6.0/`

## Contrato de mapas y jerarquía (v6.0)

- Cada mapa se guarda con un único `jerarquiaPath` y el campo derivado `mapLevel`.
- El campo `allowFreeLevel` permite excepciones puntuales (sin jerarquía obligatoria) y está desactivado por defecto.
- Durante `mapStorage.saveMaps()` se valida que no existan nodos hoja repetidos salvo en mapas marcados como libres.
- Ejecuta `mapStorage.auditMapHierarchy()` (una vez conectado el File System) para obtener un resumen de inconsistencias antes de migrar datos.
