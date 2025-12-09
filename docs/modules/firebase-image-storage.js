/**
 * FirebaseImageStorage - Servicio para almacenar imágenes en Firebase Storage
 * Maneja upload, download y eliminación de imágenes de repuestos
 * 
 * @version 1.1.0
 * @date 2024-12-09
 */

class FirebaseImageStorage {
    constructor() {
        this.storage = null;
        this.isInitialized = false;
        this.uploadQueue = [];
        this.isProcessingQueue = false;
        this.initAttempts = 0;
        this.maxInitAttempts = 10; // Máximo 10 intentos (10 segundos)
        
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
     * 🆕 Genera un nombre de carpeta amigable para Storage
     * Formato: {numero}_{codSAP}_{nombre_sanitizado}
     * Ejemplo: 058_3014567890_PERNO_M8X80_INOX
     */
    generateFriendlyFolderId(repuestoId, codSAP, nombre, index = null) {
        // Sanitizar nombre (quitar caracteres especiales, espacios por guiones bajos)
        const nombreSanitizado = (nombre || 'SIN_NOMBRE')
            .toUpperCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/[^A-Z0-9]/g, '_') // Solo alfanuméricos
            .replace(/_+/g, '_') // Múltiples guiones bajos a uno
            .replace(/^_|_$/g, '') // Quitar guiones al inicio/final
            .substring(0, 30); // Limitar longitud
        
        const codSAPPart = codSAP ? `${codSAP}_` : '';
        
        // Si tenemos índice, usarlo para el número
        if (index !== null) {
            const numPart = String(index).padStart(3, '0');
            return `${numPart}_${codSAPPart}${nombreSanitizado}`;
        }
        
        // Si no hay índice, usar timestamp corto
        const shortId = Date.now().toString(36).toUpperCase();
        return `${shortId}_${codSAPPart}${nombreSanitizado}`;
    }
    
