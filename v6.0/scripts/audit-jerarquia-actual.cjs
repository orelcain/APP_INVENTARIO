#!/usr/bin/env node
/**
 * SCRIPT DE AUDITORÍA DE JERARQUÍA ACTUAL
 * Analiza la estructura de jerarquías en todos los archivos JSON
 * Fase 1.2 del Plan de Unificación
 */

const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '..', 'INVENTARIO_STORAGE');

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

function readJSON(filename) {
  try {
    const filepath = path.join(STORAGE_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(content);
    
    // Si repuestos.json tiene estructura de backup, extraer array
    if (filename === 'repuestos.json' && data.repuestos && Array.isArray(data.repuestos)) {
      return data.repuestos;
    }
    
    return data;
  } catch (error) {
    log(`⚠ Error leyendo ${filename}: ${error.message}`, 'yellow');
    return null;
  }
}

function analyzeZonasJerarquia(zonas) {
  const analysis = {
    totalZonas: zonas.length,
    conJerarquia: 0,
    sinJerarquia: 0,
    nivelesEncontrados: new Set(),
    valoresPorNivel: {},
    zonasIncompletas: [],
    zonasConNull: [],
    mapasPorZona: new Map()
  };

  // Inicializar contadores de nivel
  for (let i = 1; i <= 7; i++) {
    analysis.valoresPorNivel[`nivel${i}`] = new Set();
  }

  zonas.forEach(zona => {
    if (!zona.jerarquia || Object.keys(zona.jerarquia).length === 0) {
      analysis.sinJerarquia++;
      return;
    }

    analysis.conJerarquia++;

    // Analizar cada nivel
    for (let i = 1; i <= 7; i++) {
      const nivelKey = `nivel${i}`;
      const valor = zona.jerarquia[nivelKey];

      if (valor !== undefined && valor !== null) {
        analysis.nivelesEncontrados.add(nivelKey);
        analysis.valoresPorNivel[nivelKey].add(valor);
      } else if (valor === null) {
        analysis.zonasConNull.push({
          id: zona.id,
          name: zona.name,
          nivel: nivelKey
        });
      }
    }

    // Detectar jerarquías incompletas (nivel N sin nivel N-1)
    const niveles = ['nivel1', 'nivel2', 'nivel3', 'nivel4', 'nivel5', 'nivel6', 'nivel7'];
    for (let i = 1; i < niveles.length; i++) {
      const nivelActual = niveles[i];
      const nivelAnterior = niveles[i - 1];

      if (zona.jerarquia[nivelActual] && !zona.jerarquia[nivelAnterior]) {
        analysis.zonasIncompletas.push({
          id: zona.id,
          name: zona.name,
          problema: `Tiene ${nivelActual} pero no ${nivelAnterior}`,
          jerarquia: zona.jerarquia
        });
      }
    }

    // Mapear zonas por mapId
    if (zona.mapId) {
      if (!analysis.mapasPorZona.has(zona.mapId)) {
        analysis.mapasPorZona.set(zona.mapId, []);
      }
      analysis.mapasPorZona.get(zona.mapId).push({
        id: zona.id,
        name: zona.name,
        jerarquia: zona.jerarquia
      });
    }
  });

  // Convertir Sets a Arrays para serialización
  analysis.nivelesEncontrados = Array.from(analysis.nivelesEncontrados).sort();
  Object.keys(analysis.valoresPorNivel).forEach(nivel => {
    analysis.valoresPorNivel[nivel] = Array.from(analysis.valoresPorNivel[nivel]).sort();
  });
  analysis.mapasPorZona = Object.fromEntries(analysis.mapasPorZona);

  return analysis;
}

function analyzeRepuestosJerarquia(repuestos) {
  const analysis = {
    totalRepuestos: repuestos.length,
    conCamposAntiguos: 0,
    conJerarquiaUnificada: 0,
    sinJerarquia: 0,
    camposAntiguosEncontrados: {},
    valoresUnicos: {}
  };

  const camposAntiguos = ['planta', 'areaGeneral', 'subArea', 'sistemaEquipo', 'subSistema', 'seccion', 'detalle'];
  
  camposAntiguos.forEach(campo => {
    analysis.camposAntiguosEncontrados[campo] = new Set();
  });

  repuestos.forEach(repuesto => {
    let tieneCampoAntiguo = false;
    let tieneJerarquia = false;

    // Verificar campos antiguos
    camposAntiguos.forEach(campo => {
      if (repuesto[campo]) {
        tieneCampoAntiguo = true;
        analysis.camposAntiguosEncontrados[campo].add(repuesto[campo]);
      }
    });

    // Verificar jerarquía unificada
    if (repuesto.jerarquia && Object.keys(repuesto.jerarquia).length > 0) {
      tieneJerarquia = true;
      analysis.conJerarquiaUnificada++;
    }

    if (tieneCampoAntiguo) {
      analysis.conCamposAntiguos++;
    }

    if (!tieneCampoAntiguo && !tieneJerarquia) {
      analysis.sinJerarquia++;
    }
  });

  // Convertir Sets a Arrays
  Object.keys(analysis.camposAntiguosEncontrados).forEach(campo => {
    analysis.valoresUnicos[campo] = Array.from(analysis.camposAntiguosEncontrados[campo]).sort();
    analysis.camposAntiguosEncontrados[campo] = analysis.camposAntiguosEncontrados[campo].size;
  });

  return analysis;
}

function analyzeMapas(mapas) {
  const analysis = {
    totalMapas: mapas.length,
    mapasConJerarquia: 0,
    mapasSinJerarquia: 0,
    mapasPorId: {}
  };

  mapas.forEach(mapa => {
    const info = {
      id: mapa.id,
      name: mapa.name || 'Sin nombre',
      imageUrl: mapa.imageUrl || null,
      jerarquiaPath: mapa.jerarquiaPath || null,
      width: mapa.width,
      height: mapa.height
    };

    if (mapa.jerarquiaPath && mapa.jerarquiaPath.length > 0) {
      analysis.mapasConJerarquia++;
    } else {
      analysis.mapasSinJerarquia++;
    }

    analysis.mapasPorId[mapa.id] = info;
  });

  return analysis;
}

function generateMigrationMapping(zonasAnalysis, repuestosAnalysis) {
  const mapping = {
    descripcion: 'Mapeo para migración de 5 niveles a 7 niveles',
    transformaciones: {
      zonas: {
        'nivel1': '→ nivel2 (Planta Principal → Áreas)',
        'nivel2': '→ nivel3 (Eviscerado/Filete → Sub-áreas)',
        'nivel3': '→ nivel4 (Grader/Marel → Sistemas)',
        'nivel4': '→ nivel5 (Cintas → Sub-sistemas)',
        'nivel5': '→ nivel6 (Componentes → Secciones)',
        'NUEVO nivel1': 'Empresa (valor por defecto)',
        'NUEVO nivel7': 'null (opcional)'
      },
      repuestos: {
        'planta': '→ jerarquia.nivel2',
        'areaGeneral': '→ jerarquia.nivel3',
        'subArea': '→ jerarquia.nivel4',
        'sistemaEquipo': '→ jerarquia.nivel5',
        'subSistema': '→ jerarquia.nivel6',
        'seccion': '→ jerarquia.nivel6 o nivel7 (evaluar)',
        'detalle': '→ jerarquia.nivel7',
        'NUEVO nivel1': '→ jerarquia.nivel1 = "Empresa X"'
      }
    },
    valoresEjemplo: {
      antes: {
        zona: {
          nivel1: 'Planta Principal',
          nivel2: 'Eviscerado',
          nivel3: 'Grader',
          nivel4: 'Pocket 1 al 4',
          nivel5: 'Sistema Neumático'
        },
        repuesto: {
          planta: 'Planta Principal',
          areaGeneral: 'Eviscerado',
          subArea: 'Grader',
          sistemaEquipo: 'Pocket 1 al 4',
          subSistema: 'Sistema Neumático'
        }
      },
      despues: {
        zona: {
          nivel1: 'Empresa X',
          nivel2: 'Planta Principal',
          nivel3: 'Eviscerado',
          nivel4: 'Grader',
          nivel5: 'Pocket 1 al 4',
          nivel6: 'Sistema Neumático',
          nivel7: null
        },
        repuesto: {
          jerarquia: {
            nivel1: 'Empresa X',
            nivel2: 'Planta Principal',
            nivel3: 'Eviscerado',
            nivel4: 'Grader',
            nivel5: 'Pocket 1 al 4',
            nivel6: 'Sistema Neumático',
            nivel7: null
          }
        }
      }
    },
    valorPorDefecto: {
      nivel1: 'Empresa X',
      razon: 'Se agregará como raíz a todas las jerarquías existentes'
    }
  };

  return mapping;
}

async function main() {
  log('\n════════════════════════════════════════════════════', 'cyan');
  log('  AUDITORÍA DE JERARQUÍA ACTUAL', 'bright');
  log('  Fase 1.2 - Análisis de Estructura', 'bright');
  log('════════════════════════════════════════════════════\n', 'cyan');

  const auditoria = {
    timestamp: new Date().toISOString(),
    fecha: new Date().toLocaleString('es-ES'),
    archivosAnalizados: []
  };

  // ========== ANALIZAR ZONAS.JSON ==========
  log('📋 Analizando zonas.json...', 'yellow');
  const zonas = readJSON('zonas.json');
  
  if (zonas) {
    const zonasAnalysis = analyzeZonasJerarquia(zonas);
    auditoria.zonas = zonasAnalysis;
    auditoria.archivosAnalizados.push('zonas.json');

    log(`  Total zonas: ${zonasAnalysis.totalZonas}`, 'blue');
    log(`  Con jerarquía: ${zonasAnalysis.conJerarquia}`, 'green');
    log(`  Sin jerarquía: ${zonasAnalysis.sinJerarquia}`, zonasAnalysis.sinJerarquia > 0 ? 'yellow' : 'green');
    log(`  Niveles encontrados: ${zonasAnalysis.nivelesEncontrados.join(', ')}`, 'cyan');

    log('\n  Valores únicos por nivel:', 'cyan');
    zonasAnalysis.nivelesEncontrados.forEach(nivel => {
      const valores = zonasAnalysis.valoresPorNivel[nivel];
      log(`    ${nivel}: ${valores.length} valores únicos`, 'blue');
      valores.forEach(valor => {
        log(`      - ${valor}`, 'reset');
      });
    });

    if (zonasAnalysis.zonasIncompletas.length > 0) {
      log(`\n  ⚠ Zonas con jerarquía incompleta: ${zonasAnalysis.zonasIncompletas.length}`, 'yellow');
      zonasAnalysis.zonasIncompletas.forEach(z => {
        log(`    - ${z.name}: ${z.problema}`, 'yellow');
      });
    }

    if (zonasAnalysis.zonasConNull.length > 0) {
      log(`\n  ⚠ Zonas con valores null: ${zonasAnalysis.zonasConNull.length}`, 'yellow');
    }

    log(`\n  Mapas con zonas: ${Object.keys(zonasAnalysis.mapasPorZona).length}`, 'magenta');
  }

  log('\n');

  // ========== ANALIZAR REPUESTOS.JSON ==========
  log('📋 Analizando repuestos.json...', 'yellow');
  const repuestos = readJSON('repuestos.json');
  
  if (repuestos) {
    const repuestosAnalysis = analyzeRepuestosJerarquia(repuestos);
    auditoria.repuestos = repuestosAnalysis;
    auditoria.archivosAnalizados.push('repuestos.json');

    log(`  Total repuestos: ${repuestosAnalysis.totalRepuestos}`, 'blue');
    log(`  Con campos antiguos: ${repuestosAnalysis.conCamposAntiguos}`, 'yellow');
    log(`  Con jerarquía unificada: ${repuestosAnalysis.conJerarquiaUnificada}`, repuestosAnalysis.conJerarquiaUnificada > 0 ? 'green' : 'red');
    log(`  Sin jerarquía: ${repuestosAnalysis.sinJerarquia}`, repuestosAnalysis.sinJerarquia > 0 ? 'yellow' : 'green');

    log('\n  Campos antiguos encontrados:', 'cyan');
    Object.entries(repuestosAnalysis.camposAntiguosEncontrados).forEach(([campo, count]) => {
      if (count > 0) {
        log(`    ${campo}: ${count} valores únicos`, 'blue');
        const valores = repuestosAnalysis.valoresUnicos[campo];
        if (valores && valores.length <= 10) {
          valores.forEach(valor => {
            log(`      - ${valor}`, 'reset');
          });
        } else if (valores && valores.length > 10) {
          log(`      (${valores.length} valores - listado completo en JSON)`, 'reset');
        }
      }
    });
  }

  log('\n');

  // ========== ANALIZAR MAPAS.JSON ==========
  log('📋 Analizando mapas.json...', 'yellow');
  const mapas = readJSON('mapas.json');
  
  if (mapas) {
    const mapasAnalysis = analyzeMapas(mapas);
    auditoria.mapas = mapasAnalysis;
    auditoria.archivosAnalizados.push('mapas.json');

    log(`  Total mapas: ${mapasAnalysis.totalMapas}`, 'blue');
    log(`  Con jerarquía asignada: ${mapasAnalysis.mapasConJerarquia}`, 'green');
    log(`  Sin jerarquía: ${mapasAnalysis.mapasSinJerarquia}`, mapasAnalysis.mapasSinJerarquia > 0 ? 'yellow' : 'green');

    log('\n  Lista de mapas:', 'cyan');
    Object.values(mapasAnalysis.mapasPorId).forEach(mapa => {
      log(`    • ${mapa.name} (ID: ${mapa.id})`, 'blue');
      if (mapa.jerarquiaPath && mapa.jerarquiaPath.length > 0) {
        log(`      Path: ${mapa.jerarquiaPath.join(' > ')}`, 'green');
      } else {
        log(`      Sin jerarquía asignada`, 'yellow');
      }
    });
  }

  log('\n');

  // ========== GENERAR MAPEO DE MIGRACIÓN ==========
  log('🗺️  Generando mapeo de migración...', 'yellow');
  const mapping = generateMigrationMapping(auditoria.zonas, auditoria.repuestos);
  auditoria.mapeoMigracion = mapping;
  log('  ✓ Mapeo generado', 'green');

  // ========== GUARDAR AUDITORÍA ==========
  const outputPath = path.join(__dirname, '..', 'docs', 'AUDITORIA_JERARQUIA_ACTUAL.json');
  fs.writeFileSync(outputPath, JSON.stringify(auditoria, null, 2), 'utf8');

  log('\n════════════════════════════════════════════════════', 'cyan');
  log('  RESUMEN DE AUDITORÍA', 'bright');
  log('════════════════════════════════════════════════════', 'cyan');

  if (auditoria.zonas) {
    log(`\n📊 ZONAS:`, 'cyan');
    log(`   • ${auditoria.zonas.totalZonas} zonas totales`, 'blue');
    log(`   • ${auditoria.zonas.nivelesEncontrados.length} niveles en uso (de 5 posibles)`, 'blue');
    log(`   • ${auditoria.zonas.conJerarquia} con jerarquía completa`, 'green');
    if (auditoria.zonas.zonasIncompletas.length > 0) {
      log(`   ⚠ ${auditoria.zonas.zonasIncompletas.length} con jerarquía incompleta`, 'yellow');
    }
  }

  if (auditoria.repuestos) {
    log(`\n📊 REPUESTOS:`, 'cyan');
    log(`   • ${auditoria.repuestos.totalRepuestos} repuestos totales`, 'blue');
    log(`   • ${auditoria.repuestos.conCamposAntiguos} usando campos antiguos`, 'yellow');
    log(`   • ${auditoria.repuestos.conJerarquiaUnificada} con jerarquía unificada`, auditoria.repuestos.conJerarquiaUnificada > 0 ? 'green' : 'red');
  }

  if (auditoria.mapas) {
    log(`\n📊 MAPAS:`, 'cyan');
    log(`   • ${auditoria.mapas.totalMapas} mapas totales`, 'blue');
    log(`   • ${auditoria.mapas.mapasConJerarquia} con jerarquía asignada`, 'green');
  }

  log(`\n💾 Auditoría guardada en:`, 'green');
  log(`   ${outputPath}`, 'bright');

  log('\n🎯 PRÓXIMOS PASOS:', 'cyan');
  log('   1. Revisar AUDITORIA_JERARQUIA_ACTUAL.json', 'blue');
  log('   2. Validar mapeo de migración propuesto', 'blue');
  log('   3. Proceder con Fase 1.3 - Análisis de dependencias', 'blue');

  log('\n════════════════════════════════════════════════════\n', 'cyan');
}

main().catch(error => {
  log(`\n✗ ERROR: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
