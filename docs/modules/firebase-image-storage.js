/**
 * FirebaseImageStorage - Servicio para almacenar imágenes en Firebase Storage
 * Maneja upload, download y eliminación de imágenes de repuestos
 * 
 * @version 1.0.0
 * @date 2024-12-04
 */

class FirebaseImageStorage {
    constructor() {
        this.storage = null;
        this.isInitialized = false;
        this.uploadQueue = [];
        this.isProcessingQueue = false;
        
        // Configuración de rutas
        this.PATHS = {
            REPUESTOS: 'repuestos',
            MAPAS: 'mapas',
            TEMP: 'temp'
        };
        
        // Límites
        this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        this.ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        
        this.init();
    }
    
    /**
     * Inicializar Firebase Storage
     */
    init() {
        try {
            if (typeof firebase !== 'undefined' && firebase.storage) {
                this.storage = firebase.storage();
                this.isInitialized = true;
                console.log('✅ Firebase Storage inicializado correctamente');
            } else {
                console.warn('⚠️ Firebase Storage SDK no disponible, esperando...');
                // Reintentar en 1 segundo
                setTimeout(() => this.init(), 1000);
            }
        } catch (error) {
            console.error('❌ Error inicializando Firebase Storage:', error);
        }
    }
    
    /**
     * Verificar si el servicio está listo
     */
    isReady() {
        return this.isInitialized && this.storage !== null;
    }
    
    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated() {
        return window.firebaseService && window.firebaseService.isAuthenticated();
    }
    
    // ========================================
    // UPLOAD DE IMÁGENES
    // ========================================
    
