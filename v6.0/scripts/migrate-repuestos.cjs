#!/usr/bin/env node
/**
 * FASE 2A: MIGRACIÓN DE REPUESTOS.JSON
 * Script de migración de campos antiguos a estructura unificada de 7 niveles
 * 
 * ESTRATEGIA SEGURA:
 * - Mantiene campos antiguos (planta, areaGeneral, etc.) como deprecated
 * - Agrega nuevo campo jerarquia con 7 niveles
 * - Agrega flag _migrated: true
 * - Modo dry-run por defecto
 */

const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '..', 'INVENTARIO_STORAGE');
const REPUESTOS_PATH = path.join(STORAGE_DIR, 'repuestos.json');
const BACKUP_DIR = path.join(STORAGE_DIR, 'backups', 'migracion');

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

const EMPRESA_DEFAULT = 'Aquachile Antarfood';

function createMigrationBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                    new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const backupPath = path.join(BACKUP_DIR, `repuestos_pre_migracion_${timestamp}.json`);
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const original = fs.readFileSync(REPUESTOS_PATH, 'utf8');
  fs.writeFileSync(backupPath, original, 'utf8');
  
  return backupPath;
}

function migrateRepuesto(repuesto) {
  // Si ya fue migrado, no re-migrar
  if (repuesto._migrated === true) {
    return {
      repuesto: repuesto,
      migrated: false,
      reason: 'Ya migrado anteriormente'
    };
  }

  // Si ya tiene jerarquía unificada, no migrar
  if (repuesto.jerarquia && Object.keys(repuesto.jerarquia).length >= 7) {
    return {
      repuesto: repuesto,
      migrated: false,
      reason: 'Ya tiene jerarquía unificada'
    };
  }

  // Campos antiguos a migrar
  const camposAntiguos = {
    planta: repuesto.planta || null,
    areaGeneral: repuesto.areaGeneral || repuesto.area || null,
    subArea: repuesto.subArea || null,
    sistemaEquipo: repuesto.sistemaEquipo || null,
    subSistema: repuesto.subSistema || null,
    seccion: repuesto.seccion || null,
    detalle: repuesto.detalle || null
  };

  // Verificar si tiene al menos un campo antiguo
  const tieneCamposAntiguos = Object.values(camposAntiguos).some(v => v !== null);
  
  if (!tieneCamposAntiguos) {
    return {
      repuesto: repuesto,
      migrated: false,
      reason: 'Sin campos de jerarquía'
    };
  }

  // TRANSFORMACIÓN: Mapear campos antiguos a 7 niveles
  const newJerarquia = {
    nivel1: EMPRESA_DEFAULT,                    // N1: Empresa (nuevo)
    nivel2: camposAntiguos.planta,              // N2: Áreas (antes planta)
    nivel3: camposAntiguos.areaGeneral,         // N3: Sub-áreas (antes areaGeneral)
    nivel4: camposAntiguos.subArea,             // N4: Sistema (antes subArea)
    nivel5: camposAntiguos.sistemaEquipo,       // N5: Sub-sistema (antes sistemaEquipo)
    nivel6: camposAntiguos.subSistema || camposAntiguos.seccion, // N6: Sección (antes subSistema o seccion)
    nivel7: camposAntiguos.detalle              // N7: Sub-sección (antes detalle)
  };

  // Crear repuesto migrado con AMBAS estructuras (compatibilidad dual)
  const repuestoMigrado = {
    ...repuesto,
    jerarquia: newJerarquia,                   // Nueva estructura unificada
    _jerarquiaLegacy: camposAntiguos,          // Campos antiguos preservados
    _migrated: true,
    _migrationDate: new Date().toISOString()
  };

  return {
    repuesto: repuestoMigrado,
    migrated: true,
    changes: {
      antes: camposAntiguos,
      despues: newJerarquia
    }
  };
}

