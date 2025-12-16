const fs = require('fs');
const path = require('path');

/**
 * Script para dividir en MÚLTIPLES partes más pequeñas (50-70 KB cada una)
 * Uso: node split-spark-mini.cjs
 */

const DOCS_DIR = path.join(__dirname, '.');
const OUTPUT_PREFIX = 'SPARK_MINI_';
const MAX_SIZE_KB = 70; // ~70 KB por parte (seguro para Spark)

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

console.log('🔄 Dividiendo en partes de ~70 KB cada una...\n');

try {
  const parts = [];
  let currentPart = {
    number: 1,
    docs: [],
    content: '',
    size: 0
  };

  // Procesar cada documento
  SPARK_DOCS.forEach((docName, index) => {
    const docPath = path.join(DOCS_DIR, docName);
    
    if (!fs.existsSync(docPath)) {
      console.warn(`⚠️  ${docName} no encontrado, omitiendo...`);
      return;
    }

    const content = fs.readFileSync(docPath, 'utf-8');
    const sizeKB = content.length / 1024;

    console.log(`📄 ${docName}: ${sizeKB.toFixed(1)} KB`);

    // Si agregar este doc excede el límite, crear nueva parte
    if (currentPart.size + sizeKB > MAX_SIZE_KB && currentPart.docs.length > 0) {
      parts.push(currentPart);
      currentPart = {
        number: parts.length + 1,
        docs: [],
        content: '',
        size: 0
      };
    }

    // Agregar documento a la parte actual
    currentPart.docs.push(docName);
    currentPart.content += `\n\n${'#'.repeat(80)}\n`;
    currentPart.content += `# ${docName}\n`;
    currentPart.content += `${'#'.repeat(80)}\n\n`;
    currentPart.content += content;
    currentPart.size += sizeKB;
  });

  // Agregar última parte
  if (currentPart.docs.length > 0) {
    parts.push(currentPart);
  }

  console.log(`\n✂️  Dividiendo en ${parts.length} partes:\n`);

  // Escribir cada parte
  parts.forEach((part, index) => {
    const isFirst = index === 0;
    const isLast = index === parts.length - 1;
    
    let header = `# 📚 APP INVENTARIO v6.0.1 - PARTE ${part.number}/${parts.length}\n\n`;
    header += `**Fecha:** ${new Date().toLocaleDateString('es-ES')}\n`;
    header += `**Tamaño:** ~${part.size.toFixed(1)} KB\n\n`;
    
    if (isFirst) {
      header += `🏠 **PRIMERA PARTE** - Lee todo y espera las siguientes partes\n\n`;
    } else if (isLast) {
      header += `🏁 **ÚLTIMA PARTE** - Ahora tienes toda la documentación\n\n`;
    } else {
      header += `⏩ **PARTE INTERMEDIA** - Continúa leyendo...\n\n`;
    }
    
    header += `**Documentos en esta parte:**\n`;
    part.docs.forEach(doc => {
      header += `- ${doc}\n`;
    });
    header += `\n---\n`;

    let footer = `\n\n${'='.repeat(80)}\n\n`;
    if (!isLast) {
      footer += `## ⏭️ CONTINÚA EN SPARK_MINI_${part.number + 1}.md\n\n`;
      footer += `**Lee la siguiente parte antes de crear la app**\n`;
    } else {
      footer += `## ✅ DOCUMENTACIÓN COMPLETA\n\n`;
      footer += `**Ahora puedes crear la aplicación con todas las ${parts.length} partes**\n`;
    }

    const fullContent = header + part.content + footer;
    const filename = `${OUTPUT_PREFIX}${part.number}.md`;
    const filepath = path.join(DOCS_DIR, filename);
    
    fs.writeFileSync(filepath, fullContent, 'utf-8');
    
    console.log(`   ✅ PARTE ${part.number}: ${filename}`);
    console.log(`      📏 ${part.size.toFixed(1)} KB`);
    console.log(`      📚 ${part.docs.join(', ')}\n`);
  });

  console.log('✅ ¡División completada!\n');
  console.log('📋 INSTRUCCIONES PARA SPARK:\n');
  
  parts.forEach((part, index) => {
    console.log(`${index + 1}. Pega SPARK_MINI_${part.number}.md`);
    if (index < parts.length - 1) {
      console.log(`   → Prompt: "Lee esta parte ${part.number}/${parts.length} y espera la siguiente"\n`);
    } else {
      console.log(`   → Prompt: "Esta es la última parte. Ahora crea la app completa siguiendo TODO"\n`);
    }
  });

  console.log(`\n💡 Límite seguro: Cada parte tiene ~${MAX_SIZE_KB} KB o menos`);
  console.log(`   (Spark suele tener límite de ~100-150 KB por mensaje)\n`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
