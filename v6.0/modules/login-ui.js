/**
 * Login UI - Interfaz de autenticación
 * Modal de login con email/password y gestión de sesión
 */

class LoginUI {
    constructor() {
        this.firebaseService = window.firebaseService;
        this.isLoginModalCreated = false;
        
        this.init();
    }

    init() {
        // Crear modal de login
        this.createLoginModal();
        
        // Escuchar eventos de autenticación
        window.addEventListener('userLoggedIn', (e) => this.handleLoginSuccess(e.detail));
        window.addEventListener('userLoggedOut', () => this.handleLogout());
        
        // Verificar si ya hay sesión activa
        if (!this.firebaseService.isAuthenticated()) {
            this.showLoginModal();
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
                                <label for="loginEmail">Email</label>
                                <input 
                                    type="email" 
                                    id="loginEmail" 
                                    class="form-control" 
                                    placeholder="usuario@ejemplo.com"
                                    required
                                    autocomplete="email"
                                >
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
                        </form>

                        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color);">
                            <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center;">
                                ℹ️ Contacta al administrador para obtener una cuenta
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Menu (después de login) -->
            <div id="userMenu" style="display: none; position: fixed; top: 18px; right: 280px; z-index: 999;">
                <div class="user-menu-container" style="background: var(--bg-card); padding: 8px 14px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 10px; border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="text-align: left;">
                            <div id="userEmail" style="font-size: 0.75rem; font-weight: 600; color: var(--text-primary);"></div>
                            <div id="userRole" style="font-size: 0.65rem; color: var(--text-muted); margin-top: 1px;"></div>
                        </div>
                        <button id="btnLogout" class="btn btn-sm btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;">
                            Salir
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.isLoginModalCreated = true;

        // Event listeners
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('btnLogout').addEventListener('click', () => this.logout());
        
        // Prevenir que atajos de teclado interfieran con los inputs del login
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        
        [loginEmail, loginPassword].forEach(input => {
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
            document.getElementById('loginEmail').focus();
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

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btnLogin = document.getElementById('btnLogin');
        const errorDiv = document.getElementById('loginError');

        // Limpiar errores previos
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        // Validación básica
        if (!email || !password) {
            this.showError('Por favor completa todos los campos');
            return;
        }

        // Deshabilitar botón
        btnLogin.disabled = true;
        btnLogin.textContent = 'Iniciando sesión...';

        try {
            const result = await this.firebaseService.login(email, password);

            if (result.success) {
                console.log('✅ Login exitoso');
                // El evento 'userLoggedIn' se disparará automáticamente
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

        // Mostrar toast de bienvenida
        if (window.app) {
            window.app.mostrarToast(`Bienvenido ${detail.user.email}`, 'success');
        }

        // Recargar datos
        if (window.app) {
            window.app.cargarDatosIniciales();
        }
    }

    /**
     * Mostrar menú de usuario
     */
    showUserMenu(user, role) {
        const userMenu = document.getElementById('userMenu');
        const userEmail = document.getElementById('userEmail');
        const userRoleEl = document.getElementById('userRole');

        if (userMenu && userEmail && userRoleEl) {
            userEmail.textContent = user.email;
            
            const roleLabels = {
                'admin': '👑 Administrador',
                'usuario': '✏️ Usuario',
                'lectura': '👁️ Solo lectura'
            };
            userRoleEl.textContent = roleLabels[role] || role;

            userMenu.style.display = 'block';
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

        const result = await this.firebaseService.logout();

        if (result.success) {
            console.log('✅ Logout exitoso');
            // El evento 'userLoggedOut' se disparará automáticamente
        } else {
            alert('Error al cerrar sesión: ' + result.error);
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
