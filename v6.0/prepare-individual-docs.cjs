const fs = require('fs');
const path = require('path');

/**
 * Script para crear archivos individuales listos para Spark (1 doc = 1 archivo)
 * Uso: node prepare-individual-docs.cjs
 */

const DOCS_DIR = path.join(__dirname, '.');
const OUTPUT_DIR = path.join(DOCS_DIR, 'SPARK_INDIVIDUAL');

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

console.log('🔄 Preparando documentos individuales para Spark...\n');

try {
  // Crear directorio de salida
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Crear archivo de instrucciones
  let instructions = `# 📋 INSTRUCCIONES PARA SPARK (11 MENSAJES)

**Fecha:** ${new Date().toLocaleDateString('es-ES')}

---

## 🚀 PROCESO PASO A PASO:

Envía **11 mensajes** a Spark en este orden:

`;

  // Procesar cada documento
  SPARK_DOCS.forEach((docName, index) => {
    const docPath = path.join(DOCS_DIR, docName);
    
    if (!fs.existsSync(docPath)) {
      console.warn(`⚠️  ${docName} no encontrado, omitiendo...`);
      return;
    }

    const content = fs.readFileSync(docPath, 'utf-8');
    const sizeKB = (content.length / 1024).toFixed(1);
    const lines = content.split('\n').length;

    // Crear archivo individual con header y footer
    const isFirst = index === 0;
    const isLast = index === SPARK_DOCS.length - 1;
    
    let wrappedContent = `# 📄 DOCUMENTO ${index + 1}/11: ${docName}\n\n`;
    wrappedContent += `**Tamaño:** ${sizeKB} KB | **Líneas:** ${lines}\n`;
    wrappedContent += `**Posición:** ${index + 1} de ${SPARK_DOCS.length}\n\n`;
    
    if (isFirst) {
      wrappedContent += `🏠 **PRIMER DOCUMENTO** - Lee y espera los siguientes 10\n\n`;
    } else if (isLast) {
      wrappedContent += `🏁 **ÚLTIMO DOCUMENTO** - Ahora tienes toda la documentación\n\n`;
    } else {
      wrappedContent += `⏩ **DOCUMENTO INTERMEDIO** - Continúa leyendo...\n\n`;
    }
    
    wrappedContent += `---\n\n`;
    wrappedContent += content;
    wrappedContent += `\n\n${'='.repeat(80)}\n\n`;
    
    if (!isLast) {
      wrappedContent += `## ⏭️ SIGUIENTE: ${SPARK_DOCS[index + 1]}\n\n`;
    } else {
      wrappedContent += `## ✅ DOCUMENTACIÓN COMPLETA\n\n`;
      wrappedContent += `**Ahora puedes crear la aplicación siguiendo los 11 documentos**\n`;
    }

    // Guardar archivo individual
    const outputPath = path.join(OUTPUT_DIR, docName);
    fs.writeFileSync(outputPath, wrappedContent, 'utf-8');
    
    console.log(`✅ ${index + 1}. ${docName} (${sizeKB} KB)`);

    // Agregar a instrucciones
    instructions += `\n### MENSAJE ${index + 1}/11:\n\n`;
    instructions += '```\n';
    instructions += `[PEGA CONTENIDO DE: SPARK_INDIVIDUAL/${docName}]\n\n`;
    instructions += `---\n\n`;
    
    if (isFirst) {
      instructions += `He pegado el documento 1/11: ${docName}\n`;
      instructions += `Incluye: Índice maestro con navegación completa\n\n`;
      instructions += `Lee todo y espera el documento 2/11.\n`;
    } else if (isLast) {
      instructions += `He pegado el documento 11/11: ${docName}\n`;
      instructions += `Incluye: Cloudinary + deployment\n\n`;
      instructions += `Ahora tienes TODA LA DOCUMENTACIÓN (11 documentos).\n\n`;
      instructions += `Crea la aplicación web completa siguiendo AL PIE DE LA LETRA todas las especificaciones:\n`;
      instructions += `✅ 3 tabs sincronizados (Inventario, Jerarquía 8 niveles, Mapas canvas)\n`;
      instructions += `✅ Wizard de 7 pasos + Cloudinary para imágenes\n`;
      instructions += `✅ Flujo guiado: Crear → Ubicar → Marcar\n`;
      instructions += `✅ Todas las funciones críticas implementadas\n`;
      instructions += `✅ 100% funcional y listo para deployar\n\n`;
      instructions += `¡Hazlo ahora!\n`;
    } else {
      instructions += `He pegado el documento ${index + 1}/11: ${docName}\n`;
      const topics = {
        1: 'Arquitectura y overview',
        2: 'Modelos de datos',
        3: 'Tab Inventario',
        4: 'Tab Jerarquía',
        5: 'Tab Mapas',
        6: 'Flujo guiado v6.0.1',
        7: 'Funciones críticas',
        8: 'Componentes UI',
        9: 'Scripts y herramientas'
      };
      instructions += `Incluye: ${topics[index] || 'Documentación'}\n\n`;
      instructions += `Lee todo y espera el documento ${index + 2}/11.\n`;
    }
    
    instructions += '```\n';
  });

  // Agregar resumen final
  instructions += `\n---\n\n## 📊 RESUMEN\n\n`;
  instructions += `- **Total documentos:** 11\n`;
  instructions += `- **Total mensajes a enviar:** 11\n`;
  instructions += `- **Ubicación:** ${OUTPUT_DIR}\n`;
  instructions += `- **Proceso:** Copia cada archivo en orden, pega en Spark con el prompt indicado\n\n`;
  instructions += `## 💡 TIPS\n\n`;
  instructions += `- ✅ Envía los documentos EN ORDEN (SPARK_00 → SPARK_10)\n`;
  instructions += `- ✅ Espera confirmación de Spark antes de enviar el siguiente\n`;
  instructions += `- ✅ En el mensaje 11/11, pide a Spark que cree la app completa\n`;
  instructions += `- ✅ Cada documento es independiente (~10-30 KB), no deberían dar error\n\n`;

  // Guardar archivo de instrucciones
  const instructionsPath = path.join(OUTPUT_DIR, '00_INSTRUCCIONES.md');
  fs.writeFileSync(instructionsPath, instructions, 'utf-8');

  console.log('\n✅ ¡Preparación completada!');
  console.log(`\n📁 Archivos generados en: ${OUTPUT_DIR}`);
  console.log(`\n📋 Lee el archivo: 00_INSTRUCCIONES.md`);
  console.log(`   (Contiene el proceso completo con los 11 prompts)\n`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
