# ========================================================
# Script de optimizacion de imagenes WebP para Inventario
# ========================================================
# 
# PROPOSITO:
#   Optimiza imagenes WebP reduciendo su tamano sin perder
#   demasiada calidad visual (calidad 80%, metodo 6)
#
# USO:
#   Ejecutar cada vez que se agreguen nuevas imagenes:
#   .\optimize-images.ps1
#
# REQUISITO:
#   ImageMagick debe estar instalado
#   winget install ImageMagick.ImageMagick
#
# CONFIGURACION:
#   - Calidad: 80% (balance optimo calidad/tamano)
#   - Formato: WebP (mejor compresion que JPG/PNG)
#   - Umbral: Solo optimiza imagenes >200KB
#
# ========================================================

Write-Host "Optimizador de Imagenes WebP para Inventario" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$imagenesPath = "INVENTARIO_STORAGE\imagenes"
if (-not (Test-Path $imagenesPath)) {
    Write-Host "ERROR: No se encontro la carpeta de imagenes" -ForegroundColor Red
    exit 1
}

$imagenes = Get-ChildItem -Path $imagenesPath -Filter "*.webp" -Recurse

if ($imagenes.Count -eq 0) {
    Write-Host "INFO: No se encontraron imagenes WebP para optimizar" -ForegroundColor Yellow
    exit 0
}

Write-Host "Analisis inicial:" -ForegroundColor Green
$tamanoInicial = ($imagenes | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   - Imagenes encontradas: $($imagenes.Count)" -ForegroundColor White
Write-Host "   - Tamano total: $([math]::Round($tamanoInicial, 2)) MB" -ForegroundColor White
Write-Host ""

$magickAvailable = Get-Command "magick" -ErrorAction SilentlyContinue

if (-not $magickAvailable) {
    Write-Host "ADVERTENCIA: ImageMagick no esta instalado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para instalar ImageMagick:" -ForegroundColor White
    Write-Host "   winget install ImageMagick.ImageMagick" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Presione Enter para salir..." -ForegroundColor Gray
    Read-Host
    exit 1
}

Write-Host "ImageMagick detectado - Iniciando optimizacion..." -ForegroundColor Green
Write-Host ""

$optimizadas = 0
$ahorroTotal = 0

foreach ($imagen in $imagenes) {
    $tamanoOriginal = $imagen.Length
    
    # Solo optimizar si es mayor a 200KB
    if ($tamanoOriginal -gt 200KB) {
        Write-Host "Procesando: $($imagen.Name) ($([math]::Round($tamanoOriginal/1KB, 0)) KB)" -ForegroundColor Gray
        
        try {
            # Optimizar WebP con calidad 80
            & magick $imagen.FullName -quality 80 -define webp:method=6 "$($imagen.FullName).tmp" 2>$null
            
            if (Test-Path "$($imagen.FullName).tmp") {
                $tamanoNuevo = (Get-Item "$($imagen.FullName).tmp").Length
                
                if ($tamanoNuevo -lt $tamanoOriginal) {
                    Remove-Item $imagen.FullName -Force
                    Move-Item "$($imagen.FullName).tmp" $imagen.FullName
                    
                    $ahorro = $tamanoOriginal - $tamanoNuevo
                    $ahorroTotal += $ahorro
                    $porcentaje = [math]::Round(($ahorro / $tamanoOriginal) * 100, 1)
                    
                    Write-Host "   OPTIMIZADA: $([math]::Round($ahorro/1KB, 0)) KB ahorrados ($porcentaje%)" -ForegroundColor Green
                    $optimizadas++
                } else {
                    Remove-Item "$($imagen.FullName).tmp" -Force
                    Write-Host "   INFO: Ya optimizada" -ForegroundColor DarkGray
                }
            }
        } catch {
            Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Yellow
            if (Test-Path "$($imagen.FullName).tmp") {
                Remove-Item "$($imagen.FullName).tmp" -Force
            }
        }
    } else {
        Write-Host "Omitiendo: $($imagen.Name) (menor a 200KB)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Resumen de optimizacion:" -ForegroundColor Green
Write-Host "   - Imagenes procesadas: $optimizadas de $($imagenes.Count)" -ForegroundColor White
Write-Host "   - Espacio ahorrado: $([math]::Round($ahorroTotal/1MB, 2)) MB" -ForegroundColor White

$imagenes = Get-ChildItem -Path $imagenesPath -Filter "*.webp" -Recurse
$tamanoFinal = ($imagenes | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   - Tamano final: $([math]::Round($tamanoFinal, 2)) MB" -ForegroundColor White

if ($optimizadas -gt 0) {
    Write-Host ""
    Write-Host "COMPLETADO: Optimizacion exitosa!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "INFO: No se realizaron cambios" -ForegroundColor Yellow
}
Write-Host ""
