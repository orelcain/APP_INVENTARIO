# ========================================
# SCRIPT PARA CREAR VERSIÓN PORTABLE
# Combina HTML + CSS + JS en un solo archivo
# ========================================

Write-Host ''
Write-Host 'Construyendo version portable...' -ForegroundColor Cyan
Write-Host ''

$sourceHtml = "inventario_v6.0.html"
$outputHtml = "inventario_v6.0_portable.html"

# Leer HTML original
Write-Host 'Leyendo HTML base...' -ForegroundColor Yellow
$html = Get-Content $sourceHtml -Raw -Encoding UTF8

# Leer módulos JavaScript
Write-Host 'Leyendo modulos JS...' -ForegroundColor Yellow
$storageJs = Get-Content "modules/storage.js" -Raw -Encoding UTF8
$mapaJs = Get-Content "modules/mapa.js" -Raw -Encoding UTF8
$coreJs = Get-Content "modules/core.js" -Raw -Encoding UTF8

# Eliminar imports/exports de los módulos
Write-Host 'Procesando modulos...' -ForegroundColor Yellow

# Storage.js - Solo eliminar la línea export final
$storageJs = $storageJs -replace 'export \{[^}]+\};?\s*$', ''

# Mapa.js - Eliminar imports y export
$mapaJs = $mapaJs -replace 'import \{[^}]+\} from[^;]+;', '// [REMOVED IMPORT]'
$mapaJs = $mapaJs -replace 'export default mapController;', 'window.mapController = mapController;'

# Core.js - Eliminar imports y export
$coreJs = $coreJs -replace 'import \{[^}]+\} from[^;]+;', '// [REMOVED IMPORT]'
$coreJs = $coreJs -replace 'import \w+ from[^;]+;', '// [REMOVED IMPORT]'
$coreJs = $coreJs -replace 'export default InventarioCompleto;', 'window.InventarioCompleto = InventarioCompleto;'

# Crear el código JavaScript combinado
$combinedJs = @"
// ========================================
// VERSIÓN PORTABLE - TODO INLINEADO
// Generado automáticamente por build-portable.ps1
// ========================================

(function() {
  'use strict';

  // ========================================
  // MÓDULO STORAGE (storage.js)
  // ========================================
  $storageJs

  // Exponer globalmente
  window.fsManager = fsManager;
  window.mapStorage = mapStorage;

  // ========================================
  // MÓDULO MAPA (mapa.js)
  // ========================================
  $mapaJs

  // ========================================
  // MÓDULO CORE (core.js)
  // ========================================
  $coreJs

  // ========================================
  // INICIALIZACIÓN AUTOMÁTICA
  // ========================================
  console.log('✅ Módulos cargados correctamente');
  window.app = new InventarioCompleto();
})();
"@

# Reemplazar el tag <script type="module">...</script> que hace imports
Write-Host 'Reemplazando script modules...' -ForegroundColor Yellow

# Buscar y reemplazar el bloque que contiene los imports dinámicos
$pattern = '(?s)<script type="module">\s*// =+\s*// IMPORTS.*?</script>'
$replacement = "<script>`n$combinedJs`n</script>"
$html = $html -replace $pattern, $replacement

# Si no funcionó el primer patrón, usar uno más simple
if ($html -match 'import\(''\.\/modules\/storage\.js''\)') {
  Write-Host 'Usando patron alternativo...' -ForegroundColor Yellow
  $startMarker = '<!-- SCRIPTS MODULARES -->'
  $endMarker = '</script>'
  
  $startIdx = $html.IndexOf($startMarker)
  if ($startIdx -ge 0) {
    $scriptStart = $html.IndexOf('<script type="module">', $startIdx)
    $scriptEnd = $html.IndexOf('</script>', $scriptStart) + 9
    
    $before = $html.Substring(0, $scriptStart)
    $after = $html.Substring($scriptEnd)
    
    $html = $before + "<script>`n$combinedJs`n</script>" + $after
  }
}

# Guardar archivo portable
Write-Host 'Guardando archivo portable...' -ForegroundColor Yellow

# Eliminar declaraciones duplicadas de globalBlobCache
$count = ([regex]::Matches($html, 'const globalBlobCache')).Count
if ($count -gt 1) {
  Write-Host "  Encontradas $count declaraciones de globalBlobCache, eliminando duplicados..." -ForegroundColor Yellow
  # Reemplazar la segunda y subsecuentes ocurrencias
  $html = $html -replace '(?<=const globalBlobCache = new Map\(\);)[\s\S]*?const globalBlobCache = new Map\(\);', ''
}

# Guardar con Set-Content (mejor compatibilidad)
Set-Content -Path $outputHtml -Value $html -Encoding UTF8

Write-Host ''
Write-Host 'Version portable creada exitosamente!' -ForegroundColor Green
Write-Host "Archivo: $outputHtml" -ForegroundColor Cyan
$sizeMB = [math]::Round((Get-Item $outputHtml).Length / 1MB, 2)
Write-Host "Tamaño: $sizeMB MB" -ForegroundColor Yellow
Write-Host ''

# Abrir en navegador
Write-Host 'Abriendo en navegador...' -ForegroundColor Magenta
Start-Process $outputHtml

Write-Host 'Ahora puedes abrir el archivo directamente sin servidor' -ForegroundColor Green
Write-Host ''
