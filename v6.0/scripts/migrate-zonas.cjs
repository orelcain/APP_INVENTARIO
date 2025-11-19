#!/usr/bin/env node
/**
 * FASE 2A: MIGRACIÓN DE DATOS CON COMPATIBILIDAD DUAL
 * Script de migración de zonas.json a estructura de 7 niveles
 * 
 * ESTRATEGIA SEGURA:
 * - Mantiene campos antiguos (nivel1-5) como deprecated
 * - Agrega nuevos campos (nivel1-7) con valores migrados
 * - Agrega flag _migrated: true
 * - Modo dry-run por defecto (simular sin escribir)
 * - Validación exhaustiva pre y post migración
 */

const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '..', 'INVENTARIO_STORAGE');
const ZONAS_PATH = path.join(STORAGE_DIR, 'zonas.json');
const BACKUP_DIR = path.join(STORAGE_DIR, 'backups', 'migracion');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuración de la empresa (valor por defecto para nivel1)
const EMPRESA_DEFAULT = 'Aquachile Antarfood';

function createMigrationBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                    new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const backupPath = path.join(BACKUP_DIR, `zonas_pre_migracion_${timestamp}.json`);
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const original = fs.readFileSync(ZONAS_PATH, 'utf8');
  fs.writeFileSync(backupPath, original, 'utf8');
  
  return backupPath;
}

function migrateZona(zona) {
  // Si ya fue migrada, no re-migrar
  if (zona._migrated === true) {
    return {
      zona: zona,
      migrated: false,
      reason: 'Ya migrada anteriormente'
    };
  }

  // Si no tiene jerarquía, no migrar
  if (!zona.jerarquia || Object.keys(zona.jerarquia).length === 0) {
    return {
      zona: zona,
      migrated: false,
      reason: 'Sin jerarquía'
    };
  }

  const oldJerarquia = { ...zona.jerarquia };
  const newJerarquia = {};

  // TRANSFORMACIÓN: Bajar un nivel todos los valores existentes
  // nivel1 (viejo) → nivel2 (nuevo)
  // nivel2 (viejo) → nivel3 (nuevo)
  // nivel3 (viejo) → nivel4 (nuevo)
  // nivel4 (viejo) → nivel5 (nuevo)
  // nivel5 (viejo) → nivel6 (nuevo)

  // Nuevo nivel1: Empresa (siempre)
  newJerarquia.nivel1 = EMPRESA_DEFAULT;

  // Migrar niveles existentes bajando uno
  for (let i = 1; i <= 5; i++) {
    const oldKey = `nivel${i}`;
    const newKey = `nivel${i + 1}`;
    
    if (oldJerarquia[oldKey] !== undefined && oldJerarquia[oldKey] !== null) {
      newJerarquia[newKey] = oldJerarquia[oldKey];
    } else {
      newJerarquia[newKey] = null;
    }
  }

  // Nivel 7 siempre null por ahora (no había nivel6 en formato antiguo)
  newJerarquia.nivel7 = null;

  // Crear zona migrada con AMBAS estructuras (compatibilidad dual)
  const zonaMigrada = {
    ...zona,
    jerarquia: newJerarquia,           // Nueva estructura (7 niveles)
    _jerarquiaLegacy: oldJerarquia,    // Antigua estructura (5 niveles) - para compatibilidad
    _migrated: true,                    // Flag de migración
    _migrationDate: new Date().toISOString()
  };

  return {
    zona: zonaMigrada,
    migrated: true,
    changes: {
      antes: oldJerarquia,
      despues: newJerarquia
    }
  };
}

