# ============================================================
# Script para actualizar la version de la aplicacion
# Uso: .\update-version.ps1 -NewVersion "v6.104"
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$NewVersion
)

# Configuracion
$ErrorActionPreference = "Stop"
$indexFile = "v6.0\index.html"
$serviceWorkerFile = "v6.0\service-worker.js"
$docsIndexFile = "docs\index.html"
$docsServiceWorkerFile = "docs\service-worker.js"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACTUALIZADOR DE VERSION AUTOMATICO   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Validar formato de version
if ($NewVersion -notmatch '^v\d+\.\d+$') {
    Write-Host "[ERROR] La version debe tener formato vX.XXX (ejemplo: v6.104)" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Nueva version: $NewVersion" -ForegroundColor Yellow
Write-Host ""

# Verificar que los archivos existan
$filesToCheck = @($indexFile, $serviceWorkerFile)
foreach ($file in $filesToCheck) {
    if (-not (Test-Path $file)) {
        Write-Host "[ERROR] No se encontro el archivo: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[PASO 1/5] Actualizando index.html..." -ForegroundColor Cyan

try {
    $indexContent = Get-Content $indexFile -Raw -Encoding UTF8
    
    # Patron para window.APP_VERSION
    $pattern1 = "window\.APP_VERSION = 'v[\d\.]+'"
    $replace1 = "window.APP_VERSION = '$NewVersion'"
    
    # Patron para window.CACHE_VERSION
    $pattern2 = "window\.CACHE_VERSION = 'inventario-v[\d\.]+'"
    $replace2 = "window.CACHE_VERSION = 'inventario-$NewVersion'"
    
    $indexContent = $indexContent -replace $pattern1, $replace1
    $indexContent = $indexContent -replace $pattern2, $replace2
    
    [System.IO.File]::WriteAllText($indexFile, $indexContent, [System.Text.Encoding]::UTF8)
    Write-Host "  [OK] index.html actualizado" -ForegroundColor Green
}
catch {
    Write-Host "  [ERROR] No se pudo actualizar index.html: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[PASO 2/5] Actualizando service-worker.js..." -ForegroundColor Cyan

try {
    $swContent = Get-Content $serviceWorkerFile -Raw -Encoding UTF8
    
    # Patron para CACHE_NAME
    $pattern3 = "const CACHE_NAME = 'inventario-v[\d\.]+'"
    $replace3 = "const CACHE_NAME = 'inventario-$NewVersion'"
    
    # Patron para DYNAMIC_CACHE
    $pattern4 = "const DYNAMIC_CACHE = 'inventario-dynamic-v[\d\.]+'"
    $replace4 = "const DYNAMIC_CACHE = 'inventario-dynamic-$NewVersion'"
    
    # Patron para comentario de version
    $pattern5 = " \* v[\d\.]+ - "
    $replace5 = " * $NewVersion - "
    
    $swContent = $swContent -replace $pattern3, $replace3
    $swContent = $swContent -replace $pattern4, $replace4
    $swContent = $swContent -replace $pattern5, $replace5
    
    [System.IO.File]::WriteAllText($serviceWorkerFile, $swContent, [System.Text.Encoding]::UTF8)
    Write-Host "  [OK] service-worker.js actualizado" -ForegroundColor Green
}
catch {
    Write-Host "  [ERROR] No se pudo actualizar service-worker.js: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[PASO 3/5] Sincronizando a docs/..." -ForegroundColor Cyan

try {
    Copy-Item $indexFile $docsIndexFile -Force
    Copy-Item $serviceWorkerFile $docsServiceWorkerFile -Force
    Write-Host "  [OK] Archivos sincronizados a docs/" -ForegroundColor Green
}
catch {
    Write-Host "  [ERROR] No se pudo sincronizar: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[PASO 4/5] Preparando commit..." -ForegroundColor Cyan

# Verificar estado de git
$gitStatus = git status --porcelain
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "  [AVISO] No hay cambios para commitear" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Cambios detectados:" -ForegroundColor Yellow
git status --short
Write-Host ""

$commitAuto = Read-Host "Hacer commit y push automaticamente? (S/N)"

if ($commitAuto -eq 'S' -or $commitAuto -eq 's') {
    Write-Host ""
    $commitMsg = Read-Host "Mensaje del commit (Enter para usar mensaje por defecto)"
    
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "$NewVersion - Actualizacion de version"
    }
    
    Write-Host ""
    Write-Host "[PASO 5/5] Ejecutando git..." -ForegroundColor Cyan
    
    try {
        git add v6.0\index.html v6.0\service-worker.js docs\index.html docs\service-worker.js
        git commit -m $commitMsg
        git push origin main
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ACTUALIZACION COMPLETADA" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Version: $NewVersion" -ForegroundColor Cyan
        Write-Host "Desplegado en GitHub Pages" -ForegroundColor Green
        Write-Host ""
        Write-Host "[IMPORTANTE] Espera 2-3 minutos para que GitHub Pages actualice" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "En la PWA movil:" -ForegroundColor Cyan
        Write-Host "  1. Se detectara automaticamente en 60 segundos" -ForegroundColor White
        Write-Host "  2. Aparecera banner con boton 'Actualizar Ahora'" -ForegroundColor White
        Write-Host "  3. O cierra y vuelve a abrir la PWA" -ForegroundColor White
        Write-Host ""
    }
    catch {
        Write-Host ""
        Write-Host "[ERROR] Fallo en git: $_" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host ""
    Write-Host "[PASO 5/5] OMITIDO - Commit manual requerido" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Comandos para ejecutar manualmente:" -ForegroundColor Cyan
    Write-Host "  git add v6.0\index.html v6.0\service-worker.js docs\index.html docs\service-worker.js" -ForegroundColor Gray
    Write-Host "  git commit -m `"$NewVersion - Tu mensaje`"" -ForegroundColor Gray
    Write-Host "  git push origin main" -ForegroundColor Gray
    Write-Host ""
}
