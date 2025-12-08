/**
 * 📸 SAP Label Scanner Module
 * Escanea etiquetas SAP usando OCR (Tesseract.js) para crear repuestos rápidamente
 * 
 * @version 1.0.0
 * @requires Tesseract.js (CDN)
 */

class SAPScanner {
    constructor() {
        this.isReady = false;
        this.worker = null;
        this.isProcessing = false;
        
        // Patrones de extracción SAP
        this.patterns = {
            // Código SAP: 10 dígitos, típicamente empieza con 3
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
        
        console.log('📸 SAPScanner: Módulo inicializado');
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
     * Abre el modal de captura con cámara
     */
    openCaptureModal() {
        // Crear modal si no existe
        let modal = document.getElementById('sapScannerModal');
        if (!modal) {
            modal = this.createCaptureModal();
            document.body.appendChild(modal);
        }
        
        modal.classList.add('active');
        this.startCamera();
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
                
                <!-- Controles -->
                <div class="sap-scanner-controls">
                    <button id="sapScannerCaptureBtn" class="sap-scanner-btn primary" onclick="window.sapScanner.captureAndProcess()">
                        📷 Capturar
                    </button>
                    <button id="sapScannerRetryBtn" class="sap-scanner-btn secondary" style="display:none;" onclick="window.sapScanner.retryCapture()">
                        🔄 Reintentar
                    </button>
                    <button id="sapScannerGalleryBtn" class="sap-scanner-btn secondary" onclick="window.sapScanner.selectFromGallery()">
                        🖼️ Galería
                    </button>
                </div>
                
                <!-- Input oculto para galería -->
                <input type="file" id="sapScannerFileInput" accept="image/*" style="display:none;" onchange="window.sapScanner.processSelectedFile(event)" />
                
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
     * Captura imagen y procesa con OCR
     */
    async captureAndProcess() {
        const video = document.getElementById('sapScannerVideo');
        const canvas = document.getElementById('sapScannerCanvas');
        const preview = document.getElementById('sapScannerPreview');
        
        if (!video || !canvas) return;
        
        // Capturar frame del video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Convertir a blob
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        
        // Mostrar preview
        if (preview) {
            preview.src = imageData;
            preview.style.display = 'block';
            video.style.display = 'none';
        }
        
        // Guardar imagen
        this.lastScan.imageData = imageData;
        
        // Procesar con OCR
        await this.processImage(imageData);
    }
    
    /**
     * Seleccionar imagen de galería
     */
    selectFromGallery() {
        const input = document.getElementById('sapScannerFileInput');
        if (input) input.click();
    }
    
    /**
     * Procesa archivo seleccionado de galería
     */
    async processSelectedFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target.result;
            
            // Mostrar preview
            const preview = document.getElementById('sapScannerPreview');
            const video = document.getElementById('sapScannerVideo');
            if (preview) {
                preview.src = imageData;
                preview.style.display = 'block';
            }
            if (video) video.style.display = 'none';
            
            this.lastScan.imageData = imageData;
            await this.processImage(imageData);
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * Procesa imagen con Tesseract OCR
     */
    async processImage(imageData) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        // Mostrar progreso
        const progressContainer = document.querySelector('.sap-scanner-progress-container');
        const captureBtn = document.getElementById('sapScannerCaptureBtn');
        const retryBtn = document.getElementById('sapScannerRetryBtn');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (captureBtn) captureBtn.style.display = 'none';
        if (retryBtn) retryBtn.style.display = 'none';
        
        try {
            // Inicializar Tesseract si no está listo
            if (!this.isReady) {
                this.updateProgress(0);
                document.getElementById('sapScannerProgressText').textContent = 'Cargando motor OCR...';
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
            
            if (retryBtn) retryBtn.style.display = 'inline-flex';
            
        } finally {
            this.isProcessing = false;
            if (progressContainer) progressContainer.style.display = 'none';
            if (retryBtn) retryBtn.style.display = 'inline-flex';
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
     * Muestra modal de confirmación con datos extraídos
     */
    showConfirmModal() {
        // Cerrar modal de captura
        this.closeModal(false);
        
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
        document.getElementById('sapConfirmRawText').textContent = this.lastScan.rawText || '';
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
     * Reintentar captura
     */
    retryCapture() {
        const retryBtn = document.getElementById('sapScannerRetryBtn');
        const captureBtn = document.getElementById('sapScannerCaptureBtn');
        
        if (retryBtn) retryBtn.style.display = 'none';
        if (captureBtn) captureBtn.style.display = 'inline-flex';
        
        this.startCamera();
    }
    
    /**
     * Cierra modal de captura
     */
    closeModal(stopCam = true) {
        const modal = document.getElementById('sapScannerModal');
        if (modal) modal.classList.remove('active');
        
        if (stopCam) this.stopCamera();
    }
    
    /**
     * Cierra modal de confirmación
     */
    closeConfirmModal() {
        const modal = document.getElementById('sapConfirmModal');
        if (modal) modal.classList.remove('active');
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
        
        try {
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
                areaGeneral: '',
                subArea: '',
                sistemaEquipo: '',
                subSistema: '',
                seccion: '',
                detalle: '',
                multimedia: [],
                marcadorMapaId: null,
                ultimaModificacion: new Date().toISOString(),
                ultimoConteo: null,
                creadoPorScanner: true // Marca especial
            };
            
            // Si hay imagen escaneada, agregarla como multimedia
            if (this.lastScan.imageData) {
                // Convertir dataURL a blob
                const response = await fetch(this.lastScan.imageData);
                const blob = await response.blob();
                
                // Subir a Firebase si está disponible
                if (window.firebaseImageStorage) {
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
            }
            
            // Cerrar modal
            this.closeConfirmModal();
            
            // Mostrar éxito
            this.showToast(`✅ Repuesto creado: ${nombre}`, 'success');
            
            console.log('📸 SAPScanner: Repuesto creado:', nuevoRepuesto);
            
            // Limpiar estado
            this.lastScan = {
                rawText: '',
                codigoSAP: '',
                descripcion: '',
                imageData: null,
                confidence: 0
            };
            
        } catch (error) {
            console.error('📸 SAPScanner: Error creando repuesto:', error);
            this.showToast('Error al crear repuesto. Revisa la consola.', 'error');
        }
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

console.log('📸 SAP Scanner Module cargado - window.sapScanner disponible');
