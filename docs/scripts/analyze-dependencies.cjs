#!/usr/bin/env node
/**
 * SCRIPT DE ANÁLISIS DE DEPENDENCIAS
 * Identifica todas las funciones y código que dependen de la estructura actual de jerarquía
 * Fase 1.3 del Plan de Unificación
 * 
 * CRÍTICO: Este análisis es esencial para no romper nada durante la migración
 */

const fs = require('fs');
const path = require('path');

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

// Patrones a buscar en el código
const PATTERNS = {
  // Acceso a campos de jerarquía en zonas
  zonasJerarquia: [
    /zona\.jerarquia\.nivel[1-7]/g,
    /jerarquia\.nivel[1-7]/g,
    /\['nivel[1-7]'\]/g,
    /\.nivel[1-7]\b/g
  ],
  
  // Acceso a campos antiguos de repuestos
  repuestosCampos: [
    /repuesto\.planta\b/g,
    /repuesto\.areaGeneral\b/g,
    /repuesto\.subArea\b/g,
    /repuesto\.sistemaEquipo\b/g,
    /repuesto\.subSistema\b/g,
    /repuesto\.seccion\b/g,
    /repuesto\.detalle\b/g,
    /\.planta\b/g,
    /\.areaGeneral\b/g,
    /\.subArea\b/g,
    /\.sistemaEquipo\b/g,
    /\.subSistema\b/g
  ],
  
  // Funciones críticas de jerarquía
  funcionesJerarquia: [
    /function.*jerarquia/gi,
    /const.*jerarquia.*=/gi,
    /jerarquiaData/g,
    /jerarquiaLevelConfig/g,
    /areaJerarquiaFieldOrder/g,
    /opcionesJerarquia/g
  ],
  
  // Formularios y UI que usan jerarquía
  uiJerarquia: [
    /getElementById.*jerarquia/gi,
    /querySelector.*jerarquia/gi,
    /jerarquiaSelect/g,
    /nivel[1-7]Select/g
  ],
  
  // Event listeners relacionados
  eventos: [
    /addEventListener.*jerarquia/gi,
    /dispatchEvent.*jerarquia/gi,
    /jerarquia:.*'/g
  ]
};

function searchInFile(filepath, patterns) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    const matches = [];

    patterns.forEach(pattern => {
      lines.forEach((line, lineNum) => {
        const lineMatches = line.match(pattern);
        if (lineMatches) {
          matches.push({
            lineNumber: lineNum + 1,
            line: line.trim(),
            pattern: pattern.source || pattern.toString(),
            matches: lineMatches
          });
        }
      });
    });

    return matches;
  } catch (error) {
    return [];
  }
}

function analyzeAppJS() {
  const appJSPath = path.join(__dirname, '..', 'modules', 'app.js');
  const results = {
    archivo: 'modules/app.js',
    totalLineas: 0,
    analisis: {}
  };

  if (!fs.existsSync(appJSPath)) {
    log('⚠ No se encontró modules/app.js', 'yellow');
    return results;
  }

  const content = fs.readFileSync(appJSPath, 'utf8');
  results.totalLineas = content.split('\n').length;

  log(`\n📄 Analizando app.js (${results.totalLineas} líneas)...`, 'cyan');

  // Analizar cada categoría de patrones
  Object.entries(PATTERNS).forEach(([categoria, patterns]) => {
    const matches = searchInFile(appJSPath, patterns);
    results.analisis[categoria] = {
      totalCoincidencias: matches.length,
      coincidencias: matches
    };

    if (matches.length > 0) {
      log(`\n  ${categoria}: ${matches.length} coincidencias`, 'yellow');
      
      // Mostrar primeras 5 coincidencias como ejemplo
      matches.slice(0, 5).forEach(match => {
        log(`    Línea ${match.lineNumber}: ${match.line.substring(0, 80)}${match.line.length > 80 ? '...' : ''}`, 'blue');
      });
      
      if (matches.length > 5) {
        log(`    ... y ${matches.length - 5} más`, 'cyan');
      }
    }
  });

  return results;
}

function extractCriticalFunctions(appJSPath) {
  const content = fs.readFileSync(appJSPath, 'utf8');
  const functions = [];

  // Patrones de funciones críticas
  const criticalPatterns = [
    /function\s+(\w*[Jj]erarquia\w*)\s*\(/g,
    /(\w+)\s*:\s*function\s*\([^)]*\)\s*{[^}]*jerarquia/g,
    /const\s+(\w*[Jj]erarquia\w*)\s*=/g,
    /function\s+(\w*[Nn]ivel\w*)\s*\(/g,
    /function\s+(cargarRepuestos|guardarRepuesto|filtrar\w+)\s*\(/g,
    /function\s+(cargarZonas|guardarZona|renderArea\w+)\s*\(/g
  ];

  criticalPatterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        functions.push({
          nombre: match[1],
          tipo: 'función crítica',
          patron: pattern.source.substring(0, 50) + '...'
        });
      }
    }
  });

  return functions;
}

