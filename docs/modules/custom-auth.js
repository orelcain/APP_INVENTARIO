/**
 * Custom Authentication System
 * Sistema híbrido de autenticación:
 * - Admin: Firebase Authentication real
 * - Usuarios regulares: Validación en Firestore
 * - Modo invitado: Sin login, solo lectura
 */

class CustomAuth {
    constructor() {
        this.firebaseService = window.firebaseService;
        this.currentUser = null;
        this.userRole = null;
        this.isGuest = false;
        
        // Usuarios predefinidos (guardados en Firestore)
        this.predefinedUsers = [
            { username: 'usuario1', password: 'pass123', role: 'usuario', displayName: 'Usuario 1' },
            { username: 'usuario2', password: 'pass456', role: 'usuario', displayName: 'Usuario 2' },
            { username: 'usuario3', password: 'pass789', role: 'usuario', displayName: 'Usuario 3' },
            { username: 'usuario4', password: 'pass321', role: 'usuario', displayName: 'Usuario 4' },
            { username: 'usuario5', password: 'pass654', role: 'usuario', displayName: 'Usuario 5' }
        ];
    }

    /**
     * Inicializar usuarios en Firestore (solo una vez)
     */
    async initializeUsers() {
        try {
            // Verificar si ya existen usuarios
            const usersCollection = await this.firebaseService.db
                .collection('custom_users')
                .limit(1)
                .get();

            if (usersCollection.empty) {
                console.log('📝 Inicializando usuarios personalizados...');
                
                // Crear usuarios en Firestore
                const batch = this.firebaseService.db.batch();
                
                this.predefinedUsers.forEach(user => {
                    const docRef = this.firebaseService.db
                        .collection('custom_users')
                        .doc(user.username);
                    
                    batch.set(docRef, {
                        username: user.username,
                        password: user.password, // En producción, esto debería estar hasheado
                        role: user.role,
                        displayName: user.displayName,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        isActive: true
                    });
                });

                await batch.commit();
                console.log('✅ Usuarios personalizados creados en Firestore');
            } else {
                console.log('✅ Usuarios personalizados ya existen');
            }
        } catch (error) {
            console.error('❌ Error inicializando usuarios:', error);
        }
    }

