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
     * 🆕 v6.058 - Guardar en localStorage para persistencia entre actualizaciones
     * 🆕 v6.066 - Ignorar usuarios anónimos (usados para custom auth)
     */
    async handleAuthStateChanged(user) {
        console.log('🔥 [v6.066] handleAuthStateChanged llamado:', user ? `UID: ${user.uid}, isAnonymous: ${user.isAnonymous}, email: ${user.email}` : 'NULL');
        
        if (user) {
            // 🆕 v6.066 - Ignorar usuarios anónimos de Firebase (usados para custom auth)
            if (user.isAnonymous) {
                console.log('🔄 [v6.066] Usuario anónimo de Firebase detectado - ignorando (usado para custom auth)');
                // NO hacer nada más - la sesión custom ya está manejada
                return;
            }
            
            // Solo procesar usuarios NO anónimos (admins con email/password)
            console.log('✅ [v6.066] Usuario NO anónimo - procesando como admin...');
            
            this.currentUser = user;
            await this.loadUserRole();
            console.log('✅ Usuario autenticado:', user.email, '| Rol:', this.userRole);
            
            // 🆕 v6.058 - Guardar en localStorage para persistir entre actualizaciones
            localStorage.setItem('customAuth', JSON.stringify({
                type: 'admin',
                email: user.email,
                role: this.userRole,
                uid: user.uid,
                loginTime: new Date().toISOString()
            }));
            localStorage.setItem('userRole', this.userRole);
            
            // 🆕 v6.050 - Actualizar presencia de admin
            this.updateAdminPresence(user);
            
            // Disparar evento personalizado
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { user, role: this.userRole } 
            }));
        } else {
            this.currentUser = null;
            this.userRole = null;
            
            // 🆕 v6.075 - NO disparar userLoggedOut si hay sesión custom activa
            const customAuth = localStorage.getItem('customAuth') || sessionStorage.getItem('customAuth');
            if (customAuth) {
                try {
                    const authData = JSON.parse(customAuth);
                    // Si hay CUALQUIER tipo de sesión guardada, restaurar y NO disparar logout
                    if (authData.type === 'custom' || authData.type === 'guest' || authData.type === 'admin') {
                        console.log('🔄 [v6.075] Firebase sin usuario, pero hay sesión guardada:', authData.username || authData.email, '| Tipo:', authData.type);
                        // Restaurar userRole desde storage
                        this.userRole = authData.role || localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
                        
                        // 🆕 v6.075 - DISPARAR evento de login para restaurar la UI
                        const userSession = {
                            user: {
                                username: authData.username,
                                email: authData.email,
                                displayName: authData.displayName || authData.username || authData.email,
                                role: this.userRole
                            },
                            role: this.userRole,
                            type: authData.type
                        };
                        console.log('✅ [v6.075] Restaurando sesión y actualizando UI:', userSession.user.username || userSession.user.email);
                        
                        // Disparar evento para que LoginUI actualice la UI
                        setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('customAuthSuccess', { detail: userSession }));
                        }, 100);
                        
                        return;
                    }
                } catch (e) {
                    console.warn('⚠️ Error parseando customAuth:', e);
                }
            }
            
            console.log('❌ Usuario no autenticado (sin sesión custom)');
            
            window.dispatchEvent(new CustomEvent('userLoggedOut'));
        }
    }

    /**
     * 🆕 v6.050 - Actualizar presencia del admin con toda la info de conexión
     */
    async updateAdminPresence(user) {
        try {
            // Usar getDeviceInfo de customAuthService si está disponible
            const deviceInfo = window.customAuthService?.getDeviceInfo?.() || this.getBasicDeviceInfo();
            
            await this.db.collection('adminUsers').doc(user.uid).set({
                email: user.email,
                role: 'admin',
                presence: {
                    status: 'online',
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                    device: deviceInfo.device || 'PC',
                    deviceModel: deviceInfo.deviceModel || '',
                    isMobile: deviceInfo.isMobile || false,
                    os: deviceInfo.os || 'unknown',
                    osVersion: deviceInfo.osVersion || '',
                    browser: deviceInfo.browser || 'unknown',
                    browserVersion: deviceInfo.browserVersion || '',
                    screen: deviceInfo.screen || '',
                    language: deviceInfo.language || '',
                    timezone: deviceInfo.timezone || '',
                    connectionType: deviceInfo.connectionType || 'unknown',
                    connectionSpeed: deviceInfo.connectionSpeed || 'unknown',
                    connectionRtt: deviceInfo.connectionRtt || 'unknown',
                    online: deviceInfo.online !== undefined ? deviceInfo.online : true,
                    cpuCores: deviceInfo.cpuCores || 0,
                    memory: deviceInfo.memory || 'unknown',
                    currentSection: 'Login'
                },
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ [v6.050] Presencia de admin actualizada');
            
            // Obtener IP y geo para admin también
            this.updateAdminIPGeo(user.uid);
            
            // Iniciar tracking de ubicación para admin
            this.startAdminLocationTracking(user.uid);
            
        } catch (e) {
            console.warn('⚠️ [v6.050] No se pudo actualizar presencia admin:', e.message);
        }
    }

    /**
     * 🆕 v6.050 - Obtener IP y geolocalización para admin
     */
    async updateAdminIPGeo(uid) {
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const { ip } = await ipResponse.json();
            
            const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            const geoData = await geoResponse.json();
            
            await this.db.collection('adminUsers').doc(uid).update({
                'presence.ip': ip,
                'presence.geo': {
                    city: geoData.city || '',
                    region: geoData.region || '',
                    country: geoData.country_name || '',
                    isp: geoData.org || ''
                }
            });
        } catch (e) {
            console.warn('⚠️ No se pudo obtener IP/Geo para admin:', e.message);
        }
    }

    /**
     * 🆕 v6.050 - Tracking de ubicación en app para admin
     */
    startAdminLocationTracking(uid) {
        if (this.adminLocationInterval) return;
        
        const updateLocation = async () => {
            const section = window.customAuthService?.getCurrentAppLocation?.() || this.getCurrentSection();
            try {
                await this.db.collection('adminUsers').doc(uid).update({
                    'presence.currentSection': section,
                    'presence.lastActivity': firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) { /* silencioso */ }
        };
        
        updateLocation();
        this.adminLocationInterval = setInterval(updateLocation, 30000);
        
        // Actualizar al cambiar de pestaña
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-tab, .tab-button, [data-tab]')) {
                setTimeout(updateLocation, 500);
            }
        });
    }

    /**
     * 🆕 v6.050 - Obtener sección actual de la app
     */
    getCurrentSection() {
        const tabs = ['inventario', 'jerarquia', 'mapa', 'configuracion'];
        for (const tab of tabs) {
            const view = document.getElementById(`${tab}-view`);
            if (view && view.style.display !== 'none') {
                return tab.charAt(0).toUpperCase() + tab.slice(1);
            }
        }
        return 'Desconocido';
    }

    /**
     * 🆕 v6.050 - Info básica del dispositivo (fallback)
     */
    getBasicDeviceInfo() {
        const ua = navigator.userAgent;
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        return {
            device: isMobile ? 'Mobile' : 'PC',
            isMobile,
            browser: ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Otro',
            os: ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') ? 'iOS' : 'unknown',
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            connectionType: conn?.effectiveType || 'unknown',
            connectionSpeed: conn?.downlink ? `${conn.downlink} Mbps` : 'unknown',
            connectionRtt: conn?.rtt ? `${conn.rtt}ms` : 'unknown',
            online: navigator.onLine,
            cpuCores: navigator.hardwareConcurrency || 0,
            memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'unknown'
        };
    }

    /**
     * Login con email y password
     * 🆕 v6.069 - Devuelve el rol después de cargarlo
     */
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            
            // 🆕 v6.069 - Cargar rol inmediatamente y devolverlo
            await this.loadUserRole();
            
            return { success: true, user: userCredential.user, role: this.userRole };
        } catch (error) {
            console.error('❌ Error en login:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Logout - 🆕 v6.058 - Limpia localStorage
     */
    async logout() {
        try {
            // 🆕 v6.058 - Limpiar localStorage al hacer logout explícito
            localStorage.removeItem('customAuth');
            localStorage.removeItem('userRole');
            
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
     * 🆕 v6.068 - Buscar primero en adminUsers y auto-reparar si es necesario
     */
    async loadUserRole() {
        if (!this.currentUser) return null;

        try {
            console.log('🔍 Buscando rol para UID:', this.currentUser.uid);
            
            // 🆕 v6.069 - Primero verificar si es un admin conocido por email
            const adminEmails = ['orelcain@hotmail.com']; // Lista de emails admin
            const userEmail = (this.currentUser.email || '').toLowerCase().trim();
            console.log('🔍 [v6.069] Verificando email:', userEmail, '| adminEmails:', adminEmails);
            const isKnownAdmin = userEmail && adminEmails.includes(userEmail);
            console.log('🔍 [v6.069] isKnownAdmin:', isKnownAdmin);
            
            if (isKnownAdmin) {
                console.log('✅ [v6.068] Email reconocido como admin:', this.currentUser.email);
                this.userRole = this.USER_ROLES.ADMIN;
                
                // Auto-reparar: crear/actualizar documento en adminUsers
                try {
                    await this.db.collection('adminUsers').doc(this.currentUser.uid).set({
                        email: this.currentUser.email,
                        role: 'admin',
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        autoRepaired: true
                    }, { merge: true });
                    console.log('✅ [v6.068] Documento admin auto-reparado en adminUsers');
                } catch (e) {
                    console.warn('⚠️ [v6.068] No se pudo auto-reparar adminUsers:', e.message);
                }
                
                // También en usuarios para consistencia
                try {
                    await this.db.collection(this.COLLECTIONS.USUARIOS).doc(this.currentUser.uid).set({
                        email: this.currentUser.email,
                        role: 'admin',
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    console.log('✅ [v6.068] Documento admin auto-reparado en usuarios');
                } catch (e) {
                    console.warn('⚠️ [v6.068] No se pudo auto-reparar usuarios:', e.message);
                }
                
                return this.userRole;
            }
            
            // Para usuarios no-admin, buscar normalmente
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
                // Usuario nuevo, asignar rol por defecto (NO admin)
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
     * 🆕 v6.072 - También considera sesiones custom (usuarios con nick)
     */
    isAuthenticated() {
        // Firebase Auth user
        if (this.currentUser) return true;
        
        // 🆕 v6.072 - También verificar sesión custom (usuario con nick)
        // Esto permite que usuarios "usuario" y "lectura" puedan leer datos
        const customAuth = localStorage.getItem('customAuth') || sessionStorage.getItem('customAuth');
        if (customAuth) {
            try {
                const authData = JSON.parse(customAuth);
                if (authData.type === 'custom' || authData.type === 'admin' || authData.type === 'guest') {
                    // Establecer userRole si no está establecido
                    if (!this.userRole && authData.role) {
                        this.userRole = authData.role;
                    }
                    return true;
                }
            } catch (e) {}
        }
        
        return false;
    }

    /**
     * 🆕 v6.072 - Obtener el rol actual (desde memoria o storage)
     */
    getUserRole() {
        if (this.userRole) return this.userRole;
        
        // Intentar obtener de storage
        const customAuth = localStorage.getItem('customAuth') || sessionStorage.getItem('customAuth');
        if (customAuth) {
            try {
                const authData = JSON.parse(customAuth);
                if (authData.role) {
                    this.userRole = authData.role;
                    return this.userRole;
                }
            } catch (e) {}
        }
        
        return localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || null;
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

    // 🆕 v6.034 - Permisos granulares
    canCreate() {
        return this.userRole === this.USER_ROLES.ADMIN || 
               this.userRole === this.USER_ROLES.USUARIO;
    }

    canAddPhotos() {
        return this.userRole === this.USER_ROLES.ADMIN || 
               this.userRole === this.USER_ROLES.USUARIO;
    }

    canCount() {
        return this.userRole === this.USER_ROLES.ADMIN || 
               this.userRole === this.USER_ROLES.USUARIO;
    }

    canViewConfig() {
        return this.userRole === this.USER_ROLES.ADMIN;
    }

    // ========================================
    // 🆕 PRESENCIA Y MONITOREO DE USUARIOS
    // ========================================

    /**
     * Actualizar presencia del usuario (online/offline, qué está haciendo)
     */
    async updatePresence(status = 'online', currentView = '', currentAction = '') {
        if (!this.currentUser) return;
        
        try {
            await this.db.collection(this.COLLECTIONS.USUARIOS).doc(this.currentUser.uid).set({
                presence: {
                    status: status,
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                    currentView: currentView,
                    currentAction: currentAction,
                    userAgent: navigator.userAgent.substring(0, 100)
                }
            }, { merge: true });
        } catch (error) {
            console.warn('⚠️ Error actualizando presencia:', error);
        }
    }

    /**
     * Obtener usuarios conectados (solo admin)
     */
    async getOnlineUsers() {
        if (!this.isAdmin()) return [];
        
        try {
            const snapshot = await this.db.collection(this.COLLECTIONS.USUARIOS).get();
            const users = [];
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const lastSeen = data.presence?.lastSeen?.toDate();
                const isOnline = lastSeen && lastSeen > fiveMinutesAgo;
                
                users.push({
                    id: doc.id,
                    email: data.email,
                    role: data.role,
                    isOnline: isOnline,
                    lastSeen: lastSeen,
                    currentView: data.presence?.currentView || '',
                    currentAction: data.presence?.currentAction || ''
                });
            });
            
            return users;
        } catch (error) {
            console.error('❌ Error obteniendo usuarios:', error);
            return [];
        }
    }

    /**
     * Obtener todos los usuarios (solo admin)
     * 🆕 v6.069 - Fix duplicados DEFINITIVO: usar Map para garantizar unicidad por email
     */
    async getAllUsers() {
        if (!this.isAdmin()) return [];
        
        try {
            // Map para almacenar usuarios únicos por email (normalizado)
            const uniqueUsers = new Map();
            
            // 1. Primero obtener admins de adminUsers
            const adminsSnapshot = await this.db.collection('adminUsers').get();
            adminsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const email = (data.email || '').toLowerCase().trim();
                if (email && email.length > 3 && !email.includes('undefined')) {
                    uniqueUsers.set(email, {
                        id: doc.id,
                        isAdminUser: true,
                        role: 'admin',
                        ...data,
                        email: email
                    });
                }
            });
            
            // 2. Obtener usuarios de la colección 'usuarios'
            const usuariosSnapshot = await this.db.collection(this.COLLECTIONS.USUARIOS).get();
            usuariosSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const email = (data.email || '').toLowerCase().trim();
                const nick = data.nick || data.username;
                
                // Si tiene nick (usuario custom), usar nick como clave
                if (nick) {
                    const nickKey = `nick:${nick.toLowerCase()}`;
                    if (!uniqueUsers.has(nickKey)) {
                        uniqueUsers.set(nickKey, {
                            id: doc.id,
                            ...data,
                            nick: nick
                        });
                    }
                } 
                // Si tiene email válido y NO está ya como admin
                else if (email && email.length > 3 && !email.includes('undefined')) {
                    // Solo agregar si no existe ya (los admins tienen prioridad)
                    if (!uniqueUsers.has(email)) {
                        uniqueUsers.set(email, {
                            id: doc.id,
                            ...data,
                            email: email
                        });
                    }
                }
            });
            
            const result = Array.from(uniqueUsers.values());
            console.log(`📋 [v6.069] Usuarios únicos: ${result.length} (sin duplicados)`);
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo usuarios:', error);
            return [];
        }
    }

    /**
     * Actualizar rol de usuario (solo admin)
     */
    async updateUserRole(userId, newRole) {
        if (!this.isAdmin()) {
            return { success: false, error: 'Solo administradores pueden cambiar roles' };
        }
        
        try {
            await this.db.collection(this.COLLECTIONS.USUARIOS).doc(userId).update({
                role: newRole,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Error actualizando rol:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Escuchar cambios en usuarios en tiempo real (solo admin)
     */
    listenToUsers(callback) {
        if (!this.isAdmin()) return null;
        
        return this.db.collection(this.COLLECTIONS.USUARIOS)
            .onSnapshot(snapshot => {
                const users = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(users);
            }, error => {
                console.error('❌ Error en listener de usuarios:', error);
            });
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
