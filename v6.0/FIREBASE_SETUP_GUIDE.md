# 🔥 Guía de Configuración Firebase - APP Inventario

## 📋 Tabla de Contenidos
1. [Crear Proyecto Firebase](#1-crear-proyecto-firebase)
2. [Configurar Authentication](#2-configurar-authentication)
3. [Configurar Firestore](#3-configurar-firestore)
4. [Configurar Reglas de Seguridad](#4-configurar-reglas-de-seguridad)
5. [Integrar con la App](#5-integrar-con-la-app)
6. [Crear Usuarios](#6-crear-usuarios)
7. [Migrar Datos Locales](#7-migrar-datos-locales)
8. [Publicar en GitHub Pages](#8-publicar-en-github-pages)

---

## 1. Crear Proyecto Firebase

### Paso 1.1: Ir a Firebase Console
1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Click en **"Agregar proyecto"**

### Paso 1.2: Configurar Proyecto
1. **Nombre del proyecto**: `app-inventario-v6` (o el que prefieras)
2. Click **"Continuar"**
3. **Google Analytics**: Puedes desactivarlo (opcional)
4. Click **"Crear proyecto"**
5. Espera a que se cree (30-60 segundos)
6. Click **"Continuar"**

---

## 2. Configurar Authentication

### Paso 2.1: Activar Authentication
1. En el menú lateral, click en **"Authentication"**
2. Click en **"Comenzar"**
3. Ve a la pestaña **"Sign-in method"**

### Paso 2.2: Habilitar Email/Password
1. Click en **"Email/Password"**
2. **Habilitar** el toggle
3. Click **"Guardar"**

---

## 3. Configurar Firestore

### Paso 3.1: Crear Base de Datos
1. En el menú lateral, click en **"Firestore Database"**
2. Click **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de producción"**
4. Click **"Siguiente"**

### Paso 3.2: Seleccionar Ubicación
1. Elige la ubicación más cercana (ej: `southamerica-east1` para Chile)
2. Click **"Habilitar"**
3. Espera a que se cree la base de datos

---

## 4. Configurar Reglas de Seguridad

### Paso 4.1: Ir a Reglas
1. En Firestore, click en la pestaña **"Reglas"**
2. Reemplaza el contenido con las siguientes reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función helper para obtener rol del usuario
    function getUserRole() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role;
    }
    
    // Función helper para verificar si es admin
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    // Función helper para verificar si puede editar
    function canEdit() {
      return isAuthenticated() && (getUserRole() == 'admin' || getUserRole() == 'usuario');
    }
    
    // REPUESTOS
    match /repuestos/{repuestoId} {
      allow read: if isAuthenticated();
      allow create, update: if canEdit();
      allow delete: if isAdmin();
    }
    
    // MAPAS
    match /mapas/{mapaId} {
      allow read: if isAuthenticated();
      allow create, update: if canEdit();
      allow delete: if isAdmin();
    }
    
    // ZONAS
    match /zonas/{zonaId} {
      allow read: if isAuthenticated();
      allow create, update: if canEdit();
      allow delete: if isAdmin();
    }
    
    // PRESUPUESTOS
    match /presupuestos/{presupuestoId} {
      allow read: if isAuthenticated();
      allow create, update: if canEdit();
      allow delete: if isAdmin();
    }
    
    // USUARIOS (solo admin puede modificar roles)
    match /usuarios/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // METADATA
    match /metadata/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

3. Click **"Publicar"**
4. Confirma los cambios

---

## 5. Integrar con la App

### Paso 5.1: Obtener Credenciales
1. En Firebase Console, click en el ícono de **engranaje** (⚙️) → **Configuración del proyecto**
2. Scroll hacia abajo hasta **"Tus apps"**
3. Click en el ícono **</>** (Web)
4. **Nombre de la app**: `APP Inventario Web`
5. NO marcar Firebase Hosting
6. Click **"Registrar app"**
7. Copia las credenciales que aparecen (apiKey, authDomain, etc.)

### Paso 5.2: Configurar firebase-config.js
1. Abre el archivo `v6.0/config/firebase-config.js`
2. Reemplaza las credenciales:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...", // TU apiKey
    authDomain: "app-inventario-v6.firebaseapp.com", // TU authDomain
    projectId: "app-inventario-v6", // TU projectId
    storageBucket: "app-inventario-v6.appspot.com", // TU storageBucket
    messagingSenderId: "123456789", // TU messagingSenderId
    appId: "1:123456789:web:abc123..." // TU appId
};
```

3. Guarda el archivo

### Paso 5.3: Agregar Scripts Firebase al HTML
Abre `v6.0/index.html` y agrega estos scripts **ANTES** del `</body>`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Firebase Configuration -->
<script src="config/firebase-config.js"></script>

<!-- Firebase Modules -->
<script src="modules/firebase-service.js"></script>
<script src="modules/firebase-storage-adapter.js"></script>
<script src="modules/login-ui.js"></script>

<!-- App existente -->
<script src="modules/app.js"></script>
```

---

## 6. Crear Usuarios

### Opción A: Desde Firebase Console (Recomendado)

1. **Ir a Authentication**
   - En Firebase Console, click en **"Authentication"**
   - Click en **"Users"**

2. **Agregar usuario**
   - Click en **"Add user"**
   - **Email**: `admin@ejemplo.com`
   - **Password**: Crear contraseña segura (mínimo 6 caracteres)
   - Click **"Add user"**

3. **Copiar UID del usuario**
   - El usuario aparecerá en la lista
   - Copia el **User UID** (ej: `AbC123XyZ...`)

4. **Asignar rol**
   - Ve a **Firestore Database**
   - Click en **"Iniciar colección"**
   - **ID de colección**: `usuarios`
   - Click **"Siguiente"**
   - **ID de documento**: Pega el UID que copiaste
   - **Campos**:
     ```
     email: admin@ejemplo.com (string)
     role: admin (string)
     createdAt: (timestamp) [Click en "Agregar campo" → tipo timestamp → valor actual]
     ```
   - Click **"Guardar"**

5. **Crear más usuarios**
   - Repite los pasos para crear:
     - **Usuario normal**: `role: usuario` (puede editar)
     - **Solo lectura**: `role: lectura` (solo puede ver)

### Opción B: Usar Script de Inicialización

Crea un archivo `v6.0/scripts/init-users.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Crear Primer Admin</title>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    <script src="../config/firebase-config.js"></script>
</head>
<body>
    <h1>Crear Primer Administrador</h1>
    <form id="createAdminForm">
        <input type="email" id="email" placeholder="admin@ejemplo.com" required>
        <input type="password" id="password" placeholder="Contraseña" required>
        <button type="submit">Crear Admin</button>
    </form>
    <div id="result"></div>

    <script>
        document.getElementById('createAdminForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Crear usuario
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Asignar rol admin
                await firebase.firestore().collection('usuarios').doc(user.uid).set({
                    email: email,
                    role: 'admin',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                document.getElementById('result').innerHTML = '✅ Admin creado exitosamente!';
                alert('Admin creado. Ya puedes cerrar esta página.');
            } catch (error) {
                document.getElementById('result').innerHTML = '❌ Error: ' + error.message;
            }
        });
    </script>
</body>
</html>
```

**Uso:**
1. Abre este archivo en el navegador
2. Ingresa email y contraseña
3. Click en "Crear Admin"
4. **IMPORTANTE**: Elimina este archivo después de usarlo

---

## 7. Migrar Datos Locales

### Paso 7.1: Preparar Migración
1. Abre la app en el navegador
2. Inicia sesión con tu cuenta **admin**
3. Verifica que todos tus datos locales estén cargados

### Paso 7.2: Ejecutar Migración
En la consola del navegador (F12), ejecuta:

```javascript
// Migrar todos los datos
await window.firebaseStorageAdapter.migrarDatosLocales(
    window.app.repuestos,
    window.app.mapas,
    window.app.zonas,
    window.app.presupuestos
);
```

Confirma la operación cuando se te pregunte.

### Paso 7.3: Verificar Migración
1. Ve a Firebase Console → Firestore Database
2. Deberías ver las colecciones:
   - `repuestos`
   - `mapas`
   - `zonas`
   - `presupuestos`
   - `usuarios`

3. Verifica que los documentos estén ahí

### Paso 7.4: Activar Sincronización
En la consola, ejecuta:

```javascript
// Activar sincronización en tiempo real
window.firebaseStorageAdapter.enableRealtimeSync({
    repuestos: (data) => {
        console.log('Repuestos actualizados:', data.length);
        window.app.repuestos = data;
        window.app.renderizarGrid();
    },
    mapas: (data) => {
        console.log('Mapas actualizados:', data.length);
        window.app.mapas = data;
    },
    zonas: (data) => {
        console.log('Zonas actualizadas:', data.length);
        window.app.zonas = data;
    }
});
```

---

## 8. Publicar en GitHub Pages

### Paso 8.1: Commit y Push
```bash
cd d:\APP_INVENTARIO-2
git add .
git commit -m "feat: Add Firebase authentication and cloud sync"
git push origin main
```

### Paso 8.2: Activar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. **Source**: Deploy from a branch
5. **Branch**: `main`, carpeta `/v6.0`
6. Click **"Save"**

### Paso 8.3: Esperar Despliegue
1. Espera 2-5 minutos
2. La URL será: `https://tuusuario.github.io/APP_INVENTARIO/v6.0/`

### Paso 8.4: Configurar Dominio en Firebase
1. En Firebase Console → Authentication → Settings
2. **Authorized domains**: Agregar tu dominio de GitHub Pages
   - `tuusuario.github.io`

---

## 🎯 Resumen de Roles

| Rol | Permisos |
|-----|----------|
| **Admin** (`admin`) | ✅ Ver, Crear, Editar, Eliminar todo<br>✅ Gestionar usuarios<br>✅ Migrar datos |
| **Usuario** (`usuario`) | ✅ Ver todo<br>✅ Crear y editar<br>❌ No puede eliminar |
| **Lectura** (`lectura`) | ✅ Solo ver<br>❌ No puede editar ni eliminar |

---

## 🔒 Seguridad

### Buenas Prácticas:
1. ✅ Usa contraseñas fuertes (mínimo 12 caracteres)
2. ✅ No compartas credenciales de admin
3. ✅ Revisa las reglas de Firestore regularmente
4. ✅ Activa autenticación de 2 factores en tu cuenta Google
5. ✅ Mantén actualizado Firebase SDK

### Monitoreo:
1. Firebase Console → Authentication → Users (ver usuarios activos)
2. Firestore → Uso (monitorear lecturas/escrituras)
3. Firestore → Reglas → Playground (probar reglas)

---

## 🐛 Troubleshooting

### Error: "Firebase not defined"
**Solución**: Verifica que los scripts de Firebase estén antes de tus módulos en index.html

### Error: "Permission denied"
**Solución**: 
1. Verifica que el usuario tenga rol asignado en Firestore
2. Revisa las reglas de seguridad

### Error: "User not found"
**Solución**: Asegúrate de haber creado el usuario en Authentication

### No se sincronizan los datos
**Solución**: 
1. Abre la consola (F12)
2. Verifica que no haya errores
3. Verifica conexión a internet
4. Re-activa los listeners

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa Firebase Console → Firestore → Reglas
3. Verifica que tu dominio esté autorizado en Firebase

---

## ✅ Checklist Final

- [ ] Proyecto Firebase creado
- [ ] Authentication habilitada (Email/Password)
- [ ] Firestore creado
- [ ] Reglas de seguridad configuradas
- [ ] Credenciales en firebase-config.js
- [ ] Scripts agregados a index.html
- [ ] Al menos 1 usuario admin creado
- [ ] Rol admin asignado en Firestore
- [ ] Datos migrados a Firestore
- [ ] Sincronización activada
- [ ] Publicado en GitHub Pages
- [ ] Dominio autorizado en Firebase

---

**¡Listo!** Tu app ahora funciona con Firebase y está accesible desde la web 🚀
