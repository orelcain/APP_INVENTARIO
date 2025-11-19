/**
 * FASE 3: LIMPIEZA DE CAMPOS LEGACY
 * 
 * Este script elimina campos legacy después de validar que el sistema
 * funciona correctamente con la jerarquía unificada de 7 niveles.
 * 
 * ACCIONES:
 * 1. Eliminar _jerarquiaLegacy de zonas y repuestos
 * 2. Eliminar campos antiguos de repuestos (planta, areaGeneral, etc)
 * 3. Crear backup antes de limpiar
 * 4. Validar integridad después de limpieza
 */

const fs = require('fs');
const path = require('path');

// Configuración
const STORAGE_DIR = path.join(__dirname, '../INVENTARIO_STORAGE');
const BACKUP_DIR = path.join(STORAGE_DIR, 'backups/fase3_cleanup');
const ZONAS_FILE = path.join(STORAGE_DIR, 'zonas.json');
const REPUESTOS_FILE = path.join(STORAGE_DIR, 'repuestos.json');

// Campos legacy a eliminar de repuestos
const LEGACY_FIELDS = [
  'planta',
  'areaGeneral', 
  'area',
  'subArea',
  'sistemaEquipo',
  'subSistema',
  'seccion',
  'detalle',
  'equipo',
  'sistema',
  'detalleUbicacion'
];

/**
 * Crear backup antes de limpiar
 */
function createBackup() {
  console.log('\n📦 Creando backup antes de limpieza...');
  
  // Crear directorio de backup
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  
  // Backup zonas
  if (fs.existsSync(ZONAS_FILE)) {
    const backupZonas = path.join(BACKUP_DIR, `zonas_pre_cleanup_${timestamp}.json`);
    fs.copyFileSync(ZONAS_FILE, backupZonas);
    console.log(`  ✅ Backup zonas: ${path.basename(backupZonas)}`);
  }
  
  // Backup repuestos
  if (fs.existsSync(REPUESTOS_FILE)) {
    const backupRepuestos = path.join(BACKUP_DIR, `repuestos_pre_cleanup_${timestamp}.json`);
    fs.copyFileSync(REPUESTOS_FILE, backupRepuestos);
    console.log(`  ✅ Backup repuestos: ${path.basename(backupRepuestos)}`);
  }
  
  console.log('✅ Backups creados exitosamente\n');
}

/**
 * Limpiar zona eliminando _jerarquiaLegacy
 */
function cleanZona(zona) {
  const cleaned = { ...zona };
  
  // Eliminar _jerarquiaLegacy si existe
  if (cleaned._jerarquiaLegacy) {
    delete cleaned._jerarquiaLegacy;
  }
  
  // Eliminar _migrated y _migrationDate (ya no son necesarios)
  if (cleaned._migrated) delete cleaned._migrated;
  if (cleaned._migrationDate) delete cleaned._migrationDate;
  
  return cleaned;
}

/**
 * Limpiar ubicación individual eliminando campos legacy
 */
function cleanUbicacion(ubicacion) {
  const cleaned = { ...ubicacion };
  
  // Eliminar campos legacy de ubicación
  LEGACY_FIELDS.forEach(field => {
    if (cleaned.hasOwnProperty(field)) {
      delete cleaned[field];
    }
  });
  
  // Limpiar jerarquiaPath (eliminar referencias a campos legacy)
  if (cleaned.jerarquiaPath && Array.isArray(cleaned.jerarquiaPath)) {
    cleaned.jerarquiaPath = cleaned.jerarquiaPath.filter(item => {
      // Mantener solo niveles válidos (nivel1-7)
      const validLevels = ['planta', 'nivel1', 'nivel2', 'nivel3', 'nivel4', 'nivel5', 'nivel6', 'nivel7'];
      return item.storageKey && validLevels.includes(item.storageKey);
    });
  }
  
  return cleaned;
}

/**
 * Limpiar repuesto eliminando campos legacy
 */
