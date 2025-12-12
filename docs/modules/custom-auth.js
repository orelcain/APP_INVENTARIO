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
     * 🆕 v6.044 - Detectar información del dispositivo y navegador
     * 🆕 v6.045 - SUPER INFO: todos los datos posibles del usuario
     */
    getDeviceInfo() {
        const ua = navigator.userAgent;
        let deviceType = 'PC';
        let deviceModel = '';
        let browser = 'Desconocido';
        let browserVersion = '';
        let os = 'Desconocido';
        let osVersion = '';

        // ===== DETECTAR TIPO DE DISPOSITIVO Y MODELO =====
        if (/Android/i.test(ua)) {
            deviceType = 'Android';
            // Extraer modelo de Android (ej: "SM-G950F", "Pixel 6")
            const androidMatch = ua.match(/Android[^;]*;\s*([^)]+)/);
            if (androidMatch) {
                deviceModel = androidMatch[1].replace(/Build\/.*/, '').trim();
            }
        } else if (/iPhone/i.test(ua)) {
            deviceType = 'iPhone';
            const iphoneMatch = ua.match(/iPhone[^;]*;?\s*(CPU[^)]*)?/);
            deviceModel = 'iPhone';
        } else if (/iPad/i.test(ua)) {
            deviceType = 'iPad';
            deviceModel = 'iPad';
        } else if (/iPod/i.test(ua)) {
            deviceType = 'iPod';
        } else if (/Mobile/i.test(ua)) {
            deviceType = 'Mobile';
        } else if (/Tablet/i.test(ua)) {
            deviceType = 'Tablet';
        }

        // ===== DETECTAR SISTEMA OPERATIVO =====
        if (/Windows NT 10/i.test(ua)) {
            os = 'Windows';
            osVersion = '10/11';
        } else if (/Windows NT 6.3/i.test(ua)) {
            os = 'Windows';
            osVersion = '8.1';
        } else if (/Windows NT 6.2/i.test(ua)) {
            os = 'Windows';
            osVersion = '8';
        } else if (/Windows NT 6.1/i.test(ua)) {
            os = 'Windows';
            osVersion = '7';
        } else if (/Mac OS X/i.test(ua)) {
            os = 'macOS';
            const macMatch = ua.match(/Mac OS X ([\d_]+)/);
            if (macMatch) osVersion = macMatch[1].replace(/_/g, '.');
        } else if (/Android ([\d.]+)/i.test(ua)) {
            os = 'Android';
            const androidVer = ua.match(/Android ([\d.]+)/i);
            if (androidVer) osVersion = androidVer[1];
        } else if (/iPhone OS ([\d_]+)/i.test(ua) || /CPU OS ([\d_]+)/i.test(ua)) {
            os = 'iOS';
            const iosMatch = ua.match(/(?:iPhone OS|CPU OS) ([\d_]+)/i);
            if (iosMatch) osVersion = iosMatch[1].replace(/_/g, '.');
        } else if (/Linux/i.test(ua)) {
            os = 'Linux';
        } else if (/CrOS/i.test(ua)) {
            os = 'Chrome OS';
        }

        // ===== DETECTAR NAVEGADOR Y VERSIÓN =====
        if (/Edg\/([\d.]+)/i.test(ua)) {
            browser = 'Edge';
            const edgeMatch = ua.match(/Edg\/([\d.]+)/i);
            if (edgeMatch) browserVersion = edgeMatch[1];
        } else if (/OPR\/([\d.]+)/i.test(ua) || /Opera\/([\d.]+)/i.test(ua)) {
            browser = 'Opera';
            const operaMatch = ua.match(/(?:OPR|Opera)\/([\d.]+)/i);
            if (operaMatch) browserVersion = operaMatch[1];
        } else if (/Chrome\/([\d.]+)/i.test(ua)) {
            browser = 'Chrome';
            const chromeMatch = ua.match(/Chrome\/([\d.]+)/i);
            if (chromeMatch) browserVersion = chromeMatch[1];
        } else if (/Firefox\/([\d.]+)/i.test(ua)) {
            browser = 'Firefox';
            const firefoxMatch = ua.match(/Firefox\/([\d.]+)/i);
            if (firefoxMatch) browserVersion = firefoxMatch[1];
        } else if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
            browser = 'Safari';
            const safariMatch = ua.match(/Version\/([\d.]+)/i);
            if (safariMatch) browserVersion = safariMatch[1];
        } else if (/MSIE ([\d.]+)/i.test(ua) || /Trident/i.test(ua)) {
            browser = 'IE';
            const ieMatch = ua.match(/(?:MSIE |rv:)([\d.]+)/i);
            if (ieMatch) browserVersion = ieMatch[1];
        } else if (/SamsungBrowser\/([\d.]+)/i.test(ua)) {
            browser = 'Samsung Browser';
            const samsungMatch = ua.match(/SamsungBrowser\/([\d.]+)/i);
            if (samsungMatch) browserVersion = samsungMatch[1];
        }

        // ===== INFORMACIÓN DE PANTALLA =====
        const screenInfo = {
            width: window.screen?.width || 0,
            height: window.screen?.height || 0,
            availWidth: window.screen?.availWidth || 0,
            availHeight: window.screen?.availHeight || 0,
            colorDepth: window.screen?.colorDepth || 0,
            pixelRatio: window.devicePixelRatio || 1,
            orientation: window.screen?.orientation?.type || 'unknown'
        };

        // ===== INFORMACIÓN DE CONEXIÓN =====
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const connectionInfo = {
            type: connection?.effectiveType || 'unknown', // 4g, 3g, 2g, slow-2g
            downlink: connection?.downlink || 0, // Mbps
            rtt: connection?.rtt || 0, // ms
            saveData: connection?.saveData || false
        };

        // ===== IDIOMA Y ZONA HORARIA =====
        const localeInfo = {
            language: navigator.language || 'unknown',
            languages: navigator.languages?.join(', ') || navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset()
        };

        // ===== CAPACIDADES DEL DISPOSITIVO =====
        const capabilities = {
            cookiesEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency || 0, // CPU cores
            maxTouchPoints: navigator.maxTouchPoints || 0,
            pdfViewerEnabled: navigator.pdfViewerEnabled || false,
            memory: navigator.deviceMemory || 0 // GB RAM (solo Chrome)
        };

        // ===== RESULTADO COMPLETO =====
        const isMobile = deviceType !== 'PC';
        
        return {
            // Básico
            device: deviceType,
            deviceModel: deviceModel,
            isMobile: isMobile,
            
            // Sistema Operativo
            os: os,
            osVersion: osVersion,
            platform: navigator.platform || 'unknown',
            
            // Navegador
            browser: browser,
            browserVersion: browserVersion,
            
            // Pantalla
            screen: `${screenInfo.width}x${screenInfo.height}`,
            screenWidth: screenInfo.width,
            screenHeight: screenInfo.height,
            pixelRatio: screenInfo.pixelRatio,
            orientation: screenInfo.orientation,
            
            // 🆕 v6.050 - Conexión COMPLETA
            connectionType: connectionInfo.type,
            connectionSpeed: connectionInfo.downlink ? `${connectionInfo.downlink} Mbps` : 'unknown',
            connectionRtt: connectionInfo.rtt ? `${connectionInfo.rtt}ms` : 'unknown',
            connectionSaveData: connectionInfo.saveData,
            
            // Locale
            language: localeInfo.language,
            timezone: localeInfo.timezone,
            
            // Hardware
            cpuCores: capabilities.hardwareConcurrency,
            memory: capabilities.memory ? `${capabilities.memory} GB` : 'unknown',
            touchPoints: capabilities.maxTouchPoints,
            
            // Estado
            online: capabilities.onLine,
            
            // User Agent completo (para debug)
            userAgent: ua.substring(0, 300),
            
            // Timestamp
            detectedAt: new Date().toISOString()
        };
    }

    /**
     * 🆕 v6.050 - Trackear ubicación actual en la app
     */
    getCurrentAppLocation() {
        // Detectar qué pestaña/sección está activa
        const activeTab = document.querySelector('.nav-tab.active, .tab-button.active, [data-tab].active');
        let section = 'Desconocido';
        
        if (activeTab) {
            section = activeTab.textContent?.trim() || activeTab.dataset?.tab || 'Tab activa';
        } else {
            // Buscar por visibilidad de contenedores
            if (document.getElementById('inventario-view')?.style.display !== 'none') {
                section = 'Inventario';
            } else if (document.getElementById('jerarquia-view')?.style.display !== 'none') {
                section = 'Jerarquía';
            } else if (document.getElementById('mapa-view')?.style.display !== 'none') {
                section = 'Mapa';
            } else if (document.getElementById('configuracion-view')?.style.display !== 'none') {
                section = 'Configuración';
            }
        }
        
        // Detectar si hay algún modal abierto
        const modalOpen = document.querySelector('.modal.show, .mobile-modal-overlay.active, [class*="modal"]:not([style*="display: none"])');
        if (modalOpen) {
            const modalTitle = modalOpen.querySelector('.modal-title, .mobile-modal-title, h2, h3')?.textContent?.trim();
            if (modalTitle) {
                section += ` > ${modalTitle}`;
            } else {
                section += ' > Modal abierto';
            }
        }
        
        return section;
    }

    /**
     * 🆕 v6.050 - Actualizar ubicación en app cada X segundos
     */
    startLocationTracking() {
        if (this.locationTrackingInterval) return;
        
        const updateLocation = async () => {
            if (!this.currentUser || !this.isAuthenticated()) return;
            
            const appLocation = this.getCurrentAppLocation();
            const collection = this.currentUser.collection || 'usuarios';
            const docId = this.currentUser.docId;
            
            if (!docId) return;
            
            try {
                await this.firebaseService.db.collection(collection).doc(docId).update({
                    'presence.currentSection': appLocation,
                    'presence.lastActivity': firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                // Silencioso - no queremos llenar los logs
            }
        };
        
        // Actualizar inmediatamente
        updateLocation();
        
        // Actualizar cada 30 segundos
        this.locationTrackingInterval = setInterval(updateLocation, 30000);
        
        // También actualizar cuando cambie de pestaña
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-tab, .tab-button, [data-tab]')) {
                setTimeout(updateLocation, 500);
            }
        });
    }

    stopLocationTracking() {
        if (this.locationTrackingInterval) {
            clearInterval(this.locationTrackingInterval);
            this.locationTrackingInterval = null;
        }
    }

    /**
     * 🆕 v6.045 - Obtener IP pública (requiere servicio externo)
     */
    async getPublicIP() {
        try {
            // Usar servicio gratuito para obtener IP
            const response = await fetch('https://api.ipify.org?format=json', { 
                timeout: 3000 
            });
            const data = await response.json();
            return data.ip;
        } catch (e) {
            console.warn('⚠️ No se pudo obtener IP pública:', e.message);
            return null;
        }
    }

    /**
     * 🆕 v6.045 - Obtener info de geolocalización por IP
     */
    async getGeoLocation(ip) {
        if (!ip) return null;
        try {
            // Usar servicio gratuito de geolocalización
            const response = await fetch(`https://ipapi.co/${ip}/json/`, {
                timeout: 3000
            });
            const data = await response.json();
            return {
                city: data.city || 'unknown',
                region: data.region || 'unknown',
                country: data.country_name || 'unknown',
                countryCode: data.country_code || 'unknown',
                isp: data.org || 'unknown',
                latitude: data.latitude,
                longitude: data.longitude
            };
        } catch (e) {
            console.warn('⚠️ No se pudo obtener geolocalización:', e.message);
            return null;
        }
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

                // 🆕 v6.074 - Guardar en localStorage para persistencia entre refrescos
                localStorage.setItem('customAuth', JSON.stringify({
                    type: 'admin',
                    email: email,
                    role: this.userRole,
                    loginTime: new Date().toISOString()
                }));
                localStorage.setItem('userRole', this.userRole);

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
            console.log('🔍 [DEBUG] Intentando login con nick:', usernameLower);
            
            // 1️⃣ Primero buscar en custom_users (usuarios predefinidos)
            const customUserDoc = await this.firebaseService.db
                .collection('custom_users')
                .doc(usernameLower)
                .get();

            console.log('🔍 [DEBUG] Buscado en custom_users:', customUserDoc.exists);

            if (customUserDoc.exists) {
                const userData = customUserDoc.data();
                console.log('🔍 [DEBUG] Usuario encontrado en custom_users:', userData.username);
                
                // Verificar contraseña
                if (userData.password !== password) {
                    console.log('❌ [DEBUG] Contraseña incorrecta en custom_users');
                    return { success: false, error: 'Contraseña incorrecta' };
                }

                // Verificar que esté activo
                if (userData.isActive === false) {
                    return { success: false, error: 'Usuario desactivado' };
                }

                return await this.completeLogin(userData, 'custom_users', usernameLower);
            }

            // 2️⃣ Buscar en usuarios (creados desde panel admin con nick)
            console.log('🔍 [DEBUG] Buscando en colección usuarios con nick:', usernameLower);
            
            // 🆕 v6.045 - Primero buscar solo por nick (sin filtro active) para debug
            let nickQuery;
            try {
                nickQuery = await this.firebaseService.db
                    .collection('usuarios')
                    .where('nick', '==', usernameLower)
                    .limit(1)
                    .get();
            } catch (queryError) {
                console.error('❌ [DEBUG] Error en query:', queryError);
                // Fallback: buscar todos y filtrar manualmente
                const allUsers = await this.firebaseService.db.collection('usuarios').get();
                const matchingUser = allUsers.docs.find(doc => {
                    const data = doc.data();
                    return data.nick?.toLowerCase() === usernameLower;
                });
                if (matchingUser) {
                    nickQuery = { empty: false, docs: [matchingUser] };
                } else {
                    nickQuery = { empty: true, docs: [] };
                }
            }

            console.log('🔍 [DEBUG] Resultados en usuarios:', nickQuery.empty ? 'VACÍO' : nickQuery.docs.length + ' encontrado(s)');

            if (!nickQuery.empty) {
                const userDoc = nickQuery.docs[0];
                const userData = userDoc.data();
                console.log('🔍 [DEBUG] Usuario encontrado:', { 
                    nick: userData.nick, 
                    role: userData.role, 
                    hasPassword: !!userData.password,
                    active: userData.active
                });
                
                // 🆕 v6.045 - Verificar que el usuario esté activo
                if (userData.active === false) {
                    console.log('❌ [DEBUG] Usuario desactivado');
                    return { success: false, error: 'Usuario desactivado. Contacte al administrador.' };
                }
                
                // Verificar contraseña
                if (userData.password !== password) {
                    console.log('❌ [DEBUG] Contraseña NO coincide. Esperada:', userData.password?.substring(0,3) + '***', 'Recibida:', password?.substring(0,3) + '***');
                    return { success: false, error: 'Contraseña incorrecta' };
                }

                console.log('✅ [DEBUG] Contraseña correcta, completando login...');
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
     * 🆕 v6.047 - SIMPLIFICADO: Sin Firebase Auth para usuarios nick
     * La seguridad se maneja en el código, no en reglas de Firestore
     */
    async completeLogin(userData, collection, docId) {
        console.log('🔐 [v6.047] Completando login para:', userData.nick || userData.username);
        
        // Detectar información del dispositivo
        const deviceInfo = this.getDeviceInfo();
        
        // Login exitoso - guardar en memoria
        this.currentUser = {
            id: docId,
            username: userData.username || userData.nick,
            displayName: userData.displayName || userData.nick || userData.username,
            role: userData.role,
            isNickUser: userData.isNickUser || collection === 'usuarios'
        };
        this.userRole = userData.role;
        this.isGuest = false;

        // 🆕 v6.074 - Guardar rol en localStorage para que mostrarSeccionesAdmin lo encuentre
        localStorage.setItem('userRole', userData.role);

        // 🆕 v6.074 - Guardar en localStorage para persistencia entre refrescos
        localStorage.setItem('customAuth', JSON.stringify({
            type: 'custom',
            username: this.currentUser.username,
            displayName: this.currentUser.displayName,
            role: userData.role,
            collection: collection,
            docId: docId,
            loginTime: new Date().toISOString()
        }));

        console.log('✅ [v6.047] Usuario autenticado:', this.currentUser.username, 'Rol:', this.userRole);
        console.log('📱 Dispositivo:', deviceInfo.device, deviceInfo.browser);

        // Actualizar presencia en Firestore (ahora funciona porque las reglas son públicas)
        try {
            await this.firebaseService.db.collection(collection).doc(docId).update({
                'presence.status': 'online',
                'presence.lastSeen': firebase.firestore.FieldValue.serverTimestamp(),
                'presence.device': deviceInfo.device,
                'presence.deviceModel': deviceInfo.deviceModel || '',
                'presence.isMobile': deviceInfo.isMobile,
                'presence.os': deviceInfo.os,
                'presence.osVersion': deviceInfo.osVersion || '',
                'presence.browser': deviceInfo.browser,
                'presence.browserVersion': deviceInfo.browserVersion || '',
                'presence.screen': deviceInfo.screen,
                'presence.language': deviceInfo.language,
                'presence.timezone': deviceInfo.timezone,
                // 🆕 v6.050 - Más datos de conexión
                'presence.connectionType': deviceInfo.connectionType || 'unknown',
                'presence.connectionSpeed': deviceInfo.connectionSpeed || 'unknown',
                'presence.connectionRtt': deviceInfo.connectionRtt || 'unknown',
                'presence.online': deviceInfo.online,
                'presence.cpuCores': deviceInfo.cpuCores || 0,
                'presence.memory': deviceInfo.memory || 'unknown',
                'presence.currentSection': 'Login',
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ [v6.047] Presencia actualizada en Firestore');
        } catch (e) {
            console.warn('⚠️ [v6.047] No se pudo actualizar presencia:', e.message);
        }

        // Obtener IP y geolocalización en background
        this.getPublicIP().then(async (ip) => {
            if (ip) {
                const geoInfo = await this.getGeoLocation(ip);
                console.log('🌍 IP:', ip, 'Ubicación:', geoInfo?.city);
                try {
                    await this.firebaseService.db.collection(collection).doc(docId).update({
                        'presence.ip': ip,
                        'presence.geo': geoInfo
                    });
                } catch (e) {
                    console.warn('⚠️ No se pudo guardar IP/Geo:', e.message);
                }
            }
        }).catch(e => console.warn('⚠️ Error obteniendo IP:', e.message));

        // Registrar login en historial
        try {
            await this.logUserAction(this.currentUser.username, 'login', { 
                timestamp: new Date(),
                device: deviceInfo.device,
                browser: deviceInfo.browser
            });
        } catch (e) {
            console.warn('⚠️ [v6.047] No se pudo registrar acción:', e.message);
        }

        // Disparar eventos para que la UI se actualice
        window.dispatchEvent(new CustomEvent('customAuthSuccess', {
            detail: {
                user: this.currentUser,
                role: this.userRole,
                type: 'custom'
            }
        }));

        window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: {
                user: this.currentUser,
                role: this.userRole
            }
        }));

        // 🆕 v6.048 - Llamar directamente a mostrarSeccionesAdmin para ocultar Config si no es admin
        setTimeout(() => {
            if (window.mostrarSeccionesAdmin) {
                console.log('🔄 [v6.048] Llamando mostrarSeccionesAdmin después de login');
                window.mostrarSeccionesAdmin();
            }
        }, 100);

        // 🆕 v6.050 - Iniciar tracking de ubicación en la app
        this.currentUser.collection = collection;
        this.currentUser.docId = docId;
        setTimeout(() => this.startLocationTracking(), 1000);

        return { success: true, user: this.currentUser, role: this.userRole };
    }

    // Función loginAsGuest eliminada - solo usuarios autorizados

    /**
     * Logout
     * 🆕 v6.074 - Limpiar tanto localStorage como sessionStorage
     */
    async logout() {
        const authData = JSON.parse(localStorage.getItem('customAuth') || sessionStorage.getItem('customAuth') || '{}');

        // Si es admin, hacer logout de Firebase
        if (authData.type === 'admin') {
            await this.firebaseService.logout();
        }

        // Limpiar datos locales
        this.currentUser = null;
        this.userRole = null;
        this.isGuest = false;
        
        // 🆕 v6.074 - Limpiar ambos storages
        localStorage.removeItem('customAuth');
        localStorage.removeItem('userRole');
        sessionStorage.removeItem('customAuth');
        sessionStorage.removeItem('userRole');

        console.log('👋 Logout exitoso');

        // Disparar evento
        window.dispatchEvent(new CustomEvent('customAuthLogout'));

        return { success: true };
    }

    /**
     * Verificar si hay sesión activa
     */
    hasActiveSession() {
        const authData = sessionStorage.getItem('customAuth') || localStorage.getItem('customAuth');
        return !!authData;
    }

    /**
     * 🆕 v6.074 - Verificar si está autenticado (alias de hasActiveSession)
     */
    isAuthenticated() {
        return this.currentUser !== null || this.hasActiveSession();
    }

    /**
     * Restaurar sesión desde sessionStorage o localStorage
     * 🆕 v6.069 - Priorizar localStorage para admins y verificar rol con firebaseService
     * 🆕 v6.078 - Actualizar presencia en Firestore al restaurar sesión
     */
    async restoreSession() {
        // 🆕 v6.069 - Primero intentar localStorage (usado por firebase-service para admins)
        let authData = JSON.parse(localStorage.getItem('customAuth') || '{}');
        
        // Si no hay en localStorage, intentar sessionStorage
        if (!authData.type) {
            authData = JSON.parse(sessionStorage.getItem('customAuth') || '{}');
        }

        if (!authData.type) {
            return null;
        }

        if (authData.type === 'admin') {
            this.currentUser = { email: authData.email };
            // 🆕 v6.069 - Obtener rol del firebaseService si está disponible, o de localStorage
            this.userRole = this.firebaseService?.userRole || 
                           authData.role || 
                           localStorage.getItem('userRole') || 
                           'admin'; // Default para admins conocidos
            this.isGuest = false;
            
            console.log('🔄 [v6.069] Sesión admin restaurada, rol:', this.userRole);
        } else if (authData.type === 'custom') {
            this.currentUser = {
                username: authData.username,
                displayName: authData.displayName,
                role: authData.role,
                collection: authData.collection || 'usuarios',
                docId: authData.docId
            };
            this.userRole = authData.role;
            this.isGuest = false;
            
            // 🆕 v6.078 - Actualizar presencia en Firestore al restaurar sesión custom
            if (authData.collection && authData.docId && this.firebaseService?.db) {
                try {
                    const deviceInfo = this.getDeviceInfo();
                    await this.firebaseService.db.collection(authData.collection).doc(authData.docId).update({
                        'presence.status': 'online',
                        'presence.lastSeen': firebase.firestore.FieldValue.serverTimestamp(),
                        'presence.device': deviceInfo.type,
                        'presence.browser': deviceInfo.browser,
                        'presence.currentSection': this.getCurrentAppLocation()
                    });
                    console.log('✅ [v6.078] Presencia actualizada al restaurar sesión:', authData.username);
                } catch (e) {
                    console.warn('⚠️ [v6.078] Error actualizando presencia al restaurar:', e.message);
                }
            }
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
