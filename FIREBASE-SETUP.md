# 🔥 Guía de Integración de Firebase - MPFlow

## 📋 **PARTE 1: Configurar Firebase Console**

### ✅ Paso 1: Crear Proyecto
1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. **"Agregar proyecto"** → Nombre: `mpflow`
3. Desactiva Google Analytics
4. **Crear proyecto**

### ✅ Paso 2: Registrar App Web
1. Dashboard → Ícono **</>** (Web)
2. Nombre: `MPFlow Web`
3. **NO marques** Firebase Hosting
4. **Registrar app**
5. **COPIA** el objeto `firebaseConfig` (lo necesitarás)

### ✅ Paso 3: Authentication
1. Menú lateral → **Authentication** → **Comenzar**
2. **Correo electrónico/contraseña** → **Activar**
3. **Guardar**

### ✅ Paso 4: Firestore Database
1. Menú → **Firestore Database** → **Crear base de datos**
2. Ubicación: `southamerica-east1` (más cercano a Chile)
3. Modo: **Producción**
4. **Crear**

### ✅ Paso 5: Reglas de Seguridad
En la pestaña **Reglas**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
    
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    match /members/{memberId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Publicar**

### ✅ Paso 6: Storage
1. Menú → **Storage** → **Comenzar**
2. Modo: **Producción**
3. Ubicación: Misma que Firestore
4. **Listo**

---

## 📦 **PARTE 2: Instalar en Proyecto Local**

```bash
cd ~/mpflow

# Instalar Firebase
npm install firebase
```

---

## 🔧 **PARTE 3: Configurar Archivos**

### **1. Crear carpetas necesarias:**

```bash
mkdir -p src/contexts
mkdir -p src/utils
```

### **2. Copiar archivos:**

Los archivos que te envié:
- `firebase.js` → `src/firebase.js`
- `AuthContext.jsx` → `src/contexts/AuthContext.jsx`
- `AuthScreen.jsx` → `src/components/AuthScreen.jsx`
- `firestoreHelper.js` → `src/utils/firestoreHelper.js`

### **3. Actualizar `src/firebase.js`:**

**⚠️ IMPORTANTE:** Reemplaza la configuración con la tuya:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",              // ← De Firebase Console
  authDomain: "TU_AUTH_DOMAIN",            // ← De Firebase Console
  projectId: "TU_PROJECT_ID",              // ← De Firebase Console
  storageBucket: "TU_STORAGE_BUCKET",      // ← De Firebase Console
  messagingSenderId: "TU_SENDER_ID",       // ← De Firebase Console
  appId: "TU_APP_ID"                       // ← De Firebase Console
}
```

Para obtener esta configuración:
- Firebase Console → ⚙️ (configuración) → Configuración del proyecto
- Scroll abajo → "Tus apps" → Tu app web
- Copiar el objeto `firebaseConfig`

---

## 🔐 **PARTE 4: Configurar Variables de Entorno**

### **Crear archivo `.env.local`:**

```bash
# En la raíz del proyecto:
cat > .env.local << 'EOF'
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
EOF
```

### **Actualizar `src/firebase.js` para usar variables:**

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}
```

### **Actualizar `.gitignore`:**

```bash
echo ".env.local" >> .gitignore
```

---

## ⚙️ **PARTE 5: Configurar Variables en Vercel**

1. Ve a [vercel.com](https://vercel.com) → Tu proyecto
2. **Settings** → **Environment Variables**
3. Agregar una por una:

```
VITE_FIREBASE_API_KEY = [tu valor]
VITE_FIREBASE_AUTH_DOMAIN = [tu valor]
VITE_FIREBASE_PROJECT_ID = [tu valor]
VITE_FIREBASE_STORAGE_BUCKET = [tu valor]
VITE_FIREBASE_MESSAGING_SENDER_ID = [tu valor]
VITE_FIREBASE_APP_ID = [tu valor]
```

4. **Save**

---

## 🧪 **PARTE 6: Probar Localmente**

```bash
# Iniciar servidor
npm run dev

# Abrir en navegador
# http://localhost:5173
```

Deberías ver la pantalla de login.

### **Crear primera cuenta:**
1. Click en "¿No tienes cuenta? Regístrate"
2. Nombre: Tu nombre
3. Email: tu-email@ejemplo.com
4. Contraseña: mínimo 6 caracteres
5. **Crear Cuenta**

Si todo funciona, entrarás al dashboard.

---

## 🚀 **PARTE 7: Desplegar a Vercel**

```bash
git add .
git commit -m "Integración Firebase - Authentication y Firestore"
git push
```

Vercel desplegará automáticamente (2-3 min).

---

## ✅ **Verificación Final**

- [ ] Puedes registrarte
- [ ] Puedes iniciar sesión
- [ ] Puedes crear proyectos (se guardan en Firestore)
- [ ] Puedes crear tareas (se guardan en Firestore)
- [ ] Los datos persisten al recargar
- [ ] Puedes cerrar sesión
- [ ] Al iniciar sesión nuevamente, ves tus datos

---

## 🐛 **Solución de Problemas**

### Error: "Firebase: Error (auth/...)"
→ Verifica que Authentication esté activado en Firebase Console

### Error: "Missing or insufficient permissions"
→ Verifica las reglas de Firestore (Paso 5)

### Error: "Firebase: Firebase App named '[DEFAULT]' already exists"
→ Refresca la página

### Los datos no se guardan
→ Verifica que las variables de entorno estén en Vercel

---

## 📊 **Estructura de Datos en Firestore**

```
firestore/
├── projects/
│   └── {projectId}
│       ├── name: string
│       ├── description: string
│       ├── status: string
│       ├── color: string
│       ├── userId: string
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── tasks/
│   └── {taskId}
│       ├── title: string
│       ├── description: string
│       ├── status: string
│       ├── priority: string
│       ├── assignee: string
│       ├── dueDate: string
│       ├── tags: array
│       ├── projectId: string
│       ├── userId: string
│       ├── checklist: object
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
└── members/
    └── {memberId}
        ├── name: string
        ├── role: string
        ├── email: string
        ├── phone: string
        ├── avatar: string
        ├── userId: string
        └── createdAt: timestamp
```

---

**¿Listo para continuar con la actualización del App.jsx?** 🚀
