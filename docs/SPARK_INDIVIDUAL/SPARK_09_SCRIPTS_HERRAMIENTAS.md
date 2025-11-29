# 📄 DOCUMENTO 10/11: SPARK_09_SCRIPTS_HERRAMIENTAS.md

**Tamaño:** 18.8 KB | **Líneas:** 779
**Posición:** 10 de 11

⏩ **DOCUMENTO INTERMEDIO** - Continúa leyendo...

---

# 🔧 Scripts Node.js y Herramientas

**Módulo 9/10** - Scripts de migración, mantenimiento y utilidades  
**Guía completa de comandos y herramientas de desarrollo**

---

## 📋 CONTENIDO

1. [Scripts de Migración](#scripts-de-migración)
2. [Scripts de Mantenimiento](#scripts-de-mantenimiento)
3. [Herramientas de Análisis](#herramientas-de-análisis)
4. [Sistema de Backups](#sistema-de-backups)
5. [Comandos de Debugging](#comandos-de-debugging)

---

## 🚀 SCRIPTS DE MIGRACIÓN

### migrate-repuestos.cjs

**Ubicación:** `v6.0/scripts/migrate-repuestos.cjs`  
**Propósito:** Migrar repuestos de jerarquía antigua (Nivel1-7 + PlantaGeneral-SubSeccionGeneral) a jerarquía unificada de 7 niveles

#### Uso

```bash
# Dry-run (solo análisis, sin cambios)
node scripts/migrate-repuestos.cjs

# Aplicar cambios reales
node scripts/migrate-repuestos.cjs --apply

# Con ruta personalizada
node scripts/migrate-repuestos.cjs --apply --path "D:\INVENTARIOS\datos.json"
```

#### Código Principal

```javascript
// Línea 150 en migrate-repuestos.cjs
async function migrateRepuesto(repuesto) {
  const migratedData = {
    ...repuesto,
    // Nueva jerarquía unificada (7 niveles)
    nivel1: repuesto.PlantaGeneral || repuesto.nivel1 || '',
    nivel2: repuesto.AreaGeneral || repuesto.nivel2 || '',
    nivel3: repuesto.SubAreaGeneral || repuesto.nivel3 || '',
    nivel4: repuesto.SistemaGeneral || repuesto.nivel4 || '',
    nivel5: repuesto.SubSistemaGeneral || repuesto.nivel5 || '',
    nivel6: repuesto.SeccionGeneral || repuesto.nivel6 || '',
    nivel7: repuesto.SubSeccionGeneral || repuesto.nivel7 || ''
  };

  // Eliminar campos legacy
  delete migratedData.PlantaGeneral;
  delete migratedData.AreaGeneral;
  delete migratedData.SubAreaGeneral;
  delete migratedData.SistemaGeneral;
  delete migratedData.SubSistemaGeneral;
  delete migratedData.SeccionGeneral;
  delete migratedData.SubSeccionGeneral;

  return migratedData;
}
```

#### Validación

```javascript
// Línea 210 en migrate-repuestos.cjs
function validateMigratedRepuesto(repuesto) {
  const errors = [];

  // Validar estructura
  if (!repuesto.id) errors.push('Falta ID');
  if (!repuesto.nombre) errors.push('Falta nombre');

  // Validar jerarquía (al menos nivel1)
  if (!repuesto.nivel1 && !repuesto.nivel2) {
    errors.push('Sin jerarquía definida');
  }

  // Validar campos legacy no existen
  const legacyFields = ['PlantaGeneral', 'AreaGeneral', 'SubAreaGeneral'];
  legacyFields.forEach(field => {
    if (repuesto.hasOwnProperty(field)) {
      errors.push(`Campo legacy ${field} aún existe`);
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
```

#### Reporte de Migración

```javascript
// Línea 280 en migrate-repuestos.cjs
function generateMigrationReport(data) {
  const report = {
    timestamp: new Date().toISOString(),
    totalRepuestos: data.repuestos.length,
    migrados: 0,
    sinCambios: 0,
    errores: [],
    estadisticas: {
      conJerarquia: 0,
      sinJerarquia: 0,
      conMultimedia: 0
    }
  };

  data.repuestos.forEach(rep => {
    if (rep.nivel1) report.estadisticas.conJerarquia++;
    else report.estadisticas.sinJerarquia++;

    if (rep.multimedia && rep.multimedia.length > 0) {
      report.estadisticas.conMultimedia++;
    }
  });

  return report;
}
```

---

### migrate-zonas.cjs

**Ubicación:** `v6.0/scripts/migrate-zonas.cjs`  
**Propósito:** Migrar zonas de mapas a nueva estructura con jerarquía unificada

#### Uso

```bash
# Dry-run
node scripts/migrate-zonas.cjs

# Aplicar cambios
node scripts/migrate-zonas.cjs --apply
```

#### Código Principal

```javascript
// Línea 120 en migrate-zonas.cjs
async function migrateZona(zona) {
  return {
    ...zona,
    // Asegurar estructura correcta
    jerarquia: zona.jerarquia || {
      nivel1: '',
      nivel2: '',
      nivel3: '',
      nivel4: '',
      nivel5: '',
      nivel6: '',
      nivel7: ''
    },
    // Limpiar campos legacy
    mapaId: zona.mapaId || zona.mapId || null,
    repuestosAsignados: zona.repuestosAsignados || []
  };
}
```

---

### cleanup-legacy-fields.cjs

**Ubicación:** `v6.0/scripts/cleanup-legacy-fields.cjs`  
**Propósito:** Eliminar campos deprecated de toda la base de datos

#### Campos Legacy a Eliminar

```javascript
// Línea 45 en cleanup-legacy-fields.cjs
const LEGACY_FIELDS = [
  // Jerarquía antigua (eliminada en v6.0)
  'PlantaGeneral',
  'AreaGeneral',
  'SubAreaGeneral',
  'SistemaGeneral',
  'SubSistemaGeneral',
  'SeccionGeneral',
  'SubSeccionGeneral',
  
  // Campos obsoletos
  'ubicacionFisica',
  'ubicacionDetallada',
  'categoria_old',
  'tipo_old',
  
  // Campos de prueba
  'test_field',
  '_tempData'
];
```

#### Limpieza Recursiva

```javascript
// Línea 90 en cleanup-legacy-fields.cjs
function cleanupObject(obj, fieldsToRemove) {
  let cleaned = 0;

  fieldsToRemove.forEach(field => {
    if (obj.hasOwnProperty(field)) {
      delete obj[field];
      cleaned++;
    }
  });

  // Limpiar sub-objetos
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleaned += cleanupObject(obj[key], fieldsToRemove);
    }
  });

  return cleaned;
}
```

---

## 🛠️ SCRIPTS DE MANTENIMIENTO

### fix-empty-jerarquia.cjs

**Ubicación:** `v6.0/scripts/fix-empty-jerarquia.cjs`  
**Propósito:** Corregir repuestos con jerarquía vacía o null

#### Uso

```bash
# Analizar problemas
node scripts/fix-empty-jerarquia.cjs

# Aplicar correcciones
node scripts/fix-empty-jerarquia.cjs --apply --default-nivel1="Planta Principal"
```

#### Corrección

```javascript
// Línea 110 en fix-empty-jerarquia.cjs
function fixEmptyJerarquia(repuesto, defaultNivel1) {
  const fixed = { ...repuesto };
  let changed = false;

  // Si no tiene nivel1, asignar default
  if (!fixed.nivel1 || fixed.nivel1.trim() === '') {
    fixed.nivel1 = defaultNivel1;
    changed = true;
  }

  // Asegurar niveles vacíos tienen string vacío (no null)
  for (let i = 1; i <= 7; i++) {
    const key = `nivel${i}`;
    if (fixed[key] === null || fixed[key] === undefined) {
      fixed[key] = '';
      changed = true;
    }
  }

  return { repuesto: fixed, changed };
}
```

---

### data-migrate.cjs

**Ubicación:** `v6.0/scripts/data-migrate.cjs`  
**Propósito:** Migración general de datos entre versiones

#### Transformaciones

```javascript
// Línea 200 en data-migrate.cjs
const MIGRATIONS = {
  'v5.0-to-v6.0': {
    name: 'Migración v5.0 → v6.0',
    transforms: [
      {
        type: 'rename-field',
        from: 'categoria',
        to: 'tipo'
      },
      {
        type: 'add-field',
        field: 'nivel8',
        defaultValue: ''
      },
      {
        type: 'transform-field',
        field: 'multimedia',
        fn: (value) => {
          // Convertir array simple a objetos
          if (Array.isArray(value) && typeof value[0] === 'string') {
            return value.map(url => ({
              id: generateId(),
              type: 'image',
              url: url,
              name: url.split('/').pop(),
              size: 0,
              uploadDate: new Date().toISOString()
            }));
          }
          return value;
        }
      }
    ]
  }
};
```

---

## 📊 HERRAMIENTAS DE ANÁLISIS

### analyze-dependencies.cjs

**Ubicación:** `v6.0/scripts/analyze-dependencies.cjs`  
**Propósito:** Analizar dependencias entre módulos y funciones

#### Uso

```bash
# Análisis completo
node scripts/analyze-dependencies.cjs

# Exportar a JSON
node scripts/analyze-dependencies.cjs --output dependencies.json

# Ver solo funciones críticas
node scripts/analyze-dependencies.cjs --critical-only
```

#### Análisis

```javascript
// Línea 150 en analyze-dependencies.cjs
function analyzeFunctionDependencies(code) {
  const dependencies = {
    functions: {},
    calls: []
  };

  // Buscar definiciones de funciones
  const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*[=\(]/g;
  let match;
  
  while ((match = functionRegex.exec(code)) !== null) {
    const functionName = match[1];
    dependencies.functions[functionName] = {
      name: functionName,
      calls: [],
      calledBy: []
    };
  }

  // Buscar llamadas a funciones
  Object.keys(dependencies.functions).forEach(fnName => {
    const callRegex = new RegExp(`${fnName}\\s*\\(`, 'g');
    const calls = [...code.matchAll(callRegex)];
    dependencies.functions[fnName].callCount = calls.length;
  });

  return dependencies;
}
```

---

### audit-jerarquia-actual.cjs

**Ubicación:** `v6.0/scripts/audit-jerarquia-actual.cjs`  
**Propósito:** Auditar estado actual de jerarquía en todos los repuestos

#### Reporte

```javascript
// Línea 180 en audit-jerarquia-actual.cjs
function generateAuditReport(repuestos) {
  const report = {
    timestamp: new Date().toISOString(),
    totalRepuestos: repuestos.length,
    jerarquia: {
      completa: 0,
      parcial: 0,
      vacia: 0
    },
    niveles: {}
  };

  // Inicializar contadores por nivel
  for (let i = 1; i <= 7; i++) {
    report.niveles[`nivel${i}`] = {
      poblado: 0,
      vacio: 0,
      valores: new Set()
    };
  }

  // Analizar cada repuesto
  repuestos.forEach(rep => {
    let nivelesCompletos = 0;

    for (let i = 1; i <= 7; i++) {
      const nivel = rep[`nivel${i}`];
      const nivelKey = `nivel${i}`;

      if (nivel && nivel.trim() !== '') {
        report.niveles[nivelKey].poblado++;
        report.niveles[nivelKey].valores.add(nivel);
        nivelesCompletos++;
      } else {
        report.niveles[nivelKey].vacio++;
      }
    }

    // Clasificar jerarquía
    if (nivelesCompletos === 7) report.jerarquia.completa++;
    else if (nivelesCompletos > 0) report.jerarquia.parcial++;
    else report.jerarquia.vacia++;
  });

  // Convertir Sets a arrays
  Object.keys(report.niveles).forEach(nivel => {
    report.niveles[nivel].valores = Array.from(report.niveles[nivel].valores);
    report.niveles[nivel].valoresUnicos = report.niveles[nivel].valores.length;
  });

  return report;
}
```

---

## 💾 SISTEMA DE BACKUPS

### create-backup-unificacion.cjs

**Ubicación:** `v6.0/scripts/create-backup-unificacion.cjs`  
**Propósito:** Crear backups completos antes de operaciones críticas

#### Uso

```bash
# Backup automático
node scripts/create-backup-unificacion.cjs

# Backup con nombre personalizado
node scripts/create-backup-unificacion.cjs --name "pre-migration-v6"

# Backup con compresión
node scripts/create-backup-unificacion.cjs --compress
```

#### Creación de Backup

```javascript
// Línea 100 en create-backup-unificacion.cjs
const fs = require('fs');
const path = require('path');

async function createBackup(options = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = options.name || `backup_${timestamp}`;
  const backupDir = path.join(process.cwd(), 'INVENTARIO_STORAGE', 'backups', 'unificacion');

  // Crear directorio si no existe
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, backupName);
  fs.mkdirSync(backupPath, { recursive: true });

  // Archivos a respaldar
  const filesToBackup = [
    'inventario.json',
    'repuestos.json',
    'mapas.json',
    'zonas.json',
    'presupuestos.json'
  ];

  const backupManifest = {
    timestamp: timestamp,
    name: backupName,
    files: [],
    stats: {}
  };

  // Copiar cada archivo
  for (const file of filesToBackup) {
    const sourcePath = path.join(process.cwd(), 'INVENTARIO_STORAGE', file);
    const destPath = path.join(backupPath, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      
      const stats = fs.statSync(destPath);
      backupManifest.files.push({
        name: file,
        size: stats.size,
        sizeHuman: formatBytes(stats.size)
      });
      
      console.log(`✅ Respaldado: ${file} (${formatBytes(stats.size)})`);
    } else {
      console.warn(`⚠️  Archivo no encontrado: ${file}`);
    }
  }

  // Guardar manifest
  fs.writeFileSync(
    path.join(backupPath, 'manifest.json'),
    JSON.stringify(backupManifest, null, 2)
  );

  console.log(`\n📦 Backup creado: ${backupPath}`);
  return backupPath;
}
```

---

## 🐛 COMANDOS DE DEBUGGING

### Consola del Navegador

```javascript
// Verificar estado de la aplicación
app.getAppState()

// Ver estadísticas
app.stats

// Forzar guardado
await app.guardarTodo()

// Ver repuestos en memoria
app.repuestos

// Filtrar repuestos
app.repuestos.filter(r => r.nivel1 === 'Planta Principal')

// Ver jerarquía activa
app.jerarquiaActiva

// Ver mapa activo
app.mapController.activeMapId

// Limpiar LocalStorage
localStorage.clear()
sessionStorage.clear()

// Ver todas las keys de LocalStorage
Object.keys(localStorage).filter(k => k.startsWith('app_inventario_'))

// Debugging de FileSystem
app.fileSystemState

// Ver logs de operaciones
app.logs
```

### Scripts de Debugging en Package.json

```json
// Línea 18 en package.json
{
  "scripts": {
    "debug:repuestos": "node scripts/debug-repuestos.cjs",
    "debug:jerarquia": "node scripts/debug-jerarquia.cjs",
    "debug:mapas": "node scripts/debug-mapas.cjs",
    "analyze": "node scripts/analyze-dependencies.cjs",
    "audit": "node scripts/audit-jerarquia-actual.cjs",
    "backup": "node scripts/create-backup-unificacion.cjs",
    "migrate": "node scripts/migrate-repuestos.cjs",
    "cleanup": "node scripts/cleanup-legacy-fields.cjs",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Debugging de Jerarquía

```javascript
// debug-jerarquia.cjs (crear en scripts/)
const fs = require('fs');
const path = require('path');

async function debugJerarquia() {
  const dataPath = path.join(process.cwd(), 'INVENTARIO_STORAGE', 'repuestos.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log('=== DEBUG JERARQUÍA ===\n');

  // Contar niveles poblados
  const nivelCounts = {};
  for (let i = 1; i <= 7; i++) {
    nivelCounts[`nivel${i}`] = 0;
  }

  data.repuestos.forEach(rep => {
    for (let i = 1; i <= 7; i++) {
      if (rep[`nivel${i}`] && rep[`nivel${i}`].trim() !== '') {
        nivelCounts[`nivel${i}`]++;
      }
    }
  });

  console.log('Niveles poblados:');
  Object.entries(nivelCounts).forEach(([nivel, count]) => {
    const percent = ((count / data.repuestos.length) * 100).toFixed(1);
    console.log(`  ${nivel}: ${count}/${data.repuestos.length} (${percent}%)`);
  });

  // Valores únicos por nivel
  console.log('\nValores únicos por nivel:');
  for (let i = 1; i <= 7; i++) {
    const valores = new Set(
      data.repuestos
        .map(r => r[`nivel${i}`])
        .filter(v => v && v.trim() !== '')
    );
    console.log(`  nivel${i}: ${valores.size} valores únicos`);
  }

  // Repuestos sin jerarquía
  const sinJerarquia = data.repuestos.filter(r => 
    !r.nivel1 || r.nivel1.trim() === ''
  );
  console.log(`\n⚠️  Repuestos sin jerarquía: ${sinJerarquia.length}`);

  if (sinJerarquia.length > 0) {
    console.log('Primeros 5:');
    sinJerarquia.slice(0, 5).forEach(r => {
      console.log(`  - ${r.id}: ${r.nombre}`);
    });
  }
}

debugJerarquia().catch(console.error);
```

---

## 📦 COMANDOS NPM ÚTILES

```bash
# Desarrollo
npm run dev                    # Servidor Vite con hot-reload

# Producción
npm run build                  # Build optimizado
npm run preview                # Vista previa del build

# Migración
npm run migrate               # Migrar repuestos (dry-run)
npm run migrate -- --apply    # Aplicar migración real

# Backups
npm run backup                # Backup automático
npm run backup -- --name "pre-deploy"  # Backup con nombre

# Análisis
npm run analyze               # Analizar dependencias
npm run audit                 # Auditar jerarquía

# Limpieza
npm run cleanup               # Eliminar campos legacy
npm run cleanup -- --apply    # Aplicar limpieza real

# Debugging
npm run debug:repuestos       # Debug de repuestos
npm run debug:jerarquia       # Debug de jerarquía
npm run debug:mapas           # Debug de mapas
```

---

## 🔍 TROUBLESHOOTING

### Problema: Repuestos sin jerarquía

```bash
# 1. Auditar estado actual
npm run audit

# 2. Ver repuestos afectados
node -e "
const data = require('./INVENTARIO_STORAGE/repuestos.json');
const sin = data.repuestos.filter(r => !r.nivel1);
console.log(sin.map(r => r.id + ': ' + r.nombre).join('\\n'));
"

# 3. Corregir con valor por defecto
node scripts/fix-empty-jerarquia.cjs --apply --default-nivel1="Planta Principal"
```

### Problema: Campos legacy existen

```bash
# 1. Identificar campos legacy
node scripts/analyze-dependencies.cjs --legacy-fields

# 2. Crear backup
npm run backup -- --name "pre-cleanup"

# 3. Eliminar campos legacy
npm run cleanup -- --apply
```

### Problema: Error al cargar datos

```bash
# 1. Validar JSON
node -e "
const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('./INVENTARIO_STORAGE/repuestos.json', 'utf-8'));
  console.log('✅ JSON válido');
  console.log('Total repuestos:', data.repuestos.length);
} catch (e) {
  console.error('❌ Error en JSON:', e.message);
}
"

# 2. Restaurar desde backup si es necesario
cp INVENTARIO_STORAGE/backups/unificacion/backup_YYYY-MM-DD/repuestos.json INVENTARIO_STORAGE/
```

---

## 📊 ESTADÍSTICAS DE SCRIPTS

| Script | Líneas | Propósito | Dry-run |
|--------|--------|-----------|---------|
| **migrate-repuestos.cjs** | 500 | Migrar jerarquía | ✅ |
| **migrate-zonas.cjs** | 350 | Migrar zonas | ✅ |
| **cleanup-legacy-fields.cjs** | 280 | Limpiar campos | ✅ |
| **fix-empty-jerarquia.cjs** | 320 | Corregir jerarquía vacía | ✅ |
| **create-backup-unificacion.cjs** | 200 | Crear backups | N/A |
| **analyze-dependencies.cjs** | 450 | Analizar código | N/A |
| **audit-jerarquia-actual.cjs** | 400 | Auditar estado | N/A |
| **data-migrate.cjs** | 600 | Migración general | ✅ |

**Total:** ~3,100 líneas de scripts Node.js

---

## ✅ CHECKLIST PRE-MIGRACIÓN

Antes de ejecutar cualquier script de migración con `--apply`:

- [ ] Crear backup completo: `npm run backup`
- [ ] Revisar dry-run: `npm run migrate` (sin --apply)
- [ ] Validar JSON: `node -e "require('./INVENTARIO_STORAGE/repuestos.json')"`
- [ ] Verificar espacio en disco (al menos 100 MB libre)
- [ ] Cerrar aplicación web (evitar conflictos)
- [ ] Tener acceso a backups anteriores
- [ ] Anotar hash MD5 de archivos originales (opcional)

---

**Continúa con:** [`SPARK_00_INDEX.md`](./SPARK_00_INDEX.md) (Índice actualizado)


================================================================================

## ⏭️ SIGUIENTE: SPARK_10_CLOUDINARY_DEPLOYMENT.md