function cleanRepuesto(repuesto) {
  const cleaned = { ...repuesto };
  
  // Eliminar _jerarquiaLegacy
  if (cleaned._jerarquiaLegacy) {
    delete cleaned._jerarquiaLegacy;
  }
  
  // Eliminar _migrated y _migrationDate
  if (cleaned._migrated) delete cleaned._migrated;
  if (cleaned._migrationDate) delete cleaned._migrationDate;
  
  // Eliminar campos legacy del nivel superior
  LEGACY_FIELDS.forEach(field => {
    if (cleaned.hasOwnProperty(field)) {
      delete cleaned[field];
    }
  });
  
  // Limpiar cada ubicación dentro del repuesto
  if (cleaned.ubicaciones && Array.isArray(cleaned.ubicaciones)) {
    cleaned.ubicaciones = cleaned.ubicaciones.map(cleanUbicacion);
  }
  
  // Limpiar jerarquiaPath del nivel superior
  if (cleaned.jerarquiaPath && Array.isArray(cleaned.jerarquiaPath)) {
    cleaned.jerarquiaPath = cleaned.jerarquiaPath.filter(item => {
      const validLevels = ['planta', 'nivel1', 'nivel2', 'nivel3', 'nivel4', 'nivel5', 'nivel6', 'nivel7'];
      return item.storageKey && validLevels.includes(item.storageKey);
    });
  }
  
  return cleaned;
}

/**
 * Validar que la jerarquía esté presente y sea correcta
 */
function validateJerarquia(obj, tipo) {
  if (!obj.jerarquia) {
    return { valid: false, error: `${tipo} sin campo jerarquia` };
  }
  
  // Validar que tenga al menos nivel1
  if (!obj.jerarquia.nivel1) {
    return { valid: false, error: `${tipo} sin nivel1 en jerarquia` };
  }
  
  // Validar que sea la estructura correcta (7 niveles)
  const expectedLevels = ['nivel1', 'nivel2', 'nivel3', 'nivel4', 'nivel5', 'nivel6', 'nivel7'];
  const hasAllLevels = expectedLevels.every(level => obj.jerarquia.hasOwnProperty(level));
  
  if (!hasAllLevels) {
    return { valid: false, error: `${tipo} con estructura de jerarquia incompleta` };
  }
  
  return { valid: true };
}

/**
 * Limpiar zonas.json
 */
function cleanZonas(dryRun = true) {
  console.log('\n🧹 Limpiando zonas.json...');
  
  if (!fs.existsSync(ZONAS_FILE)) {
    console.log('  ⚠️  No se encontró zonas.json');
    return { total: 0, cleaned: 0, errors: [] };
  }
  
  const data = JSON.parse(fs.readFileSync(ZONAS_FILE, 'utf8'));
  const zonas = Array.isArray(data) ? data : [];
  
  let cleaned = 0;
  const errors = [];
  
  const zonasLimpias = zonas.map((zona, index) => {
    // Validar antes de limpiar
    const validation = validateJerarquia(zona, `Zona ${zona.name || index}`);
    if (!validation.valid) {
      errors.push({ index, id: zona.id, error: validation.error });
      return zona; // No limpiar si no es válido
    }
    
    const cleanedZona = cleanZona(zona);
    
    // Verificar si se hicieron cambios
    if (zona._jerarquiaLegacy || zona._migrated || zona._migrationDate) {
      cleaned++;
    }
    
    return cleanedZona;
  });
  
  console.log(`  📊 Total zonas: ${zonas.length}`);
  console.log(`  🧹 Zonas limpiadas: ${cleaned}`);
  console.log(`  ❌ Errores validación: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n  ⚠️  Errores encontrados:');
    errors.forEach(err => {
      console.log(`    - Zona ID ${err.id}: ${err.error}`);
    });
  }
  
  if (!dryRun && errors.length === 0) {
    fs.writeFileSync(ZONAS_FILE, JSON.stringify(zonasLimpias, null, 2), 'utf8');
    console.log('  ✅ zonas.json actualizado');
  }
  
  return { total: zonas.length, cleaned, errors };
}

/**
 * Limpiar repuestos.json
 */
function cleanRepuestos(dryRun = true) {
  console.log('\n🧹 Limpiando repuestos.json...');
  
  if (!fs.existsSync(REPUESTOS_FILE)) {
    console.log('  ⚠️  No se encontró repuestos.json');
    return { total: 0, cleaned: 0, errors: [] };
  }
  
  const data = JSON.parse(fs.readFileSync(REPUESTOS_FILE, 'utf8'));
  const repuestos = Array.isArray(data) ? data : (data.repuestos || []);
  
  let cleaned = 0;
  const errors = [];
  
  const repuestosLimpios = repuestos.map((repuesto, index) => {
    // Validar antes de limpiar
    const validation = validateJerarquia(repuesto, `Repuesto ${repuesto.nombre || index}`);
    if (!validation.valid) {
      errors.push({ index, codigo: repuesto.codigo, error: validation.error });
      return repuesto; // No limpiar si no es válido
    }
    
    const cleanedRepuesto = cleanRepuesto(repuesto);
    
    // Verificar si se hicieron cambios
    const hadLegacy = repuesto._jerarquiaLegacy || repuesto._migrated || 
                      LEGACY_FIELDS.some(field => repuesto.hasOwnProperty(field));
    if (hadLegacy) {
      cleaned++;
    }
    
    return cleanedRepuesto;
  });
  
  console.log(`  📊 Total repuestos: ${repuestos.length}`);
  console.log(`  🧹 Repuestos limpiados: ${cleaned}`);
  console.log(`  ❌ Errores validación: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n  ⚠️  Errores encontrados:');
    errors.forEach(err => {
      console.log(`    - Repuesto ${err.codigo}: ${err.error}`);
    });
  }
  
  if (!dryRun && errors.length === 0) {
    fs.writeFileSync(REPUESTOS_FILE, JSON.stringify(repuestosLimpios, null, 2), 'utf8');
    console.log('  ✅ repuestos.json actualizado');
  }
  
  return { total: repuestos.length, cleaned, errors };
}

