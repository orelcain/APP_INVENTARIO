#!/usr/bin/env node
/**
 * SCRIPT DE BACKUP PARA UNIFICACIÓN DE JERARQUÍA
 * Crea copias de seguridad de todos los archivos críticos antes de la migración
 * Fecha: 2025-11-19
 */

const fs = require('fs');
const path = require('path');

// Configuración
const STORAGE_DIR = path.join(__dirname, '..', 'INVENTARIO_STORAGE');
const BACKUP_ROOT = path.join(STORAGE_DIR, 'backups', 'unificacion');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                  new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
const BACKUP_DIR = path.join(BACKUP_ROOT, `backup_${TIMESTAMP}`);

// Archivos a respaldar
const FILES_TO_BACKUP = [
  'zonas.json',
  'repuestos.json',
  'mapas.json',
  'presupuestos.json',
  'inventario.json'
];

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDirectoryIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`✓ Directorio creado: ${dir}`, 'green');
  }
}

function copyFile(source, dest) {
  try {
    if (!fs.existsSync(source)) {
      log(`⚠ Archivo no encontrado: ${source}`, 'yellow');
      return { success: false, size: 0 };
    }

    const content = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(dest, content, 'utf8');
    
    const stats = fs.statSync(dest);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    return { success: true, size: stats.size, sizeMB };
  } catch (error) {
    log(`✗ Error copiando ${source}: ${error.message}`, 'red');
    return { success: false, size: 0, error: error.message };
  }
}

