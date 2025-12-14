# ============================================================
# Script de validacion de versiones
# Verifica que todas las versiones esten sincronizadas
# Uso: .\validate-version.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VALIDADOR DE VERSIONES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$files = @{
    "index.html" = "v6.0\index.html"
    "service-worker.js" = "v6.0\service-worker.js"
    "docs/index.html" = "docs\index.html"
    "docs/service-worker.js" = "docs\service-worker.js"
}

$versions = @{}
$errors = @()

Write-Host "[INFO] Extrayendo versiones de archivos..." -ForegroundColor Yellow
Write-Host ""

# Extraer version de index.html
try {
    $indexContent = Get-Content $files["index.html"] -Raw -Encoding UTF8
    if ($indexContent -match "window\.APP_VERSION = '(v[\d\.]+)'") {
        $versions["index.html APP_VERSION"] = $matches[1]
        Write-Host "  index.html (APP_VERSION): $($matches[1])" -ForegroundColor White
    }
    if ($indexContent -match "window\.CACHE_VERSION = 'inventario-(v[\d\.]+)'") {
        $versions["index.html CACHE_VERSION"] = $matches[1]
        Write-Host "  index.html (CACHE_VERSION): $($matches[1])" -ForegroundColor White
    }
}
catch {
    $errors += "Error leyendo index.html: $_"
}

# Extraer version de service-worker.js
try {
    $swContent = Get-Content $files["service-worker.js"] -Raw -Encoding UTF8
    if ($swContent -match "const CACHE_NAME = 'inventario-(v[\d\.]+)'") {
        $versions["service-worker.js CACHE_NAME"] = $matches[1]
        Write-Host "  service-worker.js (CACHE_NAME): $($matches[1])" -ForegroundColor White
    }
    if ($swContent -match "const DYNAMIC_CACHE = 'inventario-dynamic-(v[\d\.]+)'") {
        $versions["service-worker.js DYNAMIC_CACHE"] = $matches[1]
        Write-Host "  service-worker.js (DYNAMIC_CACHE): $($matches[1])" -ForegroundColor White
    }
}
catch {
    $errors += "Error leyendo service-worker.js: $_"
}

# Extraer version de docs/index.html
try {
    $docsIndexContent = Get-Content $files["docs/index.html"] -Raw -Encoding UTF8
    if ($docsIndexContent -match "window\.APP_VERSION = '(v[\d\.]+)'") {
        $versions["docs/index.html APP_VERSION"] = $matches[1]
        Write-Host "  docs/index.html (APP_VERSION): $($matches[1])" -ForegroundColor White
    }
}
catch {
    $errors += "Error leyendo docs/index.html: $_"
}

# Extraer version de docs/service-worker.js
try {
    $docsSwContent = Get-Content $files["docs/service-worker.js"] -Raw -Encoding UTF8
    if ($docsSwContent -match "const CACHE_NAME = 'inventario-(v[\d\.]+)'") {
        $versions["docs/service-worker.js CACHE_NAME"] = $matches[1]
        Write-Host "  docs/service-worker.js (CACHE_NAME): $($matches[1])" -ForegroundColor White
    }
}
catch {
    $errors += "Error leyendo docs/service-worker.js: $_"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Validar que todas sean iguales
$uniqueVersions = $versions.Values | Select-Object -Unique

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "[ERRORES ENCONTRADOS]" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    exit 1
}

if ($uniqueVersions.Count -eq 1) {
    Write-Host ""
    Write-Host "[RESULTADO] TODAS LAS VERSIONES SINCRONIZADAS" -ForegroundColor Green
    Write-Host ""
    Write-Host "Version actual: $($uniqueVersions[0])" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}
else {
    Write-Host ""
    Write-Host "[RESULTADO] VERSIONES DESINCRONIZADAS" -ForegroundColor Red
    Write-Host ""
    Write-Host "Se encontraron las siguientes versiones:" -ForegroundColor Yellow
    foreach ($key in $versions.Keys) {
        $color = if ($versions[$key] -eq $uniqueVersions[0]) { "Green" } else { "Red" }
        Write-Host "  $key : $($versions[$key])" -ForegroundColor $color
    }
    Write-Host ""
    Write-Host "Ejecuta el script de actualizacion para sincronizar:" -ForegroundColor Yellow
    Write-Host "  .\update-version.ps1 -NewVersion `"v6.XXX`"" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
