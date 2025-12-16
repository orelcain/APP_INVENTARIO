const fs = require('fs');
const path = require('path');

/**
 * Script para unir los 11 documentos SPARK en uno solo
 * Uso: node merge-spark-docs.cjs
 */

// Configuración
const DOCS_DIR = path.join(__dirname, '.');
const OUTPUT_FILE = path.join(DOCS_DIR, 'SPARK_COMPLETO.md');

// Lista de documentos en orden
const SPARK_DOCS = [
  'SPARK_00_INDEX.md',
  'SPARK_01_GUIA_RAPIDA.md',
  'SPARK_02_MODELOS_DATOS.md',
  'SPARK_03_INVENTARIO.md',
  'SPARK_04_JERARQUIA.md',
  'SPARK_05_MAPAS.md',
  'SPARK_06_FLUJO_V601.md',
  'SPARK_07_FUNCIONES_TOP30.md',
  'SPARK_08_COMPONENTES_UI.md',
  'SPARK_09_SCRIPTS_HERRAMIENTAS.md',
  'SPARK_10_CLOUDINARY_DEPLOYMENT.md'
];

// Separador entre documentos
const SEPARATOR = '\n\n' + '='.repeat(100) + '\n\n';

console.log('🔄 Iniciando fusión de documentos SPARK...\n');

try {
  let mergedContent = '';
  let totalLines = 0;
  let processedDocs = 0;

  // Header del documento fusionado
  mergedContent += `# 📚 DOCUMENTACIÓN COMPLETA - APP INVENTARIO v6.0.1

**Fecha:** ${new Date().toLocaleDateString('es-ES', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

**Propósito:** Documentación unificada para GitHub Copilot Spark

**Documentos incluidos:** ${SPARK_DOCS.length}

---

`;

  // Procesar cada documento
  SPARK_DOCS.forEach((docName, index) => {
    const docPath = path.join(DOCS_DIR, docName);

    if (!fs.existsSync(docPath)) {
      console.warn(`⚠️  Advertencia: ${docName} no encontrado, omitiendo...`);
      return;
    }

    console.log(`📄 Procesando [${index + 1}/${SPARK_DOCS.length}]: ${docName}`);

    // Leer contenido del documento
    const content = fs.readFileSync(docPath, 'utf-8');
    const lines = content.split('\n').length;
    totalLines += lines;

    // Agregar header del documento
    mergedContent += `${'#'.repeat(80)}\n`;
    mergedContent += `# DOCUMENTO ${index}: ${docName}\n`;
    mergedContent += `# Líneas: ${lines}\n`;
    mergedContent += `${'#'.repeat(80)}\n\n`;

    // Agregar contenido
    mergedContent += content;

    // Agregar separador (excepto en el último)
    if (index < SPARK_DOCS.length - 1) {
      mergedContent += SEPARATOR;
    }

    processedDocs++;
  });

  // Footer del documento fusionado
  mergedContent += `\n\n${'='.repeat(100)}\n\n`;
  mergedContent += `## 📊 ESTADÍSTICAS FINALES\n\n`;
  mergedContent += `- **Documentos fusionados:** ${processedDocs}/${SPARK_DOCS.length}\n`;
  mergedContent += `- **Líneas totales:** ~${totalLines.toLocaleString()}\n`;
  mergedContent += `- **Tamaño:** ${(mergedContent.length / 1024).toFixed(2)} KB\n`;
  mergedContent += `- **Fecha de generación:** ${new Date().toLocaleString('es-ES')}\n\n`;
  mergedContent += `---\n\n`;
  mergedContent += `**✅ Documento generado automáticamente por merge-spark-docs.cjs**\n`;

  // Escribir archivo fusionado
  fs.writeFileSync(OUTPUT_FILE, mergedContent, 'utf-8');

  console.log('\n✅ ¡Fusión completada exitosamente!');
  console.log(`\n📊 Estadísticas:`);
  console.log(`   - Documentos procesados: ${processedDocs}/${SPARK_DOCS.length}`);
  console.log(`   - Líneas totales: ~${totalLines.toLocaleString()}`);
  console.log(`   - Tamaño final: ${(mergedContent.length / 1024).toFixed(2)} KB`);
  console.log(`\n📁 Archivo generado:`);
  console.log(`   ${OUTPUT_FILE}`);
  console.log(`\n💡 Puedes copiar el contenido de SPARK_COMPLETO.md y pegarlo en Spark`);

} catch (error) {
  console.error('\n❌ Error al fusionar documentos:', error.message);
  process.exit(1);
}
