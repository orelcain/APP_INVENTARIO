# ============================================================
# SCRIPT DE SINCRONIZACIÓN: v6.0/ → docs/
# ============================================================
# Este script sincroniza los archivos de desarrollo (v6.0/)
# con el directorio de deployment de GitHub Pages (docs/)
#
# USO: .\sync-to-docs.ps1
# O:   .\sync-to-docs.ps1 -Commit
# ============================================================

param(
    [switch]$Commit,
    [switch]$Push,
    [string]$Message = "Sync v6.0 to docs for GitHub Pages deployment"
)

$ErrorActionPreference = "Stop"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host " SINCRONIZACIÓN v6.0/ → docs/ (GitHub Pages)" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# Archivos críticos que DEBEN sincronizarse
$criticalFiles = @(
    "index.html",
    "service-worker.js",
    "manifest.json"
)

# Carpetas que deben sincronizarse
$criticalFolders = @(
    "config",
    "icons",
    "modules",
    "scripts",
    "styles"
)

$sourceDir = "v6.0"
$targetDir = "docs"
$syncedFiles = @()
$errors = @()

# Verificar que estamos en el directorio correcto
if (-not (Test-Path $sourceDir) -or -not (Test-Path $targetDir)) {
    Write-Host "❌ ERROR: Ejecuta este script desde D:\APP_INVENTARIO-2\" -ForegroundColor Red
    exit 1
}

# Sincronizar archivos críticos
Write-Host "📄 Sincronizando archivos críticos..." -ForegroundColor Yellow
foreach ($file in $criticalFiles) {
    $source = Join-Path $sourceDir $file
    $target = Join-Path $targetDir $file
    
    if (Test-Path $source) {
        try {
            Copy-Item -Path $source -Destination $target -Force
            $syncedFiles += $file
            Write-Host "  ✅ $file" -ForegroundColor Green
        } catch {
            $errors += "Error copiando $file : $_"
            Write-Host "  ❌ $file - ERROR" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️ $file - No existe en v6.0/" -ForegroundColor Yellow
    }
}

# Sincronizar carpetas (opcional, solo si existen cambios)
Write-Host "`n📁 Sincronizando carpetas..." -ForegroundColor Yellow
foreach ($folder in $criticalFolders) {
    $source = Join-Path $sourceDir $folder
    $target = Join-Path $targetDir $folder
    
    if (Test-Path $source) {
        try {
            # Crear carpeta destino si no existe
            if (-not (Test-Path $target)) {
                New-Item -ItemType Directory -Path $target -Force | Out-Null
            }
            
            # Copiar contenido
            Copy-Item -Path "$source\*" -Destination $target -Recurse -Force
            $syncedFiles += "$folder/*"
            Write-Host "  ✅ $folder/" -ForegroundColor Green
        } catch {
            $errors += "Error copiando $folder : $_"
            Write-Host "  ❌ $folder/ - ERROR" -ForegroundColor Red
        }
    }
}

# Mostrar resumen
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host " RESUMEN DE SINCRONIZACIÓN" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Archivos/carpetas sincronizados: $($syncedFiles.Count)" -ForegroundColor White
Write-Host "  Errores: $($errors.Count)" -ForegroundColor $(if ($errors.Count -gt 0) { "Red" } else { "Green" })

if ($errors.Count -gt 0) {
    Write-Host "`n⚠️ ERRORES:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "  - $err" -ForegroundColor Red
    }
}

# Git commit si se especificó -Commit
if ($Commit) {
    Write-Host "`n📦 Haciendo commit..." -ForegroundColor Yellow
    
    # Extraer versión del service-worker.js
    $swContent = Get-Content "docs/service-worker.js" -Raw
    if ($swContent -match "CACHE_NAME = 'inventario-v(\d+\.\d+)'") {
        $version = $matches[1]
        $Message = "v$version - $Message"
    }
    
    git add docs/
    git commit -m $Message
    
    if ($Push) {
        Write-Host "🚀 Pusheando a origin/main..." -ForegroundColor Yellow
        git push origin main
        Write-Host "✅ Push completado" -ForegroundColor Green
    } else {
        Write-Host "💡 Usa -Push para pushear automáticamente" -ForegroundColor Cyan
    }
}

Write-Host "`n✅ Sincronización completada`n" -ForegroundColor Green

# Recordatorio
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "  1. Verifica los cambios: git diff docs/" -ForegroundColor White
Write-Host "  2. Commit: git add docs/ && git commit -m 'mensaje'" -ForegroundColor White
Write-Host "  3. Push: git push origin main" -ForegroundColor White
Write-Host "  4. Espera 2-5 min para que GitHub Pages se actualice" -ForegroundColor White
Write-Host "  5. Recarga app con Ctrl+Shift+R (bypass cache)`n" -ForegroundColor White
