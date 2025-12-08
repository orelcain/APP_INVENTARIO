/**
 * 📸 SAP Label Scanner Module v1.2
 * Escanea etiquetas SAP usando OCR (Tesseract.js) para crear o contar repuestos
 * 
 * @version 1.2.0
 * @requires Tesseract.js (CDN)
 * 
 * CAMBIOS v1.2:
 * - NUEVO: Modal inicial con opciones "Agregar" o "Contar"
 * - NUEVO: Detección inteligente si repuesto ya existe
 * - NUEVO: Flujo de conteo rápido (+1, -1, cantidad específica)
 * - Validación redundante: usuario elige + sistema verifica
 */

class SAPScanner {
    constructor() {
        this.isReady = false;
        this.worker = null;
        this.isProcessing = false;
        
        // 🆕 Modo de operación: 'add' o 'count'
        this.operationMode = null;
        
        // Patrones de extracción SAP
        this.patterns = {
            // Código SAP: 10 dígitos, típicamente empieza con 3 o 2
            codigoSAP: /\b[23][0-9]{9}\b/g,
            // Código alternativo: 8-12 dígitos
            codigoAlt: /\b[0-9]{8,12}\b/g,
            // Limpiar caracteres extraños del OCR
            cleanText: /[^\w\sáéíóúñÁÉÍÓÚÑ.,\-\/()#°"']/g
        };
        
        // Estado del escaneo
        this.lastScan = {
            rawText: '',
            codigoSAP: '',
            descripcion: '',
            imageData: null,
            confidence: 0
        };
        
        // Estado de la UI
        this.imageReady = false;
        
        console.log('📸 SAPScanner v1.2: Módulo inicializado');
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
            
            /* Modal de conteo rápido */
            .sap-count-content {
                max-width: 380px;
                padding: 24px;
            }
            
            .sap-count-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                background: var(--bg-secondary);
                border-radius: 12px;
                margin: 16px 0;
            }
            
            .sap-count-thumb {
                width: 64px;
                height: 64px;
                border-radius: 8px;
                object-fit: cover;
                background: var(--bg-tertiary);
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
            }
            
            .sap-count-code {
                font-size: 0.8rem;
                color: var(--text-secondary);
            }
            
            .sap-count-current {
                text-align: center;
                padding: 16px;
                background: var(--bg-tertiary);
                border-radius: 12px;
                margin: 16px 0;
            }
            
            .sap-count-current-label {
                font-size: 0.8rem;
                color: var(--text-secondary);
                margin-bottom: 4px;
            }
            
            .sap-count-current-value {
                font-size: 2.5rem;
                font-weight: 700;
                color: var(--accent);
            }
            
            .sap-count-buttons {
                display: flex;
                gap: 12px;
                justify-content: center;
                margin: 20px 0;
            }
            
            .sap-count-btn {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                border: 2px solid var(--border-color);
                background: var(--bg-secondary);
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .sap-count-btn:hover {
                transform: scale(1.1);
            }
            
            .sap-count-btn.minus {
                color: #ef4444;
            }
            .sap-count-btn.minus:hover {
                background: rgba(239,68,68,0.1);
                border-color: #ef4444;
            }
            
            .sap-count-btn.plus {
                color: #22c55e;
            }
            .sap-count-btn.plus:hover {
                background: rgba(34,197,94,0.1);
                border-color: #22c55e;
            }
            
            .sap-count-manual {
                display: flex;
                gap: 12px;
                align-items: center;
                justify-content: center;
                margin-top: 16px;
            }
            
            .sap-count-manual input {
                width: 80px;
                text-align: center;
                font-size: 1.25rem;
                padding: 8px;
                border-radius: 8px;
                border: 2px solid var(--border-color);
                background: var(--bg-primary);
                color: var(--text-primary);
            }
            
            .sap-count-manual .sap-scanner-btn {
                padding: 8px 16px;
            }
            
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
        `;
        document.head.appendChild(styles);
    }
    
    /**
     * 🆕 NUEVO: Cierra modal de selección de modo
     */
    closeModeModal() {
        const modal = document.getElementById('sapModeModal');
        if (modal) modal.classList.remove('active');
        this.refreshMobileFooter();
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
            confidence: 0
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
        const preview = document.getElementById('sapScannerPreview');
        const captureBtn = document.getElementById('sapScannerCaptureBtn');
        const analyzeBtn = document.getElementById('sapScannerAnalyzeBtn');
        const retryBtn = document.getElementById('sapScannerRetryBtn');
        const galleryBtn = document.getElementById('sapScannerGalleryBtn');
        const progressContainer = document.querySelector('.sap-scanner-progress-container');
        const guide = document.querySelector('.sap-scanner-guide');
        
        if (video) video.style.display = 'block';
        if (preview) preview.style.display = 'none';
        if (captureBtn) captureBtn.style.display = 'inline-flex';
        if (analyzeBtn) analyzeBtn.style.display = 'none';
        if (retryBtn) retryBtn.style.display = 'none';
        if (galleryBtn) galleryBtn.style.display = 'inline-flex';
        if (progressContainer) progressContainer.style.display = 'none';
        if (guide) guide.style.display = 'flex';
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
                    
                    <!-- Preview de imagen capturada -->
                    <img id="sapScannerPreview" class="sap-scanner-preview" style="display:none;" />
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
        const preview = document.getElementById('sapScannerPreview');
        
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
        const preview = document.getElementById('sapScannerPreview');
        const captureBtn = document.getElementById('sapScannerCaptureBtn');
        const galleryBtn = document.getElementById('sapScannerGalleryBtn');
        const analyzeBtn = document.getElementById('sapScannerAnalyzeBtn');
        const retryBtn = document.getElementById('sapScannerRetryBtn');
        const guide = document.querySelector('.sap-scanner-guide');
        
        // Mostrar preview
        if (preview) {
            preview.src = imageData;
            preview.style.display = 'block';
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
     * Procesa imagen con Tesseract OCR
     */
    async processImage(imageData) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        // Mostrar progreso
        const progressContainer = document.querySelector('.sap-scanner-progress-container');
        const analyzeBtn = document.getElementById('sapScannerAnalyzeBtn');
        const retryBtn = document.getElementById('sapScannerRetryBtn');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (analyzeBtn) analyzeBtn.style.display = 'none';
        if (retryBtn) retryBtn.style.display = 'none';
        
        try {
            // Inicializar Tesseract si no está listo
            if (!this.isReady) {
                this.updateProgress(0);
                const progressText = document.getElementById('sapScannerProgressText');
                if (progressText) progressText.textContent = 'Cargando motor OCR (primera vez)...';
                await this.init();
            }
            
            // Ejecutar OCR
            console.log('📸 SAPScanner: Procesando imagen...');
            const result = await this.worker.recognize(imageData);
            
            console.log('📸 SAPScanner: OCR completado:', result);
            
            // Extraer datos
            this.lastScan.rawText = result.data.text;
            this.lastScan.confidence = Math.round(result.data.confidence);
            
            // Parsear datos SAP
            this.parseExtractedText(result.data.text);
            
            // Mostrar modal de confirmación
            this.showConfirmModal();
            
        } catch (error) {
            console.error('📸 SAPScanner: Error en OCR:', error);
            this.showToast('Error procesando imagen. Intenta de nuevo.', 'error');
            
            // Mostrar botón de reintentar
            if (analyzeBtn) analyzeBtn.style.display = 'inline-flex';
            if (retryBtn) retryBtn.style.display = 'inline-flex';
            
        } finally {
            this.isProcessing = false;
            if (progressContainer) progressContainer.style.display = 'none';
        }
    }
    
    /**
     * Extrae código SAP y descripción del texto
     */
    parseExtractedText(text) {
        console.log('📸 SAPScanner: Parseando texto:', text);
        
        // Limpiar texto
        const cleanText = text.replace(this.patterns.cleanText, ' ').trim();
        const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Buscar código SAP (10 dígitos, empieza con 3 o 2)
        let codigoSAP = '';
        const sapMatches = text.match(this.patterns.codigoSAP);
        if (sapMatches && sapMatches.length > 0) {
            codigoSAP = sapMatches[0];
        } else {
            // Intentar patrón alternativo
            const altMatches = text.match(this.patterns.codigoAlt);
            if (altMatches && altMatches.length > 0) {
                // Tomar el más largo que parezca código SAP
                codigoSAP = altMatches.sort((a, b) => b.length - a.length)[0];
            }
        }
        
        // Buscar descripción (líneas que no son el código)
        let descripcion = '';
        for (const line of lines) {
            // Saltar líneas que son solo el código
            if (line === codigoSAP) continue;
            // Saltar líneas muy cortas o que parecen basura
            if (line.length < 3) continue;
            // Saltar líneas que son solo números
            if (/^\d+$/.test(line)) continue;
            
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
        descripcion = descripcion
            .replace(/\s+/g, ' ')
            .replace(/^[^a-zA-Z]+/, '') // Quitar caracteres iniciales no-letra
            .trim()
            .toUpperCase();
        
        this.lastScan.codigoSAP = codigoSAP;
        this.lastScan.descripcion = descripcion;
        
        console.log('📸 SAPScanner: Datos extraídos:', {
            codigoSAP,
            descripcion,
            confidence: this.lastScan.confidence
        });
    }
    
    /**
     * 🆕 ACTUALIZADO: Muestra modal según modo y estado del repuesto
     * Lógica inteligente con validación redundante
     */
    showConfirmModal() {
        // Cerrar modal de captura
        this.closeModal(false);
        
        // Buscar si el repuesto ya existe
        const codigoSAP = this.lastScan.codigoSAP;
        const repuestoExistente = this.findRepuestoByCodigo(codigoSAP);
        
        console.log(`📸 SAPScanner: Modo=${this.operationMode}, Código=${codigoSAP}, Existe=${!!repuestoExistente}`);
        
        // 🎯 LÓGICA INTELIGENTE
        if (this.operationMode === 'count') {
            // Usuario quiere CONTAR
            if (repuestoExistente) {
                // ✅ Escenario ideal: existe y quiere contar
                this.showCountModal(repuestoExistente);
            } else {
                // ⚠️ Discrepancia: quiere contar pero NO existe
                this.showDiscrepancyModal('count-not-found', codigoSAP);
            }
        } else if (this.operationMode === 'add') {
            // Usuario quiere AGREGAR
            if (repuestoExistente) {
                // ⚠️ Discrepancia: quiere agregar pero YA existe
                this.showDiscrepancyModal('add-exists', codigoSAP, repuestoExistente);
            } else {
                // ✅ Escenario ideal: no existe y quiere agregar
                this.showAddModal();
            }
        } else {
            // Sin modo definido (fallback)
            this.showAddModal();
        }
    }
    
    /**
     * 🆕 NUEVO: Busca repuesto por código SAP
     */
    findRepuestoByCodigo(codigo) {
        if (!codigo || !window.app || !window.app.repuestos) return null;
        return window.app.repuestos.find(r => r.codSAP === codigo);
    }
    
    /**
     * 🆕 NUEVO: Modal de CONTEO rápido
     */
    showCountModal(repuesto) {
        let modal = document.getElementById('sapCountModal');
        if (!modal) {
            modal = this.createCountModal();
            document.body.appendChild(modal);
        }
        
        // Guardar referencia al repuesto
        this.countingRepuesto = repuesto;
        this.newCountValue = repuesto.cantidad || 0;
        
        // Poblar datos
        const thumb = document.getElementById('sapCountThumb');
        const name = document.getElementById('sapCountName');
        const code = document.getElementById('sapCountCode');
        const value = document.getElementById('sapCountValue');
        const input = document.getElementById('sapCountInput');
        
        // Usar imagen del escaneo o placeholder
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
        if (input) input.value = this.newCountValue;
        
        modal.classList.add('active');
    }
    
    /**
     * 🆕 NUEVO: Crear modal de conteo
     */
    createCountModal() {
        const modal = document.createElement('div');
        modal.id = 'sapCountModal';
        modal.className = 'sap-scanner-modal';
        
        modal.innerHTML = `
            <div class="sap-scanner-content sap-count-content">
                <div class="sap-scanner-header">
                    <h3>🔢 Contar Repuesto</h3>
                    <button type="button" class="sap-scanner-close" onclick="window.sapScanner.closeCountModal()">✕</button>
                </div>
                
                <div class="sap-count-item">
                    <img id="sapCountThumb" class="sap-count-thumb" src="" alt="" />
                    <div class="sap-count-info">
                        <div id="sapCountName" class="sap-count-name">-</div>
                        <div id="sapCountCode" class="sap-count-code">-</div>
                    </div>
                </div>
                
                <div class="sap-count-current">
                    <div class="sap-count-current-label">Cantidad Actual</div>
                    <div id="sapCountValue" class="sap-count-current-value">0</div>
                </div>
                
                <div class="sap-count-buttons">
                    <button type="button" class="sap-count-btn minus" onclick="window.sapScanner.adjustCount(-1)">−</button>
                    <button type="button" class="sap-count-btn plus" onclick="window.sapScanner.adjustCount(+1)">+</button>
                </div>
                
                <div class="sap-count-manual">
                    <input type="number" id="sapCountInput" min="0" value="0" />
                    <button type="button" class="sap-scanner-btn secondary" onclick="window.sapScanner.setManualCount()">
                        Establecer
                    </button>
                </div>
                
                <div class="sap-confirm-actions">
                    <button type="button" class="sap-scanner-btn secondary" onclick="window.sapScanner.closeCountModal()">
                        Cancelar
                    </button>
                    <button type="button" class="sap-scanner-btn primary" onclick="window.sapScanner.saveCount()">
                        ✅ Guardar Conteo
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    /**
     * 🆕 NUEVO: Ajustar cantidad (+1 o -1)
     */
    adjustCount(delta) {
        this.newCountValue = Math.max(0, this.newCountValue + delta);
        this.updateCountDisplay();
    }
    
    /**
     * 🆕 NUEVO: Establecer cantidad manual
     */
    setManualCount() {
        const input = document.getElementById('sapCountInput');
        if (input) {
            this.newCountValue = Math.max(0, parseInt(input.value) || 0);
            this.updateCountDisplay();
        }
    }
    
    /**
     * 🆕 NUEVO: Actualizar display de cantidad
     */
    updateCountDisplay() {
        const value = document.getElementById('sapCountValue');
        const input = document.getElementById('sapCountInput');
        if (value) value.textContent = this.newCountValue;
        if (input) input.value = this.newCountValue;
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
        
        // Guardar
        if (window.app && window.app.saveData) {
            await window.app.saveData();
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
     * 🆕 NUEVO: Modal de DISCREPANCIA
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
            // Quería contar pero no existe
            content = `
                <div class="sap-scanner-content" style="max-width: 380px; padding: 24px;">
                    <div class="sap-scanner-header">
                        <h3>⚠️ Repuesto No Encontrado</h3>
                        <button type="button" class="sap-scanner-close" onclick="window.sapScanner.closeDiscrepancyModal()">✕</button>
                    </div>
                    
                    <div class="sap-discrepancy-alert">
                        <div class="sap-discrepancy-icon">🔍</div>
                        <div class="sap-discrepancy-text">
                            <div class="sap-discrepancy-title">No existe en el inventario</div>
                            <div class="sap-discrepancy-desc">
                                El código <strong>${codigo || 'detectado'}</strong> no está registrado. 
                                ¿Deseas agregarlo primero?
                            </div>
                        </div>
                    </div>
                    
                    <div class="sap-discrepancy-actions">
                        <button type="button" class="sap-scanner-btn secondary" onclick="window.sapScanner.closeDiscrepancyModal()">
                            Cancelar
                        </button>
                        <button type="button" class="sap-scanner-btn primary" onclick="window.sapScanner.switchToAddMode()">
                            📦 Agregar Repuesto
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
     * 🆕 NUEVO: Cambiar a modo agregar
     */
    switchToAddMode() {
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
        // Usar el nuevo módulo de verificación si está disponible
        if (window.repuestoVerification) {
            window.repuestoVerification.startVerification({
                imageData: this.lastScan.imageData,
                codigoSAP: this.lastScan.codigoSAP,
                descripcion: this.lastScan.descripcion,
                rawText: this.lastScan.rawText,
                confidence: this.lastScan.confidence
            });
            return;
        }
        
        // Fallback al modal simple
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
                    const uploadResult = await window.firebaseImageStorage.uploadRepuestoImage(
                        blob,
                        nuevoRepuesto.id,
                        `etiqueta_sap_${codigoSAP || 'sin_codigo'}.webp`
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
                
                // Guardar
                if (window.app.saveData) {
                    await window.app.saveData();
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
