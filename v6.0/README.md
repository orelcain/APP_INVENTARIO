# v6.0-modular - Version Optimizada

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
