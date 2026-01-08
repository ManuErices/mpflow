# 🚀 Guía de Deploy a Vercel - MPFlow

## 📋 Preparación (1 minuto)

Tu proyecto ya tiene todo lo necesario:
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `.gitignore` - Archivos a ignorar
- ✅ `package.json` - Dependencias configuradas

---

## 🎯 **Método 1: Deploy Directo con Vercel CLI** (Recomendado - Más Rápido)

### Paso 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Paso 2: Navegar a tu proyecto
```bash
cd mpflow
```

### Paso 3: Login en Vercel
```bash
vercel login
```
Se abrirá tu navegador para autenticarte.

### Paso 4: Deploy
```bash
vercel
```

**Responde las preguntas:**
- `Set up and deploy "~/mpflow"?` → **Y** (Yes)
- `Which scope do you want to deploy to?` → Selecciona tu cuenta
- `Link to existing project?` → **N** (No)
- `What's your project's name?` → **mpflow** (o el que prefieras)
- `In which directory is your code located?` → **./** (presiona Enter)
- `Want to override the settings?` → **N** (No)

### Paso 5: Deploy a Producción
```bash
vercel --prod
```

**¡Listo!** Te dará una URL como: `https://mpflow.vercel.app`

---

## 🎯 **Método 2: Deploy desde GitHub** (Más Profesional)

### Paso 1: Subir a GitHub

```bash
# Inicializar git
cd mpflow
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "MPFlow v1.0 - Deploy inicial"

# Crear repositorio en GitHub
# Ve a https://github.com/new
# Nombre: mpflow
# Descripción: Sistema de gestión para MPF Ingeniería Civil
# Privado o Público según prefieras

# Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/mpflow.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Click en **"Add New Project"**
4. Click en **"Import"** junto a tu repositorio `mpflow`
5. Vercel detectará automáticamente Vite
6. Click en **"Deploy"**

**Configuración automática:**
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Paso 3: Esperar
Vercel compilará tu proyecto (2-3 minutos)

**¡Listo!** Tu app estará en: `https://mpflow.vercel.app`

---

## ⚙️ **Configuración de Dominio Personalizado** (Opcional)

Si quieres usar tu propio dominio (ej: `mpflow.cl` o `app.mpfingenieria.cl`):

### En Vercel:
1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Click en **"Add"**
4. Ingresa tu dominio: `mpflow.cl`
5. Vercel te dará registros DNS para configurar

### En tu proveedor de dominios:
1. Agrega los registros DNS que Vercel te indica
2. Espera propagación (5-30 minutos)
3. ¡Listo! Tu app estará en tu dominio

---

## 🔄 **Actualizaciones Futuras**

### Con Vercel CLI:
```bash
cd mpflow
# Hacer tus cambios...
vercel --prod
```

### Con GitHub:
```bash
git add .
git commit -m "Descripción de los cambios"
git push
```
Vercel detectará el push y desplegará automáticamente.

---

## 🐛 **Solución de Problemas**

### Error: "Command not found: vercel"
```bash
npm install -g vercel
# O con sudo en Mac/Linux
sudo npm install -g vercel
```

### Error: "No se puede construir el proyecto"
```bash
# Asegúrate de instalar dependencias localmente primero
cd mpflow
npm install
npm run build  # Debe funcionar sin errores
vercel --prod
```

### Error: "Routes not working" (404 en rutas)
El archivo `vercel.json` ya lo soluciona con:
```json
"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
```

---

## 📊 **Verificar Deploy**

Después del deploy, verifica:
1. ✅ La página carga correctamente
2. ✅ Los datos se guardan en localStorage
3. ✅ Todas las vistas funcionan (Dashboard, Proyectos, Equipo, Calendario)
4. ✅ Los modales se abren correctamente
5. ✅ El drag & drop funciona
6. ✅ La búsqueda funciona
7. ✅ Las notificaciones aparecen
8. ✅ La exportación funciona

---

## 🎯 **URLs Finales**

Después del deploy tendrás:
- **URL de Producción**: `https://mpflow.vercel.app`
- **URL de Preview**: `https://mpflow-git-main-tuusuario.vercel.app`
- **Dashboard de Vercel**: `https://vercel.com/tu-usuario/mpflow`

---

## 📱 **Compartir con el Equipo**

Una vez desplegado, puedes compartir la URL con MPF Ingeniería:

```
🚀 MPFlow está en línea!

Acceso: https://mpflow.vercel.app

Credenciales: (no hay login por ahora - próximo paso con Firebase)

Características:
✅ Dashboard con estadísticas
✅ Gestión de proyectos
✅ Gestión de tareas (Drag & Drop)
✅ Vista de calendario
✅ Gestión de equipo
✅ Notificaciones en tiempo real
✅ Exportar datos
```

---

## 🔜 **Próximos Pasos**

1. ✅ Deploy completado
2. 🔥 Integrar Firebase (autenticación + base de datos)
3. 📎 Agregar sistema de adjuntos

---

## 🆘 **Soporte**

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica que `npm run build` funcione localmente
3. Consulta la documentación: https://vercel.com/docs

---

**MPFlow - El flujo de tu obra**  
*MPF Ingeniería Civil © 2026*
