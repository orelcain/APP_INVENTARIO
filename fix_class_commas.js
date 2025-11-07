const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Uso: node fix_class_commas.js <ruta_del_archivo>');
  process.exit(1);
}

const filePath = process.argv[2];
const originalContent = fs.readFileSync(filePath, 'utf8');
const newline = originalContent.includes('\r\n') ? '\r\n' : '\n';
const lines = originalContent.split(/\r?\n/);
let fixes = 0;

let classStart = -1;
let classEnd = lines.length - 1;

for (let i = 0; i < lines.length; i++) {
  if (classStart === -1 && lines[i].includes('class InventarioCompleto')) {
    classStart = i;
  }
  if (classStart !== -1 && lines[i].includes('const app = new InventarioCompleto')) {
    classEnd = i;
    break;
  }
}

if (classStart === -1) {
  console.error('No se encontró la clase InventarioCompleto en el archivo.');
  process.exit(1);
}

function isCommentLine(text) {
  const trimmed = text.trim();
  return (
    trimmed === '' ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('*/')
  );
}

function isMethodSignature(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('constructor(')) return true;
  const methodRegex = /^(?:async\s+)?(?:get\s+|set\s+)?[A-Za-z_$][\w$]*\s*\(/;
  return methodRegex.test(trimmed);
}

for (let i = classStart; i <= classEnd; i++) {
  if (lines[i].trim() === '},') {
    let j = i + 1;
    while (j < lines.length && isCommentLine(lines[j])) {
      j++;
    }
    if (j < lines.length && isMethodSignature(lines[j])) {
      const idx = lines[i].indexOf('},');
      if (idx !== -1) {
        lines[i] = lines[i].slice(0, idx) + '}' + lines[i].slice(idx + 2);
        fixes++;
      }
    }
  }
}

if (fixes === 0) {
  console.log('No se realizaron cambios.');
  process.exit(0);
}

const newContent = lines.join(newline);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`Correcciones aplicadas: ${fixes}`);
