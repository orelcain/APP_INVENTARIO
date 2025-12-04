/**
 * Firebase Configuration
 * Configuración centralizada para Firebase Authentication y Firestore
 */

// TODO: Reemplazar con tus credenciales de Firebase
// Obtener de: https://console.firebase.google.com/
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROJECT_ID.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT_ID.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
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