function validateMigratedZona(result) {
  const errors = [];
  const warnings = [];

  if (!result.migrated) {
    return { valid: true, errors, warnings };
  }

  const zona = result.zona;
  const newJerarquia = zona.jerarquia;

  // Validación 1: nivel1 debe ser la empresa
  if (newJerarquia.nivel1 !== EMPRESA_DEFAULT) {
    errors.push(`nivel1 no es "${EMPRESA_DEFAULT}": ${newJerarquia.nivel1}`);
  }

  // Validación 2: No debe haber nivel N sin nivel N-1 (excepto nulls al final)
  let encontradoNull = false;
  for (let i = 2; i <= 7; i++) {
    const nivelKey = `nivel${i}`;
    const valor = newJerarquia[nivelKey];

    if (valor === null || valor === undefined) {
      encontradoNull = true;
    } else if (encontradoNull) {
      errors.push(`${nivelKey} tiene valor pero niveles anteriores son null`);
    }
  }

  // Validación 3: Debe tener flag _migrated
  if (zona._migrated !== true) {
    errors.push('Falta flag _migrated');
  }

  // Validación 4: Debe tener _jerarquiaLegacy
  if (!zona._jerarquiaLegacy) {
    warnings.push('Falta _jerarquiaLegacy (compatibilidad)');
  }

  // Validación 5: Verificar que los valores se movieron correctamente
  if (result.changes) {
    const { antes, despues } = result.changes;
    for (let i = 1; i <= 5; i++) {
      const oldKey = `nivel${i}`;
      const newKey = `nivel${i + 1}`;
      
      if (antes[oldKey] && antes[oldKey] !== despues[newKey]) {
        errors.push(`Valor de ${oldKey} no se movió correctamente a ${newKey}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function generateMigrationReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalZonas: results.length,
    migradas: 0,
    noMigradas: 0,
    errores: 0,
    advertencias: 0,
    razonesNoMigracion: {},
    zonasConError: [],
    detalles: []
  };

  results.forEach((result, index) => {
    const validation = validateMigratedZona(result);

    if (result.migrated) {
      report.migradas++;
    } else {
      report.noMigradas++;
      const reason = result.reason || 'Desconocida';
      report.razonesNoMigracion[reason] = (report.razonesNoMigracion[reason] || 0) + 1;
    }

    if (!validation.valid) {
      report.errores++;
      report.zonasConError.push({
        index,
        id: result.zona.id,
        name: result.zona.name,
        errores: validation.errors
      });
    }

    if (validation.warnings.length > 0) {
      report.advertencias += validation.warnings.length;
    }

    report.detalles.push({
      id: result.zona.id,
      name: result.zona.name,
      migrated: result.migrated,
      valid: validation.valid,
      changes: result.changes || null,
      errors: validation.errors,
      warnings: validation.warnings
    });
  });

  return report;
}

async function main(dryRun = true) {
  log('\n════════════════════════════════════════════════════', 'cyan');
  log('  FASE 2A: MIGRACIÓN DE ZONAS.JSON', 'bright');
  log('  Estructura: 5 niveles → 7 niveles', 'bright');
  log('════════════════════════════════════════════════════\n', 'cyan');

  if (dryRun) {
    log('🔍 MODO DRY-RUN: Simulación sin escribir archivos', 'yellow');
    log('   (para aplicar cambios, ejecuta: node migrate-zonas.cjs --apply)\n', 'yellow');
  } else {
    log('⚠️  MODO APLICACIÓN: Se escribirán cambios reales', 'red');
    log('   Creando backup de seguridad...\n', 'yellow');
  }

  // Leer zonas.json
  log('📖 Leyendo zonas.json...', 'cyan');
  let zonas;
  try {
    const content = fs.readFileSync(ZONAS_PATH, 'utf8');
    zonas = JSON.parse(content);
  } catch (error) {
    log(`✗ Error leyendo zonas.json: ${error.message}`, 'red');
    process.exit(1);
  }

  if (!Array.isArray(zonas)) {
    log('✗ zonas.json no contiene un array', 'red');
    process.exit(1);
  }

  log(`  Total de zonas: ${zonas.length}`, 'blue');
  log('');

  // Crear backup si no es dry-run
  let backupPath;
  if (!dryRun) {
    log('💾 Creando backup...', 'yellow');
    backupPath = createMigrationBackup();
    log(`  ✓ Backup: ${path.basename(backupPath)}`, 'green');
    log('');
  }

  // Migrar cada zona
  log('🔄 Procesando zonas...', 'cyan');
  const results = zonas.map((zona, index) => {
    const result = migrateZona(zona);
    const validation = validateMigratedZona(result);

    const status = result.migrated 
      ? (validation.valid ? '✓' : '⚠')
      : '○';
    const color = result.migrated
      ? (validation.valid ? 'green' : 'yellow')
      : 'cyan';

    log(`  ${status} Zona ${index + 1}/${zonas.length}: ${zona.name}`, color);

    if (result.migrated && result.changes) {
      const { antes, despues } = result.changes;
      log(`    Antes: nivel1="${antes.nivel1}" nivel2="${antes.nivel2}" nivel3="${antes.nivel3}"`, 'blue');
      log(`    Después: nivel1="${despues.nivel1}" nivel2="${despues.nivel2}" nivel3="${despues.nivel3}" nivel4="${despues.nivel4}"`, 'blue');
    }

    if (!validation.valid) {
      validation.errors.forEach(err => {
        log(`    ✗ Error: ${err}`, 'red');
      });
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warn => {
        log(`    ⚠ Advertencia: ${warn}`, 'yellow');
      });
    }

    return result;
  });

  log('');

  // Generar reporte
  log('📊 Generando reporte...', 'cyan');
  const report = generateMigrationReport(results);

  // Guardar reporte (crear directorio si no existe)
  const reportDir = path.join(STORAGE_DIR, 'backups', 'migracion');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const reportPath = path.join(reportDir, 'reporte_migracion_zonas.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  // Aplicar cambios si no es dry-run
  if (!dryRun && report.errores === 0) {
    log('💾 Escribiendo cambios...', 'yellow');
    const zonasMigradas = results.map(r => r.zona);
    fs.writeFileSync(ZONAS_PATH, JSON.stringify(zonasMigradas, null, 2), 'utf8');
    log('  ✓ Archivo actualizado', 'green');
  } else if (!dryRun && report.errores > 0) {
    log('✗ NO se aplicaron cambios por errores de validación', 'red');
  }

  log('');

  // Resumen
  log('════════════════════════════════════════════════════', 'cyan');
  log('  RESUMEN DE MIGRACIÓN', 'bright');
  log('════════════════════════════════════════════════════', 'cyan');

  log(`\n✓ Zonas migradas: ${report.migradas}`, 'green');
  log(`○ Zonas no migradas: ${report.noMigradas}`, 'cyan');
  
  if (report.noMigradas > 0) {
    log('\n  Razones:', 'cyan');
    Object.entries(report.razonesNoMigracion).forEach(([reason, count]) => {
      log(`    • ${reason}: ${count}`, 'blue');
    });
  }

  if (report.errores > 0) {
    log(`\n✗ Errores de validación: ${report.errores}`, 'red');
    report.zonasConError.forEach(z => {
      log(`  • ${z.name}:`, 'yellow');
      z.errores.forEach(err => log(`    - ${err}`, 'red'));
    });
  } else {
    log('\n✓ Sin errores de validación', 'green');
  }

  if (report.advertencias > 0) {
    log(`\n⚠ Advertencias: ${report.advertencias}`, 'yellow');
  }

  log(`\n📄 Reporte completo: ${path.basename(reportPath)}`, 'blue');
  
  if (!dryRun && report.errores === 0) {
    log(`💾 Backup creado: ${path.basename(backupPath)}`, 'blue');
    log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE', 'green');
  } else if (dryRun) {
    log('\n🔍 Simulación completada. Para aplicar:', 'yellow');
    log('   node scripts/migrate-zonas.cjs --apply', 'bright');
  } else {
    log('\n✗ MIGRACIÓN ABORTADA POR ERRORES', 'red');
  }

  log('\n════════════════════════════════════════════════════\n', 'cyan');

  // Retornar código de salida
  process.exit(report.errores > 0 ? 1 : 0);
}

// Parsear argumentos
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');

main(dryRun).catch(error => {
  log(`\n✗ ERROR FATAL: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
