/**
 * Login UI - Interfaz de autenticación
 * Modal de login con email/password y gestión de sesión
 */

class LoginUI {
    constructor() {
        console.log('🔐 [v6.070] LoginUI CONSTRUCTOR - INICIO');
        console.log('🔐 [v6.070] customAuth en localStorage AHORA:', localStorage.getItem('customAuth') ? 'EXISTE' : 'NULL');
        
        this.firebaseService = window.firebaseService;
        this.customAuth = window.customAuth;
        this.isLoginModalCreated = false;
        this.APP_VERSION = 'v6.070'; // 🆕 v6.070 - Fix caché rol admin + versión scripts
        
        // 🆕 v6.070 - Limpiar rol corrupto de admin conocido ANTES de restaurar sesión
        this.fixAdminRoleIfNeeded();
        
        // 🆕 v6.060 - Verificar sesión ANTES de crear el modal
        this.checkSavedSession();
    }
    
    /**
     * 🆕 v6.070 - Limpiar localStorage si admin conocido tiene rol incorrecto
     */
    fixAdminRoleIfNeeded() {
        const adminEmails = ['orelcain@hotmail.com'];
        const savedAuth = localStorage.getItem('customAuth');
        const savedRole = localStorage.getItem('userRole');
        
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                const email = (authData.email || '').toLowerCase();
                
                if (adminEmails.includes(email) && savedRole !== 'admin') {
                    console.log('🔧 [v6.070] Admin conocido con rol incorrecto detectado:', email);
                    console.log('🔧 [v6.070] Rol actual:', savedRole, '→ Corrigiendo a admin');
                    
                    // Corregir localStorage
                    authData.role = 'admin';
                    localStorage.setItem('customAuth', JSON.stringify(authData));
                    localStorage.setItem('userRole', 'admin');
                    
                    console.log('✅ [v6.070] Rol corregido en localStorage');
                }
            } catch (e) {
                console.warn('⚠️ [v6.070] Error verificando rol admin:', e);
            }
        }
    }

    /**
     * 🆕 v6.060 - Verificar si hay sesión guardada antes de mostrar login
     */
    checkSavedSession() {
        const savedAuth = localStorage.getItem('customAuth');
        console.log('🔍 [v6.060] Verificando sesión guardada:', savedAuth ? 'ENCONTRADA' : 'NO HAY');
        
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                console.log('📋 [v6.060] Tipo de sesión:', authData.type, '- Usuario:', authData.username || authData.email);
                
                // Hay sesión válida guardada - NO mostrar login
                this.sessionRestored = true;
                this.savedAuthData = authData;
                
                // Inicializar después de que el DOM esté listo
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.initWithSession());
                } else {
                    this.initWithSession();
                }
                return;
            } catch (e) {
                console.error('❌ [v6.060] Error parseando sesión:', e);
                localStorage.removeItem('customAuth');
            }
        }
        
        // No hay sesión guardada - iniciar normalmente
        this.sessionRestored = false;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * 🆕 v6.060 - Inicializar con sesión ya restaurada
     * 🆕 v6.067 - Mejorado para esperar a que customAuthService esté listo
     */
    async initWithSession() {
        console.log('🔄 [v6.067] Iniciando con sesión restaurada...');
        
        // Crear modal pero NO mostrarlo
        this.createLoginModal();
        this.hideLoginModal();
        
        // Verificar versión
        this.checkAppVersion();
        
        // Configurar listeners
        window.addEventListener('userLoggedIn', (e) => this.handleLoginSuccess(e.detail));
        window.addEventListener('customAuthSuccess', (e) => this.handleLoginSuccess(e.detail));
        window.addEventListener('userLoggedOut', () => this.handleLogout());
        window.addEventListener('customAuthLogout', () => this.handleLogout());
        
        // 🆕 v6.067 - Esperar a que customAuthService esté disponible (máx 3 segundos)
        let customAuthInstance = this.customAuth || window.customAuthService || window.customAuth;
        let attempts = 0;
        while (!customAuthInstance && attempts < 30) {
            await new Promise(r => setTimeout(r, 100));
            customAuthInstance = this.customAuth || window.customAuthService || window.customAuth;
            attempts++;
        }
        
        console.log('🔄 [v6.067] customAuthInstance disponible:', !!customAuthInstance, `(después de ${attempts * 100}ms)`);
        
        // Restaurar sesión en customAuth
        if (customAuthInstance) {
            console.log('🔄 [v6.067] Intentando restoreSession...');
            const session = customAuthInstance.restoreSession();
            console.log('🔄 [v6.067] Resultado restoreSession:', session);
            if (session && session.user) {
                console.log('✅ [v6.067] Sesión restaurada:', session.user.username || session.user.email, '| Rol:', session.role);
                this.handleLoginSuccess(session);
                return;
            }
        } else {
            console.log('⚠️ [v6.067] customAuth NO disponible después de esperar');
        }
        
        // Si customAuth no está listo, usar datos guardados directamente
        console.log('🔄 [v6.067] Intentando usar savedAuthData:', this.savedAuthData);
        if (this.savedAuthData) {
            const session = {
                user: {
                    username: this.savedAuthData.username,
                    email: this.savedAuthData.email,
                    displayName: this.savedAuthData.displayName || this.savedAuthData.username || this.savedAuthData.email,
                    role: this.savedAuthData.role
                },
                role: this.savedAuthData.role,
                type: this.savedAuthData.type
            };
            console.log('✅ [v6.067] Sesión restaurada desde savedAuthData:', session.user.username || session.user.email, '| Rol:', session.role);
            this.handleLoginSuccess(session);
        } else {
            console.log('❌ [v6.067] NO hay savedAuthData, el usuario verá la app sin login');
        }
    }

    init() {
        console.log('🔐 [v6.060] Iniciando LoginUI sin sesión previa...');
        
        // Crear modal de login
        this.createLoginModal();
        
        // 🆕 v6.058 - Verificar versión de la app
        this.checkAppVersion();
        
        // Escuchar eventos de autenticación (Firebase y Custom)
        window.addEventListener('userLoggedIn', (e) => this.handleLoginSuccess(e.detail));
        window.addEventListener('customAuthSuccess', (e) => this.handleLoginSuccess(e.detail));
        window.addEventListener('userLoggedOut', () => this.handleLogout());
        window.addEventListener('customAuthLogout', () => this.handleLogout());
        
        // Si Firebase está autenticando, esperar
        if (this.firebaseService?.isAuthenticated()) {
            console.log('✅ [v6.060] Firebase ya tiene sesión activa');
            this.hideLoginModal();
            return;
        }
        
        // Mostrar modal de login después de un breve delay
        console.log('⏳ [v6.060] Esperando 1s para verificar sesión de Firebase...');
        setTimeout(() => {
            if (!this.firebaseService?.isAuthenticated() && !localStorage.getItem('customAuth')) {
                console.log('🔐 [v6.060] No hay sesión - mostrando login');
                this.showLoginModal();
            }
        }, 1000);
    }
    
    /**
     * 🆕 v6.058 - Verificar si hay una nueva versión de la app
     */
    checkAppVersion() {
        const savedVersion = localStorage.getItem('appVersion');
        const currentVersion = this.APP_VERSION;
        
        if (savedVersion && savedVersion !== currentVersion) {
            // Hay una nueva versión - mostrar aviso
            console.log(`🆕 [v6.058] Nueva versión detectada: ${savedVersion} → ${currentVersion}`);
            this.showVersionUpdateNotice(savedVersion, currentVersion);
        }
        
        // Guardar versión actual
        localStorage.setItem('appVersion', currentVersion);
    }
    
    /**
     * 🆕 v6.058 - Mostrar aviso de nueva versión
     */
    showVersionUpdateNotice(oldVersion, newVersion) {
        const notice = document.createElement('div');
        notice.id = 'versionUpdateNotice';
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 999999;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 90%;
            animation: slideDown 0.5s ease-out;
        `;
        notice.innerHTML = `
            <span style="font-size: 1.5rem;">🎉</span>
            <div>
                <div style="font-weight: 600; font-size: 1rem;">¡App Actualizada!</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">
                    ${oldVersion} → <strong>${newVersion}</strong>
                </div>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                margin-left: 8px;
                font-size: 0.8rem;
            ">✕</button>
        `;
        
        // Agregar animación CSS si no existe
        if (!document.getElementById('versionNoticeStyles')) {
            const style = document.createElement('style');
            style.id = 'versionNoticeStyles';
            style.textContent = `
                @keyframes slideDown {
                    from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notice);
        
        // Auto-cerrar después de 8 segundos
        setTimeout(() => {
            if (notice.parentElement) {
                notice.style.transition = 'opacity 0.5s, transform 0.5s';
                notice.style.opacity = '0';
                notice.style.transform = 'translateX(-50%) translateY(-20px)';
                setTimeout(() => notice.remove(), 500);
            }
        }, 8000);
    }

    /**
     * Crear modal de login en el DOM
     */
    createLoginModal() {
        if (this.isLoginModalCreated) return;

        const modalHTML = `
            <div id="loginModal" class="modal-overlay" style="display: none; align-items: center; justify-content: center;">
                <div class="modal-container" style="max-width: 420px; margin: 0; background: var(--bg-secondary);">
                    <div class="modal-header" style="display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px;">
                        <div style="text-align: center;">
                            <div style="font-size: 3rem; margin-bottom: 8px;">🔐</div>
                            <h2 class="modal-title" style="margin: 0; font-size: 1.75rem; font-weight: 700;">Iniciar Sesión</h2>
                            <p style="color: rgba(255,255,255,0.9); font-size: 0.9rem; margin-top: 8px; font-weight: 400;">
                                Sistema de Inventario de Repuestos
                            </p>
                        </div>
                    </div>
                    
                    <div class="modal-body" style="padding: 32px 24px;">
                        <form id="loginForm">
                            <div class="form-group">
                                <label for="loginIdentifier">Usuario o Email</label>
                                <input 
                                    type="text" 
                                    id="loginIdentifier" 
                                    class="form-control" 
                                    placeholder="usuario1 o admin@ejemplo.com"
                                    required
                                    autocomplete="username"
                                >
                                <small style="color: var(--text-muted); font-size: 0.8rem;">
                                    Email para admin, username para usuarios regulares
                                </small>
                            </div>

                            <div class="form-group">
                                <label for="loginPassword">Contraseña</label>
                                <input 
                                    type="password" 
                                    id="loginPassword" 
                                    class="form-control" 
                                    placeholder="••••••••"
                                    required
                                    autocomplete="current-password"
                                >
                            </div>

                            <div id="loginError" class="alert alert-error" style="display: none;"></div>

                            <button type="submit" class="btn btn-primary btn-block" id="btnLogin">
                                Iniciar Sesión
                            </button>
                            
                            <!-- Botón de invitado eliminado - Solo usuarios registrados -->
                        </form>

                        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color);">
                            <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center;">
                                🔐 Acceso solo para usuarios autorizados
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.isLoginModalCreated = true;

        // Event listeners
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        // Botón de invitado eliminado - solo usuarios autorizados
        document.getElementById('btnLogout').addEventListener('click', () => this.logout());
        
        // Prevenir que atajos de teclado interfieran con los inputs del login
        const loginIdentifier = document.getElementById('loginIdentifier');
        const loginPassword = document.getElementById('loginPassword');
        
        [loginIdentifier, loginPassword].forEach(input => {
            input.addEventListener('keydown', (e) => {
                // Detener propagación para que los atajos globales no interfieran
                e.stopPropagation();
            });
        });
    }

    /**
     * Mostrar modal de login
     */
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('loginIdentifier').focus();
        }
    }

    /**
     * Ocultar modal de login
     */
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Manejar submit del formulario de login
     */
    async handleLogin(e) {
        e.preventDefault();

        const identifier = document.getElementById('loginIdentifier').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btnLogin = document.getElementById('btnLogin');
        const errorDiv = document.getElementById('loginError');

        // Limpiar errores previos
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        // Validación básica
        if (!identifier || !password) {
            this.showError('Por favor completa todos los campos');
            return;
        }

        // Deshabilitar botón
        btnLogin.disabled = true;
        btnLogin.textContent = 'Iniciando sesión...';

        try {
            // Usar sistema híbrido de autenticación
            const result = await this.customAuth.login(identifier, password);

            if (result.success) {
                console.log('✅ Login exitoso');
                // El evento se disparará automáticamente desde customAuth
            } else {
                this.showError(result.error);
                btnLogin.disabled = false;
                btnLogin.textContent = 'Iniciar Sesión';
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showError('Error de conexión. Intenta nuevamente.');
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }
    }

    // Función handleGuestLogin eliminada - solo usuarios autorizados

    /**
     * Manejar login exitoso
     * 🆕 v6.058 - Mejorado para sesiones restauradas
     */
    handleLoginSuccess(detail) {
        console.log('🔐 [v6.058] handleLoginSuccess llamado con:', detail);
        
        // 🆕 v6.058 - Si no hay detail o user, ignorar
        if (!detail || !detail.user) {
            console.log('⚠️ [v6.058] handleLoginSuccess: sin datos de usuario');
            return;
        }
        
        // Obtener rol de múltiples fuentes
        const role = detail.role || 
                     detail.user?.role || 
                     localStorage.getItem('userRole') ||
                     'lectura';
        
        console.log('✅ [v6.058] Usuario autenticado:', detail.user, 'Rol:', role);

        // Ocultar modal de login
        this.hideLoginModal();

        // Resetear formulario si existe
        const loginForm = document.getElementById('loginForm');
        const btnLogin = document.getElementById('btnLogin');
        if (loginForm) loginForm.reset();
        if (btnLogin) {
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }

        // Mostrar menú de usuario
        this.showUserMenu(detail.user, role);

        // Log de bienvenida
        const userName = detail.user.email || detail.user.username || detail.user.displayName || 'Usuario';
        console.log(`🎉 Bienvenido ${userName} - Rol: ${role}`);

        // Recargar datos
        if (window.app && window.app.cargarDatosIniciales) {
            window.app.cargarDatosIniciales();
        }
        
        // Actualizar UI según rol
        if (window.mostrarSeccionesAdmin) {
            setTimeout(() => window.mostrarSeccionesAdmin(), 300);
        }
        
        // Inicializar panel de admin si es admin
        if (role === 'admin' && window.initAdminPanel) {
            setTimeout(() => window.initAdminPanel(), 500);
        }
        
        // 📱🔥 Reconfigurar inputs de foto ahora que Firebase está autenticado
        setTimeout(() => {
            if (window.app && typeof window.app.setupPhotoInputs === 'function') {
                console.log('📱 Reconfigurando inputs de foto post-login...');
                window.app.setupPhotoInputs();
            }
        }, 500);
    }

    /**
     * Mostrar menú de usuario
     * 🆕 v6.055 - Cambiar color del icono según rol
     */
    showUserMenu(user, role) {
        console.log('📋 showUserMenu llamado:', { user, role, roleType: typeof role });
        
        const userMenu = document.getElementById('userMenu');
        const userEmail = document.getElementById('userEmail');
        const loginBtn = document.getElementById('loginBtn');

        console.log('🔍 Elementos encontrados:', { 
            userMenu: !!userMenu, 
            userEmail: !!userEmail,
            loginBtn: !!loginBtn
        });

        if (userMenu && userEmail) {
            const roleLabels = {
                'admin': 'Admin',
                'usuario': 'Usuario',
                'lectura': 'Invitado'
            };
            
            // 🆕 v6.055 - Colores según rol: rojo=admin, amarillo=usuario, azul=lectura
            const roleColors = {
                'admin': '#ef4444',    // Rojo
                'usuario': '#f59e0b',  // Amarillo/Naranja
                'lectura': '#3b82f6'   // Azul
            };
            
            // Determinar nombre a mostrar
            let displayName = '';
            if (user.email) {
                displayName = user.email;
            } else if (user.displayName) {
                displayName = user.displayName;
            } else if (user.username) {
                displayName = user.username;
            }
            
            const displayRole = roleLabels[role] || role;
            const iconColor = roleColors[role] || '#3b82f6';
            
            userEmail.textContent = `${displayName} • ${displayRole}`;
            userMenu.style.display = 'flex';
            
            // 🆕 v6.055 - Cambiar color del icono de login según rol
            if (loginBtn) {
                const svg = loginBtn.querySelector('svg');
                if (svg) {
                    svg.style.stroke = iconColor;
                    svg.style.transition = 'stroke 0.3s ease';
                    console.log(`🎨 [v6.055] Icono cambiado a color ${role}: ${iconColor}`);
                }
            }
            
            console.log('✅ Menú de usuario mostrado:', {
                displayName,
                role: role,
                displayRole: displayRole,
                iconColor: iconColor,
                display: userMenu.style.display
            });
        } else {
            console.error('❌ No se encontraron los elementos del menú de usuario');
        }
    }

    /**
     * Ocultar menú de usuario
     * 🆕 v6.055 - Restaurar color del icono
     */
    hideUserMenu() {
        const userMenu = document.getElementById('userMenu');
        const loginBtn = document.getElementById('loginBtn');
        
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        
        // 🆕 v6.055 - Restaurar color original del icono (blanco)
        if (loginBtn) {
            const svg = loginBtn.querySelector('svg');
            if (svg) {
                svg.style.stroke = 'currentColor';
                console.log('🎨 [v6.055] Icono restaurado a color original');
            }
        }
    }

    /**
     * Logout
     */
    async logout() {
        if (!confirm('¿Cerrar sesión?')) return;

        try {
            // Usar customAuth para logout híbrido
            await this.customAuth.logout();
            console.log('✅ Logout completado');
        } catch (error) {
            console.error('❌ Error en logout:', error);
        }
    }

    /**
     * Manejar logout
     */
    handleLogout() {
        // Ocultar menú de usuario
        this.hideUserMenu();

        // Mostrar modal de login
        this.showLoginModal();

        // Mostrar toast
        if (window.app && window.app.mostrarToast) {
            window.app.mostrarToast('Sesión cerrada', 'info');
        }
        
        console.log('✅ Sesión cerrada correctamente');
    }
    /**
     * Mostrar error en el formulario
     */
    showError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    /**
     * Verificar si usuario está autenticado
     */
    isAuthenticated() {
        return this.firebaseService.isAuthenticated();
    }

    /**
     * Obtener información del usuario actual
     */
    getCurrentUser() {
        return this.firebaseService.getCurrentUser();
    }
}

// Estilos adicionales para el login
const loginStyles = `
<style>
.login-modal .modal-body {
    padding: 32px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--text-primary);
}

.form-control {
    width: 100%;
    padding: 12px 16px;
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: all 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: var(--primary-color);
    background: var(--bg-secondary);
}

.btn-block {
    width: 100%;
    padding: 14px;
    font-size: 1rem;
    margin-top: 8px;
}

.alert {
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-size: 0.9rem;
}

.alert-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
}

.user-menu-container {
    backdrop-filter: blur(10px);
    animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.btn-sm {
    padding: 6px 16px;
    font-size: 0.85rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', loginStyles);

// Inicializar LoginUI cuando Firebase esté listo
window.addEventListener('load', () => {
    if (window.firebaseService) {
        window.loginUI = new LoginUI();
    } else {
        console.error('❌ FirebaseService no disponible');
    }
});
