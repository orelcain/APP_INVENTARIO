# Script para actualizar la versión de la aplicación
# Uso: .\update-version.ps1 -NewVersion "v6.103"

param(
    [Parameter(Mandatory=$true)]
    [string]$NewVersion
)

Write-Host "🔄 Actualizando a versión: $NewVersion" -ForegroundColor Cyan

# Validar formato de versión
if ($NewVersion -notmatch '^v\d+\.\d+$') {
    Write-Host "❌ Error: La versión debe tener formato vX.XXX (ejemplo: v6.103)" -ForegroundColor Red
    exit 1
}

# Archivos a actualizar
$indexFile = "v6.0\index.html"
$serviceWorkerFile = "v6.0\service-worker.js"
$docsServiceWorkerFile = "docs\service-worker.js"

Write-Host "`n📝 Actualizando archivos..." -ForegroundColor Yellow

# 1. Actualizar index.html - window.APP_VERSION
$indexContent = Get-Content $indexFile -Raw -Encoding UTF8
$indexContent = $indexContent -replace "window\.APP_VERSION = 'v[\d\.]+';", "window.APP_VERSION = '$NewVersion';"
$indexContent = $indexContent -replace "window\.CACHE_VERSION = 'inventario-v[\d\.]+';", "window.CACHE_VERSION = 'inventario-$NewVersion';"
Set-Content $indexFile -Value $indexContent -Encoding UTF8 -NoNewline
Write-Host "  ✅ index.html actualizado" -ForegroundColor Green

# 2. Actualizar v6.0/service-worker.js
$swContent = Get-Content $serviceWorkerFile -Raw -Encoding UTF8
$swContent = $swContent -replace "const CACHE_NAME = 'inventario-v[\d\.]+';", "const CACHE_NAME = 'inventario-$NewVersion';"
$swContent = $swContent -replace "const DYNAMIC_CACHE = 'inventario-dynamic-v[\d\.]+';", "const DYNAMIC_CACHE = 'inventario-dynamic-$NewVersion';"
$swContent = $swContent -replace "\* v[\d\.]+ - ", "* $NewVersion - "
Set-Content $serviceWorkerFile -Value $swContent -Encoding UTF8 -NoNewline
Write-Host "  ✅ v6.0/service-worker.js actualizado" -ForegroundColor Green

# 3. Sincronizar a docs/
Write-Host "`n📋 Sincronizando a docs/..." -ForegroundColor Yellow
Copy-Item $indexFile "docs\index.html" -Force
Copy-Item $serviceWorkerFile $docsServiceWorkerFile -Force
Write-Host "  ✅ Archivos sincronizados" -ForegroundColor Green

# 4. Git commit y push (opcional)
Write-Host "`n🔍 ¿Deseas hacer commit y push automáticamente? (S/N)" -ForegroundColor Cyan
$response = Read-Host
if ($response -eq 'S' -or $response -eq 's') {
    Write-Host "`n📝 Ingresa el mensaje del commit (o presiona Enter para usar mensaje por defecto):" -ForegroundColor Yellow
    $commitMsg = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "$NewVersion - Actualización de versión"
    }
    
    Write-Host "`n🔄 Ejecutando git..." -ForegroundColor Cyan
    git add v6.0\index.html v6.0\service-worker.js docs\index.html docs\service-worker.js
    git commit -m $commitMsg
    git push origin main
    
    Write-Host "`n✅ Cambios desplegados a GitHub Pages" -ForegroundColor Green
    Write-Host "⏱️  Espera 2-3 minutos para que GitHub Pages actualice" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  Recuerda hacer commit y push manualmente:" -ForegroundColor Yellow
    Write-Host "   git add v6.0\index.html v6.0\service-worker.js docs\index.html docs\service-worker.js" -ForegroundColor Gray
    Write-Host "   git commit -m `"$NewVersion - Tu mensaje`"" -ForegroundColor Gray
    Write-Host "   git push origin main" -ForegroundColor Gray
}

Write-Host "`n🎉 ¡Actualización completa!" -ForegroundColor Green
Write-Host "   Versión anterior → Versión nueva: $NewVersion" -ForegroundColor Cyan
Write-Host "`n📱 En el móvil/PWA:" -ForegroundColor Yellow
Write-Host "   1. La app detectará la nueva versión automáticamente en 60 segundos" -ForegroundColor White
Write-Host "   2. Aparecerá un banner con botón 'Actualizar Ahora'" -ForegroundColor White
Write-Host "   3. O puedes cerrar y volver a abrir la PWA" -ForegroundColor White
