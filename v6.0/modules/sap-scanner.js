/**
 * 📸 SAP Label Scanner Module v1.4
 * Escanea etiquetas SAP usando OCR (Tesseract.js) para crear o contar repuestos
 * 
 * @version 1.4.0
 * @requires Tesseract.js (CDN)
 * 
 * CAMBIOS v1.4:
 * - FIX: Imagen visible durante animación de escaneo
 * - MEJORADO: Modal de conteo con teclado numérico estilo calculadora
 * - MEJORADO: Botones de ajuste rápido (+1, -1, +5, -5, +10, -10)
 * - MEJORADO: Muestra diferencia (delta) entre cantidad original y nueva
 * - NUEVO: Zoom de imagen al tocar thumbnail en modal de conteo
 * 
 * CAMBIOS v1.3:
 * - Animación de escaneo estilo Google Lens durante OCR
 * - Puntos animados, línea de escaneo y esquinas de enfoque
 * - Caja de detección cuando se encuentra texto
 * 
 * CAMBIOS v1.2:
 * - Modal inicial con opciones "Agregar" o "Contar"
 * - Detección inteligente si repuesto ya existe
 * - Flujo de conteo rápido
 */

class SAPScanner {
    constructor() {
        this.isReady = false;
        this.worker = null;
        this.workerOptimized = null; // Worker optimizado para códigos
        this.isProcessing = false;
        
        // 🆕 Modo de operación: 'add' o 'count'
        this.operationMode = null;
        
        // Patrones de extracción SAP MEJORADOS
        this.patterns = {
            // Código SAP: 10 dígitos, típicamente empieza con 3 o 2
            codigoSAP: /\b[23][0-9]{9}\b/g,
            // Código alternativo: 8-12 dígitos
            codigoAlt: /\b[0-9]{8,12}\b/g,
            // Código con posibles errores OCR (O->0, I->1, S->5, B->8)
            codigoFuzzy: /\b[23OoZz][0-9OoIilZzSsBb]{8,11}\b/g,
            // Limpiar caracteres extraños del OCR
            cleanText: /[^\w\sáéíóúñÁÉÍÓÚÑ.,\-\/()#°"']/g
        };
        
        // Correcciones OCR comunes
        this.ocrCorrections = {
            'O': '0', 'o': '0',
            'I': '1', 'i': '1', 'l': '1', '|': '1',
            'Z': '2', 'z': '2',
            'S': '5', 's': '5',
            'B': '8', 'b': '8',
            'G': '6', 'g': '9',
            'q': '9', 'Q': '0'
        };
        
        // Estado del escaneo
        this.lastScan = {
            rawText: '',
            codigoSAP: '',
            descripcion: '',
            imageData: null,
            confidence: 0,
            processedImageData: null, // Imagen pre-procesada
            similarCodes: [] // 🆕 Códigos similares encontrados para asistencia humana
        };
        
        // Estado de la UI
        this.imageReady = false;
        
        console.log('📸 SAPScanner v1.5: Módulo inicializado con OCR mejorado');
    }
    
    /**
     * Inicializa Tesseract.js (carga lazy)
     */
    async init() {
        if (this.isReady) return true;
        
        try {
            // Verificar si Tesseract ya está cargado
            if (typeof Tesseract === 'undefined') {
                console.log('📸 SAPScanner: Cargando Tesseract.js...');
                await this.loadTesseractCDN();
            }
            
            console.log('📸 SAPScanner: Creando worker...');
            this.worker = await Tesseract.createWorker('spa', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        this.updateProgress(Math.round(m.progress * 100));
                    }
                }
            });
            