    /**
     * Inicializar Firebase Storage
     */
    init() {
        try {
            if (typeof firebase !== 'undefined' && firebase.storage) {
                this.storage = firebase.storage();
                this.isInitialized = true;
                this.initAttempts = 0; // Reset contador
                console.log('✅ Firebase Storage inicializado correctamente');
            } else {
                this.initAttempts++;
                if (this.initAttempts < this.maxInitAttempts) {
                    console.warn(`⚠️ Firebase Storage SDK no disponible, reintentando (${this.initAttempts}/${this.maxInitAttempts})...`);
                    // Reintentar en 1 segundo
                    setTimeout(() => this.init(), 1000);
                } else {
                    console.error('❌ Firebase Storage SDK no se pudo inicializar después de 10 intentos. Las imágenes se guardarán solo localmente.');
                }
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
     * @param {Object} repuestoInfo - Info adicional para nombre amigable {codSAP, nombre} (opcional)
     * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
     */
    async uploadRepuestoImage(imageData, repuestoId, filename = null, onProgress = null, repuestoInfo = null) {
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
            
            // 🆕 Usar nombre de carpeta amigable si tenemos info del repuesto
            let folderId = repuestoId;
            if (repuestoInfo && (repuestoInfo.codSAP || repuestoInfo.nombre)) {
                folderId = this.generateFriendlyFolderId(
                    repuestoId, 
                    repuestoInfo.codSAP, 
                    repuestoInfo.nombre,
                    repuestoInfo.index
                );
                console.log(`📁 Carpeta amigable generada: ${folderId}`);
            }
            
            // Construir ruta: repuestos/{folderId}/{filename}
            const storagePath = `${this.PATHS.REPUESTOS}/${folderId}/${finalFilename}`;
            const storageRef = this.storage.ref(storagePath);
            
            // Configurar metadata
            const metadata = {
                contentType: imageData.type || 'image/webp',
                customMetadata: {
                    repuestoId: repuestoId,
                    codSAP: repuestoInfo?.codSAP || '',
                    nombre: repuestoInfo?.nombre || '',
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
     * OPTIMIZADO: Usa índice fijo para evitar duplicados
     */
    generateFilename(repuestoData, index = 1, extension = 'webp') {
        // Nombre fijo basado en índice (sin timestamp para evitar duplicados)
        return `foto_${index}.${extension}`;
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
    
    // ========================================
    // 🔥 OPTIMIZACIÓN DE RECURSOS
    // ========================================
    
    /**
     * Verificar si una imagen ya existe en Firebase (por path)
     * @param {string} storagePath - Ruta en Storage
     * @returns {Promise<{exists: boolean, url?: string}>}
     */
    async imageExists(storagePath) {
        if (!this.isReady()) {
            return { exists: false };
        }
        
        try {
            const storageRef = this.storage.ref(storagePath);
            const url = await storageRef.getDownloadURL();
            return { exists: true, url };
        } catch (error) {
            if (error.code === 'storage/object-not-found') {
                return { exists: false };
            }
            console.warn('⚠️ Error verificando imagen:', error);
            return { exists: false };
        }
    }
    
    /**
     * 🔥 Subir imagen SOLO si es nueva o cambió
     * Evita duplicados verificando si ya existe con el mismo nombre
     * @param {Blob|File} imageData - Datos de la imagen
     * @param {string} repuestoId - ID del repuesto
     * @param {number} imageIndex - Índice de la imagen (1, 2, 3...)
     * @param {Object} existingMedia - Objeto multimedia existente (si lo hay)
     * @returns {Promise<{success: boolean, url?: string, path?: string, skipped?: boolean}>}
     */
    async uploadIfNeeded(imageData, repuestoId, imageIndex, existingMedia = null) {
        if (!this.isReady()) {
            return { success: false, error: 'Firebase Storage no inicializado' };
        }
        
        // Si ya tiene URL de Firebase y no es un blob nuevo → reutilizar
        if (existingMedia && existingMedia.isFirebaseStorage && existingMedia.url && !imageData) {
            console.log(`♻️ Reutilizando imagen existente: ${existingMedia.url}`);
            return { 
                success: true, 
                url: existingMedia.url, 
                path: existingMedia.path,
                skipped: true 
            };
        }
        
        // Si no hay datos nuevos que subir
        if (!imageData) {
            return { success: false, error: 'Sin datos de imagen' };
        }
        
        // Generar nombre fijo basado en índice
        const extension = this.getExtension(imageData);
        const filename = `foto_${imageIndex}.${extension}`;
        const storagePath = `${this.PATHS.REPUESTOS}/${repuestoId}/${filename}`;
        
        // Si existía una imagen anterior con path diferente, eliminarla
        if (existingMedia && existingMedia.path && existingMedia.path !== storagePath) {
            console.log(`🗑️ Eliminando imagen anterior: ${existingMedia.path}`);
            await this.deleteImage(existingMedia.path);
        }
        
        // Subir la nueva imagen
        console.log(`☁️ Subiendo imagen: ${storagePath}`);
        return await this.uploadRepuestoImage(imageData, repuestoId, filename);
    }
    
    /**
     * 🔥 Sincronizar multimedia de un repuesto con Firebase Storage
     * - Sube imágenes nuevas
     * - Reutiliza las existentes
     * - Elimina las que ya no están en el array
     * @param {Array} newMultimedia - Nuevo array de multimedia
     * @param {string} repuestoId - ID del repuesto
     * @param {Array} oldMultimedia - Array anterior (para comparar)
     * @returns {Promise<Array>} - Array actualizado con URLs de Firebase
     */
    async syncMultimedia(newMultimedia, repuestoId, oldMultimedia = []) {
        if (!this.isReady() || !this.isAuthenticated()) {
            console.warn('⚠️ Firebase no disponible, retornando multimedia sin cambios');
            return newMultimedia;
        }
        
        const syncedMultimedia = [];
        let uploaded = 0;
        let reused = 0;
        let deleted = 0;
        
        // 1. Procesar cada elemento del nuevo multimedia
        for (let i = 0; i < newMultimedia.length; i++) {
            const media = newMultimedia[i];
            const imageIndex = i + 1;
            
            // Si ya es de Firebase y tiene URL válida → reutilizar
            if (media.isFirebaseStorage && media.url && !media.blob && !media.pendingUpload) {
                console.log(`♻️ [${imageIndex}] Reutilizando: ${media.url.substring(0, 50)}...`);
                syncedMultimedia.push(media);
                reused++;
                continue;
            }
            
            // Si tiene blob o está pendiente → subir
            if (media.blob || media.pendingUpload || (media.url && media.url.startsWith('data:'))) {
                const blobToUpload = media.blob || await this.dataURLtoBlob(media.url);
                
                if (blobToUpload) {
                    const result = await this.uploadIfNeeded(blobToUpload, repuestoId, imageIndex);
                    
                    if (result.success) {
                        syncedMultimedia.push({
                            type: 'image',
                            url: result.url,
                            path: result.path,
                            name: media.name || `foto_${imageIndex}`,
                            size: blobToUpload.size,
                            isFirebaseStorage: true
                        });
                        uploaded++;
                        console.log(`✅ [${imageIndex}] Subido: ${result.path}`);
                    } else {
                        // Si falla, mantener el original
                        console.warn(`⚠️ [${imageIndex}] Falló subida, manteniendo local`);
                        syncedMultimedia.push(media);
                    }
                } else {
                    syncedMultimedia.push(media);
                }
            } else {
                // Otro tipo de media (no imagen o no procesable)
                syncedMultimedia.push(media);
            }
        }
        
        // 2. NO eliminar huérfanas automáticamente aquí
        // La eliminación se hace en removeMultimedia() cuando el usuario quita una imagen explícitamente
        // Esto evita borrar imágenes que fueron sincronizadas desde Firebase pero aún no guardadas
        console.log(`📊 Sync completado: ${uploaded} subidas, ${reused} reutilizadas`);
        return syncedMultimedia;
    }
    
    /**
     * 🔄 Sincronizar multimedia DESDE Firebase Storage
     * Escanea la carpeta del repuesto y agrega imágenes que no estén en el array local
     * @param {string} repuestoId - ID del repuesto
     * @param {Array} currentMultimedia - Array actual de multimedia del repuesto
     * @returns {Promise<{updated: boolean, multimedia: Array, added: number}>}
     */
    async syncFromFirebase(repuestoId, currentMultimedia = []) {
        if (!this.isReady() || !this.isAuthenticated()) {
            console.log('⚠️ [SYNC-FROM] Firebase no disponible');
            return { updated: false, multimedia: currentMultimedia, added: 0 };
        }
        
        console.log(`🔄 [SYNC-FROM] Sincronizando repuesto ${repuestoId} desde Firebase...`);
        
        try {
            // Obtener todas las imágenes en Firebase para este repuesto
            const firebaseImages = await this.listRepuestoImages(repuestoId);
            
            if (firebaseImages.length === 0) {
                console.log(`📁 [SYNC-FROM] No hay imágenes en Firebase para repuesto ${repuestoId}`);
                return { updated: false, multimedia: currentMultimedia, added: 0 };
            }
            
            console.log(`☁️ [SYNC-FROM] Encontradas ${firebaseImages.length} imágenes en Firebase`);
            
            // Crear set de URLs actuales para comparación rápida
            const currentUrls = new Set(
                currentMultimedia
                    .filter(m => m.isFirebaseStorage && m.url)
                    .map(m => m.url)
            );
            
            // También comparar por path
            const currentPaths = new Set(
                currentMultimedia
                    .filter(m => m.isFirebaseStorage && m.path)
                    .map(m => m.path)
            );
            
            // Encontrar imágenes nuevas (en Firebase pero no en local)
            const newImages = firebaseImages.filter(img => 
                !currentUrls.has(img.url) && !currentPaths.has(img.path)
            );
            
            if (newImages.length === 0) {
                console.log(`✅ [SYNC-FROM] Multimedia ya sincronizada, no hay nuevas imágenes`);
                return { updated: false, multimedia: currentMultimedia, added: 0 };
            }
            
            console.log(`🆕 [SYNC-FROM] Agregando ${newImages.length} imágenes nuevas desde Firebase`);
            
            // Convertir imágenes de Firebase a formato multimedia
            const newMultimediaItems = newImages.map(img => ({
                type: 'image',
                url: img.url,
                path: img.path,
                name: img.name,
                isFirebaseStorage: true
            }));
            
            // Combinar: primero las existentes, luego las nuevas
            const updatedMultimedia = [...currentMultimedia, ...newMultimediaItems];
            
            console.log(`✅ [SYNC-FROM] Sincronización completada: ${currentMultimedia.length} → ${updatedMultimedia.length} items`);
            
            return {
                updated: true,
                multimedia: updatedMultimedia,
                added: newImages.length
            };
            
        } catch (error) {
            console.error('❌ [SYNC-FROM] Error sincronizando desde Firebase:', error);
            return { updated: false, multimedia: currentMultimedia, added: 0 };
        }
    }
    
    /**
     * Convertir dataURL a Blob
     */
    async dataURLtoBlob(dataURL) {
        if (!dataURL || !dataURL.startsWith('data:')) {
            return null;
        }
        
        try {
            const response = await fetch(dataURL);
            return await response.blob();
        } catch (error) {
            console.error('Error convirtiendo dataURL a Blob:', error);
            return null;
        }
    }
}

// Crear instancia global
window.firebaseImageStorage = new FirebaseImageStorage();

console.log('📸 FirebaseImageStorage cargado');
