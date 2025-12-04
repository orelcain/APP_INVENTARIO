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
            const doc = await this.db.collection(this.COLLECTIONS.USUARIOS)
                .doc(this.currentUser.uid)
                .get();

            if (doc.exists) {
                this.userRole = doc.data().role || this.USER_ROLES.LECTURA;
            } else {
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
}

// Exportar instancia global
window.firebaseService = new FirebaseService();
