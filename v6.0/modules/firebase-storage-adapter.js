/**
 * FirebaseStorageAdapter - Adaptador para usar Firestore en lugar de FileSystem API
 * Mantiene compatibilidad con la interfaz existente de StorageManager
 */

class FirebaseStorageAdapter {
    constructor() {
        this.firebaseService = window.firebaseService;
        this.COLLECTIONS = window.FirebaseApp.COLLECTIONS;
        
        // Listeners activos
        this.activeListeners = {
            repuestos: null,
            mapas: null,
            zonas: null,
            presupuestos: null,
            jerarquia: null
        };

        // Callbacks para sincronización en tiempo real
        this.callbacks = {
            repuestos: null,
            mapas: null,
            zonas: null,
            presupuestos: null,
            jerarquia: null
        };
    }

    /**
     * Sanitizar objeto para Firebase (eliminar undefined, null profundo, convertir IDs a strings)
     */
    sanitizeForFirebase(obj) {
        if (obj === null || obj === undefined) return null;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => this.sanitizeForFirebase(item)).filter(item => item !== null);
        
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                // Convertir IDs numéricos a strings
                if ((key === 'id' || key === 'mapId' || key === 'parentId') && typeof value === 'number') {
                    sanitized[key] = String(value);
                }
                // Eliminar undefined y null de nivel superior
                else if (value === undefined) {
                    continue;
                }
                else if (value === null) {
                    sanitized[key] = null; // Mantener null explícito
                }
                // Recursión para objetos anidados
                else if (typeof value === 'object' && !Array.isArray(value)) {
                    const nestedSanitized = this.sanitizeForFirebase(value);
                    if (nestedSanitized !== null && Object.keys(nestedSanitized).length > 0) {
                        sanitized[key] = nestedSanitized;
                    }
                }
                // Arrays
                else if (Array.isArray(value)) {
                    const sanitizedArray = value.map(item => this.sanitizeForFirebase(item)).filter(item => item !== null);
                    if (sanitizedArray.length > 0) {
                        sanitized[key] = sanitizedArray;
                    }
                }
                // Valores primitivos
                else {
                    sanitized[key] = value;
                }
            }
        }
        return sanitized;
    }

    // ========================================
    // MÉTODOS COMPATIBLES CON StorageManager
    // ========================================

    /**
     * Cargar repuestos desde Firestore
     */
    async cargarRepuestos() {
        try {
            const result = await this.firebaseService.readAll(this.COLLECTIONS.REPUESTOS);
            
            if (result.success) {
                console.log(`✅ ${result.data.length} repuestos cargados desde Firestore`);
                return result.data;
            } else {
                console.warn('⚠️ No se pudieron cargar repuestos, retornando array vacío');
                return [];
            }
        } catch (error) {
            console.error('❌ Error cargando repuestos:', error);
            return [];
        }
    }

    /**
     * Guardar repuestos en Firestore
     */
    async guardarRepuestos(repuestos) {
        try {
            console.log(`🔥 [FIRESTORE] guardarRepuestos() - Intentando guardar ${repuestos.length} repuestos`);
            
            if (!this.firebaseService || !this.firebaseService.db) {
                throw new Error('FirebaseService no está disponible o no inicializado');
            }
            
            if (!this.COLLECTIONS || !this.COLLECTIONS.REPUESTOS) {
                throw new Error('COLLECTIONS no está definido correctamente');
            }
            
            console.log(`🔥 [FIRESTORE] Colección destino: ${this.COLLECTIONS.REPUESTOS}`);
            console.log(`🔥 [FIRESTORE] Usuario actual: ${this.firebaseService.currentUser?.uid || 'unknown'}`);
            
            // Firestore maneja cada repuesto como documento individual
            // Por lo tanto, usamos batch writes para eficiencia
            const batch = this.firebaseService.db.batch();
            
            repuestos.forEach((repuesto, index) => {
                // Sanitizar repuesto antes de guardar
                const sanitizedRepuesto = this.sanitizeForFirebase(repuesto);
                
                // Validar que tiene ID
                if (!sanitizedRepuesto.id) {
                    console.error(`❌ [FIRESTORE] Repuesto ${index} sin ID:`, sanitizedRepuesto);
                    throw new Error(`Repuesto ${index} no tiene ID`);
                }
                
                const docRef = this.firebaseService.db
                    .collection(this.COLLECTIONS.REPUESTOS)
                    .doc(sanitizedRepuesto.id);
                
                console.log(`📝 [FIRESTORE] Preparando documento: ${sanitizedRepuesto.id} - ${sanitizedRepuesto.nombre || 'sin nombre'}`);
                
                batch.set(docRef, {
                    ...sanitizedRepuesto,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.firebaseService.currentUser?.uid || 'unknown'
                }, { merge: true });
            });

            console.log(`🔥 [FIRESTORE] Ejecutando batch commit...`);
            await batch.commit();
            console.log(`✅ [FIRESTORE] ${repuestos.length} repuestos guardados en Firestore exitosamente`);
            
            return true;
        } catch (error) {
            console.error('❌ [FIRESTORE] Error guardando repuestos:', error);
            console.error('❌ [FIRESTORE] Error stack:', error.stack);
            console.error('❌ [FIRESTORE] Datos que intentó guardar:', repuestos);
            return false;
        }
    }

    /**
     * Cargar mapas desde Firestore
     */
    async cargarMapas() {
        try {
            const result = await this.firebaseService.readAll(this.COLLECTIONS.MAPAS);
            
            if (result.success) {
                console.log(`✅ ${result.data.length} mapas cargados desde Firestore`);
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            console.error('❌ Error cargando mapas:', error);
            return [];
        }
    }

    /**
     * Guardar mapas en Firestore
     */
    async guardarMapas(mapas) {
        try {
            console.log('🗺️  [DEBUG] guardarMapas llamado:', {
                recibido: mapas,
                tipo: typeof mapas,
                esArray: Array.isArray(mapas),
                longitud: mapas?.length,
                primerMapa: mapas?.[0]
            });
            
            const batch = this.firebaseService.db.batch();

            mapas.forEach(mapa => {
                // Convertir ID a string para Firebase
                const mapaId = mapa.id ? String(mapa.id) : this.generateId();
                
                // Sanitizar datos antes de guardar
                const sanitizedMapa = this.sanitizeForFirebase({
                    ...mapa,
                    id: mapaId,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.firebaseService.currentUser?.uid || 'unknown'
                });
                
                const docRef = this.firebaseService.db
                    .collection(this.COLLECTIONS.MAPAS)
                    .doc(mapaId);
                
                batch.set(docRef, sanitizedMapa, { merge: true });
            });

            await batch.commit();
            console.log(`✅ ${mapas.length} mapas guardados en Firestore`);
            return true;
        } catch (error) {
            console.error('❌ Error guardando mapas:', error);
            return false;
        }
    }

    /**
     * Cargar zonas desde Firestore
     */
    async cargarZonas() {
        try {
            const result = await this.firebaseService.readAll(this.COLLECTIONS.ZONAS);
            
            if (result.success) {
                console.log(`✅ ${result.data.length} zonas cargadas desde Firestore`);
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            console.error('❌ Error cargando zonas:', error);
            return [];
        }
    }

    /**
     * Guardar zonas en Firestore
     */
    async guardarZonas(zonas) {
        try {
            console.log('📍 [DEBUG] guardarZonas llamado:', {
                recibido: zonas,
                tipo: typeof zonas,
                esArray: Array.isArray(zonas),
                longitud: zonas?.length,
                primeraZona: zonas?.[0]
            });
            
            const batch = this.firebaseService.db.batch();

            zonas.forEach(zona => {
                // Convertir ID a string para Firebase
                const zonaId = zona.id ? String(zona.id) : this.generateId();
                
                // Sanitizar datos antes de guardar
                const sanitizedZona = this.sanitizeForFirebase({
                    ...zona,
                    id: zonaId,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.firebaseService.currentUser?.uid || 'unknown'
                });
                
                const docRef = this.firebaseService.db
                    .collection(this.COLLECTIONS.ZONAS)
                    .doc(zonaId);
                
                batch.set(docRef, sanitizedZona, { merge: true });
            });

            await batch.commit();
            console.log(`✅ ${zonas.length} zonas guardadas en Firestore`);
            return true;
        } catch (error) {
            console.error('❌ Error guardando zonas:', error);
            return false;
        }
    }

    /**
     * Cargar presupuestos desde Firestore
     */
    async cargarPresupuestos() {
        try {
            const result = await this.firebaseService.readAll(this.COLLECTIONS.PRESUPUESTOS);
            
            if (result.success) {
                console.log(`✅ ${result.data.length} presupuestos cargados desde Firestore`);
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            console.error('❌ Error cargando presupuestos:', error);
            return [];
        }
    }

    /**
     * Guardar presupuestos en Firestore
     */
    async guardarPresupuestos(presupuestos) {
        try {
            const batch = this.firebaseService.db.batch();

            presupuestos.forEach(presupuesto => {
                const docRef = this.firebaseService.db
                    .collection(this.COLLECTIONS.PRESUPUESTOS)
                    .doc(presupuesto.id || this.generateId());
                
                batch.set(docRef, {
                    ...presupuesto,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.firebaseService.currentUser?.uid || 'unknown'
                }, { merge: true });
            });

            await batch.commit();
            console.log(`✅ ${presupuestos.length} presupuestos guardados en Firestore`);
            return true;
        } catch (error) {
            console.error('❌ Error guardando presupuestos:', error);
            return false;
        }
    }

    // ========================================
    // SINCRONIZACIÓN EN TIEMPO REAL
    // ========================================

    /**
     * Activar listeners para sincronización en tiempo real
     */
    enableRealtimeSync(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };

        // Listener de repuestos
        if (callbacks.repuestos) {
            this.activeListeners.repuestos = this.firebaseService.listenToCollection(
                this.COLLECTIONS.REPUESTOS,
                (result) => {
                    if (result.success) {
                        callbacks.repuestos(result.data);
                    }
                }
            );
        }

        // Listener de mapas
        if (callbacks.mapas) {
            this.activeListeners.mapas = this.firebaseService.listenToCollection(
                this.COLLECTIONS.MAPAS,
                (result) => {
                    if (result.success) {
                        callbacks.mapas(result.data);
                    }
                }
            );
        }

        // Listener de zonas
        if (callbacks.zonas) {
            this.activeListeners.zonas = this.firebaseService.listenToCollection(
                this.COLLECTIONS.ZONAS,
                (result) => {
                    if (result.success) {
                        callbacks.zonas(result.data);
                    }
                }
            );
        }

        // Listener de presupuestos
        if (callbacks.presupuestos) {
            this.activeListeners.presupuestos = this.firebaseService.listenToCollection(
                this.COLLECTIONS.PRESUPUESTOS,
                (result) => {
                    if (result.success) {
                        callbacks.presupuestos(result.data);
                    }
                }
            );
        }

        // Listener de jerarquía
        if (callbacks.jerarquia) {
            this.activeListeners.jerarquia = this.firebaseService.listenToCollection(
                this.COLLECTIONS.JERARQUIA,
                (result) => {
                    if (result.success) {
                        callbacks.jerarquia(result.data);
                    }
                }
            );
        }

        console.log('✅ Sincronización en tiempo real activada');
    }

    /**
     * Desactivar sincronización en tiempo real
     */
    disableRealtimeSync() {
        Object.values(this.activeListeners).forEach(listener => {
            if (listener) {
                this.firebaseService.detachListener(listener);
            }
        });

        this.activeListeners = {
            repuestos: null,
            mapas: null,
            zonas: null,
            presupuestos: null
        };

        console.log('✅ Sincronización en tiempo real desactivada');
    }

    // ========================================
    // OPERACIONES CRUD INDIVIDUALES
    // ========================================

    /**
     * Crear repuesto
     */
    async crearRepuesto(repuesto) {
        try {
            const result = await this.firebaseService.create(
                this.COLLECTIONS.REPUESTOS,
                repuesto,
                repuesto.id
            );
            return result.success;
        } catch (error) {
            console.error('❌ Error creando repuesto:', error);
            return false;
        }
    }

    /**
     * Actualizar repuesto
     */
    async actualizarRepuesto(id, data) {
        try {
            const result = await this.firebaseService.update(
                this.COLLECTIONS.REPUESTOS,
                id,
                data
            );
            return result.success;
        } catch (error) {
            console.error('❌ Error actualizando repuesto:', error);
            return false;
        }
    }

    /**
     * Eliminar repuesto
     */
    async eliminarRepuesto(id) {
        try {
            const result = await this.firebaseService.delete(
                this.COLLECTIONS.REPUESTOS,
                id
            );
            return result.success;
        } catch (error) {
            console.error('❌ Error eliminando repuesto:', error);
            return false;
        }
    }

    /**
     * Crear mapa
     */
    async crearMapa(mapa) {
        try {
            const result = await this.firebaseService.create(
                this.COLLECTIONS.MAPAS,
                mapa,
                mapa.id
            );
            return result.success;
        } catch (error) {
            console.error('❌ Error creando mapa:', error);
            return false;
        }
    }

    /**
     * Actualizar mapa
     */
    async actualizarMapa(id, data) {
        try {
            const result = await this.firebaseService.update(
                this.COLLECTIONS.MAPAS,
                id,
                data
            );
            return result.success;
        } catch (error) {
            console.error('❌ Error actualizando mapa:', error);
            return false;
        }
    }

    /**
     * Eliminar mapa
     */
    async eliminarMapa(id) {
        try {
            const result = await this.firebaseService.delete(
                this.COLLECTIONS.MAPAS,
                id
            );
            return result.success;
        } catch (error) {
            console.error('❌ Error eliminando mapa:', error);
            return false;
        }
    }

    // ========================================
    // UTILIDADES
    // ========================================

    /**
     * Generar ID único
     */
    generateId() {
        return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Verificar conexión a Firestore
     */
    async checkConnection() {
        try {
            await this.firebaseService.db.collection('_health_check').get();
            return true;
        } catch (error) {
            console.error('❌ Sin conexión a Firestore:', error);
            return false;
        }
    }

    /**
     * Cargar jerarquía desde Firestore
     */
    async cargarJerarquia() {
        try {
            const result = await this.firebaseService.readAll(this.COLLECTIONS.JERARQUIA);
            
            if (result.success && result.data.length > 0) {
                console.log(`✅ Jerarquía cargada desde Firestore`);
                // La jerarquía se guarda como un solo documento
                return result.data[0].estructura || [];
            } else {
                return [];
            }
        } catch (error) {
            console.error('❌ Error cargando jerarquía:', error);
            return [];
        }
    }

    /**
     * Guardar jerarquía en Firestore
     */
    async guardarJerarquia(jerarquia) {
        try {
            // La jerarquía se guarda como un solo documento con ID fijo
            const docRef = this.firebaseService.db
                .collection(this.COLLECTIONS.JERARQUIA)
                .doc('estructura_principal');

            await docRef.set({
                estructura: jerarquia,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.firebaseService.currentUser?.uid || 'unknown',
                version: '1.0'
            }, { merge: true });

            console.log(`✅ Jerarquía guardada en Firestore (${jerarquia.length} áreas)`);
            return true;
        } catch (error) {
            console.error('❌ Error guardando jerarquía:', error);
            return false;
        }
    }

    /**
     * Migrar datos locales a Firestore (solo ejecutar una vez)
     */
    async migrarDatosLocales(repuestos, mapas, zonas, presupuestos, jerarquia) {
        if (!this.firebaseService.isAdmin()) {
            alert('Solo administradores pueden migrar datos');
            return false;
        }

        if (!confirm('¿Migrar todos los datos locales a Firestore? Esta operación sobrescribirá datos existentes.')) {
            return false;
        }

        try {
            console.log('🔄 Iniciando migración...');

            await this.guardarRepuestos(repuestos);
            await this.guardarMapas(mapas);
            await this.guardarZonas(zonas);
            await this.guardarPresupuestos(presupuestos);
            
            // Migrar jerarquía si existe
            if (jerarquia && jerarquia.length > 0) {
                await this.guardarJerarquia(jerarquia);
            }

            console.log('✅ Migración completada exitosamente');
            alert('Migración completada. Los datos ahora están en la nube.');
            return true;
        } catch (error) {
            console.error('❌ Error en migración:', error);
            alert('Error en la migración: ' + error.message);
            return false;
        }
    }
}

// Exportar instancia global
window.firebaseStorageAdapter = new FirebaseStorageAdapter();
