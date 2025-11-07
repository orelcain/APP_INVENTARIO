param(
    [string]$filePath
)

# Encabezado para el log
$logFile = "fix_commas_log.txt"
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Iniciando script de corrección de comas." | Out-File -FilePath $logFile -Append

function Get-FirstErrorLine {
    # Simula la obtención de errores desde una fuente externa (aquí usamos un archivo temporal)
    # En un entorno real, esto sería reemplazado por la llamada a la herramienta de VS Code
    $errors = $($(vscode-command get-errors --file-path $using:filePath) | ConvertFrom-Json)
    if ($errors -and $errors.errors) {
        $firstError = $errors.errors | Where-Object { $_.message -like "*Unexpected token*" } | Select-Object -First 1
        if ($firstError) {
            return $firstError.range.start.line + 1 # Ajustar a base 1
        }
    }
    return -1
}

$fileContent = Get-Content -Path $filePath -Raw
$lines = $fileContent.Split([Environment]::NewLine)
$maxIterations = 150 # Límite de seguridad para evitar bucles infinitos
$iterations = 0

while ($iterations -lt $maxIterations) {
    $iterations++
    
    # Forzamos la actualización de errores en VS Code antes de leerlos
    # (Esta es una aproximación, la herramienta real lo haría directamente)
    Start-Sleep -Milliseconds 500 
    
    $errorLine = Get-FirstErrorLine
    
    if ($errorLine -eq -1) {
        $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - No se encontraron más errores de 'token inesperado'. Proceso completado."
        $logMessage | Out-File -FilePath $logFile -Append
        Write-Host "✅ Proceso completado. No hay más errores de token inesperado."
        break
    }

    $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Primer error detectado en la línea: $errorLine."
    $logMessage | Out-File -FilePath $logFile -Append

    # Buscar hacia atrás desde la línea del error - 1
    $targetLineIndex = -1
    for ($i = $errorLine - 2; $i -ge 0; $i--) {
        if ($lines[$i].Trim() -eq "}") {
            $targetLineIndex = $i
            break
        }
    }

    if ($targetLineIndex -ne -1) {
        $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Llave '}' encontrada en la línea $($targetLineIndex + 1). Añadiendo coma."
        $logMessage | Out-File -FilePath $logFile -Append
        
        # Añadir la coma
        $lines[$targetLineIndex] = $lines[$targetLineIndex] + ","
        
        # Guardar los cambios en el archivo
        $newContent = $lines -join [Environment]::NewLine
        Set-Content -Path $filePath -Value $newContent -NoNewline
        
        Write-Host "🔧 Coma añadida en la línea $($targetLineIndex + 1). Buscando siguiente error..."

    } else {
        $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - No se encontró una llave '}' candidata antes de la línea $errorLine. Abortando."
        $logMessage | Out-File -FilePath $logFile -Append
        Write-Host "❌ No se pudo encontrar una '}' para corregir antes de la línea $errorLine. Revisa el archivo manualmente."
        break
    }
}

if ($iterations -ge $maxIterations) {
    $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Se alcanzó el número máximo de iteraciones ($maxIterations). Abortando."
    $logMessage | Out-File -FilePath $logFile -Append
    Write-Host "⚠️ Se alcanzó el límite de iteraciones. Revisa el archivo por si hay un bucle inesperado."
}