function analyzeEventSystem(appJSPath) {
  const content = fs.readFileSync(appJSPath, 'utf8');
  const events = {
    listeners: [],
    dispatchers: []
  };

  // Buscar addEventListener
  const listenerPattern = /addEventListener\s*\(\s*['"]([^'"]+)['"]/g;
  const listenerMatches = content.matchAll(listenerPattern);
  for (const match of listenerMatches) {
    if (match[1].includes('jerarquia') || match[1].includes('area') || match[1].includes('zona')) {
      events.listeners.push({
        evento: match[1],
        codigo: match[0]
      });
    }
  }

  // Buscar dispatchEvent
  const dispatchPattern = /dispatchEvent\s*\(\s*new\s+CustomEvent\s*\(\s*['"]([^'"]+)['"]/g;
  const dispatchMatches = content.matchAll(dispatchPattern);
  for (const match of dispatchMatches) {
    if (match[1].includes('jerarquia') || match[1].includes('area') || match[1].includes('zona')) {
      events.dispatchers.push({
        evento: match[1],
        codigo: match[0]
      });
    }
  }

  return events;
}

function analyzeUIElements(appJSPath) {
  const content = fs.readFileSync(appJSPath, 'utf8');
  const uiElements = {
    selectores: [],
    inputs: [],
    formularios: []
  };

  // Buscar getElementById con jerarquía
  const idPattern = /getElementById\s*\(\s*['"]([^'"]*[Jj]erarquia[^'"]*)['"]/g;
  const idMatches = content.matchAll(idPattern);
  for (const match of idMatches) {
    uiElements.selectores.push({
      id: match[1],
      tipo: 'getElementById'
    });
  }

  // Buscar querySelector con jerarquía
  const selectorPattern = /querySelector\w*\s*\(\s*['"]([^'"]*[Jj]erarquia[^'"]*)['"]/g;
  const selectorMatches = content.matchAll(selectorPattern);
  for (const match of selectorMatches) {
    uiElements.selectores.push({
      selector: match[1],
      tipo: 'querySelector'
    });
  }

  return uiElements;
}

function generateMigrationChecklist(analysis) {
  const checklist = {
    descripcion: 'Lista de verificación para migración segura',
    categorias: []
  };

  // Funciones que requieren actualización
  if (analysis.funcionesCriticas && analysis.funcionesCriticas.length > 0) {
    checklist.categorias.push({
      nombre: 'Funciones Críticas a Actualizar',
      prioridad: 'ALTA',
      items: analysis.funcionesCriticas.map(fn => ({
        funcion: fn.nombre,
        accion: 'Actualizar para soportar 7 niveles',
        riesgo: 'Alto - puede romper funcionalidad',
        testing: `Test unitario para ${fn.nombre}`
      }))
    });
  }

  // Eventos a mantener funcionando
  if (analysis.eventos && (analysis.eventos.listeners.length > 0 || analysis.eventos.dispatchers.length > 0)) {
    checklist.categorias.push({
      nombre: 'Sistema de Eventos',
      prioridad: 'ALTA',
      items: [
        ...analysis.eventos.listeners.map(evt => ({
          evento: evt.evento,
          tipo: 'Listener',
          accion: 'Verificar compatibilidad con nueva estructura',
          riesgo: 'Medio - puede perder sincronización'
        })),
        ...analysis.eventos.dispatchers.map(evt => ({
          evento: evt.evento,
          tipo: 'Dispatcher',
          accion: 'Actualizar payload para incluir 7 niveles',
          riesgo: 'Medio'
        }))
      ]
    });
  }

  // Elementos UI a actualizar
  if (analysis.uiElements && analysis.uiElements.selectores.length > 0) {
    checklist.categorias.push({
      nombre: 'Elementos de UI',
      prioridad: 'MEDIA',
      items: analysis.uiElements.selectores.map(ui => ({
        elemento: ui.id || ui.selector,
        tipo: ui.tipo,
        accion: 'Actualizar selectores a 7 niveles',
        riesgo: 'Bajo - principalmente visual'
      }))
    });
  }

  return checklist;
}

function generateBackwardCompatibilityPlan() {
  return {
    descripcion: 'Plan de compatibilidad hacia atrás durante la transición',
    estrategias: [
      {
        nombre: 'Lectura Dual',
        descripcion: 'Soportar lectura de formato antiguo Y nuevo simultáneamente',
        implementacion: [
          'Al cargar repuesto: if (repuesto.planta && !repuesto.jerarquia) { normalizar() }',
          'Al cargar zona: if (zona.jerarquia.nivel1 && !esNivel2Real) { migrar() }',
          'Mantener campos antiguos como deprecated temporalmente'
        ],
        duracion: '2-4 semanas después de migración',
        removible: true
      },
      {
        nombre: 'Flag de Migración',
        descripcion: 'Agregar campo _migrated: true a registros procesados',
        implementacion: [
          'Agregar _migrated al guardar en nuevo formato',
          'Verificar flag antes de re-migrar',
          'Permite rollback selectivo si es necesario'
        ],
        duracion: 'Permanente (bajo overhead)',
        removible: false
      },
      {
        nombre: 'Validación Estricta',
        descripcion: 'Validar integridad antes de guardar',
        implementacion: [
          'No permitir nivel N sin nivel N-1',
          'Verificar que nivel1 = "Empresa X"',
          'Alertar si campos antiguos + jerarquia coexisten'
        ],
        duracion: 'Permanente',
        removible: false
      },
      {
        nombre: 'Modo Debug',
        descripcion: 'Logging detallado durante migración',
        implementacion: [
          'console.log de cada transformación',
          'Guardar log de migraciones en archivo',
          'Estadísticas de éxito/fallo'
        ],
        duracion: '1-2 semanas',
        removible: true
      }
    ]
  };
}

async function main() {
  log('\n════════════════════════════════════════════════════', 'cyan');
  log('  ANÁLISIS DE DEPENDENCIAS DE CÓDIGO', 'bright');
  log('  Fase 1.3 - Identificación de Riesgos', 'bright');
  log('════════════════════════════════════════════════════\n', 'cyan');

  const appJSPath = path.join(__dirname, '..', 'modules', 'app.js');
  
  if (!fs.existsSync(appJSPath)) {
    log('✗ No se encontró modules/app.js', 'red');
    log('  Ubicación esperada:', 'yellow');
    log(`  ${appJSPath}`, 'reset');
    process.exit(1);
  }

  const analisisCompleto = {
    timestamp: new Date().toISOString(),
    fecha: new Date().toLocaleString('es-ES'),
    archivo: 'modules/app.js',
    analisis: {}
  };

  // 1. Análisis de patrones
  const patternAnalysis = analyzeAppJS();
  analisisCompleto.patrones = patternAnalysis.analisis;
  analisisCompleto.totalLineas = patternAnalysis.totalLineas;

  // 2. Extracción de funciones críticas
  log('\n🔍 Extrayendo funciones críticas...', 'yellow');
  const funcionesCriticas = extractCriticalFunctions(appJSPath);
  analisisCompleto.funcionesCriticas = funcionesCriticas;
  
  log(`  Encontradas: ${funcionesCriticas.length} funciones`, 'blue');
  funcionesCriticas.slice(0, 10).forEach(fn => {
    log(`    • ${fn.nombre}`, 'cyan');
  });
  if (funcionesCriticas.length > 10) {
    log(`    ... y ${funcionesCriticas.length - 10} más`, 'cyan');
  }

  // 3. Análisis de eventos
  log('\n🔔 Analizando sistema de eventos...', 'yellow');
  const eventos = analyzeEventSystem(appJSPath);
  analisisCompleto.eventos = eventos;
  
  log(`  Listeners relacionados: ${eventos.listeners.length}`, 'blue');
  eventos.listeners.forEach(evt => {
    log(`    • ${evt.evento}`, 'cyan');
  });
  
  log(`  Dispatchers relacionados: ${eventos.dispatchers.length}`, 'blue');
  eventos.dispatchers.forEach(evt => {
    log(`    • ${evt.evento}`, 'cyan');
  });

  // 4. Análisis de elementos UI
  log('\n🎨 Analizando elementos de UI...', 'yellow');
  const uiElements = analyzeUIElements(appJSPath);
  analisisCompleto.uiElements = uiElements;
  
  log(`  Selectores/IDs encontrados: ${uiElements.selectores.length}`, 'blue');
  uiElements.selectores.slice(0, 10).forEach(ui => {
    log(`    • ${ui.id || ui.selector} (${ui.tipo})`, 'cyan');
  });

  // 5. Generar checklist de migración
  log('\n📋 Generando checklist de migración...', 'yellow');
  const checklist = generateMigrationChecklist(analisisCompleto);
  analisisCompleto.checklistMigracion = checklist;
  log('  ✓ Checklist generado', 'green');

  // 6. Plan de compatibilidad hacia atrás
  log('\n🔄 Generando plan de compatibilidad...', 'yellow');
  const compatibilityPlan = generateBackwardCompatibilityPlan();
  analisisCompleto.planCompatibilidad = compatibilityPlan;
  log('  ✓ Plan de compatibilidad generado', 'green');

  // 7. Cálculo de riesgo
  log('\n⚠️  Evaluando nivel de riesgo...', 'yellow');
  const riskScore = {
    funcionesCriticas: funcionesCriticas.length * 10,
    eventosAfectados: (eventos.listeners.length + eventos.dispatchers.length) * 5,
    uiElements: uiElements.selectores.length * 2,
    total: 0
  };
  riskScore.total = riskScore.funcionesCriticas + riskScore.eventosAfectados + riskScore.uiElements;
  
  let riskLevel = 'BAJO';
  let riskColor = 'green';
  if (riskScore.total > 200) {
    riskLevel = 'ALTO';
    riskColor = 'red';
  } else if (riskScore.total > 100) {
    riskLevel = 'MEDIO';
    riskColor = 'yellow';
  }

  analisisCompleto.evaluacionRiesgo = {
    puntuacion: riskScore,
    nivel: riskLevel,
    recomendacion: riskLevel === 'ALTO' 
      ? 'Migración gradual con testing exhaustivo'
      : riskLevel === 'MEDIO'
      ? 'Migración con validación paso a paso'
      : 'Migración directa con validación básica'
  };

  log(`  Puntuación de riesgo: ${riskScore.total}`, riskColor);
  log(`  Nivel: ${riskLevel}`, riskColor);
  log(`  Recomendación: ${analisisCompleto.evaluacionRiesgo.recomendacion}`, riskColor);

  // Guardar análisis completo
  const outputPath = path.join(__dirname, '..', 'docs', 'DEPENDENCIAS_JERARQUIA.json');
  fs.writeFileSync(outputPath, JSON.stringify(analisisCompleto, null, 2), 'utf8');

  // Resumen final
  log('\n════════════════════════════════════════════════════', 'cyan');
  log('  RESUMEN DE ANÁLISIS DE DEPENDENCIAS', 'bright');
  log('════════════════════════════════════════════════════', 'cyan');

  log(`\n📊 ESTADÍSTICAS:`, 'cyan');
  log(`   • Líneas de código analizadas: ${analisisCompleto.totalLineas}`, 'blue');
  log(`   • Funciones críticas identificadas: ${funcionesCriticas.length}`, 'blue');
  log(`   • Eventos del sistema: ${eventos.listeners.length + eventos.dispatchers.length}`, 'blue');
  log(`   • Elementos UI afectados: ${uiElements.selectores.length}`, 'blue');

  log(`\n⚠️  EVALUACIÓN DE RIESGO:`, 'cyan');
  log(`   • Nivel: ${riskLevel}`, riskColor);
  log(`   • Puntuación: ${riskScore.total}`, riskColor);
  log(`   • Recomendación: ${analisisCompleto.evaluacionRiesgo.recomendacion}`, 'blue');

  log(`\n📋 CHECKLIST DE MIGRACIÓN:`, 'cyan');
  checklist.categorias.forEach(cat => {
    log(`   • ${cat.nombre}: ${cat.items.length} items (Prioridad: ${cat.prioridad})`, 'yellow');
  });

  log(`\n🔄 ESTRATEGIAS DE COMPATIBILIDAD:`, 'cyan');
  compatibilityPlan.estrategias.forEach(est => {
    log(`   • ${est.nombre}: ${est.descripcion}`, 'blue');
  });

  log(`\n💾 Análisis completo guardado en:`, 'green');
  log(`   ${outputPath}`, 'bright');

  log(`\n🎯 PRÓXIMOS PASOS SEGUROS:`, 'cyan');
  log('   1. ✅ Revisar DEPENDENCIAS_JERARQUIA.json en detalle', 'green');
  log('   2. ✅ Validar que el plan de compatibilidad es adecuado', 'green');
  log('   3. ✅ Preparar tests antes de cualquier cambio', 'green');
  log('   4. ⚠️  Proceder con Fase 2 solo si riesgo es aceptable', 'yellow');

  if (riskLevel === 'ALTO') {
    log(`\n⚠️  ADVERTENCIA: Riesgo ALTO detectado`, 'red');
    log('   Se recomienda revisión manual exhaustiva antes de proceder', 'red');
    log('   Considera migración gradual por módulos', 'yellow');
  }

  log('\n════════════════════════════════════════════════════\n', 'cyan');
}

main().catch(error => {
  log(`\n✗ ERROR: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
