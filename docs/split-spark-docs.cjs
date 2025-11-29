const fs = require('fs');
const path = require('path');

/**
 * Script para dividir SPARK_COMPLETO.md en 2 partes para Spark
 * Uso: node split-spark-docs.cjs
 */

const DOCS_DIR = path.join(__dirname, '.');
const INPUT_FILE = path.join(DOCS_DIR, 'SPARK_COMPLETO.md');
const PART1_FILE = path.join(DOCS_DIR, 'SPARK_PARTE_1.md');
const PART2_FILE = path.join(DOCS_DIR, 'SPARK_PARTE_2.md');

console.log('🔄 Dividiendo SPARK_COMPLETO.md en 2 partes...\n');

try {
  // Leer archivo completo
  const content = fs.readFileSync(INPUT_FILE, 'utf-8');
  const lines = content.split('\n');
  
  console.log(`📄 Archivo original: ${lines.length} líneas`);

  // Buscar línea de separación para dividir (después de SPARK_05)
  let splitIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('DOCUMENTO 5: SPARK_05_MAPAS.md') ||
        lines[i].includes('DOCUMENTO 6: SPARK_06_FLUJO_V601.md')) {
      // Buscar el próximo separador grande
      for (let j = i; j < lines.length; j++) {
        if (lines[j].includes('====================================================================================================')) {
          splitIndex = j + 2; // Después del separador
          break;
        }
      }
      break;
    }
  }

  if (splitIndex === -1) {
    // Fallback: dividir a la mitad
    splitIndex = Math.floor(lines.length / 2);
  }

  console.log(`✂️  Dividiendo en línea: ${splitIndex}`);

  // Crear parte 1 (SPARK_00 a SPARK_05)
  const part1Lines = lines.slice(0, splitIndex);
  const part1Content = part1Lines.join('\n') + '\n\n' + 
    '## ⏭️ CONTINÚA EN SPARK_PARTE_2.md\n\n' +
    '**Para continuar, pega el contenido de SPARK_PARTE_2.md**\n';

  // Crear parte 2 (SPARK_06 a SPARK_10)
  const part2Header = `# 📚 DOCUMENTACIÓN COMPLETA - APP INVENTARIO v6.0.1 (PARTE 2/2)

**Fecha:** ${new Date().toLocaleDateString('es-ES', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

**Propósito:** Continuación de SPARK_PARTE_1.md

---

⬅️ **PARTE 1 INCLUYE:**
- SPARK_00_INDEX.md
- SPARK_01_GUIA_RAPIDA.md
- SPARK_02_MODELOS_DATOS.md
- SPARK_03_INVENTARIO.md
- SPARK_04_JERARQUIA.md
- SPARK_05_MAPAS.md

📍 **PARTE 2 INCLUYE (ABAJO):**
- SPARK_06_FLUJO_V601.md
- SPARK_07_FUNCIONES_TOP30.md
- SPARK_08_COMPONENTES_UI.md
- SPARK_09_SCRIPTS_HERRAMIENTAS.md
- SPARK_10_CLOUDINARY_DEPLOYMENT.md

---

`;

  const part2Lines = lines.slice(splitIndex);
  const part2Content = part2Header + part2Lines.join('\n');

  // Escribir archivos
  fs.writeFileSync(PART1_FILE, part1Content, 'utf-8');
  fs.writeFileSync(PART2_FILE, part2Content, 'utf-8');

  // Estadísticas
  const part1Stats = {
    lines: part1Lines.length,
    size: (part1Content.length / 1024).toFixed(2)
  };

  const part2Stats = {
    lines: part2Lines.length,
    size: (part2Content.length / 1024).toFixed(2)
  };

  console.log('\n✅ ¡División completada exitosamente!');
  console.log(`\n📊 Estadísticas:`);
  console.log(`\n   📄 PARTE 1 (Fundamentos):`);
  console.log(`      - Archivo: SPARK_PARTE_1.md`);
  console.log(`      - Líneas: ${part1Stats.lines}`);
  console.log(`      - Tamaño: ${part1Stats.size} KB`);
  console.log(`      - Incluye: SPARK_00 a SPARK_05`);
  
  console.log(`\n   📄 PARTE 2 (Funciones y Deploy):`);
  console.log(`      - Archivo: SPARK_PARTE_2.md`);
  console.log(`      - Líneas: ${part2Stats.lines}`);
  console.log(`      - Tamaño: ${part2Stats.size} KB`);
  console.log(`      - Incluye: SPARK_06 a SPARK_10`);

  console.log(`\n💡 Instrucciones para Spark:`);
  console.log(`   1. Pega SPARK_PARTE_1.md en Spark`);
  console.log(`   2. Agrega prompt: "Lee todo esto y espera la parte 2"`);
  console.log(`   3. Pega SPARK_PARTE_2.md`);
  console.log(`   4. Agrega prompt: "Ahora crea la app completa con ambas partes"`);

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