    /**
     * Login con sistema híbrido
     * @param {string} identifier - Email (admin) o username (usuarios)
     * @param {string} password - Contraseña
     * @returns {Object} - Resultado del login
     */
    async login(identifier, password) {
        try {
            // Detectar si es email (admin) o username (usuario regular)
            const isEmail = identifier.includes('@');

            if (isEmail) {
                // Login de admin con Firebase Authentication
                return await this.loginAdmin(identifier, password);
            } else {
                // Login de usuario regular con Firestore
                return await this.loginCustomUser(identifier, password);
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Login de admin con Firebase Authentication
     */
    async loginAdmin(email, password) {
        try {
            const result = await this.firebaseService.login(email, password);

            if (result.success) {
                this.currentUser = result.user;
                this.userRole = result.role;
                this.isGuest = false;

                // Guardar en sessionStorage
                sessionStorage.setItem('customAuth', JSON.stringify({
                    type: 'admin',
                    email: email,
                    role: this.userRole
                }));

                console.log('✅ Admin autenticado:', email);

                // Disparar evento personalizado
                window.dispatchEvent(new CustomEvent('customAuthSuccess', {
                    detail: {
                        user: { email, displayName: email },
                        role: this.userRole,
                        type: 'admin'
                    }
                }));

                return { success: true, user: this.currentUser, role: this.userRole };
            }

            return result;
        } catch (error) {
            console.error('❌ Error en login admin:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Login de usuario regular con Firestore
     * 🆕 v6.038 - Busca en custom_users y en usuarios (para nicks creados desde admin)
     */
    async loginCustomUser(username, password) {
        try {
            const usernameLower = username.toLowerCase().trim();
            
            // 1️⃣ Primero buscar en custom_users (usuarios predefinidos)
            const customUserDoc = await this.firebaseService.db
                .collection('custom_users')
                .doc(usernameLower)
                .get();

            if (customUserDoc.exists) {
                const userData = customUserDoc.data();
                
                // Verificar contraseña
                if (userData.password !== password) {
                    return { success: false, error: 'Contraseña incorrecta' };
                }

                // Verificar que esté activo
                if (userData.isActive === false) {
                    return { success: false, error: 'Usuario desactivado' };
                }

                return await this.completeLogin(userData, 'custom_users', usernameLower);
            }

            // 2️⃣ Buscar en usuarios (creados desde panel admin con nick)
            const nickQuery = await this.firebaseService.db
                .collection('usuarios')
                .where('nick', '==', usernameLower)
                .where('active', '==', true)
                .limit(1)
                .get();

            if (!nickQuery.empty) {
                const userDoc = nickQuery.docs[0];
                const userData = userDoc.data();
                
                // Verificar contraseña
                if (userData.password !== password) {
                    return { success: false, error: 'Contraseña incorrecta' };
                }

                return await this.completeLogin({
                    ...userData,
                    username: userData.nick,
                    displayName: userData.nick
                }, 'usuarios', userDoc.id);
            }

            return { success: false, error: 'Usuario no encontrado' };
        } catch (error) {
            console.error('❌ Error en login usuario regular:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🆕 v6.038 - Completar login exitoso
     */
    async completeLogin(userData, collection, docId) {
        // Login exitoso
        this.currentUser = {
            id: docId,
            username: userData.username || userData.nick,
            displayName: userData.displayName || userData.nick || userData.username,
            role: userData.role,
            isNickUser: userData.isNickUser || collection === 'usuarios'
        };
        this.userRole = userData.role;
        this.isGuest = false;

        // Guardar en sessionStorage
        sessionStorage.setItem('customAuth', JSON.stringify({
            type: 'custom',
            username: this.currentUser.username,
            displayName: this.currentUser.displayName,
            role: userData.role,
            collection: collection,
            docId: docId
        }));

        console.log('✅ Usuario regular autenticado:', this.currentUser.username);

        // Actualizar presencia
        try {
            await this.firebaseService.db.collection(collection).doc(docId).update({
                'presence.status': 'online',
                'presence.lastSeen': firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.warn('⚠️ No se pudo actualizar presencia:', e);
        }

        // Registrar login en historial
        await this.logUserAction(this.currentUser.username, 'login', { timestamp: new Date() });

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('customAuthSuccess', {
            detail: {
                user: this.currentUser,
                role: this.userRole,
                type: 'custom'
            }
        }));

        // También disparar userLoggedIn para que se actualicen permisos
        window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: {
                user: this.currentUser,
                role: this.userRole
            }
        }));

        return { success: true, user: this.currentUser, role: this.userRole };
    }

    // Función loginAsGuest eliminada - solo usuarios autorizados

    /**
     * Logout
     */
    async logout() {
        const authData = JSON.parse(sessionStorage.getItem('customAuth') || '{}');

        // Si es admin, hacer logout de Firebase
        if (authData.type === 'admin') {
            await this.firebaseService.logout();
        }

        // Limpiar datos locales
        this.currentUser = null;
        this.userRole = null;
        this.isGuest = false;
        sessionStorage.removeItem('customAuth');

        console.log('👋 Logout exitoso');

        // Disparar evento
        window.dispatchEvent(new CustomEvent('customAuthLogout'));

        return { success: true };
    }

    /**
     * Verificar si hay sesión activa
     */
    hasActiveSession() {
        const authData = sessionStorage.getItem('customAuth');
        return !!authData;
    }

    /**
     * Restaurar sesión desde sessionStorage
     */
    restoreSession() {
        const authData = JSON.parse(sessionStorage.getItem('customAuth') || '{}');

        if (!authData.type) {
            return null;
        }

        if (authData.type === 'admin') {
            this.currentUser = { email: authData.email };
            this.userRole = authData.role;
            this.isGuest = false;
        } else if (authData.type === 'custom') {
            this.currentUser = {
                username: authData.username,
                displayName: authData.displayName,
                role: authData.role
            };
            this.userRole = authData.role;
            this.isGuest = false;
        } else if (authData.type === 'guest') {
            this.currentUser = { username: 'invitado', displayName: 'Invitado', role: 'lectura' };
            this.userRole = 'lectura';
            this.isGuest = true;
        }

        return {
            user: this.currentUser,
            role: this.userRole,
            type: authData.type
        };
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Obtener rol actual
     */
    getUserRole() {
        return this.userRole;
    }

    /**
     * Verificar si es invitado
     */
    isGuestUser() {
        return this.isGuest;
    }

    /**
     * Registrar acción de usuario en Firestore (para tracking)
     */
    async logUserAction(username, action, details = {}) {
        try {
            await this.firebaseService.db
                .collection('user_actions')
                .add({
                    username,
                    action,
                    details,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
        } catch (error) {
            console.error('❌ Error registrando acción:', error);
        }
    }

    /**
     * Obtener historial de acciones de un usuario
     */
    async getUserHistory(username, limit = 50) {
        try {
            const snapshot = await this.firebaseService.db
                .collection('user_actions')
                .where('username', '==', username)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            const history = [];
            snapshot.forEach(doc => {
                history.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: history };
        } catch (error) {
            console.error('❌ Error obteniendo historial:', error);
            return { success: false, error: error.message };
        }
    }
}

// Crear instancia global
window.customAuth = new CustomAuth();
console.log('✅ CustomAuth inicializado');

// Inicializar usuarios automáticamente cuando Firebase esté listo
window.addEventListener('firebaseReady', async () => {
    console.log('🔄 Firebase listo - Inicializando usuarios personalizados...');
    await window.customAuth.initializeUsers();
});

// Si Firebase ya está listo, inicializar inmediatamente
setTimeout(async () => {
    if (window.firebaseService && window.firebaseService.db) {
        console.log('🔄 Firebase detectado - Inicializando usuarios personalizados...');
        await window.customAuth.initializeUsers();
    }
}, 2000);
