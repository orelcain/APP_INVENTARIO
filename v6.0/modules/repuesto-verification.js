/**
 * 📋 Módulo de Verificación de Repuesto v1.0
 * Flujo completo post-escaneo: verificar, completar, asignar
 * 
 * FLUJO:
 * 1. Verificar datos escaneados vs imagen
 * 2. Completar información faltante
 * 3. Agregar al inventario (queda primero)
 * 4. Asistente de asignación: jerarquía → mapa → área → marcador
 * 5. Indicadores de completitud
 */

class RepuestoVerification {
    constructor() {
        this.currentRepuesto = null;
        this.scanData = null;
        this.modal = null;
        this.step = 'verify'; // verify, complete, assign
        this.currentZoom = 1; // Para zoom de imagen
        
        console.log('📋 RepuestoVerification: Módulo inicializado');
    }
    
    /**
     * Inicia el flujo de verificación con datos del escáner
     */
    startVerification(scanData) {
        this.scanData = scanData;
        this.currentRepuesto = null;
        this.step = 'verify';
        
        this.createVerificationModal();
        this.showStep('verify');
    }
    
    /**
     * Crea el modal de verificación completo
     */
    createVerificationModal() {
        // Remover modal existente
        const existing = document.getElementById('repuestoVerificationModal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'repuestoVerificationModal';
        modal.className = 'verification-modal';
        
        modal.innerHTML = `
            <div class="verification-container">
                <!-- Header con progreso -->
                <div class="verification-header">
                    <div class="verification-steps">
                        <div class="step-indicator active" data-step="verify">
                            <span class="step-num">1</span>
                            <span class="step-label">Verificar</span>
                        </div>
                        <div class="step-connector"></div>
                        <div class="step-indicator" data-step="complete">
                            <span class="step-num">2</span>
                            <span class="step-label">Completar</span>
                        </div>
                        <div class="step-connector"></div>
                        <div class="step-indicator" data-step="assign">
                            <span class="step-num">3</span>
                            <span class="step-label">Ubicar</span>
                        </div>
                    </div>
                    <button type="button" class="verification-close" onclick="window.repuestoVerification.close()">✕</button>
                </div>
                
                <!-- Contenido dinámico -->
                <div class="verification-content">
                    <!-- PASO 1: Verificar datos -->
                    <div class="verification-step" id="stepVerify">
                        <h2>📸 Verificar Datos Escaneados</h2>
                        <p class="verify-hint">Compara la imagen con los datos detectados. Usa 🔍 para hacer zoom.</p>
                        
                        <!-- Comparación imagen vs datos -->
                        <div class="verify-comparison">
                            <div class="verify-image-section">
                                <div class="verify-image-container" id="verifyImageContainer">
                                    <img id="verifyImage" src="" alt="Imagen escaneada" onclick="window.repuestoVerification.openImageZoom()" />
                                    <button type="button" class="image-zoom-btn" onclick="window.repuestoVerification.openImageZoom()" title="Ver imagen completa">
                                        🔍
                                    </button>
                                </div>
                                <span class="verify-confidence" id="verifyConfidence">--% confianza</span>
                            </div>
                            <div class="verify-data-section">
                                <div class="verify-field">
                                    <label>Código SAP detectado</label>
                                    <input type="text" id="verifyCodSAP" placeholder="No detectado" />
                                    <span class="field-status" id="codSAPStatus"></span>
                                </div>
                                <div class="verify-field">
                                    <label>Descripción detectada</label>
                                    <input type="text" id="verifyNombre" placeholder="Ingresa descripción" />
                                </div>
                            </div>
                        </div>
                        
                        <!-- Texto crudo colapsable -->
                        <details class="raw-text-details">
                            <summary>📝 Ver texto OCR completo</summary>
                            <pre id="verifyRawText"></pre>
                        </details>
                        
                        <div class="step-actions">
                            <button type="button" class="btn-secondary" onclick="window.repuestoVerification.close()">Cancelar</button>
                            <button type="button" class="btn-primary" onclick="window.repuestoVerification.goToStep('complete')">
                                Continuar →
                            </button>
                        </div>
                    </div>
                    
                    <!-- PASO 2: Completar información -->
                    <div class="verification-step" id="stepComplete" style="display:none;">
                        <h2>📝 Completar Información</h2>
                        
                        <form id="completeForm" class="complete-form">
                            <!-- Datos básicos -->
                            <div class="form-section">
                                <h3>Datos Básicos</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Código SAP</label>
                                        <input type="text" id="completeCodSAP" readonly />
                                    </div>
                                    <div class="form-group">
                                        <label>Código Proveedor</label>
                                        <input type="text" id="completeCodProv" placeholder="Opcional" />
                                    </div>
                                </div>
                                <div class="form-group full">
                                    <label>Nombre / Descripción *</label>
                                    <input type="text" id="completeNombre" required />
                                </div>
                            </div>
                            
                            <!-- Stock -->
                            <div class="form-section">
                                <h3>Inventario</h3>
                                <div class="form-row three-col">
                                    <div class="form-group">
                                        <label>Cantidad *</label>
                                        <input type="number" id="completeCantidad" value="1" min="0" required />
                                    </div>
                                    <div class="form-group">
                                        <label>Mínimo</label>
                                        <input type="number" id="completeMinimo" value="5" min="0" />
                                    </div>
                                    <div class="form-group">
                                        <label>Óptimo</label>
                                        <input type="number" id="completeOptimo" value="10" min="0" />
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Identificación de equipo -->
                            <div class="form-section">
                                <h3>🔧 Identificación de Equipo</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Número de Equipo</label>
                                        <input type="text" id="completeNumEquipo" placeholder="Ej: EQ-001, M-2340" />
                                    </div>
                                    <div class="form-group">
                                        <label>Tipo</label>
                                        <select id="completeTipo">
                                            <option value="">-- Seleccionar --</option>
                                            <option value="electrico">Eléctrico</option>
                                            <option value="mecanico">Mecánico</option>
                                            <option value="hidraulico">Hidráulico</option>
                                            <option value="neumatico">Neumático</option>
                                            <option value="electronico">Electrónico</option>
                                            <option value="consumible">Consumible</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group full">
                                    <label>Datos Técnicos</label>
                                    <textarea id="completeDatosTec" rows="2" placeholder="Especificaciones, medidas, etc."></textarea>
                                </div>
                            </div>
                            
                            <!-- Categoría -->
                            <div class="form-section">
                                <h3>Categorización</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Categoría</label>
                                        <select id="completeCategoria">
                                            <option value="">-- Seleccionar --</option>
                                            <option value="repuesto">Repuesto</option>
                                            <option value="herramienta">Herramienta</option>
                                            <option value="consumible">Consumible</option>
                                            <option value="insumo">Insumo</option>
                                            <option value="equipo">Equipo</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Precio (opcional)</label>
                                        <input type="number" id="completePrecio" min="0" step="0.01" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>
                        </form>
                        
                        <div class="step-actions">
                            <button type="button" class="btn-secondary" onclick="window.repuestoVerification.goToStep('verify')">
                                ← Volver
                            </button>
                            <button type="button" class="btn-primary" onclick="window.repuestoVerification.saveAndContinue()">
                                Guardar y Ubicar →
                            </button>
                            <button type="button" class="btn-outline" onclick="window.repuestoVerification.saveOnly()">
                                Solo Guardar
                            </button>
                        </div>
                    </div>
                    
                    <!-- PASO 3: Asignar ubicación -->
                    <div class="verification-step" id="stepAssign" style="display:none;">
                        <h2>📍 Ubicar en Jerarquía y Mapa</h2>
                        
                        <!-- Repuesto creado (resumen) -->
                        <div class="created-summary">
                            <div class="summary-icon">✅</div>
                            <div class="summary-info">
                                <span class="summary-name" id="assignSummaryName">-</span>
                                <span class="summary-code" id="assignSummaryCode">SAP: -</span>
                            </div>
                        </div>
                        
                        <!-- Indicadores de completitud -->
                        <div class="completeness-indicators">
                            <h4>Estado de completitud</h4>
                            <div class="indicator-list">
                                <div class="indicator" id="indJerarquia">
                                    <span class="ind-icon">⬜</span>
                                    <span class="ind-label">Asignado a Jerarquía</span>
                                    <button type="button" class="ind-action" onclick="window.repuestoVerification.assignJerarquia()">Asignar</button>
                                </div>
                                <div class="indicator" id="indMapa">
                                    <span class="ind-icon">⬜</span>
                                    <span class="ind-label">Asignado a Mapa</span>
                                    <button type="button" class="ind-action" onclick="window.repuestoVerification.assignMapa()">Asignar</button>
                                </div>
                                <div class="indicator" id="indArea">
                                    <span class="ind-icon">⬜</span>
                                    <span class="ind-label">Área especificada</span>
                                    <button type="button" class="ind-action" onclick="window.repuestoVerification.assignArea()">Asignar</button>
                                </div>
                                <div class="indicator" id="indMarcador">
                                    <span class="ind-icon">⬜</span>
                                    <span class="ind-label">Marcador en mapa</span>
                                    <button type="button" class="ind-action" onclick="window.repuestoVerification.assignMarcador()">Colocar</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Selector de jerarquía -->
                        <div class="assign-section" id="assignJerarquiaSection" style="display:none;">
                            <h4>🏢 Seleccionar ubicación en jerarquía</h4>
                            <div class="jerarquia-search">
                                <input type="text" id="jerarquiaSearchInput" placeholder="Buscar área, sistema, equipo..." oninput="window.repuestoVerification.filterJerarquia(this.value)" />
                            </div>
                            <div class="jerarquia-tree" id="jerarquiaTreeSelect">
                                <!-- Se llena dinámicamente -->
                            </div>
                        </div>
                        
                        <!-- Selector de mapa/área -->
                        <div class="assign-section" id="assignMapaSection" style="display:none;">
                            <h4>🗺️ Seleccionar mapa y área</h4>
                            <div class="mapa-selector">
                                <select id="mapaSelect" onchange="window.repuestoVerification.onMapaSelected(this.value)">
                                    <option value="">-- Seleccionar mapa --</option>
                                </select>
                            </div>
                            <div class="area-selector" id="areaSelector" style="display:none;">
                                <select id="areaSelect">
                                    <option value="">-- Seleccionar área --</option>
                                </select>
                                <div class="area-types">
                                    <label>Tipo de área:</label>
                                    <select id="areaTipo">
                                        <option value="maquina">Máquina</option>
                                        <option value="estanteria">Estantería</option>
                                        <option value="zona">Zona</option>
                                        <option value="rack">Rack/Anaquel</option>
                                        <option value="caja">Caja/Contenedor</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step-actions">
                            <button type="button" class="btn-secondary" onclick="window.repuestoVerification.close()">
                                Finalizar después
                            </button>
                            <button type="button" class="btn-primary" onclick="window.repuestoVerification.finishAssignment()">
                                ✅ Completar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
        
        // Agregar estilos si no existen
        this.injectStyles();
    }
    
    /**
     * Inyecta estilos CSS para el modal
     */
    injectStyles() {
        if (document.getElementById('verificationStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'verificationStyles';
        styles.textContent = `
            /* Modal de verificación */
            .verification-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                animation: fadeIn 0.2s ease;
            }
            
            .verification-container {
                background: var(--home-bg, #0f1419);
                border-radius: 16px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 1px solid var(--home-border, #2d3640);
            }
            
            /* Header con pasos */
            .verification-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                border-bottom: 1px solid var(--home-border, #2d3640);
                background: var(--home-card, #1a1f26);
                border-radius: 16px 16px 0 0;
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            .verification-steps {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .step-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                opacity: 0.5;
                transition: opacity 0.2s;
            }
            
            .step-indicator.active {
                opacity: 1;
            }
            
            .step-indicator.completed {
                opacity: 1;
            }
            
            .step-indicator.completed .step-num {
                background: var(--home-success, #059669);
            }
            
            .step-num {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: var(--home-card-hover, #242b33);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
                color: var(--home-text, #e7e9ea);
            }
            
            .step-indicator.active .step-num {
                background: var(--home-accent, #5b8bb4);
            }
            
            .step-label {
                font-size: 11px;
                color: var(--home-text-muted, #8b98a5);
            }
            
            .step-connector {
                width: 24px;
                height: 2px;
                background: var(--home-border, #2d3640);
                margin-bottom: 18px;
            }
            
            .verification-close {
                background: transparent;
                border: none;
                color: var(--home-text-muted, #8b98a5);
                font-size: 20px;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
            }
            
            .verification-close:hover {
                background: var(--home-card-hover, #242b33);
            }
            
            /* Contenido */
            .verification-content {
                padding: 20px;
            }
            
            .verification-step h2 {
                margin: 0 0 20px 0;
                font-size: 1.2rem;
                color: var(--home-text, #e7e9ea);
            }
            
            /* Paso 1: Verificar */
            .verify-comparison {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 16px;
            }
            
            @media (max-width: 480px) {
                .verify-comparison {
                    grid-template-columns: 1fr;
                }
            }
            
            .verify-hint {
                font-size: 13px;
                color: var(--home-text-muted, #8b98a5);
                margin-bottom: 16px;
            }
            
            .verify-image-section {
                position: relative;
            }
            
            .verify-image-container {
                position: relative;
                cursor: zoom-in;
            }
            
            .verify-image-section img {
                width: 100%;
                border-radius: 12px;
                border: 1px solid var(--home-border, #2d3640);
                transition: transform 0.2s ease;
            }
            
            .verify-image-container:hover img {
                opacity: 0.9;
            }
            
            .image-zoom-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 36px;
                height: 36px;
                background: rgba(0,0,0,0.7);
                border: none;
                border-radius: 50%;
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
                transition: all 0.2s ease;
            }
            
            .image-zoom-btn:hover {
                background: rgba(0,0,0,0.85);
                transform: scale(1.1);
            }
            
            /* Modal de Zoom de Imagen */
            .image-zoom-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.95);
                z-index: 10001;
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .image-zoom-modal.active {
                display: flex;
            }
            
            .image-zoom-header {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
                z-index: 10;
            }
            
            .image-zoom-title {
                color: white;
                font-size: 14px;
                font-weight: 500;
            }
            
            .image-zoom-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
            }
            
            .image-zoom-container {
                flex: 1;
                width: 100%;
                overflow: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 60px 16px 80px;
            }
            
            .image-zoom-container img {
                max-width: none;
                transform-origin: center;
                transition: transform 0.1s ease;
                cursor: grab;
            }
            
            .image-zoom-container img:active {
                cursor: grabbing;
            }
            
            .image-zoom-controls {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                display: flex;
                justify-content: center;
                gap: 12px;
                padding: 16px;
                background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            }
            
            .zoom-control-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .zoom-control-btn:hover {
                background: rgba(255,255,255,0.3);
            }
            
            .zoom-level-display {
                background: rgba(0,0,0,0.5);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                display: flex;
                align-items: center;
            }
            
            .verify-confidence {
                position: absolute;
                bottom: 8px;
                right: 8px;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
            }
            
            .verify-data-section {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .verify-field label {
                display: block;
                font-size: 12px;
                color: var(--home-text-muted, #8b98a5);
                margin-bottom: 4px;
            }
            
            .verify-field input {
                width: 100%;
                padding: 12px;
                background: var(--home-card, #1a1f26);
                border: 1px solid var(--home-border, #2d3640);
                border-radius: 8px;
                color: var(--home-text, #e7e9ea);
                font-size: 15px;
            }
            
            .verify-field input:focus {
                outline: none;
                border-color: var(--home-accent, #5b8bb4);
            }
            
            .field-status {
                display: block;
                font-size: 12px;
                margin-top: 4px;
            }
            
            .field-status.exists {
                color: var(--home-warning, #d97706);
            }
            
            .field-status.new {
                color: var(--home-success, #059669);
            }
            
            .raw-text-details {
                background: var(--home-card, #1a1f26);
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .raw-text-details summary {
                padding: 12px;
                cursor: pointer;
                color: var(--home-text-muted, #8b98a5);
                font-size: 13px;
            }
            
            .raw-text-details pre {
                padding: 12px;
                font-size: 11px;
                white-space: pre-wrap;
                word-break: break-word;
                color: var(--home-text-muted, #8b98a5);
                max-height: 150px;
                overflow-y: auto;
            }
            
            /* Paso 2: Completar */
            .complete-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .form-section h3 {
                font-size: 14px;
                color: var(--home-accent, #5b8bb4);
                margin: 0 0 12px 0;
                padding-bottom: 8px;
                border-bottom: 1px solid var(--home-border, #2d3640);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }
            
            .form-row.three-col {
                grid-template-columns: repeat(3, 1fr);
            }
            
            @media (max-width: 480px) {
                .form-row, .form-row.three-col {
                    grid-template-columns: 1fr;
                }
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .form-group.full {
                grid-column: 1 / -1;
            }
            
            .form-group label {
                font-size: 12px;
                color: var(--home-text-muted, #8b98a5);
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                padding: 10px 12px;
                background: var(--home-card, #1a1f26);
                border: 1px solid var(--home-border, #2d3640);
                border-radius: 8px;
                color: var(--home-text, #e7e9ea);
                font-size: 14px;
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--home-accent, #5b8bb4);
            }
            
            .form-group input[readonly] {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            /* Paso 3: Asignar */
            .created-summary {
                display: flex;
                align-items: center;
                gap: 12px;
                background: rgba(5, 150, 105, 0.15);
                border: 1px solid rgba(5, 150, 105, 0.3);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .summary-icon {
                font-size: 2rem;
            }
            
            .summary-info {
                display: flex;
                flex-direction: column;
            }
            
            .summary-name {
                font-weight: 600;
                color: var(--home-text, #e7e9ea);
            }
            
            .summary-code {
                font-size: 12px;
                color: var(--home-text-muted, #8b98a5);
            }
            
            /* Indicadores de completitud */
            .completeness-indicators h4 {
                font-size: 14px;
                color: var(--home-text-muted, #8b98a5);
                margin: 0 0 12px 0;
            }
            
            .indicator-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .indicator {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 14px;
                background: var(--home-card, #1a1f26);
                border-radius: 8px;
            }
            
            .indicator.completed {
                background: rgba(5, 150, 105, 0.1);
            }
            
            .indicator.completed .ind-icon {
                color: var(--home-success, #059669);
            }
            
            .ind-icon {
                font-size: 16px;
            }
            
            .ind-label {
                flex: 1;
                font-size: 14px;
                color: var(--home-text, #e7e9ea);
            }
            
            .ind-action {
                background: var(--home-accent, #5b8bb4);
                color: #fff;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
            }
            
            .indicator.completed .ind-action {
                display: none;
            }
            
            /* Secciones de asignación */
            .assign-section {
                margin-top: 16px;
                padding: 16px;
                background: var(--home-card, #1a1f26);
                border-radius: 12px;
            }
            
            .assign-section h4 {
                margin: 0 0 12px 0;
                font-size: 14px;
                color: var(--home-text, #e7e9ea);
            }
            
            .jerarquia-search input {
                width: 100%;
                padding: 10px 12px;
                background: var(--home-bg, #0f1419);
                border: 1px solid var(--home-border, #2d3640);
                border-radius: 8px;
                color: var(--home-text, #e7e9ea);
                margin-bottom: 12px;
            }
            
            .jerarquia-tree {
                max-height: 200px;
                overflow-y: auto;
            }
            
            .jerarquia-item {
                padding: 10px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                color: var(--home-text, #e7e9ea);
                margin-bottom: 4px;
            }
            
            .jerarquia-item:hover {
                background: var(--home-card-hover, #242b33);
            }
            
            .jerarquia-item.selected {
                background: var(--home-accent, #5b8bb4);
            }
            
            .mapa-selector select,
            .area-selector select {
                width: 100%;
                padding: 10px 12px;
                background: var(--home-bg, #0f1419);
                border: 1px solid var(--home-border, #2d3640);
                border-radius: 8px;
                color: var(--home-text, #e7e9ea);
                margin-bottom: 12px;
            }
            
            /* Botones de acción */
            .step-actions {
                display: flex;
                gap: 10px;
                margin-top: 24px;
                padding-top: 16px;
                border-top: 1px solid var(--home-border, #2d3640);
            }
            
            .btn-primary {
                flex: 1;
                padding: 14px 20px;
                background: var(--home-accent, #5b8bb4);
                color: #fff;
                border: none;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-primary:hover {
                filter: brightness(1.1);
            }
            
            .btn-secondary {
                padding: 14px 20px;
                background: var(--home-card, #1a1f26);
                color: var(--home-text, #e7e9ea);
                border: 1px solid var(--home-border, #2d3640);
                border-radius: 10px;
                font-size: 15px;
                cursor: pointer;
            }
            
            .btn-outline {
                padding: 14px 20px;
                background: transparent;
                color: var(--home-accent, #5b8bb4);
                border: 1px solid var(--home-accent, #5b8bb4);
                border-radius: 10px;
                font-size: 14px;
                cursor: pointer;
            }
            
            @media (max-width: 480px) {
                .step-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    /**
     * Muestra un paso específico
     */
    showStep(step) {
        this.step = step;
        
        // Ocultar todos los pasos
        document.querySelectorAll('.verification-step').forEach(el => {
            el.style.display = 'none';
        });
        
        // Mostrar paso actual
        const stepMap = {
            'verify': 'stepVerify',
            'complete': 'stepComplete',
            'assign': 'stepAssign'
        };
        
        const stepEl = document.getElementById(stepMap[step]);
        if (stepEl) stepEl.style.display = 'block';
        
        // Actualizar indicadores
        const steps = ['verify', 'complete', 'assign'];
        const currentIndex = steps.indexOf(step);
        
        document.querySelectorAll('.step-indicator').forEach((el, i) => {
            el.classList.remove('active', 'completed');
            if (i < currentIndex) el.classList.add('completed');
            if (i === currentIndex) el.classList.add('active');
        });
        
        // Inicializar contenido del paso
        if (step === 'verify') this.initVerifyStep();
        if (step === 'complete') this.initCompleteStep();
        if (step === 'assign') this.initAssignStep();
    }
    
    /**
     * Navegar a un paso
     */
    goToStep(step) {
        // Validar paso actual antes de avanzar
        if (this.step === 'verify' && step === 'complete') {
            const nombre = document.getElementById('verifyNombre')?.value?.trim();
            if (!nombre) {
                this.showToast('Debes ingresar un nombre/descripción', 'warning');
                return;
            }
        }
        
        this.showStep(step);
    }
    
    /**
     * Inicializa el paso de verificación
     */
    initVerifyStep() {
        if (!this.scanData) return;
        
        // Imagen
        const img = document.getElementById('verifyImage');
        if (img && this.scanData.imageData) {
            img.src = this.scanData.imageData;
        }
        
        // Confianza
        const conf = document.getElementById('verifyConfidence');
        if (conf) {
            conf.textContent = `${this.scanData.confidence || 0}% confianza`;
        }
        
        // Código SAP
        const codInput = document.getElementById('verifyCodSAP');
        if (codInput) {
            codInput.value = this.scanData.codigoSAP || '';
            codInput.oninput = () => this.checkExistingCode(codInput.value);
            this.checkExistingCode(this.scanData.codigoSAP);
        }
        
        // Nombre
        const nombreInput = document.getElementById('verifyNombre');
        if (nombreInput) {
            nombreInput.value = this.scanData.descripcion || '';
        }
        
        // Texto crudo
        const rawText = document.getElementById('verifyRawText');
        if (rawText) {
            rawText.textContent = this.scanData.rawText || '(No se detectó texto)';
        }
    }
    
    /**
     * Verifica si el código ya existe
     */
    checkExistingCode(codigo) {
        const status = document.getElementById('codSAPStatus');
        if (!status || !codigo) {
            if (status) status.textContent = '';
            return;
        }
        
        if (window.app && window.app.repuestos) {
            const existente = window.app.repuestos.find(r => r.codSAP === codigo);
            if (existente) {
                status.textContent = `⚠️ Ya existe: "${existente.nombre}"`;
                status.className = 'field-status exists';
            } else {
                status.textContent = '✅ Código disponible';
                status.className = 'field-status new';
            }
        }
    }
    
    /**
     * Inicializa el paso de completar
     */
    initCompleteStep() {
        // Traer datos del paso anterior
        const codSAP = document.getElementById('verifyCodSAP')?.value || '';
        const nombre = document.getElementById('verifyNombre')?.value || '';
        
        document.getElementById('completeCodSAP').value = codSAP;
        document.getElementById('completeNombre').value = nombre;
    }
    
    /**
     * Guarda el repuesto y continúa al paso de asignación
     */
    async saveAndContinue() {
        const saved = await this.saveRepuesto();
        if (saved) {
            this.goToStep('assign');
        }
    }
    
    /**
     * Solo guarda el repuesto y cierra
     */
    async saveOnly() {
        const saved = await this.saveRepuesto();
        if (saved) {
            this.close();
            this.showSuccessToast();
        }
    }
    
    /**
     * Guarda el repuesto en el inventario
     */
    async saveRepuesto() {
        const nombre = document.getElementById('completeNombre')?.value?.trim();
        if (!nombre) {
            this.showToast('El nombre es obligatorio', 'warning');
            return false;
        }
        
        try {
            const nuevoRepuesto = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                codSAP: document.getElementById('completeCodSAP')?.value?.trim() || '',
                codProv: document.getElementById('completeCodProv')?.value?.trim() || '',
                nombre: nombre,
                tipo: document.getElementById('completeTipo')?.value || '',
                categoria: document.getElementById('completeCategoria')?.value || '',
                cantidad: parseInt(document.getElementById('completeCantidad')?.value) || 0,
                cantidadInstalada: 0,
                minimo: parseInt(document.getElementById('completeMinimo')?.value) || 5,
                optimo: parseInt(document.getElementById('completeOptimo')?.value) || 10,
                precio: parseFloat(document.getElementById('completePrecio')?.value) || 0,
                numEquipo: document.getElementById('completeNumEquipo')?.value?.trim() || '',
                datosTecnicos: document.getElementById('completeDatosTec')?.value?.trim() || '',
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
                creadoPorScanner: true
            };
            
            // Subir imagen si existe
            if (this.scanData?.imageData && window.firebaseImageStorage?.isReady()) {
                const response = await fetch(this.scanData.imageData);
                const blob = await response.blob();
                
                const uploadResult = await window.firebaseImageStorage.uploadRepuestoImage(
                    blob, nuevoRepuesto.id, `etiqueta_${nuevoRepuesto.codSAP || 'scan'}.webp`
                );
                
                if (uploadResult.success) {
                    nuevoRepuesto.multimedia = [{
                        type: 'image',
                        url: uploadResult.url,
                        isFirebaseStorage: true
                    }];
                }
            }
            
            // Agregar al inicio (LIFO)
            if (window.app && window.app.repuestos) {
                window.app.repuestos.unshift(nuevoRepuesto);
                
                if (window.app.saveData) await window.app.saveData();
                if (window.app.render) await window.app.render();
                if (window.app.renderFilters) window.app.renderFilters();
            }
            
            this.currentRepuesto = nuevoRepuesto;
            console.log('📋 Repuesto creado:', nuevoRepuesto);
            
            return true;
            
        } catch (error) {
            console.error('Error guardando repuesto:', error);
            this.showToast('Error al guardar repuesto', 'error');
            return false;
        }
    }
    
    /**
     * Inicializa el paso de asignación
     */
    initAssignStep() {
        if (!this.currentRepuesto) return;
        
        // Actualizar resumen
        document.getElementById('assignSummaryName').textContent = this.currentRepuesto.nombre;
        document.getElementById('assignSummaryCode').textContent = `SAP: ${this.currentRepuesto.codSAP || 'N/A'}`;
        
        // Actualizar indicadores de completitud
        this.updateCompleteness();
        
        // Cargar jerarquía para selector
        this.loadJerarquiaSelector();
        
        // Cargar mapas para selector
        this.loadMapasSelector();
    }
    
    /**
     * Actualiza los indicadores de completitud
     */
    updateCompleteness() {
        const rep = this.currentRepuesto;
        if (!rep) return;
        
        // Jerarquía
        const hasJerarquia = rep.areaGeneral || rep.detalle;
        this.setIndicator('indJerarquia', hasJerarquia);
        
        // Mapa
        const hasMapa = rep.mapaId || false;
        this.setIndicator('indMapa', hasMapa);
        
        // Área
        const hasArea = rep.ubicaciones && rep.ubicaciones.length > 0;
        this.setIndicator('indArea', hasArea);
        
        // Marcador
        const hasMarcador = rep.marcadorMapaId || false;
        this.setIndicator('indMarcador', hasMarcador);
    }
    
    /**
     * Actualiza un indicador de completitud
     */
    setIndicator(id, completed) {
        const el = document.getElementById(id);
        if (!el) return;
        
        if (completed) {
            el.classList.add('completed');
            el.querySelector('.ind-icon').textContent = '✅';
        } else {
            el.classList.remove('completed');
            el.querySelector('.ind-icon').textContent = '⬜';
        }
    }
    
    /**
     * Muestra el selector de jerarquía
     */
    assignJerarquia() {
        const section = document.getElementById('assignJerarquiaSection');
        if (section) {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Carga el árbol de jerarquía para selección
     */
    loadJerarquiaSelector() {
        const container = document.getElementById('jerarquiaTreeSelect');
        if (!container) return;
        
        const jerarquia = window.app?.jerarquia?.areas || [];
        
        if (jerarquia.length === 0) {
            container.innerHTML = '<p style="color: var(--home-text-muted); font-size: 13px;">No hay áreas configuradas en la jerarquía</p>';
            return;
        }
        
        let html = '';
        const renderNodo = (nodo, nivel = 0) => {
            const indent = '&nbsp;'.repeat(nivel * 4);
            const icon = nivel === 0 ? '🏢' : nivel === 1 ? '⚙️' : '📦';
            html += `<div class="jerarquia-item" data-id="${nodo.id}" data-nombre="${nodo.nombre}" style="padding-left: ${12 + nivel * 16}px;" onclick="window.repuestoVerification.selectJerarquia('${nodo.id}', '${nodo.nombre}')">
                ${icon} ${nodo.nombre}
            </div>`;
            
            const hijos = nodo.sistemas || nodo.children || [];
            hijos.forEach(hijo => renderNodo(hijo, nivel + 1));
        };
        
        jerarquia.forEach(area => renderNodo(area));
        container.innerHTML = html;
    }
    
    /**
     * Filtra jerarquía por búsqueda
     */
    filterJerarquia(query) {
        const items = document.querySelectorAll('.jerarquia-item');
        const q = query.toLowerCase();
        
        items.forEach(item => {
            const nombre = item.dataset.nombre?.toLowerCase() || '';
            item.style.display = nombre.includes(q) ? 'block' : 'none';
        });
    }
    
    /**
     * Selecciona una ubicación de jerarquía
     */
    async selectJerarquia(id, nombre) {
        if (!this.currentRepuesto) return;
        
        // Marcar seleccionado
        document.querySelectorAll('.jerarquia-item').forEach(el => el.classList.remove('selected'));
        document.querySelector(`.jerarquia-item[data-id="${id}"]`)?.classList.add('selected');
        
        // Actualizar repuesto
        this.currentRepuesto.areaGeneral = nombre;
        this.currentRepuesto.detalle = nombre;
        
        // Guardar cambios
        if (window.app?.saveData) await window.app.saveData();
        
        this.updateCompleteness();
        this.showToast('Ubicación asignada', 'success');
    }
    
    /**
     * Muestra el selector de mapas
     */
    assignMapa() {
        const section = document.getElementById('assignMapaSection');
        if (section) {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    assignArea() {
        this.assignMapa(); // Mismo selector
    }
    
    assignMarcador() {
        this.showToast('Función de marcador disponible próximamente', 'info');
    }
    
    /**
     * Carga los mapas disponibles
     */
    loadMapasSelector() {
        const select = document.getElementById('mapaSelect');
        if (!select) return;
        
        const mapas = window.app?.mapas || {};
        const mapasList = Object.values(mapas);
        
        if (mapasList.length === 0) {
            select.innerHTML = '<option value="">No hay mapas disponibles</option>';
            return;
        }
        
        let html = '<option value="">-- Seleccionar mapa --</option>';
        mapasList.forEach(mapa => {
            html += `<option value="${mapa.id}">${mapa.nombre}</option>`;
        });
        select.innerHTML = html;
    }
    
    /**
     * Cuando se selecciona un mapa
     */
    onMapaSelected(mapaId) {
        if (!mapaId) return;
        
        const areaSection = document.getElementById('areaSelector');
        if (areaSection) areaSection.style.display = 'block';
        
        // TODO: Cargar áreas del mapa seleccionado
    }
    
    /**
     * Finaliza la asignación
     */
    async finishAssignment() {
        if (window.app?.saveData) await window.app.saveData();
        this.close();
        this.showSuccessToast();
    }
    
    /**
     * Muestra toast de éxito
     */
    showSuccessToast() {
        this.showToast(`✅ ${this.currentRepuesto?.nombre || 'Repuesto'} agregado al inventario`, 'success');
    }
    
    /**
     * 🔍 ZOOM: Abre modal de zoom de imagen
     */
    openImageZoom() {
        // Crear modal de zoom si no existe
        let zoomModal = document.getElementById('imageZoomModal');
        if (!zoomModal) {
            zoomModal = this.createImageZoomModal();
            document.body.appendChild(zoomModal);
        }
        
        // Cargar imagen
        const originalImg = document.getElementById('verifyImage');
        const zoomImg = document.getElementById('zoomImage');
        
        if (originalImg && zoomImg) {
            zoomImg.src = originalImg.src;
            this.currentZoom = 1;
            this.updateZoomLevel();
        }
        
        zoomModal.classList.add('active');
    }
    
    /**
     * 🔍 ZOOM: Crea modal de zoom
     */
    createImageZoomModal() {
        const modal = document.createElement('div');
        modal.id = 'imageZoomModal';
        modal.className = 'image-zoom-modal';
        
        modal.innerHTML = `
            <div class="image-zoom-header">
                <span class="image-zoom-title">📸 Imagen escaneada - Pellizca para zoom</span>
                <button type="button" class="image-zoom-close" onclick="window.repuestoVerification.closeImageZoom()">✕</button>
            </div>
            
            <div class="image-zoom-container" id="zoomContainer">
                <img id="zoomImage" src="" alt="Zoom de imagen" />
            </div>
            
            <div class="image-zoom-controls">
                <button type="button" class="zoom-control-btn" onclick="window.repuestoVerification.zoomOut()">−</button>
                <div class="zoom-level-display" id="zoomLevelDisplay">100%</div>
                <button type="button" class="zoom-control-btn" onclick="window.repuestoVerification.zoomIn()">+</button>
                <button type="button" class="zoom-control-btn" onclick="window.repuestoVerification.zoomReset()">⟲</button>
            </div>
        `;
        
        // Agregar gestos táctiles
        this.setupZoomGestures(modal);
        
        return modal;
    }
    
    /**
     * 🔍 ZOOM: Configurar gestos táctiles
     */
    setupZoomGestures(modal) {
        const container = modal.querySelector('#zoomContainer');
        const img = modal.querySelector('#zoomImage');
        
        if (!container || !img) return;
        
        let initialDistance = 0;
        let initialZoom = 1;
        
        // Pinch zoom
        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                initialZoom = this.currentZoom;
            }
        }, { passive: true });
        
        container.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const distance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = distance / initialDistance;
                this.currentZoom = Math.min(5, Math.max(0.5, initialZoom * scale));
                this.applyZoom();
            }
        }, { passive: true });
        
        // Double tap para zoom rápido
        let lastTap = 0;
        container.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                // Double tap
                if (this.currentZoom > 1) {
                    this.zoomReset();
                } else {
                    this.currentZoom = 2.5;
                    this.applyZoom();
                }
            }
            lastTap = currentTime;
        });
        
        // Wheel zoom para desktop
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        });
    }
    
    /**
     * 🔍 ZOOM: Calcular distancia entre dos dedos
     */
    getDistance(touch1, touch2) {
        return Math.hypot(touch1.pageX - touch2.pageX, touch1.pageY - touch2.pageY);
    }
    
    /**
     * 🔍 ZOOM: Zoom In
     */
    zoomIn() {
        this.currentZoom = Math.min(5, this.currentZoom + 0.5);
        this.applyZoom();
    }
    
    /**
     * 🔍 ZOOM: Zoom Out
     */
    zoomOut() {
        this.currentZoom = Math.max(0.5, this.currentZoom - 0.5);
        this.applyZoom();
    }
    
    /**
     * 🔍 ZOOM: Reset Zoom
     */
    zoomReset() {
        this.currentZoom = 1;
        this.applyZoom();
    }
    
    /**
     * 🔍 ZOOM: Aplicar nivel de zoom
     */
    applyZoom() {
        const img = document.getElementById('zoomImage');
        if (img) {
            img.style.transform = `scale(${this.currentZoom})`;
        }
        this.updateZoomLevel();
    }
    
    /**
     * 🔍 ZOOM: Actualizar display de nivel
     */
    updateZoomLevel() {
        const display = document.getElementById('zoomLevelDisplay');
        if (display) {
            display.textContent = `${Math.round(this.currentZoom * 100)}%`;
        }
    }
    
    /**
     * 🔍 ZOOM: Cerrar modal
     */
    closeImageZoom() {
        const modal = document.getElementById('imageZoomModal');
        if (modal) modal.classList.remove('active');
    }

    /**
     * Cierra el modal
     */
    close() {
        const modal = document.getElementById('repuestoVerificationModal');
        if (modal) modal.remove();
        
        this.currentRepuesto = null;
        this.scanData = null;
        this.step = 'verify';
        
        // Refrescar footer móvil
        if (window.renderMobileFooter && window.mobileFooterState) {
            setTimeout(() => {
                window.renderMobileFooter(window.mobileFooterState.currentContext || 'inventario');
            }, 100);
        }
    }
    
    /**
     * Muestra toast
     */
    showToast(message, type = 'info') {
        if (window.app?.showToast) {
            window.app.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Instancia global
window.repuestoVerification = new RepuestoVerification();

console.log('📋 RepuestoVerification Module cargado - window.repuestoVerification disponible');
