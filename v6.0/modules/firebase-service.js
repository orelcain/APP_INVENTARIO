/**
 * FirebaseService - Servicio centralizado para operaciones Firebase
 * Maneja autenticación, CRUD de Firestore y gestión de roles
 */

class FirebaseService {
    constructor() {
        this.auth = window.FirebaseApp.auth;
        this.db = window.FirebaseApp.db;
        this.COLLECTIONS = window.FirebaseApp.COLLECTIONS;
        this.USER_ROLES = window.FirebaseApp.USER_ROLES;
        
        this.currentUser = null;
        this.userRole = null;
        this.listeners = [];
        
        // Observer de autenticación
        this.auth.onAuthStateChanged(user => this.handleAuthStateChanged(user));
    }

    // ========================================
    // AUTENTICACIÓN
    // ========================================

    /**
     * Manejar cambios en el estado de autenticación
     */
    async handleAuthStateChanged(user) {
        if (user) {
            this.currentUser = user;
            await this.loadUserRole();
            console.log('✅ Usuario autenticado:', user.email, '| Rol:', this.userRole);
            
            // Disparar evento personalizado
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { user, role: this.userRole } 
            }));
        } else {
            this.currentUser = null;
            this.userRole = null;
            console.log('❌ Usuario no autenticado');
            
            window.dispatchEvent(new CustomEvent('userLoggedOut'));
        }
    }

    /**
     * Login con email y password
     */
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Error en login:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Logout
     */
    async logout() {
        try {
            await this.auth.signOut();
            this.detachAllListeners();
            return { success: true };
        } catch (error) {
            console.error('❌ Error en logout:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Registrar nuevo usuario (solo admin puede hacer esto)
     */
    async registerUser(email, password, role = this.USER_ROLES.USUARIO) {
        if (!this.isAdmin()) {
            return { success: false, error: 'Solo administradores pueden crear usuarios' };
        }

        try {
            // Crear usuario en Firebase Auth usando Cloud Function
            // (En producción, esto debería hacerse desde el backend)
            const result = await this.createUserAccount(email, password, role);
            return { success: true, user: result };
        } catch (error) {
            console.error('❌ Error registrando usuario:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Crear cuenta de usuario (simulado - en producción usar Cloud Function)
     */
    async createUserAccount(email, password, role) {
        // NOTA: Esto requiere Firebase Admin SDK en el backend
        // Por ahora, el admin debe crear usuarios desde Firebase Console
        throw new Error('Crear usuarios debe hacerse desde Firebase Console por ahora');
    }

    /**
     * Cargar rol del usuario desde Firestore
     */
    async loadUserRole() {
        if (!this.currentUser) return null;

        try {
            console.log('🔍 Buscando rol para UID:', this.currentUser.uid);
            const doc = await this.db.collection(this.COLLECTIONS.USUARIOS)
                .doc(this.currentUser.uid)
                .get();

            if (doc.exists) {
                const userData = doc.data();
                console.log('📄 Documento encontrado:', userData);
                this.userRole = userData.role || this.USER_ROLES.LECTURA;
                console.log('✅ Rol asignado:', this.userRole);
                
                // 📋 Si es admin, mostrar secciones de admin automáticamente
                if (this.userRole === 'admin' && window.mostrarSeccionesAdmin) {
                    setTimeout(() => {
                        window.mostrarSeccionesAdmin();
                        console.log('📋 Secciones admin actualizadas después de asignar rol');
                    }, 100);
                }
            } else {
                console.warn('⚠️ Usuario no encontrado en Firestore, asignando rol lectura');
                // Usuario nuevo, asignar rol por defecto
                this.userRole = this.USER_ROLES.LECTURA;
                await this.setUserRole(this.currentUser.uid, this.userRole);
            }

            return this.userRole;
        } catch (error) {
            console.error('❌ Error cargando rol:', error);
            this.userRole = this.USER_ROLES.LECTURA;
            return this.userRole;
        }
    }

    /**
     * Establecer rol de usuario (solo admin)
     */
    async setUserRole(userId, role) {
        if (!this.isAdmin() && userId !== this.currentUser?.uid) {
            throw new Error('Sin permisos para cambiar roles');
        }

        await this.db.collection(this.COLLECTIONS.USUARIOS).doc(userId).set({
            email: this.currentUser?.email || '',
            role: role,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    /**
     * Verificar permisos
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    isAdmin() {
        return this.userRole === this.USER_ROLES.ADMIN;
    }

    canEdit() {
        return this.userRole === this.USER_ROLES.ADMIN || 
               this.userRole === this.USER_ROLES.USUARIO;
    }

    canDelete() {
        return this.userRole === this.USER_ROLES.ADMIN;
    }

    // ========================================
    // OPERACIONES CRUD FIRESTORE
    // ========================================

    /**
     * Crear documento
     */
    async create(collection, data, customId = null) {
        if (!this.canEdit()) {
            throw new Error('Sin permisos para crear');
        }

        try {
            const docData = {
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: this.currentUser.uid,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            };

            let docRef;
            if (customId) {
                docRef = this.db.collection(collection).doc(customId);
                await docRef.set(docData);
            } else {
                docRef = await this.db.collection(collection).add(docData);
            }

            console.log(`✅ Documento creado en ${collection}:`, docRef.id);
            return { success: true, id: docRef.id, data: docData };
        } catch (error) {
            console.error('❌ Error creando documento:', error);
            throw error;
        }
    }

    /**
     * Leer documento por ID
     */
    async read(collection, docId) {
        try {
            const doc = await this.db.collection(collection).doc(docId).get();
            
            if (!doc.exists) {
                return { success: false, error: 'Documento no encontrado' };
            }

            return { 
                success: true, 
                data: { id: doc.id, ...doc.data() } 
            };
        } catch (error) {
            console.error('❌ Error leyendo documento:', error);
            throw error;
        }
    }

    /**
     * Leer todos los documentos de una colección
     */
    async readAll(collection, orderBy = null, limit = null) {
        try {
            let query = this.db.collection(collection);

            if (orderBy) {
                query = query.orderBy(orderBy);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const snapshot = await query.get();
            const documents = [];

            snapshot.forEach(doc => {
                documents.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: documents };
        } catch (error) {
            console.error('❌ Error leyendo colección:', error);
            throw error;
        }
    }

    /**
     * Actualizar documento
     */
    async update(collection, docId, data) {
        if (!this.canEdit()) {
            throw new Error('Sin permisos para editar');
        }

        try {
            const updateData = {
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            };

            await this.db.collection(collection).doc(docId).update(updateData);
            
            console.log(`✅ Documento actualizado en ${collection}:`, docId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error actualizando documento:', error);
            throw error;
        }
    }

    /**
     * Eliminar documento
     */
    async delete(collection, docId) {
        if (!this.canDelete()) {
            throw new Error('Sin permisos para eliminar');
        }

        try {
            await this.db.collection(collection).doc(docId).delete();
            
            console.log(`✅ Documento eliminado de ${collection}:`, docId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error eliminando documento:', error);
            throw error;
        }
    }

    // ========================================
    // LISTENERS EN TIEMPO REAL
    // ========================================

    /**
     * Escuchar cambios en una colección
     */
    listenToCollection(collection, callback, orderBy = null) {
        if (!this.isAuthenticated()) {
            console.warn('⚠️ Usuario no autenticado, listener no activado');
            return null;
        }

        let query = this.db.collection(collection);

        if (orderBy) {
            query = query.orderBy(orderBy);
        }

        const unsubscribe = query.onSnapshot(
            snapshot => {
                const documents = [];
                snapshot.forEach(doc => {
                    documents.push({ id: doc.id, ...doc.data() });
                });
                callback({ success: true, data: documents });
            },
            error => {
                console.error('❌ Error en listener:', error);
                callback({ success: false, error: error.message });
            }
        );

        this.listeners.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Escuchar cambios en un documento específico
     */
    listenToDocument(collection, docId, callback) {
        if (!this.isAuthenticated()) {
            console.warn('⚠️ Usuario no autenticado, listener no activado');
            return null;
        }

        const unsubscribe = this.db.collection(collection).doc(docId).onSnapshot(
            doc => {
                if (doc.exists) {
                    callback({ success: true, data: { id: doc.id, ...doc.data() } });
                } else {
                    callback({ success: false, error: 'Documento no encontrado' });
                }
            },
            error => {
                console.error('❌ Error en listener:', error);
                callback({ success: false, error: error.message });
            }
        );

        this.listeners.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Detener un listener específico
     */
    detachListener(unsubscribe) {
        if (unsubscribe) {
            unsubscribe();
            const index = this.listeners.indexOf(unsubscribe);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        }
    }

    /**
     * Detener todos los listeners
     */
    detachAllListeners() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
        console.log('✅ Todos los listeners detenidos');
    }

    // ========================================
    // BÚSQUEDAS Y QUERIES
    // ========================================

    /**
     * Buscar documentos con filtros
     */
    async query(collection, filters = [], orderBy = null, limit = null) {
        try {
            let query = this.db.collection(collection);

            // Aplicar filtros
            filters.forEach(filter => {
                query = query.where(filter.field, filter.operator, filter.value);
            });

            if (orderBy) {
                query = query.orderBy(orderBy);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const snapshot = await query.get();
            const documents = [];

            snapshot.forEach(doc => {
                documents.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: documents };
        } catch (error) {
            console.error('❌ Error en query:', error);
            throw error;
        }
    }

    // ========================================
    // UTILIDADES
    // ========================================

    /**
     * Obtener mensaje de error traducido
     */
    getErrorMessage(error) {
        const errorMessages = {
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/email-already-in-use': 'Email ya registrado',
            'auth/weak-password': 'Contraseña muy débil (mínimo 6 caracteres)',
            'auth/invalid-email': 'Email inválido',
            'auth/network-request-failed': 'Error de conexión',
            'permission-denied': 'Sin permisos para esta operación'
        };

        return errorMessages[error.code] || error.message || 'Error desconocido';
    }

    /**
     * Obtener información del usuario actual
     */
    getCurrentUser() {
        return {
            uid: this.currentUser?.uid,
            email: this.currentUser?.email,
            role: this.userRole,
            isAuthenticated: this.isAuthenticated(),
            isAdmin: this.isAdmin(),
            canEdit: this.canEdit(),
            canDelete: this.canDelete()
        };
    }

    // ========================================
    // ACTIVITY LOG - Historial de Actividad
    // ========================================

    /**
     * Registrar actividad en el historial
     * @param {string} action - Tipo de acción: 'create', 'update', 'delete'
     * @param {string} entityType - Tipo de entidad: 'repuesto', 'mapa', 'zona', 'jerarquia'
     * @param {string} entityId - ID de la entidad
     * @param {string} entityName - Nombre descriptivo de la entidad
     * @param {object} details - Detalles adicionales (cambios, valores anteriores, etc.)
     */
    async logActivity(action, entityType, entityId, entityName, details = {}) {
        try {
            if (!this.isAuthenticated()) return;

            const activityData = {
                action,
                entityType,
                entityId,
                entityName,
                details,
                userId: this.currentUser.uid,
                userEmail: this.currentUser.email || 'Usuario',
                userName: this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'Usuario',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                clientTimestamp: new Date().toISOString()
            };

            await this.db.collection('activityLog').add(activityData);
            console.log(`📋 Actividad registrada: ${action} ${entityType} "${entityName}"`);
        } catch (error) {
            // No bloquear operación principal si falla el log
            console.warn('⚠️ No se pudo registrar actividad:', error.message);
        }
    }

    /**
     * Obtener historial de actividad (solo admin)
     * @param {number} limitCount - Límite de registros a obtener
     * @param {string} filterUser - Filtrar por email de usuario (opcional)
     * @param {string} filterAction - Filtrar por tipo de acción (opcional)
     */
    async getActivityLog(limitCount = 100, filterUser = null, filterAction = null) {
        if (!this.isAdmin()) {
            return { success: false, error: 'Solo administradores pueden ver el historial' };
        }

        try {
            let query = this.db.collection('activityLog')
                .orderBy('timestamp', 'desc');

            if (filterUser) {
                query = query.where('userEmail', '==', filterUser);
            }

            if (filterAction) {
                query = query.where('action', '==', filterAction);
            }

            query = query.limit(limitCount);

            const snapshot = await query.get();
            const activities = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                activities.push({
                    id: doc.id,
                    ...data,
                    // Convertir timestamp de Firestore a Date
                    timestamp: data.timestamp?.toDate() || new Date(data.clientTimestamp)
                });
            });

            return { success: true, data: activities };
        } catch (error) {
            console.error('❌ Error obteniendo historial:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Limpiar historial antiguo (solo admin, opcional)
     * @param {number} daysToKeep - Días a mantener
     */
    async cleanOldActivity(daysToKeep = 30) {
        if (!this.isAdmin()) {
            return { success: false, error: 'Solo administradores pueden limpiar el historial' };
        }

        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const snapshot = await this.db.collection('activityLog')
                .where('timestamp', '<', cutoffDate)
                .get();

            const batch = this.db.batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            console.log(`🗑️ Eliminados ${snapshot.size} registros antiguos del historial`);
            return { success: true, deleted: snapshot.size };
        } catch (error) {
            console.error('❌ Error limpiando historial:', error);
            return { success: false, error: error.message };
        }
    }
}

// Exportar instancia global
window.firebaseService = new FirebaseService();