/**
 * Generar reporte de limpieza
 */
function generateReport(zonasResult, repuestosResult) {
  const timestamp = new Date().toISOString();
  
  const report = {
    timestamp,
    fase: '3 - Limpieza de campos legacy',
    zonas: {
      total: zonasResult.total,
      limpiadas: zonasResult.cleaned,
      errores: zonasResult.errors.length,
      detalleErrores: zonasResult.errors
    },
    repuestos: {
      total: repuestosResult.total,
      limpiados: repuestosResult.cleaned,
      errores: repuestosResult.errors.length,
      detalleErrores: repuestosResult.errors
    },
    exito: zonasResult.errors.length === 0 && repuestosResult.errors.length === 0
  };
  
  // Guardar reporte
  const reportPath = path.join(BACKUP_DIR, `reporte_cleanup_${timestamp.split('T')[0]}.json`);
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  
  return report;
}

/**
 * Main
 */
function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  FASE 3: LIMPIEZA DE CAMPOS LEGACY                         ║');
  console.log('║  Eliminación de _jerarquiaLegacy y campos antiguos         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const dryRun = !process.argv.includes('--apply');
  
  if (dryRun) {
    console.log('\n🔍 MODO DRY-RUN (simulación)');
    console.log('   Usa --apply para ejecutar la limpieza real\n');
  } else {
    console.log('\n⚠️  MODO APLICACIÓN - Se modificarán los archivos\n');
  }
  
  // Crear backup
  if (!dryRun) {
    createBackup();
  }
  
  // Limpiar zonas
  const zonasResult = cleanZonas(dryRun);
  
  // Limpiar repuestos
  const repuestosResult = cleanRepuestos(dryRun);
  
  // Generar reporte
  const report = generateReport(zonasResult, repuestosResult);
  
  // Resumen final
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RESUMEN FINAL');
  console.log('═'.repeat(60));
  console.log(`Zonas limpiadas:    ${zonasResult.cleaned}/${zonasResult.total}`);
  console.log(`Repuestos limpiados: ${repuestosResult.cleaned}/${repuestosResult.total}`);
  console.log(`Errores totales:    ${zonasResult.errors.length + repuestosResult.errors.length}`);
  
  if (report.exito) {
    console.log('\n✅ LIMPIEZA COMPLETADA EXITOSAMENTE');
    if (!dryRun) {
      console.log(`   Backups guardados en: ${BACKUP_DIR}`);
    }
  } else {
    console.log('\n❌ LIMPIEZA COMPLETADA CON ERRORES');
    console.log('   Revisa el reporte para más detalles');
  }
  
  if (dryRun) {
    console.log('\n💡 Para aplicar los cambios ejecuta:');
    console.log('   node scripts/cleanup-legacy-fields.cjs --apply');
  }
  
  process.exit(report.exito ? 0 : 1);
}

// Ejecutar
main();
