/**
 * Firebase Configuration
 * Configuración centralizada para Firebase Authentication y Firestore
 */

// Credenciales de Firebase - app-inventario-repuestos
const firebaseConfig = {
    apiKey: "AIzaSyAQNZlonqQ1K59F6O5md3ybMuoO&SfuPPU",
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
let app, auth, db;

try {
    // Inicializar Firebase App
    app = firebase.initializeApp(firebaseConfig);
    
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
    app,
    auth,
    db,
    COLLECTIONS,
    USER_ROLES
};