            this.isReady = true;
            console.log('📸 SAPScanner: ✅ Listo para escanear');
            return true;
            
        } catch (error) {
            console.error('📸 SAPScanner: ❌ Error inicializando:', error);
            return false;
        }
    }
    
    /**
     * Carga Tesseract.js desde CDN
     */
    loadTesseractCDN() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            script.onload = () => {
                console.log('📸 SAPScanner: Tesseract.js cargado desde CDN');
                resolve();
            };
            script.onerror = () => reject(new Error('No se pudo cargar Tesseract.js'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Actualiza indicador de progreso
     */
    updateProgress(percent) {
        const progressBar = document.getElementById('sapScannerProgress');
        const progressText = document.getElementById('sapScannerProgressText');
        
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        if (progressText) {
            progressText.textContent = `Analizando imagen... ${percent}%`;
        }
    }
    
    /**
     * 🆕 NUEVO: Abre modal de selección de modo (Agregar o Contar)
     */
    openCaptureModal() {
        // Mostrar modal de selección de modo
        this.showModeSelectionModal();
    }
    
    /**
     * 🆕 NUEVO: Modal de selección de modo
     */
    showModeSelectionModal() {
        // Crear modal si no existe
        let modal = document.getElementById('sapModeModal');
        if (!modal) {
            modal = this.createModeSelectionModal();
            document.body.appendChild(modal);
        }
        
        modal.classList.add('active');
    }
    
    /**
     * 🆕 NUEVO: Crea el modal de selección de modo
     */
    createModeSelectionModal() {
        const modal = document.createElement('div');
        modal.id = 'sapModeModal';
        modal.className = 'sap-scanner-modal sap-mode-modal';
        
        modal.innerHTML = `
            <div class="sap-mode-content">
                <div class="sap-scanner-header">
                    <h3>📸 ¿Qué deseas hacer?</h3>
                    <button type="button" class="sap-scanner-close" onclick="window.sapScanner.closeModeModal()">✕</button>
                </div>
                
                <div class="sap-mode-options">
                    <button type="button" class="sap-mode-btn add-mode" onclick="window.sapScanner.startScanWithMode('add')">
                        <div class="sap-mode-icon">📦</div>
                        <div class="sap-mode-label">AGREGAR</div>
                        <div class="sap-mode-desc">Nuevo repuesto al inventario</div>
                    </button>
                    
                    <button type="button" class="sap-mode-btn count-mode" onclick="window.sapScanner.startScanWithMode('count')">
                        <div class="sap-mode-icon">🔢</div>
                        <div class="sap-mode-label">CONTAR</div>
                        <div class="sap-mode-desc">Actualizar cantidad existente</div>
                    </button>
                </div>
                
                <p class="sap-mode-hint">
                    💡 El sistema verificará automáticamente si el repuesto existe
                </p>
            </div>
        `;
        
        // Agregar estilos si no existen
        this.addModeModalStyles();
        
        return modal;
    }
    
    /**
     * 🆕 NUEVO: Estilos para el modal de modo
     */
    addModeModalStyles() {
        if (document.getElementById('sapModeStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'sapModeStyles';
        styles.textContent = `
            .sap-mode-modal .sap-mode-content {
                max-width: 340px;
                padding: 24px;
                text-align: center;
            }
            
            .sap-mode-options {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin: 24px 0;
            }
            
            .sap-mode-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 24px 20px;
                border: 2px solid var(--border-color);
                border-radius: 16px;
                background: var(--bg-secondary);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .sap-mode-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            }
            
            .sap-mode-btn.add-mode:hover {
                border-color: var(--accent);
                background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05));
            }
            
            .sap-mode-btn.count-mode:hover {
                border-color: #22c55e;
                background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05));
            }
            
            .sap-mode-icon {
                font-size: 48px;
                line-height: 1;
            }
            
            .sap-mode-label {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--text-primary);
                letter-spacing: 0.5px;
            }
            
            .sap-mode-desc {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }
            
            .sap-mode-hint {
                font-size: 0.8rem;
                color: var(--text-tertiary);
                margin: 0;
                padding: 12px;
                background: var(--bg-tertiary);
                border-radius: 8px;
            }
            
            /* Modal de conteo rápido MEJORADO */
            .sap-count-content {
                max-width: 400px;
                padding: 20px;
            }
            
            .sap-count-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px;
                background: var(--bg-secondary);
                border-radius: 12px;
                margin: 14px 0;
            }
            
            .sap-count-thumb {
                width: 72px;
                height: 72px;
                border-radius: 10px;
                object-fit: cover;
                background: var(--bg-tertiary);
                cursor: zoom-in;
                border: 2px solid var(--border-color);
            }
            
            .sap-count-info {
                flex: 1;
                text-align: left;
            }
            
            .sap-count-name {
                font-weight: 600;
                color: var(--text-primary);
                font-size: 1rem;
                margin-bottom: 4px;
                line-height: 1.2;
            }
            
            .sap-count-code {
                font-size: 0.75rem;
                color: var(--text-secondary);
                font-family: monospace;
            }
            
            .sap-count-stock-badge {
                display: inline-block;
                font-size: 0.7rem;
                padding: 3px 8px;
                border-radius: 12px;
                background: rgba(34,197,94,0.15);
                color: #22c55e;
                margin-top: 6px;
            }
            
            .sap-count-stock-badge.warning {
                background: rgba(251,191,36,0.15);
                color: #fbbf24;
            }
            
            .sap-count-stock-badge.critical {
                background: rgba(239,68,68,0.15);
                color: #ef4444;
            }
            
            /* Display grande de cantidad */
            .sap-count-display {
                text-align: center;
                padding: 20px;
                background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
                border-radius: 16px;
                margin: 14px 0;
            }
            
            .sap-count-display-label {
                font-size: 0.75rem;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            
            .sap-count-display-value {
                font-size: 3rem;
                font-weight: 700;
                color: var(--accent);
                line-height: 1;
            }
            
            .sap-count-display-diff {
                font-size: 0.9rem;
                color: var(--text-secondary);
                margin-top: 6px;
            }
            
            .sap-count-display-diff.positive {
                color: #22c55e;
                font-weight: 600;
            }
            
            .sap-count-display-diff.negative {
                color: #ef4444;
                font-weight: 600;
            }
            
            /* Botones de ajuste rápido */
            .sap-count-quick-btns {
                display: flex;
                gap: 6px;
                justify-content: center;
                margin: 12px 0;
                flex-wrap: wrap;
            }
            
            .sap-quick-btn {
                min-width: 44px;
                height: 40px;
                border-radius: 10px;
                border: 1px solid var(--border-color);
                background: var(--bg-secondary);
                color: var(--text-primary);
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
            }
            
            .sap-quick-btn:hover {
                background: var(--bg-tertiary);
            }
            
            .sap-quick-btn.minus-big,
            .sap-quick-btn.plus-big {
                width: 50px;
                font-size: 1.25rem;
            }
            
            .sap-quick-btn.minus-big {
                color: #ef4444;
                border-color: rgba(239,68,68,0.3);
            }
            
            .sap-quick-btn.plus-big {
                color: #22c55e;
                border-color: rgba(34,197,94,0.3);
            }
            
            /* Teclado numérico */
            .sap-count-numpad {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin: 14px 0;
            }
            
            .sap-count-numpad button {
                height: 48px;
                border-radius: 10px;
                border: 1px solid var(--border-color);
                background: var(--bg-secondary);
                color: var(--text-primary);
                font-size: 1.25rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.1s;
            }
            
            .sap-count-numpad button:active {
                transform: scale(0.95);
                background: var(--bg-tertiary);
            }
            
            .sap-count-numpad .numpad-clear {
                color: #ef4444;
                font-weight: 700;
            }
            
            .sap-count-numpad .numpad-back {
                font-size: 1.1rem;
            }
            
            /* ESTILOS ELIMINADOS - Ya no se usan */
            /* .sap-count-current, .sap-count-buttons, .sap-count-manual ya no existen */
            
            /* Alerta de discrepancia */
            .sap-discrepancy-alert {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                background: rgba(251,191,36,0.1);
                border: 1px solid #fbbf24;
                border-radius: 12px;
                margin: 16px 0;
                text-align: left;
            }
            
            .sap-discrepancy-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .sap-discrepancy-text {
                flex: 1;
            }
            
            .sap-discrepancy-title {
                font-weight: 600;
                color: #f59e0b;
                margin-bottom: 4px;
            }
            
            .sap-discrepancy-desc {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }
            
            .sap-discrepancy-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }
            
            .sap-discrepancy-actions .sap-scanner-btn {
                flex: 1;
                font-size: 0.85rem;
                padding: 10px 12px;
            }
            
            /* 🔍 ANIMACIÓN ESTILO GOOGLE LENS */
            .scan-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                overflow: hidden;
                z-index: 10;
                background: transparent !important;
            }
            
            /* Asegurar que la imagen preview se vea */
            .sap-scanner-preview-wrapper img.sap-scanner-preview {
                position: relative;
                z-index: 1;
                display: block !important;
            }
            
            .scan-dots-container {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 85%;
                height: 60%;
            }
            
            /* Puntos de escaneo */
            .scan-dot {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #4285f4;
                border-radius: 50%;
                opacity: 0;
                box-shadow: 0 0 10px #4285f4, 0 0 20px #4285f4;
                animation: scanDotPulse 1.5s ease-in-out infinite;
            }
            
            .scan-dot.active {
                opacity: 1;
            }
            
            @keyframes scanDotPulse {
                0%, 100% { 
                    transform: scale(0.8);
                    opacity: 0.6;
                }
                50% { 
                    transform: scale(1.2);
                    opacity: 1;
                }
            }
            
            /* Línea de escaneo horizontal */
            .scan-line {
                position: absolute;
                left: 5%;
                right: 5%;
                height: 2px;
                background: linear-gradient(90deg, transparent, #4285f4, #34a853, #fbbc04, #ea4335, transparent);
                box-shadow: 0 0 15px rgba(66, 133, 244, 0.8);
                animation: scanLineMove 2s ease-in-out infinite;
            }
            
            @keyframes scanLineMove {
                0% { top: 20%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 80%; opacity: 0; }
            }
            
            /* Cuadro de detección */
            .detection-box {
                position: absolute;
                border: 2px solid #4285f4;
                border-radius: 8px;
                background: rgba(66, 133, 244, 0.1);
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .detection-box.found {
                opacity: 1;
                animation: detectionPulse 0.5s ease-out;
            }
            
            .detection-box .detection-label {
                position: absolute;
                top: -24px;
                left: 0;
                background: #4285f4;
                color: white;
                font-size: 10px;
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 4px;
                white-space: nowrap;
            }
            
            @keyframes detectionPulse {
                0% { transform: scale(1.1); border-color: #34a853; }
                100% { transform: scale(1); border-color: #4285f4; }
            }
            
            /* Texto de estado del escaneo */
            .scan-status {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                backdrop-filter: blur(10px);
            }
            
            .scan-status .status-dot {
                width: 8px;
                height: 8px;
                background: #4285f4;
                border-radius: 50%;
                animation: statusBlink 0.8s ease-in-out infinite;
            }
            
            @keyframes statusBlink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
            
            /* Esquinas de enfoque */
            .scan-corners {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                height: 55%;
                pointer-events: none;
            }
            
            .scan-corner {
                position: absolute;
                width: 20px;
                height: 20px;
                border-color: #4285f4;
                border-style: solid;
                border-width: 0;
            }
            
            .scan-corner.tl { top: 0; left: 0; border-top-width: 3px; border-left-width: 3px; border-radius: 8px 0 0 0; }
            .scan-corner.tr { top: 0; right: 0; border-top-width: 3px; border-right-width: 3px; border-radius: 0 8px 0 0; }
            .scan-corner.bl { bottom: 0; left: 0; border-bottom-width: 3px; border-left-width: 3px; border-radius: 0 0 0 8px; }
            .scan-corner.br { bottom: 0; right: 0; border-bottom-width: 3px; border-right-width: 3px; border-radius: 0 0 8px 0; }
            
            .scanning .scan-corner {
                animation: cornerPulse 1s ease-in-out infinite;
            }
            
            @keyframes cornerPulse {
                0%, 100% { border-color: #4285f4; }
                50% { border-color: #34a853; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    /**
     * 🆕 NUEVO: Crea el modal de sugerencias de códigos similares
     */
    createSuggestionsModal() {
        const modal = document.createElement('div');
        modal.id = 'sapSuggestionsModal';
        modal.className = 'sap-scanner-modal sap-suggestions-modal';
        
        modal.innerHTML = `
            <div class="sap-scanner-content sap-suggestions-content">
                <div class="sap-scanner-header">
                    <h3>🔍 ¿Es alguno de estos?</h3>
                    <button type="button" class="sap-scanner-close" onclick="window.sapScanner.closeSuggestionsModal()">✕</button>
                </div>
                
                <div class="sap-suggestions-body">
                    <!-- Imagen escaneada con zoom -->
                    <div class="sap-suggestions-image-container">
                        <div class="sap-suggestions-image-wrapper" id="sapSuggestionsImageWrapper">
                            <img id="sapSuggestionsImage" src="" alt="Imagen escaneada" draggable="false" 
                                 style="pointer-events: none; user-select: none; -webkit-user-select: none;" />
                        </div>
                        <div class="sap-suggestions-zoom-hint">
                            <span>🤏 Pellizca con 2 dedos para zoom | ✌️ Doble tap para zoom rápido</span>
                        </div>
                    </div>
                    
                    <!-- Campo editable para código OCR -->
                    <div class="sap-suggestions-ocr-edit">
                        <label class="ocr-edit-label">✏️ Código detectado (editable):</label>
                        <div class="ocr-edit-row">
                            <input type="text" id="sapSuggestionsOcrInput" class="ocr-edit-input" 
                                   maxlength="12" inputmode="numeric" pattern="[0-9]*"
                                   placeholder="Código SAP" />
                            <span class="ocr-confidence-badge" id="sapSuggestionsConfidence">0%</span>
                        </div>
                        <button type="button" class="sap-scanner-btn primary ocr-search-btn" onclick="window.sapScanner.searchEditedCode()">
                            🔍 Buscar código corregido
                        </button>
                    </div>
                    
                    <!-- Lista de sugerencias -->
                    <div class="sap-suggestions-list-header">
                        <span>📋 Códigos similares encontrados:</span>
                    </div>
                    <div class="sap-suggestions-list" id="sapSuggestionsList">
                        <!-- Se llena dinámicamente -->
                    </div>
                    
                    <!-- Acciones -->
                    <div class="sap-suggestions-actions">
                        <button type="button" class="sap-scanner-btn secondary" onclick="window.sapScanner.useOcrCodeAsIs()">
                            Usar código actual
                        </button>
                        <button type="button" class="sap-scanner-btn secondary" onclick="window.sapScanner.closeSuggestionsModal(); window.sapScanner.openScan();">
                            Volver a escanear
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar estilos
        this.addSuggestionsModalStyles();
        
        return modal;
    }
    
    /**
     * 🆕 NUEVO: Estilos para modal de sugerencias
     */
    addSuggestionsModalStyles() {
        if (document.getElementById('sapSuggestionsStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'sapSuggestionsStyles';
        styles.textContent = `
            .sap-suggestions-modal .sap-suggestions-content {
                width: 94vw;
                max-width: 420px;
                max-height: 92vh;
                padding: 0;
                overflow: hidden;
                margin: 4vh auto;
            }
            
            .sap-suggestions-body {
                padding: 10px;
                overflow-y: auto;
                max-height: calc(92vh - 45px);
                -webkit-overflow-scrolling: touch;
            }
            
            /* Contenedor de imagen compacto */
            .sap-suggestions-image-container {
                background: var(--bg-tertiary);
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .sap-suggestions-image-wrapper {
                position: relative;
                width: 100%;
                height: 180px;
                overflow: hidden;
                touch-action: none; /* Desactivar gestos del navegador */
                cursor: zoom-in;
                background: rgba(0,0,0,0.05);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .sap-suggestions-image-wrapper.zoomed {
                cursor: grab;
                height: 300px; /* Más alto cuando está en zoom */
            }
            
            .sap-suggestions-image-wrapper.zoomed:active {
                cursor: grabbing;
            }
            
            .sap-suggestions-image-wrapper img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                transition: none; /* Sin transición para zoom suave */
                transform-origin: center center;
                user-select: none;
                -webkit-user-select: none;
            }
            
            .sap-suggestions-zoom-hint {
                text-align: center;
                padding: 8px;
                font-size: 0.68rem;
                color: var(--text-secondary);
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08));
                border-top: 1px solid rgba(139, 92, 246, 0.15);
                line-height: 1.3;
            }
            
            /* Campo editable de código OCR */
            .sap-suggestions-ocr-edit {
                background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05));
                border-radius: 12px;
                padding: 12px;
                margin-bottom: 12px;
            }
            
            .sap-suggestions-ocr-edit .ocr-edit-label {
                display: block;
                font-size: 0.8rem;
                color: var(--text-secondary);
                margin-bottom: 8px;
            }
            
            .sap-suggestions-ocr-edit .ocr-edit-row {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .sap-suggestions-ocr-edit .ocr-edit-input {
                flex: 1;
                font-family: monospace;
                font-size: 1.3rem;
                font-weight: 700;
                letter-spacing: 2px;
                padding: 12px 16px;
                border: 2px solid var(--accent);
                border-radius: 10px;
                background: var(--bg-primary);
                color: var(--text-primary);
                text-align: center;
            }
            
            .sap-suggestions-ocr-edit .ocr-edit-input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
            }
            
            .sap-suggestions-ocr-edit .ocr-confidence-badge {
                font-size: 0.75rem;
                padding: 4px 10px;
                background: rgba(59,130,246,0.2);
                color: var(--accent);
                border-radius: 12px;
                white-space: nowrap;
            }
            
            .sap-suggestions-ocr-edit .ocr-search-btn {
                width: 100%;
                padding: 10px;
                font-size: 0.9rem;
            }
            
            /* Lista de sugerencias */
            .sap-suggestions-list-header {
                font-size: 0.8rem;
                color: var(--text-secondary);
                margin-bottom: 8px;
                padding-left: 4px;
            }
            
            .sap-suggestions-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 12px;
                max-height: 250px;
                overflow-y: auto;
            }
            
            .sap-suggestion-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px;
                background: var(--bg-secondary);
                border: 2px solid var(--border-color);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .sap-suggestion-item:hover {
                border-color: var(--accent);
                background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02));
                transform: translateY(-1px);
            }
            
            .sap-suggestion-item:active {
                transform: scale(0.98);
            }
            
            .sap-suggestion-match {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                border-radius: 10px;
                color: white;
                font-weight: 700;
                font-size: 0.9rem;
                flex-shrink: 0;
            }
            
            .sap-suggestion-match.high {
                background: linear-gradient(135deg, #22c55e, #16a34a);
            }
            
            .sap-suggestion-match.medium {
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
            }
            
            .sap-suggestion-info {
                flex: 1;
                min-width: 0;
            }
            
            .sap-suggestion-code {
                font-family: monospace;
                font-size: 1rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 4px;
                letter-spacing: 0.5px;
            }
            
            .sap-suggestion-name {
                font-size: 0.8rem;
                color: var(--text-secondary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .sap-suggestion-qty {
                font-size: 0.7rem;
                color: var(--text-tertiary);
                margin-top: 2px;
            }
            
            .sap-suggestion-arrow {
                color: var(--text-tertiary);
                font-size: 1.2rem;
            }
            
            /* Acciones */
            .sap-suggestions-actions {
                display: flex;
                gap: 10px;
                padding-top: 12px;
                border-top: 1px solid var(--border-color);
            }
            
            .sap-suggestions-actions .sap-scanner-btn {
                flex: 1;
                font-size: 0.85rem;
                padding: 12px;
            }
            
            .sap-suggestions-actions .sap-scanner-btn.secondary {
                background: var(--bg-tertiary);
                color: var(--text-primary);
            }
            
            /* Sin sugerencias */
            .sap-suggestions-empty {
                text-align: center;
                padding: 24px;
                color: var(--text-secondary);
            }
            
            .sap-suggestions-empty-icon {
                font-size: 2.5rem;
                margin-bottom: 12px;
            }
        `;
        document.head.appendChild(styles);
    }
    
    /**
     * 🆕 NUEVO: Muestra el modal de sugerencias
     */
    showSuggestionsModal() {
        let modal = document.getElementById('sapSuggestionsModal');
        if (!modal) {
            modal = this.createSuggestionsModal();
            document.body.appendChild(modal);
        }
        
        // Poblar imagen escaneada
        const img = document.getElementById('sapSuggestionsImage');
        if (img && this.lastScan.imageData) {
            img.src = this.lastScan.imageData;
        }
        
        // Mostrar código OCR en campo editable
        const ocrInput = document.getElementById('sapSuggestionsOcrInput');
        const confidence = document.getElementById('sapSuggestionsConfidence');
        if (ocrInput) ocrInput.value = this.lastScan.codigoSAP || '';
        if (confidence) confidence.textContent = `${this.lastScan.confidence}%`;
        
        // Poblar lista de sugerencias
        const list = document.getElementById('sapSuggestionsList');
        if (list) {
            const similarCodes = this.lastScan.similarCodes || [];
            
            if (similarCodes.length === 0) {
                list.innerHTML = `
                    <div class="sap-suggestions-empty">
                        <div class="sap-suggestions-empty-icon">🔍</div>
                        <div>No se encontraron códigos similares</div>
                        <div style="font-size: 0.8rem; margin-top: 8px;">Edita el código arriba y busca, o vuelve a escanear</div>
                    </div>
                `;
            } else {
                list.innerHTML = similarCodes.map((item, index) => `
                    <div class="sap-suggestion-item" onclick="window.sapScanner.selectSuggestedCode('${item.codigo}')">
                        <div class="sap-suggestion-match ${item.matchingDigits >= 9 ? 'high' : 'medium'}">
                            ${item.matchingDigits}/10
                        </div>
                        <div class="sap-suggestion-info">
                            <div class="sap-suggestion-code">${this.highlightDifferences(this.lastScan.codigoSAP, item.codigo)}</div>
                            <div class="sap-suggestion-name">${item.nombre}</div>
                            <div class="sap-suggestion-qty">Stock: ${item.cantidad} unidades</div>
                        </div>
                        <div class="sap-suggestion-arrow">›</div>
                    </div>
                `).join('');
            }
        }
        
        // Configurar zoom de imagen
        this.setupImageZoom();
        
        modal.classList.add('active');
    }
    
    /**
     * 🆕 NUEVO: Resalta las diferencias entre código OCR y sugerido
     */
    highlightDifferences(ocrCode, suggestedCode) {
        if (!ocrCode || !suggestedCode) return suggestedCode;
        
        let result = '';
        const maxLen = Math.max(ocrCode.length, suggestedCode.length);
        
        for (let i = 0; i < maxLen; i++) {
            const ocrChar = ocrCode[i] || '';
            const sugChar = suggestedCode[i] || '';
            
            if (ocrChar !== sugChar) {
                // Diferente - resaltar en rojo
                result += `<span style="color: #ef4444; font-weight: 800; text-decoration: underline;">${sugChar}</span>`;
            } else {
                result += sugChar;
            }
        }
        
        return result;
    }
    
    /**
     * 🆕 MEJORADO v6.094: Pinch-to-zoom DENTRO del contenedor (prevenir visor fullscreen)
     */
    setupImageZoom() {
        const wrapper = document.getElementById('sapSuggestionsImageWrapper');
        const img = document.getElementById('sapSuggestionsImage');
        
        if (!wrapper || !img) return;
        
        // 🔒 FASE 1: PREVENIR completamente que cualquier listener global capture estos eventos
        // Usamos capture phase (true) para interceptar ANTES que otros listeners
        const preventGlobalListeners = (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
        };
        
        // Bloquear TODOS los eventos en la imagen para que solo el wrapper los maneje
        ['click', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseup', 'mousemove'].forEach(eventType => {
            img.addEventListener(eventType, preventGlobalListeners, { capture: true, passive: false });
            wrapper.addEventListener(eventType, (e) => {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }, { capture: true, passive: false });
        });
        
        // Estado del zoom/pan
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        
        // Para pinch-to-zoom
        let initialDistance = 0;
        let initialScale = 1;
        
        // Para pan (arrastrar)
        let isPanning = false;
        let lastTouchX = 0;
        let lastTouchY = 0;
        
        // Aplicar transform
        const applyTransform = () => {
            // Limitar escala entre 1x y 4x
            scale = Math.max(1, Math.min(4, scale));
            
            // Si escala = 1, resetear posición
            if (scale === 1) {
                translateX = 0;
                translateY = 0;
                wrapper.classList.remove('zoomed');
            } else {
                wrapper.classList.add('zoomed');
            }
            
            img.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        };
        
        // Calcular distancia entre dos toques
        const getDistance = (touch1, touch2) => {
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };
        
        // PINCH-TO-ZOOM (gestos táctiles)
        wrapper.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Dos dedos = pinch-to-zoom
                e.preventDefault();
                initialDistance = getDistance(e.touches[0], e.touches[1]);
                initialScale = scale;
            } else if (e.touches.length === 1 && scale > 1) {
                // Un dedo + zoom activo = pan
                isPanning = true;
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
            }
        }, { passive: false });
        
        wrapper.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && initialDistance > 0) {
                // Pinch zoom
                e.preventDefault();
                const currentDistance = getDistance(e.touches[0], e.touches[1]);
                const scaleChange = currentDistance / initialDistance;
                scale = initialScale * scaleChange;
                applyTransform();
            } else if (e.touches.length === 1 && isPanning && scale > 1) {
                // Pan (arrastrar)
                e.preventDefault();
                const deltaX = (e.touches[0].clientX - lastTouchX) / scale;
                const deltaY = (e.touches[0].clientY - lastTouchY) / scale;
                
                translateX += deltaX;
                translateY += deltaY;
                
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
                
                applyTransform();
            }
        }, { passive: false });
        
        wrapper.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                initialDistance = 0;
            }
            if (e.touches.length === 0) {
                isPanning = false;
            }
        });
        
        // DOBLE TAP para zoom rápido (fallback)
        let lastTap = 0;
        wrapper.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0 && e.touches.length === 0) {
                // Doble tap detectado
                if (scale === 1) {
                    scale = 2.5;
                    translateX = 0;
                    translateY = 0;
                } else {
                    scale = 1;
                    translateX = 0;
                    translateY = 0;
                }
                applyTransform();
                e.preventDefault();
            }
            lastTap = currentTime;
        });
        
        // MOUSE (para desktop)
        let isMouseDragging = false;
        let mouseStartX = 0;
        let mouseStartY = 0;
        
        wrapper.addEventListener('mousedown', (e) => {
            if (scale > 1) {
                isMouseDragging = true;
                mouseStartX = e.clientX;
                mouseStartY = e.clientY;
                wrapper.style.cursor = 'grabbing';
            }
        });
        
        wrapper.addEventListener('mousemove', (e) => {
            if (isMouseDragging && scale > 1) {
                const deltaX = (e.clientX - mouseStartX) / scale;
                const deltaY = (e.clientY - mouseStartY) / scale;
                
                translateX += deltaX;
                translateY += deltaY;
                
                mouseStartX = e.clientX;
                mouseStartY = e.clientY;
                
                applyTransform();
            }
        });
        
        wrapper.addEventListener('mouseup', () => {
            isMouseDragging = false;
            wrapper.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
        });
        
        // Click para toggle zoom (desktop)
        wrapper.addEventListener('click', (e) => {
            if (e.target === img && !isMouseDragging) {
                if (scale === 1) {
                    scale = 2;
                } else {
                    scale = 1;
                }
                translateX = 0;
                translateY = 0;
                applyTransform();
            }
        });
    }
    
    /**
     * 🆕 NUEVO: Selecciona un código sugerido
     */
    selectSuggestedCode(codigo) {
        console.log(`📸 Usuario seleccionó código sugerido: ${codigo}`);
        
        // Actualizar lastScan con el código seleccionado
        this.lastScan.codigoSAP = codigo;
        this.lastScan.similarCodes = []; // Limpiar sugerencias
        
        // Cerrar modal de sugerencias
        this.closeSuggestionsModal();
        
        // Continuar con el flujo normal
        this.showConfirmModal();
    }
    
    /**
     * 🆕 NUEVO: Busca con el código editado manualmente
     */
    searchEditedCode() {
        const input = document.getElementById('sapSuggestionsOcrInput');
        if (!input) return;
        
        const editedCode = input.value.trim().replace(/\D/g, ''); // Solo dígitos
        
        if (editedCode.length < 6) {
            this.showToast('El código debe tener al menos 6 dígitos', 'warning');
            return;
        }
        
        console.log(`📸 Buscando código editado: ${editedCode}`);
        
        // Actualizar el código en lastScan
        this.lastScan.codigoSAP = editedCode;
        
        // Buscar coincidencia exacta
        const exactMatch = window.app.repuestos.find(r => r.codSAP === editedCode);
        
        if (exactMatch) {
            // ¡Encontrado exacto!
            console.log(`📸 ¡Coincidencia exacta encontrada!`);
            this.lastScan.similarCodes = [];
            this.closeSuggestionsModal();
            this.showConfirmModal();
            return;
        }
        
        // Buscar códigos similares con el código editado
        const similarCodes = this.findSimilarCodes(editedCode);
        this.lastScan.similarCodes = similarCodes;
        
        // Re-poblar la lista
        const list = document.getElementById('sapSuggestionsList');
        if (list) {
            if (similarCodes.length === 0) {
                list.innerHTML = `
                    <div class="sap-suggestions-empty">
                        <div class="sap-suggestions-empty-icon">🔍</div>
                        <div>No se encontró "${editedCode}"</div>
                        <div style="font-size: 0.8rem; margin-top: 8px;">Puedes usar este código para crear un nuevo repuesto</div>
                    </div>
                `;
            } else {
                list.innerHTML = similarCodes.map((item) => `
                    <div class="sap-suggestion-item" onclick="window.sapScanner.selectSuggestedCode('${item.codigo}')">
                        <div class="sap-suggestion-match ${item.matchingDigits >= 9 ? 'high' : 'medium'}">
                            ${item.matchingDigits}/10
                        </div>
                        <div class="sap-suggestion-info">
                            <div class="sap-suggestion-code">${this.highlightDifferences(editedCode, item.codigo)}</div>
                            <div class="sap-suggestion-name">${item.nombre}</div>
                            <div class="sap-suggestion-qty">Stock: ${item.cantidad} unidades</div>
                        </div>
                        <div class="sap-suggestion-arrow">›</div>
                    </div>
                `).join('');
            }
        }
        
        this.showToast(`${similarCodes.length} códigos similares encontrados`, 'info');
    }
    
    /**
     * 🆕 NUEVO: Usa el código del input (editado o no)
     */
    useOcrCodeAsIs() {
        const input = document.getElementById('sapSuggestionsOcrInput');
        const codigo = input ? input.value.trim() : this.lastScan.codigoSAP;
        
        console.log(`📸 Usuario decidió usar código: ${codigo}`);
        
        // Actualizar con el código del input (puede haber sido editado)
        this.lastScan.codigoSAP = codigo;
        this.lastScan.similarCodes = [];
        
        // Cerrar modal
        this.closeSuggestionsModal();
        
        // Continuar con el flujo
        this.showConfirmModal();
    }
    
    /**
     * 🆕 NUEVO: Cierra modal de sugerencias
     */
    closeSuggestionsModal() {
        const modal = document.getElementById('sapSuggestionsModal');
        if (modal) modal.classList.remove('active');
        
        // Asegurar que la cámara esté detenida
        this.stopCamera();
    }
    
    /**
     * 🆕 NUEVO: Cierra modal de selección de modo
     */
    closeModeModal() {
        const modal = document.getElementById('sapModeModal');
        if (modal) modal.classList.remove('active');
        this.refreshMobileFooter();
        
        // Asegurar que la cámara esté detenida
        this.stopCamera();
    }
    
    /**
     * 🆕 NUEVO: Inicia escaneo con modo seleccionado
     */
    startScanWithMode(mode) {
        this.operationMode = mode;
        console.log(`📸 SAPScanner: Modo seleccionado: ${mode}`);
        
        // Cerrar modal de modo
        this.closeModeModal();
        
        // Abrir modal de captura
        this.openCaptureModalInternal();
    }
    
    /**
     * Abre el modal de captura con cámara (interno)
     */
    openCaptureModalInternal() {
        // Resetear estado
        this.imageReady = false;
        this.lastScan = {
            rawText: '',
            codigoSAP: '',
            descripcion: '',
            imageData: null,
            confidence: 0,
            similarCodes: [] // 🆕 Limpiar sugerencias anteriores
        };
        
        // Crear modal si no existe
        let modal = document.getElementById('sapScannerModal');
        if (!modal) {
            modal = this.createCaptureModal();
            document.body.appendChild(modal);
        }
        
        // Resetear UI del modal
        this.resetModalUI();
        
        modal.classList.add('active');
        this.startCamera();
    }
    
    /**
     * Resetea la UI del modal a estado inicial
    */
    resetModalUI() {
        const video = document.getElementById('sapScannerVideo');
        const previewWrapper = document.getElementById('sapScannerPreviewWrapper');
        const captureBtn = document.getElementById('sapScannerCaptureBtn');
        const analyzeBtn = document.getElementById('sapScannerAnalyzeBtn');
        const retryBtn = document.getElementById('sapScannerRetryBtn');
        const galleryBtn = document.getElementById('sapScannerGalleryBtn');
        const progressContainer = document.querySelector('.sap-scanner-progress-container');
        const guide = document.querySelector('.sap-scanner-guide');
        
        if (video) video.style.display = 'block';
        if (previewWrapper) previewWrapper.style.display = 'none';
        if (captureBtn) captureBtn.style.display = 'inline-flex';
        if (analyzeBtn) analyzeBtn.style.display = 'none';
        if (retryBtn) retryBtn.style.display = 'none';
        if (galleryBtn) galleryBtn.style.display = 'inline-flex';
        if (progressContainer) progressContainer.style.display = 'none';
        if (guide) guide.style.display = 'flex';
        
        // Asegurar que la animación de escaneo esté detenida
        this.stopScanAnimation();
    }
    
    /**
     * Crea el modal de captura
     */
    createCaptureModal() {
        const modal = document.createElement('div');
        modal.id = 'sapScannerModal';
        modal.className = 'sap-scanner-modal';
        
        modal.innerHTML = `
            <div class="sap-scanner-content">
                <div class="sap-scanner-header">
                    <h3>📸 Escanear Etiqueta SAP</h3>
                    <button class="sap-scanner-close" onclick="window.sapScanner.closeModal()">✕</button>
                </div>
                
                <div class="sap-scanner-camera-container">
                    <video id="sapScannerVideo" autoplay playsinline></video>
                    <canvas id="sapScannerCanvas" style="display:none;"></canvas>
                    
                    <!-- Guía de encuadre -->
                    <div class="sap-scanner-guide">
                        <div class="sap-scanner-guide-box">
                            <span class="guide-label">Centra la etiqueta aquí</span>
                        </div>
                    </div>
                    
                    <!-- Preview de imagen capturada con overlay de escaneo -->
                    <div id="sapScannerPreviewWrapper" class="sap-scanner-preview-wrapper" style="display:none; position:relative;">
                        <img id="sapScannerPreview" class="sap-scanner-preview" />
                        
                        <!-- Overlay de animación Google Lens -->
                        <div id="sapScannerOverlay" class="scan-overlay" style="display:none;">
                            <!-- Esquinas de enfoque -->
                            <div class="scan-corners scanning">
                                <div class="scan-corner tl"></div>
                                <div class="scan-corner tr"></div>
                                <div class="scan-corner bl"></div>
                                <div class="scan-corner br"></div>
                            </div>
                            
                            <!-- Línea de escaneo -->
                            <div class="scan-line"></div>
                            
                            <!-- Contenedor de puntos -->
                            <div id="sapScanDotsContainer" class="scan-dots-container"></div>
                            
                            <!-- Texto de estado -->
                            <div class="scan-status">
                                <div class="status-dot"></div>
                                <span id="sapScanStatusText">Analizando imagen...</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Barra de progreso -->
                <div class="sap-scanner-progress-container" style="display:none;">
                    <div class="sap-scanner-progress-bar">
                        <div id="sapScannerProgress" class="sap-scanner-progress-fill"></div>
                    </div>
                    <span id="sapScannerProgressText">Preparando...</span>
                </div>
                
                <!-- Controles - NUEVO: Separado en dos pasos -->
                <div class="sap-scanner-controls">
                    <!-- Paso 1: Capturar/Seleccionar -->
                    <button id="sapScannerCaptureBtn" class="sap-scanner-btn primary" onclick="window.sapScanner.captureImage()">
                        📷 Capturar
                    </button>
                    <button id="sapScannerGalleryBtn" class="sap-scanner-btn secondary" onclick="window.sapScanner.selectFromGallery()">
                        🖼️ Galería
                    </button>
                    
                    <!-- Paso 2: Analizar o Reintentar (después de captura) -->
                    <button id="sapScannerAnalyzeBtn" class="sap-scanner-btn primary" style="display:none;" onclick="window.sapScanner.analyzeImage()">
                        🔍 Analizar Imagen
                    </button>
                    <button id="sapScannerRetryBtn" class="sap-scanner-btn secondary" style="display:none;" onclick="window.sapScanner.retryCapture()">
                        🔄 Otra Foto
                    </button>
                </div>
                
                <!-- Input oculto para galería -->
                <input type="file" id="sapScannerFileInput" accept="image/*" style="display:none;" onchange="window.sapScanner.handleFileSelected(event)" />
                
                <!-- Instrucciones -->
                <div class="sap-scanner-instructions">
                    <p>💡 <strong>Tips para mejor lectura:</strong></p>
                    <ul>
                        <li>Buena iluminación (evita sombras)</li>
                        <li>Etiqueta lo más plana posible</li>
                        <li>Código SAP visible y nítido</li>
                    </ul>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    /**
     * Crea el modal de confirmación/edición
     */
    createConfirmModal() {
        const modal = document.createElement('div');
        modal.id = 'sapConfirmModal';
        modal.className = 'sap-scanner-modal';
        
        modal.innerHTML = `
            <div class="sap-scanner-content sap-confirm-content">
                <div class="sap-scanner-header">
                    <h3>✅ Datos Detectados</h3>
                    <button class="sap-scanner-close" onclick="window.sapScanner.closeConfirmModal()">✕</button>
                </div>
                
                <!-- Imagen escaneada (miniatura) -->
                <div class="sap-confirm-image">
                    <img id="sapConfirmThumb" src="" alt="Etiqueta escaneada" />
                </div>
                
                <!-- Confianza del escaneo -->
                <div class="sap-confirm-confidence">
                    <span id="sapConfirmConfidence">Confianza: --</span>
                </div>
                
                <!-- Formulario editable -->
                <form id="sapConfirmForm" class="sap-confirm-form">
                    <!-- 🏢 Contexto de jerarquía -->
                    <div class="sap-form-context" id="sapConfirmContext" style="display: none;">
                        <span class="context-icon">📍</span>
                        <span class="context-path">-</span>
                    </div>
                    
                    <div class="sap-form-group">
                        <label for="sapConfirmCodigo">Código SAP</label>
                        <input type="text" id="sapConfirmCodigo" placeholder="Ej: 3100028363" />
                        <span class="sap-form-hint" id="sapCodigoHint"></span>
                    </div>
                    
                    <div class="sap-form-group">
                        <label for="sapConfirmNombre">Descripción</label>
                        <input type="text" id="sapConfirmNombre" placeholder="Nombre del repuesto" />
                    </div>
                    
                    <div class="sap-form-group">
                        <label for="sapConfirmCantidad">Cantidad *</label>
                        <input type="number" id="sapConfirmCantidad" value="1" min="0" required />
                    </div>
                    
                    <!-- Texto crudo detectado (colapsable) -->
                    <details class="sap-raw-text">
                        <summary>Ver texto detectado completo</summary>
                        <pre id="sapConfirmRawText"></pre>
                    </details>
                </form>
                
                <!-- Acciones -->
                <div class="sap-confirm-actions">
                    <button type="button" class="sap-scanner-btn secondary" onclick="window.sapScanner.closeConfirmModal()">
                        Cancelar
                    </button>
                    <button type="button" class="sap-scanner-btn primary" onclick="window.sapScanner.createRepuesto()">
                        ✅ Crear Repuesto
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    /**
     * Inicia la cámara trasera
     */
    async startCamera() {
        const video = document.getElementById('sapScannerVideo');
        const preview = document.getElementById('sapScannerPreview');
        
        if (!video) return;
        
        // Ocultar preview, mostrar video
        if (preview) preview.style.display = 'none';
        video.style.display = 'block';
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Cámara trasera
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            
            video.srcObject = stream;
            this.currentStream = stream;
            console.log('📸 SAPScanner: Cámara iniciada');
            
        } catch (error) {
            console.error('📸 SAPScanner: Error accediendo a cámara:', error);
            this.showToast('No se pudo acceder a la cámara. Usa "Galería" para seleccionar una imagen.', 'warning');
        }
    }
    
    /**
     * Detiene la cámara
     */
    stopCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
    }
    
    /**
     * PASO 1a: Captura imagen de la cámara (sin procesar aún)
     */
    captureImage() {
        const video = document.getElementById('sapScannerVideo');
        const canvas = document.getElementById('sapScannerCanvas');
        
        if (!video || !canvas) return;
        
        // Capturar frame del video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Convertir a dataURL
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        
        // Guardar imagen
        this.lastScan.imageData = imageData;
        this.imageReady = true;
        
        // Mostrar preview
        this.showImagePreview(imageData);
        
        // Detener cámara para ahorrar batería
        this.stopCamera();
        
        console.log('📸 SAPScanner: Imagen capturada, esperando confirmación');
    }
    
    /**
     * Seleccionar imagen de galería
     */
    selectFromGallery() {
        const input = document.getElementById('sapScannerFileInput');
        if (input) {
            input.value = ''; // Reset para permitir seleccionar mismo archivo
            input.click();
        }
    }
    
    /**
     * PASO 1b: Maneja archivo seleccionado de galería (sin procesar aún)
     */
    handleFileSelected(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            
            // Guardar imagen
            this.lastScan.imageData = imageData;
            this.imageReady = true;
            
            // Mostrar preview
            this.showImagePreview(imageData);
            
            console.log('📸 SAPScanner: Imagen de galería cargada, esperando confirmación');
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * Muestra preview de imagen y botones de paso 2
     */
    showImagePreview(imageData) {
        const video = document.getElementById('sapScannerVideo');
        const previewWrapper = document.getElementById('sapScannerPreviewWrapper');
        const preview = document.getElementById('sapScannerPreview');
        const captureBtn = document.getElementById('sapScannerCaptureBtn');
        const galleryBtn = document.getElementById('sapScannerGalleryBtn');
        const analyzeBtn = document.getElementById('sapScannerAnalyzeBtn');
        const retryBtn = document.getElementById('sapScannerRetryBtn');
        const guide = document.querySelector('.sap-scanner-guide');
        
        // Mostrar preview con wrapper
        if (preview) {
            preview.src = imageData;
        }
        if (previewWrapper) {
            previewWrapper.style.display = 'block';
        }
        if (video) video.style.display = 'none';
        if (guide) guide.style.display = 'none';
        
        // Cambiar botones a paso 2
        if (captureBtn) captureBtn.style.display = 'none';
        if (galleryBtn) galleryBtn.style.display = 'none';
        if (analyzeBtn) analyzeBtn.style.display = 'inline-flex';
        if (retryBtn) retryBtn.style.display = 'inline-flex';
    }
    
    /**
     * PASO 2: Analizar imagen con OCR (después de confirmar)
     */
    async analyzeImage() {
        if (!this.imageReady || !this.lastScan.imageData) {
            this.showToast('No hay imagen para analizar', 'warning');
            return;
        }
        
        await this.processImage(this.lastScan.imageData);
    }
    
    /**
     * Procesa imagen con Tesseract OCR - VERSIÓN MEJORADA
     */
    async processImage(imageData) {
        console.log('📸 [DEBUG] processImage() INICIANDO - v1.5 mejorado');
        
        if (this.isProcessing) {
            console.log('📸 [DEBUG] Ya está procesando, saliendo');
            return;
        }
        this.isProcessing = true;
        
        // Mostrar progreso
        const progressContainer = document.querySelector('.sap-scanner-progress-container');
        const analyzeBtn = document.getElementById('sapScannerAnalyzeBtn');
        const retryBtn = document.getElementById('sapScannerRetryBtn');
        
        console.log('📸 [DEBUG] Elementos UI:', { progressContainer: !!progressContainer, analyzeBtn: !!analyzeBtn, retryBtn: !!retryBtn });
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (analyzeBtn) analyzeBtn.style.display = 'none';
        if (retryBtn) retryBtn.style.display = 'none';
        
        // 🔍 Iniciar animación de escaneo estilo Google Lens
        console.log('📸 [DEBUG] Iniciando animación de escaneo');
        this.startScanAnimation();
        
        try {
            // Inicializar Tesseract si no está listo
            if (!this.isReady) {
                console.log('📸 [DEBUG] Tesseract no listo, inicializando...');
                this.updateProgress(0);
                const progressText = document.getElementById('sapScannerProgressText');
                if (progressText) progressText.textContent = 'Cargando motor OCR (primera vez)...';
                this.updateScanStatus('Cargando motor OCR...');
                await this.init();
                console.log('📸 [DEBUG] Tesseract inicializado');
            }
            
            // 🖼️ PASO 1: Pre-procesar imagen para mejorar OCR
            this.updateScanStatus('Optimizando imagen...');
            const processedImage = await this.preprocessImage(imageData);
            this.lastScan.processedImageData = processedImage;
            
            // 🔍 PASO 2: OCR con múltiples intentos
            this.updateScanStatus('Detectando código SAP...');
            const ocrResult = await this.performMultiPassOCR(processedImage, imageData);
            
            console.log('📸 [DEBUG] OCR completado. Mejor resultado:', {
                text: ocrResult.text?.substring(0, 100),
                confidence: ocrResult.confidence,
                method: ocrResult.method
            });
            
            // Mostrar detección encontrada
            this.updateScanStatus('¡Código encontrado!');
            console.log('📸 [DEBUG] Mostrando caja de detección');
            await this.showDetectionBox(ocrResult);
            
            // Extraer datos
            this.lastScan.rawText = ocrResult.text;
            this.lastScan.confidence = Math.round(ocrResult.confidence);
            
            // 🧠 PASO 3: Parsear con inteligencia mejorada
            console.log('📸 [DEBUG] Parseando texto extraído con mejoras');
            this.parseExtractedTextEnhanced(ocrResult.text);
            console.log('📸 [DEBUG] Datos parseados:', {
                codigoSAP: this.lastScan.codigoSAP,
                descripcion: this.lastScan.descripcion
            });
            
            // Pequeña pausa para que se vea la animación de éxito
            console.log('📸 [DEBUG] Pausa de 500ms para animación');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Detener animación
            console.log('📸 [DEBUG] Deteniendo animación');
            this.stopScanAnimation();
            
            // Mostrar modal de confirmación
            console.log('📸 [DEBUG] Llamando a showConfirmModal()');
            this.showConfirmModal();
            console.log('📸 [DEBUG] showConfirmModal() completado');
            
        } catch (error) {
            console.error('📸 [DEBUG] ERROR en OCR:', error);
            console.error('📸 [DEBUG] Stack:', error.stack);
            this.stopScanAnimation();
            this.showToast('Error procesando imagen. Intenta de nuevo.', 'error');
            
            // Mostrar botón de reintentar
            if (analyzeBtn) analyzeBtn.style.display = 'inline-flex';
            if (retryBtn) retryBtn.style.display = 'inline-flex';
            
        } finally {
            this.isProcessing = false;
            if (progressContainer) progressContainer.style.display = 'none';
            console.log('📸 [DEBUG] processImage() TERMINADO');
        }
    }
    
    /**
     * 🖼️ Pre-procesa la imagen para mejorar OCR
     * - Convierte a escala de grises
     * - Aumenta contraste
     * - Aplica binarización adaptativa
     */
    async preprocessImage(imageData) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Escalar si es muy grande (mejora velocidad)
                let width = img.width;
                let height = img.height;
                const maxSize = 1500;
                
                if (width > maxSize || height > maxSize) {
                    const scale = maxSize / Math.max(width, height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Obtener datos de imagen
                const imageDataObj = ctx.getImageData(0, 0, width, height);
                const data = imageDataObj.data;
                
                // 1. Convertir a escala de grises y aumentar contraste
                for (let i = 0; i < data.length; i += 4) {
                    // Escala de grises ponderada (mejor para texto)
                    let gray = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
                    
                    // Aumentar contraste (factor 1.5)
                    gray = ((gray - 128) * 1.5) + 128;
                    gray = Math.max(0, Math.min(255, gray));
                    
                    // Binarización con umbral adaptativo
                    // Usar umbral más agresivo para etiquetas industriales
                    const threshold = 140;
                    gray = gray > threshold ? 255 : 0;
                    
                    data[i] = data[i+1] = data[i+2] = gray;
                }
                
                ctx.putImageData(imageDataObj, 0, 0);
                
                // Devolver como base64
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = imageData;
        });
    }
    
    /**
     * 🔄 Ejecuta OCR múltiples veces con diferentes configuraciones
     * y devuelve el mejor resultado
     */
    async performMultiPassOCR(processedImage, originalImage) {
        const results = [];
        
        // INTENTO 1: Imagen pre-procesada (binarizada)
        console.log('📸 OCR Intento 1: Imagen binarizada');
        try {
            const result1 = await this.worker.recognize(processedImage);
            results.push({
                text: result1.data.text,
                confidence: result1.data.confidence,
                method: 'binarizada',
                words: result1.data.words || []
            });
            console.log(`📸 Resultado 1: ${result1.data.confidence}% confianza`);
        } catch (e) {
            console.warn('📸 Error en intento 1:', e.message);
        }
        
        // INTENTO 2: Imagen original (a veces funciona mejor)
        console.log('📸 OCR Intento 2: Imagen original');
        try {
            const result2 = await this.worker.recognize(originalImage);
            results.push({
                text: result2.data.text,
                confidence: result2.data.confidence,
                method: 'original',
                words: result2.data.words || []
            });
            console.log(`📸 Resultado 2: ${result2.data.confidence}% confianza`);
        } catch (e) {
            console.warn('📸 Error en intento 2:', e.message);
        }
        
        // Elegir el mejor resultado basado en:
        // 1. ¿Encontró un código SAP válido?
        // 2. Confianza general
        let bestResult = results[0] || { text: '', confidence: 0, method: 'none' };
        
        for (const result of results) {
            const hasSAPCode = this.findSAPCodeInText(result.text);
            const bestHasSAPCode = this.findSAPCodeInText(bestResult.text);
            
            // Priorizar el que encontró código SAP
            if (hasSAPCode && !bestHasSAPCode) {
                bestResult = result;
            } else if (hasSAPCode === bestHasSAPCode && result.confidence > bestResult.confidence) {
                bestResult = result;
            }
        }
        
        console.log(`📸 Mejor resultado: ${bestResult.method} con ${bestResult.confidence}%`);
        return bestResult;
    }
    
    /**
     * 🔍 Busca código SAP en texto (retorna true/false)
     */
    findSAPCodeInText(text) {
        if (!text) return false;
        return this.patterns.codigoSAP.test(text) || this.patterns.codigoAlt.test(text);
    }
    
    /**
     * 🔍 Inicia la animación de escaneo estilo Google Lens
     */
    startScanAnimation() {
        const overlay = document.getElementById('sapScannerOverlay');
        const dotsContainer = document.getElementById('sapScanDotsContainer');
        
        if (overlay) {
            overlay.style.display = 'block';
        }
        
        // Generar puntos aleatorios animados
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            this.scanDotsInterval = setInterval(() => {
                this.generateScanDots(dotsContainer);
            }, 300);
            
            // Generar primera tanda
            this.generateScanDots(dotsContainer);
        }
    }
    
    /**
     * 🔍 Genera puntos de escaneo aleatorios
     */
    generateScanDots(container) {
        // Limpiar puntos anteriores con fade out
        const oldDots = container.querySelectorAll('.scan-dot');
        oldDots.forEach(dot => {
            dot.style.opacity = '0';
            setTimeout(() => dot.remove(), 200);
        });
        
        // Generar 8-12 puntos nuevos
        const numDots = 8 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('div');
            dot.className = 'scan-dot';
            
            // Posición aleatoria
            const x = Math.random() * 90 + 5; // 5-95%
            const y = Math.random() * 80 + 10; // 10-90%
            dot.style.left = `${x}%`;
            dot.style.top = `${y}%`;
            
            // Delay aleatorio para la animación
            dot.style.animationDelay = `${Math.random() * 0.5}s`;
            
            // Color alternativo para algunos puntos
            if (Math.random() > 0.7) {
                const colors = ['#34a853', '#fbbc04', '#ea4335'];
                dot.style.background = colors[Math.floor(Math.random() * colors.length)];
                dot.style.boxShadow = `0 0 10px ${dot.style.background}`;
            }
            
            container.appendChild(dot);
            
            // Activar con pequeño delay
            setTimeout(() => {
                dot.classList.add('active');
            }, 50 + i * 30);
        }
    }
    
    /**
     * 🔍 Actualiza el texto de estado del escaneo
     */
    updateScanStatus(text) {
        const statusText = document.getElementById('sapScanStatusText');
        if (statusText) {
            statusText.textContent = text;
        }
    }
    
    /**
     * 🔍 Muestra una caja de detección cuando se encuentra texto
     */
    async showDetectionBox(ocrData) {
        const overlay = document.getElementById('sapScannerOverlay');
        if (!overlay) return;
        
        // Detener generación de puntos
        if (this.scanDotsInterval) {
            clearInterval(this.scanDotsInterval);
            this.scanDotsInterval = null;
        }
        
        // Limpiar puntos
        const dotsContainer = document.getElementById('sapScanDotsContainer');
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
        }
        
        // Crear caja de detección simulada (centrada ya que no tenemos coordenadas exactas)
        const box = document.createElement('div');
        box.className = 'detection-box';
        box.style.left = '15%';
        box.style.top = '25%';
        box.style.width = '70%';
        box.style.height = '50%';
        
        // Etiqueta
        const label = document.createElement('div');
        label.className = 'detection-label';
        label.textContent = `Texto detectado (${Math.round(ocrData.confidence)}%)`;
        box.appendChild(label);
        
        overlay.appendChild(box);
        
        // Animar entrada
        await new Promise(resolve => setTimeout(resolve, 50));
        box.classList.add('found');
        
        // Cambiar esquinas a verde
        const corners = overlay.querySelectorAll('.scan-corner');
        corners.forEach(corner => {
            corner.style.borderColor = '#34a853';
        });
    }
    
    /**
     * 🔍 Detiene la animación de escaneo
     */
    stopScanAnimation() {
        const overlay = document.getElementById('sapScannerOverlay');
        
        if (this.scanDotsInterval) {
            clearInterval(this.scanDotsInterval);
            this.scanDotsInterval = null;
        }
        
        if (overlay) {
            overlay.style.display = 'none';
            
            // Limpiar elementos de detección
            const detectionBox = overlay.querySelector('.detection-box');
            if (detectionBox) detectionBox.remove();
            
            // Resetear esquinas
            const corners = overlay.querySelectorAll('.scan-corner');
            corners.forEach(corner => {
                corner.style.borderColor = '';
            });
            
            // Limpiar puntos
            const dotsContainer = document.getElementById('sapScanDotsContainer');
            if (dotsContainer) dotsContainer.innerHTML = '';
        }
    }
    
    /**
     * Extrae código SAP y descripción del texto - VERSIÓN MEJORADA
     * Con corrección de errores OCR y validación contra existentes
     */
    parseExtractedTextEnhanced(text) {
        console.log('📸 SAPScanner: Parseando texto (mejorado):', text);
        
        // Limpiar texto
        const cleanText = text.replace(this.patterns.cleanText, ' ').trim();
        const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // 🔍 PASO 1: Buscar código SAP con múltiples estrategias
        let codigoSAP = this.extractSAPCode(text);
        
        // 🧠 PASO 2: Si no encontró, intentar con corrección OCR
        if (!codigoSAP) {
            codigoSAP = this.extractSAPCodeWithCorrection(text);
        }
        
        // 🔎 PASO 3: Validar contra códigos existentes (fuzzy match)
        if (codigoSAP) {
            const validatedCode = this.validateAgainstExisting(codigoSAP);
            if (validatedCode) {
                console.log(`📸 Código validado: ${codigoSAP} → ${validatedCode}`);
                codigoSAP = validatedCode;
            }
        }
        
        // 📝 PASO 4: Buscar descripción
        let descripcion = this.extractDescription(lines, codigoSAP);
        
        this.lastScan.codigoSAP = codigoSAP;
        this.lastScan.descripcion = descripcion;
        
        console.log('📸 SAPScanner: Datos extraídos (mejorado):', {
            codigoSAP,
            descripcion,
            confidence: this.lastScan.confidence
        });
    }
    
    /**
     * Extrae código SAP del texto
     */
    extractSAPCode(text) {
        // Estrategia 1: Patrón exacto (10 dígitos empezando con 2 o 3)
        const sapMatches = text.match(this.patterns.codigoSAP);
        if (sapMatches && sapMatches.length > 0) {
            return sapMatches[0];
        }
        
        // Estrategia 2: Cualquier secuencia de 8-12 dígitos
        const altMatches = text.match(this.patterns.codigoAlt);
        if (altMatches && altMatches.length > 0) {
            // Priorizar los de 10 dígitos
            const tenDigit = altMatches.find(m => m.length === 10);
            if (tenDigit) return tenDigit;
            
            // Si no, tomar el más largo
            return altMatches.sort((a, b) => b.length - a.length)[0];
        }
        
        return '';
    }
    
    /**
     * 🔧 Intenta extraer código SAP corrigiendo errores OCR comunes
     */
    extractSAPCodeWithCorrection(text) {
        // Buscar secuencias que podrían ser códigos con errores
        const fuzzyMatches = text.match(this.patterns.codigoFuzzy);
        
        if (!fuzzyMatches || fuzzyMatches.length === 0) return '';
        
        for (const match of fuzzyMatches) {
            // Aplicar correcciones
            let corrected = '';
            for (const char of match) {
                corrected += this.ocrCorrections[char] || char;
            }
            
            // Verificar si ahora es un código válido
            if (/^[23][0-9]{9}$/.test(corrected)) {
                console.log(`📸 Código corregido: "${match}" → "${corrected}"`);
                return corrected;
            }
            
            // También aceptar 8-12 dígitos
            if (/^[0-9]{8,12}$/.test(corrected)) {
                console.log(`📸 Código corregido (alt): "${match}" → "${corrected}"`);
                return corrected;
            }
        }
        
        return '';
    }
    
    /**
     * 🔎 Valida código contra repuestos existentes (fuzzy match)
     * MODIFICADO: Ya no auto-selecciona, guarda candidatos para asistencia humana
     */
    validateAgainstExisting(codigo) {
        if (!window.app || !window.app.repuestos || !codigo) return null;
        
        // Buscar coincidencia exacta primero
        const exactMatch = window.app.repuestos.find(r => r.codSAP === codigo);
        if (exactMatch) {
            this.lastScan.similarCodes = []; // Limpiar si hay match exacto
            return codigo;
        }
        
        // 🆕 Buscar códigos similares para asistencia humana
        const similarCodes = this.findSimilarCodes(codigo);
        this.lastScan.similarCodes = similarCodes;
        
        if (similarCodes.length > 0) {
            console.log(`📸 ${similarCodes.length} códigos similares encontrados para asistencia humana`);
            similarCodes.forEach((c, i) => {
                console.log(`   ${i+1}. ${c.codigo} (${c.matchingDigits} dígitos coinciden) - "${c.nombre}"`);
            });
        }
        
        // No auto-seleccionar, dejar que el usuario elija
        return null;
    }
    
    /**
     * 🆕 NUEVO: Busca códigos similares con al menos 6 dígitos coincidentes
     * Retorna hasta 3 candidatos ordenados por similitud
     */
    findSimilarCodes(codigo) {
        if (!window.app || !window.app.repuestos || !codigo) return [];
        
        const candidates = [];
        const codigoDigits = codigo.replace(/\D/g, ''); // Solo dígitos
        
        for (const repuesto of window.app.repuestos) {
            if (!repuesto.codSAP) continue;
            
            const repuestoDigits = repuesto.codSAP.replace(/\D/g, '');
            if (repuestoDigits.length < 6) continue;
            
            // Contar dígitos que coinciden en la misma posición
            let matchingDigits = 0;
            const minLen = Math.min(codigoDigits.length, repuestoDigits.length);
            
            for (let i = 0; i < minLen; i++) {
                if (codigoDigits[i] === repuestoDigits[i]) {
                    matchingDigits++;
                }
            }
            
            // 🎯 Mínimo 7 dígitos coincidentes (de 10) - hasta 3 posibles errores
            if (matchingDigits >= 7) {
                candidates.push({
                    codigo: repuesto.codSAP,
                    nombre: repuesto.nombre || repuesto.descripcion || 'Sin nombre',
                    cantidad: repuesto.cantidad || 0,
                    matchingDigits,
                    similarity: matchingDigits / Math.max(codigoDigits.length, repuestoDigits.length),
                    repuesto: repuesto // Referencia completa
                });
            }
        }
        
        // Ordenar por dígitos coincidentes (desc) y tomar máximo 8
        return candidates
            .sort((a, b) => b.matchingDigits - a.matchingDigits)
            .slice(0, 8);
    }
    
    /**
     * 📊 Calcula similitud entre dos strings (0-1)
     */
    calculateSimilarity(str1, str2) {
        if (str1 === str2) return 1;
        if (!str1 || !str2) return 0;
        
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1;
        
        // Contar caracteres coincidentes en posición
        let matches = 0;
        for (let i = 0; i < shorter.length; i++) {
            if (shorter[i] === longer[i]) matches++;
        }
        
        return matches / longer.length;
    }
    
    /**
     * 📝 Extrae descripción del texto
     */
    extractDescription(lines, codigoSAP) {
        let descripcion = '';
        
        for (const line of lines) {
            // Saltar líneas que son solo el código
            if (line === codigoSAP) continue;
            // Saltar líneas muy cortas o que parecen basura
            if (line.length < 3) continue;
            // Saltar líneas que son solo números
            if (/^\d+$/.test(line)) continue;
            // Saltar si contiene el código SAP
            if (codigoSAP && line.includes(codigoSAP)) continue;
            
            // Agregar a descripción
            if (descripcion) {
                descripcion += ' ' + line;
            } else {
                descripcion = line;
            }
            
            // Limitar longitud
            if (descripcion.length > 100) break;
        }
        
        // Limpiar descripción
        return descripcion
            .replace(/\s+/g, ' ')
            .replace(/^[^a-zA-Z]+/, '') // Quitar caracteres iniciales no-letra
            .trim()
            .toUpperCase();
    }
    
    /**
     * Extrae código SAP y descripción del texto (LEGACY - mantener por compatibilidad)
     */
    parseExtractedText(text) {
        // Usar la versión mejorada
        this.parseExtractedTextEnhanced(text);
    }
    
    /**
     * 🆕 ACTUALIZADO: Muestra modal según modo y estado del repuesto
     * Lógica inteligente con validación redundante
     * NUEVO: Muestra sugerencias si hay códigos similares pero no exactos
     */
    showConfirmModal() {
        console.log('📸 [DEBUG] showConfirmModal() INICIANDO');
        
        // Cerrar modal de captura
        console.log('📸 [DEBUG] Cerrando modal de captura');
        this.closeModal(false);
        
        // Buscar si el repuesto ya existe
        const codigoSAP = this.lastScan.codigoSAP;
        const repuestoExistente = this.findRepuestoByCodigo(codigoSAP);
        const similarCodes = this.lastScan.similarCodes || [];
        
        console.log('📸 [DEBUG] Estado actual:', {
            operationMode: this.operationMode,
            codigoSAP: codigoSAP,
            repuestoExistente: !!repuestoExistente,
            similarCodes: similarCodes.length,
            lastScan: this.lastScan
        });
        
        // 🆕 NUEVO: Si no hay match exacto pero hay códigos similares, mostrar sugerencias
        if (!repuestoExistente && similarCodes.length > 0) {
            console.log('📸 [DEBUG] No hay match exacto pero hay sugerencias -> showSuggestionsModal()');
            this.stopCamera(); // 🔥 DETENER CÁMARA antes de abrir modal
            this.showSuggestionsModal();
            return;
        }
        
        // 🎯 LÓGICA INTELIGENTE
        if (this.operationMode === 'count') {
            console.log('📸 [DEBUG] Modo CONTAR');
            // Usuario quiere CONTAR
            if (repuestoExistente) {
                // ✅ Escenario ideal: existe y quiere contar
                console.log('📸 [DEBUG] Repuesto existe -> showCountModal()');
                this.showCountModal(repuestoExistente);
            } else {
                // ⚠️ Discrepancia: quiere contar pero NO existe
                console.log('📸 [DEBUG] Repuesto NO existe -> showDiscrepancyModal()');
                this.showDiscrepancyModal('count-not-found', codigoSAP);
            }
        } else if (this.operationMode === 'add') {
            console.log('📸 [DEBUG] Modo AGREGAR');
            // Usuario quiere AGREGAR
            if (repuestoExistente) {
                // ⚠️ Discrepancia: quiere agregar pero YA existe
                console.log('📸 [DEBUG] Repuesto YA existe -> showDiscrepancyModal()');
                this.showDiscrepancyModal('add-exists', codigoSAP, repuestoExistente);
            } else {
                // ✅ Escenario ideal: no existe y quiere agregar
                console.log('📸 [DEBUG] Repuesto NO existe -> showAddModal()');
                this.showAddModal();
            }
        } else {
            // Sin modo definido (fallback)
            console.log('📸 [DEBUG] Sin modo definido -> showAddModal() (fallback)');
            this.showAddModal();
        }
        
        console.log('📸 [DEBUG] showConfirmModal() TERMINADO');
    }
    
    /**
     * 🆕 NUEVO: Busca repuesto por código SAP
     */
    findRepuestoByCodigo(codigo) {
        console.log('📸 [DEBUG] findRepuestoByCodigo:', codigo);
        if (!codigo || !window.app || !window.app.repuestos) {
            console.log('📸 [DEBUG] No hay código o no hay repuestos');
            return null;
        }
        const found = window.app.repuestos.find(r => r.codSAP === codigo);
        console.log('📸 [DEBUG] Encontrado:', found ? found.nombre : 'NO');
        return found;
    }
    
    /**
     * 🆕 NUEVO: Modal de CONTEO rápido MEJORADO
     */
    showCountModal(repuesto) {
        let modal = document.getElementById('sapCountModal');
        if (!modal) {
            modal = this.createCountModal();
            document.body.appendChild(modal);
        }
        
        // Guardar referencia al repuesto
        this.countingRepuesto = repuesto;
        this.originalCount = repuesto.cantidad || 0;
        this.newCountValue = this.originalCount;
        
        // Poblar datos
        const thumb = document.getElementById('sapCountThumb');
        const name = document.getElementById('sapCountName');
        const code = document.getElementById('sapCountCode');
        const value = document.getElementById('sapCountValue');
        const original = document.getElementById('sapCountOriginal');
        const stockBadge = document.getElementById('sapCountStockBadge');
        
        // Usar imagen del escaneo o del repuesto
        if (thumb) {
            if (this.lastScan.imageData) {
                thumb.src = this.lastScan.imageData;
            } else if (repuesto.multimedia && repuesto.multimedia[0]) {
                thumb.src = repuesto.multimedia[0].url || repuesto.multimedia[0];
            } else {
                thumb.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="40">📦</text></svg>';
            }
        }
        
        if (name) name.textContent = repuesto.nombre || repuesto.descripcion || 'Sin nombre';
        if (code) code.textContent = `SAP: ${repuesto.codSAP || 'N/A'}`;
        if (value) value.textContent = this.newCountValue;
        if (original) original.textContent = this.originalCount;
        
        // Color del badge según stock
        if (stockBadge) {
            const minimo = repuesto.minimo || 0;
            if (this.originalCount === 0) {
                stockBadge.className = 'sap-count-stock-badge critical';
            } else if (this.originalCount <= minimo && minimo > 0) {
                stockBadge.className = 'sap-count-stock-badge warning';
            } else {
                stockBadge.className = 'sap-count-stock-badge';
            }
        }
        
        // Actualizar diff
        this.updateCountDisplay();
        
        modal.classList.add('active');
    }
    
    /**
     * 🆕 NUEVO: Crear modal de conteo MEJORADO
     */
    createCountModal() {
        const modal = document.createElement('div');
        modal.id = 'sapCountModal';
        modal.className = 'sap-scanner-modal';
        
        modal.innerHTML = `
            <div class="sap-scanner-content sap-count-content">
                <div class="sap-scanner-header">
                    <h3>🔢 Actualizar Cantidad</h3>
                    <button type="button" class="sap-scanner-close" onclick="window.sapScanner.closeCountModal()">✕</button>
                </div>
                
                <!-- Info del repuesto con imagen escaneada -->
                <div class="sap-count-item">
                    <img id="sapCountThumb" class="sap-count-thumb" src="" alt="" onclick="window.sapScanner.zoomCountImage()" />
                    <div class="sap-count-info">
                        <div id="sapCountName" class="sap-count-name">-</div>
                        <div id="sapCountCode" class="sap-count-code">-</div>
                        <div class="sap-count-stock-badge" id="sapCountStockBadge">
                            Stock actual: <span id="sapCountOriginal">0</span>
                        </div>
                    </div>
                </div>
                
                <!-- Display grande de cantidad -->
                <div class="sap-count-display">
                    <div class="sap-count-display-label">Nueva cantidad</div>
                    <div class="sap-count-display-value" id="sapCountValue">0</div>
                    <div class="sap-count-display-diff" id="sapCountDiff"></div>
                </div>
                
                <!-- Botones de ajuste rápido -->
                <div class="sap-count-quick-btns">
                    <button type="button" class="sap-quick-btn" onclick="window.sapScanner.adjustCount(-10)">-10</button>
                    <button type="button" class="sap-quick-btn" onclick="window.sapScanner.adjustCount(-5)">-5</button>
                    <button type="button" class="sap-quick-btn minus-big" onclick="window.sapScanner.adjustCount(-1)">−</button>
                    <button type="button" class="sap-quick-btn plus-big" onclick="window.sapScanner.adjustCount(+1)">+</button>
                    <button type="button" class="sap-quick-btn" onclick="window.sapScanner.adjustCount(+5)">+5</button>
                    <button type="button" class="sap-quick-btn" onclick="window.sapScanner.adjustCount(+10)">+10</button>
                </div>
                
                <!-- Teclado numérico -->
                <div class="sap-count-numpad">
                    <button type="button" onclick="window.sapScanner.appendDigit(1)">1</button>
                    <button type="button" onclick="window.sapScanner.appendDigit(2)">2</button>
                    <button type="button" onclick="window.sapScanner.appendDigit(3)">3</button>
                    <button type="button" onclick="window.sapScanner.appendDigit(4)">4</button>
                    <button type="button" onclick="window.sapScanner.appendDigit(5)">5</button>
                    <button type="button" onclick="window.sapScanner.appendDigit(6)">6</button>
                    <button type="button" onclick="window.sapScanner.appendDigit(7)">7</button>
                    <button type="button" onclick="window.sapScanner.appendDigit(8)">8</button>
                    <button type="button" onclick="window.sapScanner.appendDigit(9)">9</button>
                    <button type="button" class="numpad-clear" onclick="window.sapScanner.clearCount()">C</button>
                    <button type="button" onclick="window.sapScanner.appendDigit(0)">0</button>
                    <button type="button" class="numpad-back" onclick="window.sapScanner.backspaceCount()">⌫</button>
                </div>
                
                <!-- Acciones -->
                <div class="sap-confirm-actions">
                    <button type="button" class="sap-scanner-btn secondary" onclick="window.sapScanner.closeCountModal()">
                        Cancelar
                    </button>
                    <button type="button" class="sap-scanner-btn primary" onclick="window.sapScanner.saveCount()">
                        ✅ Guardar
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    /**
     * 🆕 NUEVO: Ajustar cantidad (+/- delta)
     */
    adjustCount(delta) {
        this.newCountValue = Math.max(0, this.newCountValue + delta);
        this.updateCountDisplay();
    }
    
    /**
     * 🆕 NUEVO: Agregar dígito al contador (teclado numérico)
     */
    appendDigit(digit) {
        const current = String(this.newCountValue);
        if (current === '0') {
            this.newCountValue = digit;
        } else if (current.length < 5) { // Máximo 99999
            this.newCountValue = parseInt(current + digit);
        }
        this.updateCountDisplay();
    }
    
    /**
     * 🆕 NUEVO: Limpiar contador
     */
    clearCount() {
        this.newCountValue = 0;
        this.updateCountDisplay();
    }
    
    /**
     * 🆕 NUEVO: Borrar último dígito
     */
    backspaceCount() {
        const current = String(this.newCountValue);
        if (current.length > 1) {
            this.newCountValue = parseInt(current.slice(0, -1));
        } else {
            this.newCountValue = 0;
        }
        this.updateCountDisplay();
    }
    
    /**
     * 🆕 NUEVO: Actualizar display de cantidad con diferencia
     */
    updateCountDisplay() {
        const value = document.getElementById('sapCountValue');
        const diff = document.getElementById('sapCountDiff');
        
        if (value) value.textContent = this.newCountValue;
        
        // Mostrar diferencia
        if (diff && this.countingRepuesto) {
            const original = this.countingRepuesto.cantidad || 0;
            const delta = this.newCountValue - original;
            
            if (delta > 0) {
                diff.textContent = `+${delta}`;
                diff.className = 'sap-count-display-diff positive';
            } else if (delta < 0) {
                diff.textContent = `${delta}`;
                diff.className = 'sap-count-display-diff negative';
            } else {
                diff.textContent = 'Sin cambios';
                diff.className = 'sap-count-display-diff';
            }
        }
    }
    
    /**
     * 🆕 NUEVO: Zoom de imagen en conteo (reutiliza el de verification si existe)
     */
    zoomCountImage() {
        const thumb = document.getElementById('sapCountThumb');
        if (!thumb || !thumb.src) return;
        
        // Usar el mismo modal de zoom
        if (window.repuestoVerification?.openImageZoom) {
            // Temporalmente cambiar la imagen
            const verifyImg = document.getElementById('verifyImage');
            if (verifyImg) {
                const originalSrc = verifyImg.src;
                verifyImg.src = thumb.src;
                window.repuestoVerification.openImageZoom();
                // Restaurar después
                setTimeout(() => { verifyImg.src = originalSrc; }, 100);
            }
        } else {
            // Fallback: abrir en nueva ventana
            window.open(thumb.src, '_blank');
        }
    }
    
    /**
     * 🆕 NUEVO: Guardar el conteo
     */
    async saveCount() {
        if (!this.countingRepuesto) return;
        
        const oldValue = this.countingRepuesto.cantidad || 0;
        const newValue = this.newCountValue;
        
        // Actualizar repuesto
        this.countingRepuesto.cantidad = newValue;
        this.countingRepuesto.ultimoConteo = new Date().toISOString();
        this.countingRepuesto.ultimaModificacion = new Date().toISOString();
        
        // Guardar localmente
        if (window.app && window.app.saveData) {
            await window.app.saveData();
        }
        
        // 🔥 SINCRONIZACIÓN CON FIREBASE: Guardar conteo en Firestore
        if (window.firebaseStorageAdapter && window.firebaseStorageAdapter.guardarRepuestos) {
            try {
                console.log('🔥 [FIREBASE] Sincronizando conteo...');
                await window.firebaseStorageAdapter.guardarRepuestos([this.countingRepuesto]);
                console.log('✅ [FIREBASE] Conteo sincronizado');
            } catch (firebaseError) {
                console.error('❌ [FIREBASE] Error sincronizando conteo:', firebaseError);
            }
        }
        
        // 📋 ACTIVITY LOG: Registrar la acción
        if (window.firebaseService && window.firebaseService.logActivity) {
            await window.firebaseService.logActivity('count', 'repuesto', this.countingRepuesto.id, this.countingRepuesto.nombre, {
                oldValue,
                newValue,
                diff: newValue - oldValue,
                source: 'sap-scanner'
            });
        }
        
        // Actualizar UI
        if (window.app && window.app.render) {
            await window.app.render();
        }
        
        // Cerrar modal
        this.closeCountModal();
        
        // Mostrar feedback
        const diff = newValue - oldValue;
        const diffText = diff > 0 ? `+${diff}` : diff.toString();
        this.showToast(`✅ Conteo actualizado: ${oldValue} → ${newValue} (${diffText})`, 'success');
        
        console.log(`📸 SAPScanner: Conteo guardado - ${this.countingRepuesto.codSAP}: ${oldValue} → ${newValue}`);
        
        // Limpiar
        this.countingRepuesto = null;
        this.newCountValue = 0;
    }
    
    /**
     * 🆕 NUEVO: Cerrar modal de conteo
     */
    closeCountModal() {
        const modal = document.getElementById('sapCountModal');
        if (modal) modal.classList.remove('active');
        this.refreshMobileFooter();
    }
    
    /**
     * 🆕 NUEVO: Modal de DISCREPANCIA - con campo editable
     */
    showDiscrepancyModal(type, codigo, repuesto = null) {
        let modal = document.getElementById('sapDiscrepancyModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'sapDiscrepancyModal';
            modal.className = 'sap-scanner-modal';
            document.body.appendChild(modal);
        }
        
        let content = '';
        
        if (type === 'count-not-found') {
            // Quería contar pero no existe - CON CAMPO EDITABLE
            content = `
                <div class="sap-scanner-content" style="width: 94vw; max-width: 400px; padding: 16px;">
                    <div class="sap-scanner-header">
                        <h3>⚠️ No Encontrado</h3>
                        <button type="button" class="sap-scanner-close" onclick="window.sapScanner.closeDiscrepancyModal()">✕</button>
                    </div>
                    
                    <!-- Imagen escaneada pequeña -->
                    ${this.lastScan.imageData ? `
                    <div style="text-align: center; margin-bottom: 10px;">
                        <img src="${this.lastScan.imageData}" style="max-height: 100px; max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color);" />
                    </div>
                    ` : ''}
                    
                    <div class="sap-discrepancy-alert" style="margin-bottom: 12px;">
                        <div class="sap-discrepancy-icon">🔍</div>
                        <div class="sap-discrepancy-text">
                            <div class="sap-discrepancy-title">Código no registrado</div>
                            <div class="sap-discrepancy-desc">
                                Puedes corregir el código y buscar de nuevo.
                            </div>
                        </div>
                    </div>
                    
                    <!-- Campo editable para corregir código -->
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px;">
                            ✏️ Código detectado (editable):
                        </label>
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="sapDiscrepancyCodeInput" 
                                   value="${codigo || ''}"
                                   style="flex: 1; font-family: monospace; font-size: 1.2rem; font-weight: 700; 
                                          letter-spacing: 2px; padding: 10px; text-align: center;
                                          border: 2px solid var(--accent); border-radius: 8px;
                                          background: var(--bg-primary); color: var(--text-primary);"
                                   maxlength="12" inputmode="numeric" pattern="[0-9]*" />
                        </div>
                        <button type="button" onclick="window.sapScanner.searchFromDiscrepancy()" 
                                style="width: 100%; margin-top: 8px; padding: 10px; 
                                       background: var(--accent); color: white; border: none; 
                                       border-radius: 8px; font-weight: 600; cursor: pointer;">
                            🔍 Buscar código corregido
                        </button>
                    </div>
                    
                    <div class="sap-discrepancy-actions" style="display: flex; gap: 8px;">
                        <button type="button" class="sap-scanner-btn secondary" style="flex: 1;" onclick="window.sapScanner.closeDiscrepancyModal()">
                            Cancelar
                        </button>
                        <button type="button" class="sap-scanner-btn primary" style="flex: 1;" onclick="window.sapScanner.switchToAddMode()">
                            📦 Agregar Nuevo
                        </button>
                    </div>
                </div>
            `;
        } else if (type === 'add-exists') {
            // Quería agregar pero ya existe
            content = `
                <div class="sap-scanner-content" style="max-width: 380px; padding: 24px;">
                    <div class="sap-scanner-header">
                        <h3>⚠️ Repuesto Ya Existe</h3>
                        <button type="button" class="sap-scanner-close" onclick="window.sapScanner.closeDiscrepancyModal()">✕</button>
                    </div>
                    
                    <div class="sap-count-item">
                        <img class="sap-count-thumb" src="${repuesto?.multimedia?.[0]?.url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="40">📦</text></svg>'}" alt="" />
                        <div class="sap-count-info">
                            <div class="sap-count-name">${repuesto?.nombre || 'Sin nombre'}</div>
                            <div class="sap-count-code">SAP: ${repuesto?.codSAP || 'N/A'} • Cant: ${repuesto?.cantidad || 0}</div>
                        </div>
                    </div>
                    
                    <div class="sap-discrepancy-alert">
                        <div class="sap-discrepancy-icon">📋</div>
                        <div class="sap-discrepancy-text">
                            <div class="sap-discrepancy-title">Este repuesto ya está registrado</div>
                            <div class="sap-discrepancy-desc">
                                ¿Deseas actualizar su cantidad (contar) o ver su ficha completa?
                            </div>
                        </div>
                    </div>
                    
                    <div class="sap-discrepancy-actions">
                        <button type="button" class="sap-scanner-btn secondary" onclick="window.sapScanner.viewRepuesto('${repuesto?.id}')">
                            👁️ Ver Ficha
                        </button>
                        <button type="button" class="sap-scanner-btn primary" onclick="window.sapScanner.switchToCountMode('${repuesto?.id}')">
                            🔢 Contar
                        </button>
                    </div>
                </div>
            `;
        }
        
        modal.innerHTML = content;
        modal.classList.add('active');
    }
    
    /**
     * 🆕 NUEVO: Cerrar modal de discrepancia
     */
    closeDiscrepancyModal() {
        const modal = document.getElementById('sapDiscrepancyModal');
        if (modal) modal.classList.remove('active');
        this.refreshMobileFooter();
    }
    
    /**
     * 🆕 NUEVO: Buscar código editado desde modal de discrepancia
     */
    searchFromDiscrepancy() {
        const input = document.getElementById('sapDiscrepancyCodeInput');
        if (!input) return;
        
        const editedCode = input.value.trim().replace(/\D/g, '');
        
        if (editedCode.length < 6) {
            this.showToast('El código debe tener al menos 6 dígitos', 'warning');
            return;
        }
        
        console.log(`📸 Buscando código corregido desde discrepancia: ${editedCode}`);
        
        // Actualizar código en lastScan
        this.lastScan.codigoSAP = editedCode;
        
        // Buscar coincidencia exacta
        const exactMatch = window.app.repuestos.find(r => r.codSAP === editedCode);
        
        if (exactMatch) {
            console.log(`📸 ¡Coincidencia exacta encontrada!`);
            this.closeDiscrepancyModal();
            
            // Según el modo, mostrar modal correcto
            if (this.operationMode === 'count') {
                this.showCountModal(exactMatch);
            } else {
                this.showDiscrepancyModal('add-exists', editedCode, exactMatch);
            }
            return;
        }
        
        // Buscar similares
        const similarCodes = this.findSimilarCodes(editedCode);
        
        if (similarCodes.length > 0) {
            this.lastScan.similarCodes = similarCodes;
            this.closeDiscrepancyModal();
            this.showSuggestionsModal();
        } else {
            this.showToast(`No se encontró "${editedCode}" ni códigos similares`, 'warning');
        }
    }
    
    /**
     * 🆕 NUEVO: Cambiar a modo agregar
     */
    switchToAddMode() {
        // Usar el código del input si existe
        const input = document.getElementById('sapDiscrepancyCodeInput');
        if (input) {
            this.lastScan.codigoSAP = input.value.trim();
        }
        
        this.closeDiscrepancyModal();
        this.operationMode = 'add';
        this.showAddModal();
    }
    
    /**
     * 🆕 NUEVO: Cambiar a modo contar
     */
    switchToCountMode(repuestoId) {
        this.closeDiscrepancyModal();
        this.operationMode = 'count';
        const repuesto = window.app?.repuestos?.find(r => r.id === repuestoId);
        if (repuesto) {
            this.showCountModal(repuesto);
        }
    }
    
    /**
     * 🆕 NUEVO: Ver ficha del repuesto
     */
    viewRepuesto(repuestoId) {
        this.closeDiscrepancyModal();
        if (window.app && window.app.openModal) {
            window.app.openModal('view', repuestoId);
        }
    }
    
    /**
     * 🆕 NUEVO: Mostrar modal de agregar (flujo normal)
     */
    showAddModal() {
        console.log('📸 [DEBUG] showAddModal() INICIANDO');
        
        // Usar el nuevo módulo de verificación si está disponible
        console.log('📸 [DEBUG] window.repuestoVerification:', !!window.repuestoVerification);
        
        if (window.repuestoVerification) {
            console.log('📸 [DEBUG] Llamando repuestoVerification.startVerification() con:', {
                imageData: !!this.lastScan.imageData,
                codigoSAP: this.lastScan.codigoSAP,
                descripcion: this.lastScan.descripcion,
                confidence: this.lastScan.confidence
            });
            
            window.repuestoVerification.startVerification({
                imageData: this.lastScan.imageData,
                codigoSAP: this.lastScan.codigoSAP,
                descripcion: this.lastScan.descripcion,
                rawText: this.lastScan.rawText,
                confidence: this.lastScan.confidence
            });
            
            console.log('📸 [DEBUG] startVerification() LLAMADO');
            return;
        }
        
        // Fallback al modal simple
        console.log('📸 [DEBUG] No hay repuestoVerification, usando showSimpleConfirmModal()');
        this.showSimpleConfirmModal();
    }
    
    /**
     * Modal simple de confirmación (fallback)
     */
    showSimpleConfirmModal() {
        // Crear modal de confirmación si no existe
        let modal = document.getElementById('sapConfirmModal');
        if (!modal) {
            modal = this.createConfirmModal();
            document.body.appendChild(modal);
        }
        
        // Poblar datos
        document.getElementById('sapConfirmCodigo').value = this.lastScan.codigoSAP || '';
        document.getElementById('sapConfirmNombre').value = this.lastScan.descripcion || '';
        document.getElementById('sapConfirmCantidad').value = '1';
        document.getElementById('sapConfirmRawText').textContent = this.lastScan.rawText || '(No se detectó texto)';
        document.getElementById('sapConfirmThumb').src = this.lastScan.imageData || '';
        
        // Mostrar confianza
        const confidence = this.lastScan.confidence;
        const confEl = document.getElementById('sapConfirmConfidence');
        if (confEl) {
            let confClass = 'low';
            if (confidence >= 80) confClass = 'high';
            else if (confidence >= 60) confClass = 'medium';
            
            confEl.textContent = `Confianza: ${confidence}%`;
            confEl.className = `sap-confirm-confidence ${confClass}`;
        }
        
        // 🏢 Mostrar contexto de jerarquía si existe
        const jerarquiaContext = window.getJerarquiaContext ? window.getJerarquiaContext() : null;
        const contextEl = document.getElementById('sapConfirmContext');
        if (contextEl) {
            if (jerarquiaContext && jerarquiaContext.ubicacion) {
                contextEl.innerHTML = `<span class="context-icon">📍</span> ${jerarquiaContext.ubicacion}`;
                contextEl.style.display = 'flex';
            } else {
                contextEl.style.display = 'none';
            }
        }
        
        // Verificar si código ya existe
        this.checkExistingCode(this.lastScan.codigoSAP);
        
        modal.classList.add('active');
    }
    
    /**
     * Verifica si el código SAP ya existe en la base de datos
     */
    checkExistingCode(codigo) {
        const hint = document.getElementById('sapCodigoHint');
        if (!hint || !codigo) {
            if (hint) hint.textContent = '';
            return;
        }
        
        // Buscar en repuestos existentes
        if (window.app && window.app.repuestos) {
            const existente = window.app.repuestos.find(r => r.codSAP === codigo);
            if (existente) {
                hint.textContent = `⚠️ Ya existe: "${existente.nombre}"`;
                hint.style.color = '#f97316';
            } else {
                hint.textContent = '✅ Código nuevo';
                hint.style.color = '#22c55e';
            }
        }
    }
    
    /**
     * Reintentar captura - vuelve al paso 1
     */
    retryCapture() {
        this.imageReady = false;
        this.lastScan.imageData = null;
        
        this.resetModalUI();
        this.startCamera();
    }
    
    /**
     * Cierra modal de captura
     */
    closeModal(stopCam = true) {
        const modal = document.getElementById('sapScannerModal');
        if (modal) modal.classList.remove('active');
        
        if (stopCam) this.stopCamera();
        
        // 🔥 FIX: Re-renderizar footer móvil al cerrar
        this.refreshMobileFooter();
    }
    
    /**
     * Cierra modal de confirmación
     */
    closeConfirmModal() {
        const modal = document.getElementById('sapConfirmModal');
        if (modal) modal.classList.remove('active');
        
        // 🔥 FIX: Re-renderizar footer móvil al cerrar
        this.refreshMobileFooter();
    }
    
    /**
     * 🔥 FIX: Re-renderiza el footer móvil
     */
    refreshMobileFooter() {
        setTimeout(() => {
            if (window.renderMobileFooter && window.mobileFooterState) {
                window.renderMobileFooter(window.mobileFooterState.currentContext || 'inventario');
                console.log('📸 SAPScanner: Footer móvil re-renderizado');
            }
        }, 100);
    }
    
    /**
     * Crea el repuesto con los datos escaneados
     */
    async createRepuesto() {
        const codigoSAP = document.getElementById('sapConfirmCodigo')?.value?.trim() || '';
        const nombre = document.getElementById('sapConfirmNombre')?.value?.trim() || '';
        const cantidad = parseInt(document.getElementById('sapConfirmCantidad')?.value) || 0;
        
        if (!nombre) {
            this.showToast('Debes ingresar un nombre para el repuesto', 'warning');
            return;
        }
        
        // Mostrar loading
        const createBtn = document.querySelector('.sap-confirm-actions .sap-scanner-btn.primary');
        const originalText = createBtn?.textContent || '';
        if (createBtn) {
            createBtn.textContent = '⏳ Creando...';
            createBtn.disabled = true;
        }
        
        try {
            // 🏢 Obtener contexto de jerarquía si existe
            const jerarquiaContext = window.getJerarquiaContext ? window.getJerarquiaContext() : null;
            console.log('📸 Contexto de jerarquía:', jerarquiaContext);
            
            // Crear objeto repuesto
            const nuevoRepuesto = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                codSAP: codigoSAP,
                codProv: '',
                nombre: nombre,
                tipo: '',
                categoria: '',
                cantidad: cantidad,
                cantidadInstalada: 0,
                minimo: 5,
                optimo: 10,
                precio: 0,
                datosTecnicos: '',
                ubicaciones: [],
                planta: window.app?.plantaBase || 'Planta Principal',
                // 🏢 Usar contexto de jerarquía si está disponible
                areaGeneral: jerarquiaContext?.area || '',
                subArea: '',
                sistemaEquipo: '',
                subSistema: '',
                seccion: '',
                detalle: jerarquiaContext?.ubicacion || '',
                multimedia: [],
                marcadorMapaId: null,
                ultimaModificacion: new Date().toISOString(),
                ultimoConteo: null,
                creadoPorScanner: true, // Marca especial
                creadoDesdeJerarquia: jerarquiaContext ? true : false
            };
            
            // Si hay imagen escaneada, agregarla como multimedia
            if (this.lastScan.imageData) {
                // Convertir dataURL a blob
                const response = await fetch(this.lastScan.imageData);
                const blob = await response.blob();
                
                // Subir a Firebase si está disponible
                if (window.firebaseImageStorage && window.firebaseImageStorage.isReady()) {
                    console.log('📸 SAPScanner: Subiendo imagen a Firebase...');
                    
                    // 🆕 Contar repuestos para generar índice
                    const repuestoIndex = (window.app?.repuestos?.length || 0) + 1;
                    
                    const uploadResult = await window.firebaseImageStorage.uploadRepuestoImage(
                        blob,
                        nuevoRepuesto.id,
                        `etiqueta_sap_${codigoSAP || 'sin_codigo'}.webp`,
                        null, // onProgress
                        { // 🆕 Info para nombre de carpeta amigable
                            codSAP: codigoSAP,
                            nombre: nombre,
                            index: repuestoIndex
                        }
                    );
                    
                    if (uploadResult.success) {
                        nuevoRepuesto.multimedia = [{
                            type: 'image',
                            url: uploadResult.url,
                            isFirebaseStorage: true
                        }];
                        console.log('📸 SAPScanner: Imagen subida a Firebase');
                    }
                }
            }
            
            // Agregar a la lista de repuestos
            if (window.app && window.app.repuestos) {
                window.app.repuestos.unshift(nuevoRepuesto);
                
                // Guardar localmente
                if (window.app.saveData) {
                    await window.app.saveData();
                }
                
                // 🔥 SINCRONIZACIÓN CON FIREBASE: Guardar repuesto en Firestore
                console.log('🔍 [DEBUG] Verificando firebaseStorageAdapter:', {
                    exists: !!window.firebaseStorageAdapter,
                    hasGuardar: !!window.firebaseStorageAdapter?.guardarRepuestos,
                    isAuthenticated: window.firebaseService?.isAuthenticated?.()
                });
                
                if (window.firebaseStorageAdapter && window.firebaseStorageAdapter.guardarRepuestos) {
                    try {
                        console.log('🔥 [FIREBASE] Sincronizando nuevo repuesto desde Scanner:', nuevoRepuesto.nombre);
                        await window.firebaseStorageAdapter.guardarRepuestos([nuevoRepuesto]);
                        console.log('✅ [FIREBASE] Repuesto sincronizado con Firestore:', nuevoRepuesto.id);
                    } catch (firebaseError) {
                        console.error('❌ [FIREBASE] Error sincronizando:', firebaseError);
                        // Mostrar alerta al usuario
                        alert('⚠️ Error al sincronizar con Firebase: ' + firebaseError.message);
                    }
                } else {
                    console.warn('⚠️ [FIREBASE] firebaseStorageAdapter NO disponible - repuesto solo guardado localmente');
                }
                
                // 📋 ACTIVITY LOG: Registrar la acción
                if (window.firebaseService && window.firebaseService.logActivity) {
                    await window.firebaseService.logActivity('create', 'repuesto', nuevoRepuesto.id, nuevoRepuesto.nombre, {
                        codSAP: nuevoRepuesto.codSAP,
                        cantidad: nuevoRepuesto.cantidad,
                        source: 'sap-scanner'
                    });
                }
                
                // Actualizar UI
                if (window.app.render) {
                    await window.app.render();
                }
                if (window.app.renderFilters) {
                    window.app.renderFilters();
                }
                
                console.log('📸 SAPScanner: Repuesto agregado al inventario:', nuevoRepuesto);
            }
            
            // Cerrar modal
            this.closeConfirmModal();
            
            // 🔥 MEJORADO: Mostrar éxito más visible
            this.showSuccessMessage(nombre, codigoSAP, cantidad);
            
            // Limpiar estado
            this.lastScan = {
                rawText: '',
                codigoSAP: '',
                descripcion: '',
                imageData: null,
                confidence: 0
            };
            this.imageReady = false;
            
            // 🏢 Limpiar contexto de jerarquía
            if (window.clearScanContext) {
                window.clearScanContext();
            }
            
        } catch (error) {
            console.error('📸 SAPScanner: Error creando repuesto:', error);
            this.showToast('Error al crear repuesto. Revisa la consola.', 'error');
        } finally {
            // Restaurar botón
            if (createBtn) {
                createBtn.textContent = originalText;
                createBtn.disabled = false;
            }
        }
    }
    
    /**
     * 🔥 NUEVO: Muestra mensaje de éxito más visible
     */
    showSuccessMessage(nombre, codigo, cantidad) {
        // Crear overlay de éxito
        const overlay = document.createElement('div');
        overlay.className = 'sap-success-overlay';
        overlay.innerHTML = `
            <div class="sap-success-content">
                <div class="sap-success-icon">✅</div>
                <h3>¡Repuesto Creado!</h3>
                <p class="sap-success-name">${nombre}</p>
                ${codigo ? `<p class="sap-success-code">SAP: ${codigo}</p>` : ''}
                <p class="sap-success-qty">Cantidad: ${cantidad}</p>
                <button class="sap-scanner-btn primary" onclick="this.parentElement.parentElement.remove()">
                    Aceptar
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Auto-cerrar después de 3 segundos
        setTimeout(() => {
            if (overlay.parentElement) {
                overlay.remove();
            }
        }, 3000);
    }
    
    /**
     * Muestra toast de notificación
     */
    showToast(message, type = 'info') {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            alert(message);
        }
    }
    
    /**
     * Limpieza al destruir
     */
    destroy() {
        this.stopCamera();
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.isReady = false;
    }
}

// Crear instancia global
window.sapScanner = new SAPScanner();

console.log('📸 SAP Scanner Module v1.1 cargado - window.sapScanner disponible');