function validateBackup(source, dest) {
  try {
    const sourceContent = fs.readFileSync(source, 'utf8');
    const destContent = fs.readFileSync(dest, 'utf8');
    
    if (sourceContent === destContent) {
      return { valid: true };
    } else {
      return { valid: false, error: 'Contenido no coincide' };
    }
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function createBackupManifest(results) {
  const manifest = {
    timestamp: new Date().toISOString(),
    backupDir: BACKUP_DIR,
    files: results,
    totalSize: results.reduce((sum, r) => sum + r.size, 0),
    success: results.every(r => r.success),
    version: '1.0.0',
    purpose: 'Backup pre-unificación de jerarquía a 7 niveles'
  };

  const manifestPath = path.join(BACKUP_DIR, 'MANIFEST.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  
  return manifest;
}

function createRestoreScript() {
  const scriptContent = `#!/usr/bin/env node
/**
 * SCRIPT DE RESTAURACIÓN
 * Restaura los archivos desde este backup
 * Generado automáticamente el ${new Date().toISOString()}
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = __dirname;
const STORAGE_DIR = path.join(__dirname, '..', '..', '..');

const files = ${JSON.stringify(FILES_TO_BACKUP, null, 2)};

console.log('\\x1b[33m⚠ RESTAURANDO BACKUP...\\x1b[0m');
console.log('Origen:', BACKUP_DIR);
console.log('Destino:', STORAGE_DIR);
console.log('');

let success = 0;
let failed = 0;

files.forEach(file => {
  try {
    const source = path.join(BACKUP_DIR, file);
    const dest = path.join(STORAGE_DIR, file);
    
    if (!fs.existsSync(source)) {
      console.log(\`\\x1b[33m⚠ No existe: \${file}\\x1b[0m\`);
      return;
    }
    
    const content = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(dest, content, 'utf8');
    console.log(\`\\x1b[32m✓ Restaurado: \${file}\\x1b[0m\`);
    success++;
  } catch (error) {
    console.log(\`\\x1b[31m✗ Error con \${file}: \${error.message}\\x1b[0m\`);
    failed++;
  }
});

console.log('');
console.log(\`\\x1b[32m✓ Exitosos: \${success}\\x1b[0m\`);
if (failed > 0) {
  console.log(\`\\x1b[31m✗ Fallidos: \${failed}\\x1b[0m\`);
}
console.log('\\x1b[36m✓ Restauración completada\\x1b[0m');
`;

  const scriptPath = path.join(BACKUP_DIR, 'restore.cjs');
  fs.writeFileSync(scriptPath, scriptContent, 'utf8');
  
  return scriptPath;
}

// ========== EJECUCIÓN PRINCIPAL ==========

async function main() {
  log('\n════════════════════════════════════════════════════', 'cyan');
  log('  BACKUP PRE-UNIFICACIÓN DE JERARQUÍA', 'bright');
  log('════════════════════════════════════════════════════\n', 'cyan');
  
  log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`, 'blue');
  log(`📁 Directorio backup: ${BACKUP_DIR}`, 'blue');
  log('');

  // Crear directorio de backup
  log('🔨 Creando estructura de directorios...', 'yellow');
  createDirectoryIfNotExists(BACKUP_ROOT);
  createDirectoryIfNotExists(BACKUP_DIR);
  log('');

  // Copiar archivos
  log('📋 Copiando archivos...', 'yellow');
  const results = [];
  
  for (const file of FILES_TO_BACKUP) {
    const source = path.join(STORAGE_DIR, file);
    const dest = path.join(BACKUP_DIR, file);
    
    process.stdout.write(`  • ${file.padEnd(25)} `);
    
    const result = copyFile(source, dest);
    
    if (result.success) {
      log(`✓ ${result.sizeMB} MB`, 'green');
      
      // Validar backup
      const validation = validateBackup(source, dest);
      if (!validation.valid) {
        log(`    ⚠ Validación falló: ${validation.error}`, 'red');
        result.validated = false;
      } else {
        result.validated = true;
      }
    } else {
      log('✗ FALLÓ', 'red');
    }
    
    results.push({
      file,
      success: result.success,
      size: result.size || 0,
      sizeMB: result.sizeMB || '0.00',
      validated: result.validated || false,
      error: result.error || null
    });
  }
  
  log('');

  // Crear manifest
  log('📝 Creando manifest...', 'yellow');
  const manifest = createBackupManifest(results);
  log(`✓ Manifest creado`, 'green');
  log('');

  // Crear script de restauración
  log('🔧 Creando script de restauración...', 'yellow');
  const restoreScript = createRestoreScript();
  log(`✓ Script: ${path.basename(restoreScript)}`, 'green');
  log('');

  // Resumen
  log('════════════════════════════════════════════════════', 'cyan');
  log('  RESUMEN DEL BACKUP', 'bright');
  log('════════════════════════════════════════════════════', 'cyan');
  
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  const totalSizeMB = (manifest.totalSize / 1024 / 1024).toFixed(2);
  
  log(`✓ Archivos exitosos:  ${successCount}/${FILES_TO_BACKUP.length}`, 'green');
  
  if (failedCount > 0) {
    log(`✗ Archivos fallidos:   ${failedCount}`, 'red');
    results.filter(r => !r.success).forEach(r => {
      log(`  - ${r.file}: ${r.error}`, 'red');
    });
  }
  
  log(`📦 Tamaño total:       ${totalSizeMB} MB`, 'blue');
  log(`📁 Ubicación:          ${BACKUP_DIR}`, 'blue');
  log('');

  // Instrucciones de restauración
  if (manifest.success) {
    log('✅ BACKUP COMPLETADO EXITOSAMENTE', 'green');
    log('');
    log('Para restaurar este backup, ejecuta:', 'cyan');
    log(`  node "${restoreScript}"`, 'bright');
    log('');
    log('🚀 Puedes proceder con la migración', 'green');
  } else {
    log('⚠ BACKUP COMPLETADO CON ERRORES', 'yellow');
    log('Revisa los archivos fallidos antes de continuar', 'yellow');
  }
  
  log('════════════════════════════════════════════════════\n', 'cyan');

  // Retornar código de salida
  process.exit(manifest.success ? 0 : 1);
}

// Ejecutar
main().catch(error => {
  log(`\n✗ ERROR FATAL: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
