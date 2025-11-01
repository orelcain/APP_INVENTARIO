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
// VERSIÓN PORTABLE v6.0
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
  // EXPONER GLOBALMENTE
  // ========================================
  window.fsManager = fsManager;
  window.mapStorage = mapStorage;
  window.mapController = mapController;
  window.InventarioCompleto = InventarioCompleto;
  window.app = new InventarioCompleto();
  console.log('✅ Módulos portable cargados');
  
  // =========================================
  // OBJETO CONFIGURACIÓN
  // =========================================
  window.configuracion = {
    renderStorageUI() {
      const container = document.getElementById('storage-config-content');
      if (!container) return;
      
      const fs = window.fsManager || window.app.fsManager;
      const isConnected = fs && fs.isConnected;
      
      container.innerHTML = \`
        <h3 style="color: var(--text-primary); margin-bottom: 16px; font-size: 1.1rem; font-weight: 600;">
          💾 Almacenamiento FileSystem
        </h3>
        
        <div style="display: grid; gap: 12px;">
          <div style="background: var(--bg-primary); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong style="color: var(--text-primary); font-size: 0.95rem;">Estado:</strong>
              <span style="padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; background: \${isConnected ? '#10b981' : '#ef4444'}; color: white;">
                \${isConnected ? '🟢 Conectado' : '❌ No conectado'}
              </span>
            </div>
            <div style="color: var(--text-secondary); font-size: 0.85rem; font-family: monospace; padding: 10px; background: rgba(0,0,0,0.15); border-radius: 6px; min-height: 40px;">
              \${fs && fs.folderPath ? fs.folderPath : 'No hay carpeta seleccionada'}
            </div>
          </div>
          
          \${isConnected ? \`
            <button onclick="window.app.desconectarFileSystem()" class="btn" style="width: 100%; padding: 14px; font-size: 1rem; background: var(--danger); color: white;">
              🔴 Desconectar
            </button>
          \` : ''}
          
          <button onclick="window.app.activarFileSystem()" class="btn \${isConnected ? 'btn-secondary' : 'btn-primary'}" style="width: 100%; padding: 14px; font-size: 1rem;">
            \${isConnected ? '📁 Cambiar Carpeta' : '📂 Seleccionar Carpeta INVENTARIO_STORAGE'}
          </button>
        </div>
      \`;
    }
  };
  
  // =========================================
  // FUNCIONES DE ACORDEÓN
  // =========================================
  window.toggleConfigSection = function(sectionId) {
    const content = document.getElementById(sectionId + '-content');
    const icon = document.getElementById(sectionId + '-icon');
    
    if (!content || !icon) return;
    
    const isCollapsed = content.style.display === 'none' || !content.style.display;
    
    if (isCollapsed) {
      content.style.display = 'block';
      icon.textContent = '▼';
    } else {
      content.style.display = 'none';
      icon.textContent = '▶';
    }
    
    localStorage.setItem('config-' + sectionId, isCollapsed ? 'open' : 'closed');
  };
  
  window.initConfigSections = function() {
    const sections = ['storage-config', 'export-config', 'backup-config'];
    
    sections.forEach(sectionId => {
      const content = document.getElementById(sectionId + '-content');
      const icon = document.getElementById(sectionId + '-icon');
      
      if (!content || !icon) return;
      
      const savedState = localStorage.getItem('config-' + sectionId) || 'closed';
      
      if (savedState === 'open') {
        content.style.display = 'block';
        icon.textContent = '▼';
      } else {
        content.style.display = 'none';
        icon.textContent = '▶';
      }
    });
  };
  
  // =========================================
  // INICIALIZACIÓN
  // =========================================
  (async function() {
    try {
      console.log('📦 Iniciando aplicación portable...');
      
      const restored = await fsManager.restoreFromPreviousSession();
      if (restored) {
        console.log('✅ FileSystem restaurado');
      }
      
      if (mapController && typeof mapController.init === 'function') {
        await mapController.init();
      }
      
      await window.app.init();
      
      setTimeout(() => {
        if (window.initConfigSections) {
          window.initConfigSections();
        }
        
        if (window.configuracion && window.configuracion.renderStorageUI) {
          window.configuracion.renderStorageUI();
        }
      }, 500);
      
      const checkboxOptimizar = document.getElementById('optimizarImagenes');
      const opcionesOptimizacion = document.getElementById('opcionesOptimizacion');
      
      if (checkboxOptimizar && opcionesOptimizacion) {
        checkboxOptimizar.addEventListener('change', function() {
          opcionesOptimizacion.style.display = this.checked ? 'flex' : 'none';
        });
      }
      
      console.log('✅ Aplicación portable lista');
    } catch (error) {
      console.error('❌ Error al inicializar:', error);
    }
  })();
})();
"@

# Guardar combined.js
Write-Host 'Guardando combined.js...' -ForegroundColor Yellow
[System.IO.File]::WriteAllLines("$PWD\combined.js", $combinedJs, (New-Object System.Text.UTF8Encoding $false))

# Eliminar declaraciones duplicadas si existen
$jsContent = Get-Content 'combined.js' -Raw
$count = ([regex]::Matches($jsContent, 'const globalBlobCache')).Count
if ($count -gt 1) {
  Write-Host "  Eliminando $count declaraciones duplicadas de globalBlobCache..." -ForegroundColor Yellow
  $jsContent = $jsContent -replace '// ===+\s*// CACHÉ GLOBAL DE BLOB URLs.*?\s*// ===+\s*const globalBlobCache = new Map\(\);', ''
  [System.IO.File]::WriteAllText("$PWD\combined.js", $jsContent, (New-Object System.Text.UTF8Encoding $false))
}

# Copiar HTML y reemplazar script
Write-Host 'Creando HTML portable...' -ForegroundColor Yellow
Copy-Item $sourceHtml $outputHtml -Force

# Leer HTML portable y reemplazar el bloque de script
$htmlPortable = Get-Content $outputHtml -Raw -Encoding UTF8

# Buscar el bloque <script type="module">...</script> y reemplazarlo
$pattern = '(?s)<script type="module">.*?</script>'
$replacement = '  <script src="combined.js"></script>'

if ($htmlPortable -match $pattern) {
  $htmlPortable = $htmlPortable -replace $pattern, $replacement
  Set-Content -Path $outputHtml -Value $htmlPortable -Encoding UTF8
  Write-Host '  Bloque de script reemplazado exitosamente' -ForegroundColor Green
} else {
  Write-Host '  ERROR: No se encontro el bloque de script' -ForegroundColor Red
}

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
