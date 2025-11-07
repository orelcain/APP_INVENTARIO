# Script inteligente para agregar comas solo donde corresponde
$inputFile = "inventario_v6.0_portable.html"
$tempFile = "temp_fix.html"

Write-Host "Leyendo archivo..."
$content = Get-Content $inputFile -Raw -Encoding UTF8

Write-Host "Buscando métodos sin coma..."
# Patrón: cierre de método (  }) seguido de línea vacía y otro método
$pattern = '(?m)^(  \})(\r?\n)(\r?\n)(  (async\s+)?[a-zA-Z_]\w*\s*\([^)]*\)\s*\{)'

$matches = [regex]::Matches($content, $pattern)
Write-Host "Encontrados $($matches.Count) métodos sin coma"

# Reemplazo: agregar coma después del cierre
$fixed = $content -replace $pattern, '$1,$2$3$4'

Write-Host "Escribiendo archivo corregido..."
[System.IO.File]::WriteAllText($tempFile, $fixed, [System.Text.UTF8Encoding]::new($false))

Write-Host "Moviendo archivo..."
Move-Item $tempFile $inputFile -Force

Write-Host "✅ COMPLETADO: $($matches.Count) comas agregadas"
