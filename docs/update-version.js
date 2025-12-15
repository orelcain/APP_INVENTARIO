/**
 * Script para actualizar la versión de la aplicación
 * 
 * USO: node update-version.js <nueva-version>
 * Ejemplo: node update-version.js 120
 * 
 * Este script actualiza automáticamente:
 * 1. version.json
 * 2. index.html (APP_VERSION, CACHE_VERSION, APP_BUILD)
 * 3. service-worker.js (CACHE_NAME, DYNAMIC_CACHE)
 */

const fs = require('fs');
const path = require('path');

// Obtener número de build de argumentos
const newBuild = parseInt(process.argv[2]);

if (!newBuild || isNaN(newBuild)) {
  console.log('❌ Error: Debes proporcionar un número de build');
  console.log('   Uso: node update-version.js <build-number>');
  console.log('   Ejemplo: node update-version.js 120');
  process.exit(1);
}

const newVersion = `v6.${newBuild}`;
const cacheName = `inventario-v6.${newBuild}`;

console.log(`\n🔧 Actualizando a ${newVersion} (Build ${newBuild})...\n`);

// 1. Actualizar version.json
const versionJsonPath = path.join(__dirname, 'version.json');
const versionData = {
  version: newVersion,
  build: newBuild,
  date: new Date().toISOString(),
  changes: process.argv[3] || 'Actualización de versión'
};
fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2));
console.log('✅ version.json actualizado');

// 2. Actualizar index.html
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Actualizar APP_VERSION
indexContent = indexContent.replace(
  /window\.APP_VERSION = 'v6\.\d+';/,
  `window.APP_VERSION = '${newVersion}';`
);

// Actualizar CACHE_VERSION
indexContent = indexContent.replace(
  /window\.CACHE_VERSION = 'inventario-v6\.\d+';/,
  `window.CACHE_VERSION = '${cacheName}';`
);

// Actualizar APP_BUILD
indexContent = indexContent.replace(
  /window\.APP_BUILD = \d+;/,
  `window.APP_BUILD = ${newBuild};`
);

fs.writeFileSync(indexPath, indexContent);
console.log('✅ index.html actualizado');

// 3. Actualizar service-worker.js
const swPath = path.join(__dirname, 'service-worker.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Actualizar versión en comentario
swContent = swContent.replace(
  /v6\.\d+ - .*/,
  `${newVersion} - ${versionData.changes}`
);

// Actualizar CACHE_NAME
swContent = swContent.replace(
  /const CACHE_NAME = 'inventario-v6\.\d+';/,
  `const CACHE_NAME = '${cacheName}';`
);

// Actualizar DYNAMIC_CACHE
swContent = swContent.replace(
  /const DYNAMIC_CACHE = 'inventario-dynamic-v6\.\d+';/,
  `const DYNAMIC_CACHE = 'inventario-dynamic-v6.${newBuild}';`
);

// Actualizar log de instalación
swContent = swContent.replace(
  /Instalando Service Worker v6\.\d+/,
  `Instalando Service Worker ${newVersion}`
);

fs.writeFileSync(swPath, swContent);
console.log('✅ service-worker.js actualizado');

console.log(`\n🎉 ¡Versión actualizada a ${newVersion}!`);
console.log('\n📝 Próximos pasos:');
console.log('   1. git add -A');
console.log(`   2. git commit -m "${newVersion} - ${versionData.changes}"`);
console.log('   3. git push origin main');
console.log('');