function validateMigratedRepuesto(result) {
  const errors = [];
  const warnings = [];

  if (!result.migrated) {
    return { valid: true, errors, warnings };
  }

  const repuesto = result.repuesto;
  const jerarquia = repuesto.jerarquia;

  // Validación 1: nivel1 debe ser la empresa
  if (jerarquia.nivel1 !== EMPRESA_DEFAULT) {
    errors.push(`nivel1 no es "${EMPRESA_DEFAULT}"`);
  }

  // Validación 2: Debe tener flag _migrated
  if (repuesto._migrated !== true) {
    errors.push('Falta flag _migrated');
  }

  // Validación 3: Debe tener _jerarquiaLegacy
  if (!repuesto._jerarquiaLegacy) {
    warnings.push('Falta _jerarquiaLegacy (compatibilidad)');
  }

  // Validación 4: Verificar que los valores se mapearon correctamente
  if (result.changes) {
    const { antes, despues } = result.changes;
    
    if (antes.planta && antes.planta !== despues.nivel2) {
      errors.push('planta no se mapeó correctamente a nivel2');
    }
    if (antes.areaGeneral && antes.areaGeneral !== despues.nivel3) {
      errors.push('areaGeneral no se mapeó correctamente a nivel3');
    }
    if (antes.subArea && antes.subArea !== despues.nivel4) {
      errors.push('subArea no se mapeó correctamente a nivel4');
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
    totalRepuestos: results.length,
    migrados: 0,
    noMigrados: 0,
    errores: 0,
    advertencias: 0,
    razonesNoMigracion: {},
    repuestosConError: [],
    detalles: []
  };

  results.forEach((result, index) => {
    const validation = validateMigratedRepuesto(result);

    if (result.migrated) {
      report.migrados++;
    } else {
      report.noMigrados++;
      const reason = result.reason || 'Desconocida';
      report.razonesNoMigracion[reason] = (report.razonesNoMigracion[reason] || 0) + 1;
    }

    if (!validation.valid) {
      report.errores++;
      report.repuestosConError.push({
        index,
        codigo: result.repuesto.codigo || 'Sin código',
        nombre: result.repuesto.nombre || 'Sin nombre',
        errores: validation.errors
      });
    }

    if (validation.warnings.length > 0) {
      report.advertencias += validation.warnings.length;
    }

    report.detalles.push({
      codigo: result.repuesto.codigo || 'Sin código',
      nombre: result.repuesto.nombre || 'Sin nombre',
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
  log('  FASE 2A: MIGRACIÓN DE REPUESTOS.JSON', 'bright');
  log('  Campos antiguos → Jerarquía unificada 7 niveles', 'bright');
  log('════════════════════════════════════════════════════\n', 'cyan');

  if (dryRun) {
    log('🔍 MODO DRY-RUN: Simulación sin escribir archivos', 'yellow');
    log('   (para aplicar cambios, ejecuta: node migrate-repuestos.cjs --apply)\n', 'yellow');
  } else {
    log('⚠️  MODO APLICACIÓN: Se escribirán cambios reales', 'red');
    log('   Creando backup de seguridad...\n', 'yellow');
  }

  // Leer repuestos.json
  log('📖 Leyendo repuestos.json...', 'cyan');
  let data;
  try {
    const content = fs.readFileSync(REPUESTOS_PATH, 'utf8');
    data = JSON.parse(content);
  } catch (error) {
    log(`✗ Error leyendo repuestos.json: ${error.message}`, 'red');
    process.exit(1);
  }

  // Extraer array de repuestos (puede estar en data.repuestos si es backup)
  let repuestos = Array.isArray(data) ? data : (data.repuestos || []);
  
  if (!Array.isArray(repuestos)) {
    log('✗ No se pudo extraer array de repuestos', 'red');
    process.exit(1);
  }

  log(`  Total de repuestos: ${repuestos.length}`, 'blue');
  log('');

  // Crear backup si no es dry-run
  let backupPath;
  if (!dryRun) {
    log('💾 Creando backup...', 'yellow');
    backupPath = createMigrationBackup();
    log(`  ✓ Backup: ${path.basename(backupPath)}`, 'green');
    log('');
  }

  // Migrar cada repuesto
  log('🔄 Procesando repuestos...', 'cyan');
  const results = repuestos.map((repuesto, index) => {
    const result = migrateRepuesto(repuesto);
    const validation = validateMigratedRepuesto(result);

    if ((index + 1) % 10 === 0 || index === 0 || index === repuestos.length - 1) {
      const status = result.migrated 
        ? (validation.valid ? '✓' : '⚠')
        : '○';
      const color = result.migrated
        ? (validation.valid ? 'green' : 'yellow')
        : 'cyan';

      log(`  ${status} Repuesto ${index + 1}/${repuestos.length}: ${repuesto.codigo || 'Sin código'}`, color);

      if (result.migrated && result.changes && (index < 3 || index === repuestos.length - 1)) {
        const { antes, despues } = result.changes;
        log(`    Antes: planta="${antes.planta}" area="${antes.areaGeneral}" subArea="${antes.subArea}"`, 'blue');
        log(`    Después: nivel1="${despues.nivel1}" nivel2="${despues.nivel2}" nivel3="${despues.nivel3}" nivel4="${despues.nivel4}"`, 'blue');
      }
    }

    return result;
  });

  log('');

  // Generar reporte
  log('📊 Generando reporte...', 'cyan');
  const report = generateMigrationReport(results);

  // Guardar reporte
  const reportDir = path.join(STORAGE_DIR, 'backups', 'migracion');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const reportPath = path.join(reportDir, 'reporte_migracion_repuestos.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  // Aplicar cambios si no es dry-run
  if (!dryRun && report.errores === 0) {
    log('💾 Escribiendo cambios...', 'yellow');
    const repuestosMigrados = results.map(r => r.repuesto);
    
    // Mantener estructura original del archivo
    const outputData = Array.isArray(data) ? repuestosMigrados : { ...data, repuestos: repuestosMigrados };
    
    fs.writeFileSync(REPUESTOS_PATH, JSON.stringify(outputData, null, 2), 'utf8');
    log('  ✓ Archivo actualizado', 'green');
  } else if (!dryRun && report.errores > 0) {
    log('✗ NO se aplicaron cambios por errores de validación', 'red');
  }

  log('');

  // Resumen
  log('════════════════════════════════════════════════════', 'cyan');
  log('  RESUMEN DE MIGRACIÓN', 'bright');
  log('════════════════════════════════════════════════════', 'cyan');

  log(`\n✓ Repuestos migrados: ${report.migrados}`, 'green');
  log(`○ Repuestos no migrados: ${report.noMigrados}`, 'cyan');
  
  if (report.noMigrados > 0) {
    log('\n  Razones:', 'cyan');
    Object.entries(report.razonesNoMigracion).forEach(([reason, count]) => {
      log(`    • ${reason}: ${count}`, 'blue');
    });
  }

  if (report.errores > 0) {
    log(`\n✗ Errores de validación: ${report.errores}`, 'red');
    report.repuestosConError.slice(0, 5).forEach(r => {
      log(`  • ${r.codigo}:`, 'yellow');
      r.errores.forEach(err => log(`    - ${err}`, 'red'));
    });
    if (report.repuestosConError.length > 5) {
      log(`  ... y ${report.repuestosConError.length - 5} más`, 'red');
    }
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
    log('   node scripts/migrate-repuestos.cjs --apply', 'bright');
  } else {
    log('\n✗ MIGRACIÓN ABORTADA POR ERRORES', 'red');
  }

  log('\n════════════════════════════════════════════════════\n', 'cyan');

  process.exit(report.errores > 0 ? 1 : 0);
}

const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');

main(dryRun).catch(error => {
  log(`\n✗ ERROR FATAL: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