    /**
     * Subir imagen de repuesto a Firebase Storage
     * @param {Blob|File} imageData - Datos de la imagen
     * @param {string} repuestoId - ID del repuesto
     * @param {string} filename - Nombre del archivo (opcional)
     * @param {Function} onProgress - Callback de progreso (opcional)
     * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
     */
    async uploadRepuestoImage(imageData, repuestoId, filename = null, onProgress = null) {
        if (!this.isReady()) {
            return { success: false, error: 'Firebase Storage no está inicializado' };
        }
        
        if (!this.isAuthenticated()) {
            return { success: false, error: 'Usuario no autenticado' };
        }
        
        try {
            // Validar archivo
            const validation = this.validateImage(imageData);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }
            
            // Generar nombre único si no se proporciona
            const timestamp = Date.now();
            const extension = this.getExtension(imageData);
            const finalFilename = filename || `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
            
            // Construir ruta: repuestos/{repuestoId}/{filename}
            const storagePath = `${this.PATHS.REPUESTOS}/${repuestoId}/${finalFilename}`;
            const storageRef = this.storage.ref(storagePath);
            
            // Configurar metadata
            const metadata = {
                contentType: imageData.type || 'image/webp',
                customMetadata: {
                    repuestoId: repuestoId,
                    uploadedAt: new Date().toISOString(),
                    originalName: imageData.name || finalFilename
                }
            };
            
            // Iniciar upload
            const uploadTask = storageRef.put(imageData, metadata);
            
            // Manejar progreso
            if (onProgress) {
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        onProgress(progress, snapshot.state);
                    },
                    (error) => {
                        console.error('❌ Error durante upload:', error);
                    }
                );
            }
            
            // Esperar a que termine
            const snapshot = await uploadTask;
            
            // Obtener URL de descarga
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            console.log(`✅ Imagen subida: ${storagePath}`);
            
            return {
                success: true,
                url: downloadURL,
                path: storagePath,
                filename: finalFilename,
                size: imageData.size
            };
            
        } catch (error) {
            console.error('❌ Error subiendo imagen:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error) 
            };
        }
    }
    
    /**
     * Subir múltiples imágenes con progreso
     * @param {Array<{blob: Blob, name: string}>} images - Array de imágenes
     * @param {string} repuestoId - ID del repuesto
     * @param {Function} onProgress - Callback de progreso global
     * @returns {Promise<Array>}
     */
    async uploadMultipleImages(images, repuestoId, onProgress = null) {
        const results = [];
        const total = images.length;
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            const result = await this.uploadRepuestoImage(
                image.blob || image,
                repuestoId,
                image.name,
                (progress, state) => {
                    if (onProgress) {
                        const globalProgress = ((i + progress / 100) / total) * 100;
                        onProgress(globalProgress, i + 1, total, state);
                    }
                }
            );
            
            results.push(result);
            
            // Si falló una, continuamos con las demás pero lo registramos
            if (!result.success) {
                console.warn(`⚠️ Falló imagen ${i + 1}/${total}: ${result.error}`);
            }
        }
        
        return results;
    }
    
    // ========================================
    // DESCARGA Y OBTENCIÓN DE URLs
    // ========================================
    
    /**
     * Obtener URL de descarga de una imagen
     * @param {string} storagePath - Ruta en Storage
     * @returns {Promise<string|null>}
     */
    async getDownloadURL(storagePath) {
        if (!this.isReady()) {
            console.warn('Firebase Storage no está inicializado');
            return null;
        }
        
        try {
            const storageRef = this.storage.ref(storagePath);
            return await storageRef.getDownloadURL();
        } catch (error) {
            console.error('❌ Error obteniendo URL:', error);
            return null;
        }
    }
    
    /**
     * Listar todas las imágenes de un repuesto
     * @param {string} repuestoId - ID del repuesto
     * @returns {Promise<Array<{name: string, path: string, url: string}>>}
     */
    async listRepuestoImages(repuestoId) {
        if (!this.isReady()) {
            return [];
        }
        
        try {
            const folderRef = this.storage.ref(`${this.PATHS.REPUESTOS}/${repuestoId}`);
            const result = await folderRef.listAll();
            
            const images = await Promise.all(
                result.items.map(async (itemRef) => {
                    const url = await itemRef.getDownloadURL();
                    return {
                        name: itemRef.name,
                        path: itemRef.fullPath,
                        url: url
                    };
                })
            );
            
            return images;
        } catch (error) {
            // Si la carpeta no existe, retornar array vacío
            if (error.code === 'storage/object-not-found') {
                return [];
            }
            console.error('❌ Error listando imágenes:', error);
            return [];
        }
    }
    
    // ========================================
    // ELIMINACIÓN
    // ========================================
    
    /**
     * Eliminar una imagen específica
     * @param {string} storagePath - Ruta completa en Storage
     * @returns {Promise<boolean>}
     */
    async deleteImage(storagePath) {
        if (!this.isReady()) {
            return false;
        }
        
        if (!this.isAuthenticated()) {
            console.warn('Usuario no autenticado');
            return false;
        }
        
        try {
            const storageRef = this.storage.ref(storagePath);
            await storageRef.delete();
            console.log(`✅ Imagen eliminada: ${storagePath}`);
            return true;
        } catch (error) {
            if (error.code === 'storage/object-not-found') {
                return true; // Ya no existe, consideramos éxito
            }
            console.error('❌ Error eliminando imagen:', error);
            return false;
        }
    }
    
    /**
     * Eliminar todas las imágenes de un repuesto
     * @param {string} repuestoId - ID del repuesto
     * @returns {Promise<{deleted: number, failed: number}>}
     */
    async deleteAllRepuestoImages(repuestoId) {
        const images = await this.listRepuestoImages(repuestoId);
        let deleted = 0;
        let failed = 0;
        
        for (const image of images) {
            const success = await this.deleteImage(image.path);
            if (success) {
                deleted++;
            } else {
                failed++;
            }
        }
        
        return { deleted, failed };
    }
    
    // ========================================
    // UTILIDADES
    // ========================================
    
    /**
     * Validar imagen antes de subir
     */
    validateImage(imageData) {
        // Verificar tamaño
        if (imageData.size > this.MAX_FILE_SIZE) {
            return { 
                valid: false, 
                error: `Archivo demasiado grande. Máximo: ${this.MAX_FILE_SIZE / 1024 / 1024}MB` 
            };
        }
        
        // Verificar tipo
        const type = imageData.type || 'image/webp';
        if (!this.ALLOWED_TYPES.includes(type)) {
            return { 
                valid: false, 
                error: `Tipo de archivo no permitido: ${type}` 
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Obtener extensión del archivo
     */
    getExtension(imageData) {
        if (imageData.name) {
            return imageData.name.split('.').pop().toLowerCase();
        }
        
        const typeMap = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/gif': 'gif'
        };
        
        return typeMap[imageData.type] || 'webp';
    }
    
    /**
     * Convertir errores de Firebase a mensajes legibles
     */
    getErrorMessage(error) {
        const errorMessages = {
            'storage/unauthorized': 'No tienes permisos para realizar esta acción',
            'storage/canceled': 'Subida cancelada',
            'storage/unknown': 'Error desconocido',
            'storage/object-not-found': 'Archivo no encontrado',
            'storage/bucket-not-found': 'Bucket de almacenamiento no configurado',
            'storage/quota-exceeded': 'Cuota de almacenamiento excedida',
            'storage/unauthenticated': 'Debes iniciar sesión para subir archivos',
            'storage/retry-limit-exceeded': 'Tiempo de espera excedido, intenta de nuevo'
        };
        
        return errorMessages[error.code] || error.message || 'Error desconocido';
    }
    
    /**
     * Generar nombre de archivo único para repuesto
     */
    generateFilename(repuestoData, index = 1) {
        const timestamp = Date.now();
        const codSAP = (repuestoData.codSAP || 'SAP').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const nombre = (repuestoData.nombre || 'REPUESTO').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        return `${timestamp}_${codSAP}_${nombre}_foto${index}.webp`;
    }
    
    /**
     * Convertir URL de Firebase Storage a objeto multimedia compatible
     */
    toMultimediaObject(uploadResult, originalName = '') {
        return {
            type: 'image',
            url: uploadResult.url,
            path: uploadResult.path,
            name: originalName || uploadResult.filename,
            size: uploadResult.size,
            isFirebaseStorage: true
        };
    }
}

// Crear instancia global
window.firebaseImageStorage = new FirebaseImageStorage();

console.log('📸 FirebaseImageStorage cargado');
