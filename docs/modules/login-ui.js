/**
 * Login UI - Interfaz de autenticación
 * Modal de login con email/password y gestión de sesión
 */

class LoginUI {
    constructor() {
        this.firebaseService = window.firebaseService;
        this.customAuth = window.customAuth;
        this.isLoginModalCreated = false;
        
        this.init();
    }

    init() {
        // Crear modal de login
        this.createLoginModal();
        
        // Escuchar eventos de autenticación (Firebase y Custom)
        window.addEventListener('userLoggedIn', (e) => this.handleLoginSuccess(e.detail));
        window.addEventListener('customAuthSuccess', (e) => this.handleLoginSuccess(e.detail));
        window.addEventListener('userLoggedOut', () => this.handleLogout());
        window.addEventListener('customAuthLogout', () => this.handleLogout());
        
        // Verificar si hay sesión activa (Firebase o Custom)
        const hasFirebaseSession = this.firebaseService.isAuthenticated();
        const hasCustomSession = this.customAuth.hasActiveSession();
        
        if (!hasFirebaseSession && !hasCustomSession) {
            this.showLoginModal();
        } else if (hasCustomSession) {
            // Restaurar sesión custom
            const session = this.customAuth.restoreSession();
            if (session) {
                this.handleLoginSuccess(session);
            }
        }
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
     */
    handleLoginSuccess(detail) {
        console.log('✅ Usuario autenticado:', detail);

        // Ocultar modal de login
        this.hideLoginModal();

        // Resetear formulario
        document.getElementById('loginForm').reset();
        document.getElementById('btnLogin').disabled = false;
        document.getElementById('btnLogin').textContent = 'Iniciar Sesión';

        // Mostrar menú de usuario
        this.showUserMenu(detail.user, detail.role);

        // Log de bienvenida
        console.log(`🎉 Bienvenido ${detail.user.email} - Rol: ${detail.role}`);

        // Recargar datos
        if (window.app && window.app.cargarDatosIniciales) {
            window.app.cargarDatosIniciales();
        }
        
        // 📱🔥 Reconfigurar inputs de foto ahora que Firebase está autenticado
        // Esto habilita multimedia en móviles cuando Firebase Storage está disponible
        setTimeout(() => {
            if (window.app && typeof window.app.setupPhotoInputs === 'function') {
                console.log('📱 Reconfigurando inputs de foto post-login...');
                window.app.setupPhotoInputs();
            }
        }, 500);
    }

    /**
     * Mostrar menú de usuario
     */
    showUserMenu(user, role) {
        console.log('📋 showUserMenu llamado:', { user, role, roleType: typeof role });
        
        const userMenu = document.getElementById('userMenu');
        const userEmail = document.getElementById('userEmail');

        console.log('🔍 Elementos encontrados:', { 
            userMenu: !!userMenu, 
            userEmail: !!userEmail
        });

        if (userMenu && userEmail) {
            const roleLabels = {
                'admin': 'Admin',
                'usuario': 'Usuario',
                'lectura': 'Invitado'
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
            userEmail.textContent = `${displayName} • ${displayRole}`;

            userMenu.style.display = 'flex';
            
            console.log('✅ Menú de usuario mostrado:', {
                displayName,
                role: role,
                displayRole: displayRole,
                display: userMenu.style.display
            });
        } else {
            console.error('❌ No se encontraron los elementos del menú de usuario');
        }
    }

    /**
     * Ocultar menú de usuario
     */
    hideUserMenu() {
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.style.display = 'none';
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
