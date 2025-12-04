/**
 * Firebase Configuration
 * Configuración centralizada para Firebase Authentication y Firestore
 */

// Credenciales de Firebase - app-inventario-repuestos
const firebaseConfig = {
    apiKey: "AIzaSyAQNZionq01KS9F6O5m03ybWueO6SFuPPU",
    authDomain: "app-inventario-repuestos.firebaseapp.com",
    projectId: "app-inventario-repuestos",
    storageBucket: "app-inventario-repuestos.firebasestorage.app",
    messagingSenderId: "14780417870",
    appId: "1:14780417870:web:89a7f09383f4e12f2fc01f"
};

/**
 * Inicializar Firebase
 * Se ejecuta automáticamente al cargar el archivo
 */
let firebaseApp, auth, db;

try {
    // Inicializar Firebase App
    firebaseApp = firebase.initializeApp(firebaseConfig);
    
    // Inicializar servicios
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Configurar persistencia local
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}

/**
 * Configuración de colecciones Firestore
 */
const COLLECTIONS = {
    REPUESTOS: 'repuestos',
    MAPAS: 'mapas',
    ZONAS: 'zonas',
    PRESUPUESTOS: 'presupuestos',
    USUARIOS: 'usuarios',
    METADATA: 'metadata'
};

/**
 * Roles de usuario
 */
const USER_ROLES = {
    ADMIN: 'admin',           // Puede crear, editar, eliminar todo
    USUARIO: 'usuario',       // Puede crear y editar, no eliminar
    LECTURA: 'lectura'        // Solo puede ver, no editar
};

/**
 * Exportar configuración global
 */
window.FirebaseApp = {
    app: firebaseApp,
    auth,
    db,
    COLLECTIONS,
    USER_ROLES
};
