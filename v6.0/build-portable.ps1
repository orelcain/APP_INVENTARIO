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

# Storage.js - Eliminar exports
$storageJs = $storageJs -replace 'export \{[^}]+\};?\s*$', ''
$storageJs = $storageJs -replace 'export default \w+;?\s*$', ''

# Mapa.js - Eliminar imports y exports
$mapaJs = $mapaJs -replace 'import \{[^}]+\} from[^;]+;', ''
$mapaJs = $mapaJs -replace 'export default \w+;?\s*$', ''

# Core.js - Eliminar imports y export
$coreJs = $coreJs -replace 'import \{[^}]+\} from[^;]+;', ''
$coreJs = $coreJs -replace 'import \w+ from[^;]+;', ''
$coreJs = $coreJs -replace 'export default \w+;?\s*$', ''

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
  window.app = new InventarioCompleto();
  window.fsManager = fsManager;
  window.mapStorage = mapStorage;
  window.mapController = mapController;
})();
"@

# Reemplazar el tag <script type="module" src="modules/core.js"></script>
Write-Host 'Reemplazando script modules...' -ForegroundColor Yellow
$html = $html -replace '<script type="module" src="modules/core\.js"></script>', "<script>`n$combinedJs`n</script>"

# Guardar archivo portable
Write-Host 'Guardando archivo portable...' -ForegroundColor Yellow
$html | Out-File $outputHtml -Encoding UTF8 -NoNewline

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
