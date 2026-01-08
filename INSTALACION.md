# 🚀 GUÍA DE INSTALACIÓN - OBRAMANAGER

## Para MacBook M5 (Apple Silicon)

### Paso 1: Preparar el Entorno

Asegúrate de tener instalado Node.js (versión 18 o superior):
```bash
node --version
npm --version
```

Si no tienes Node.js, instálalo desde: https://nodejs.org/

### Paso 2: Crear el Proyecto

Abre la Terminal y ejecuta:

```bash
# Crear proyecto con Vite
npm create vite@latest obra-manager -- --template react

# Entrar al directorio
cd obra-manager
```

### Paso 3: Instalar Dependencias

```bash
# Instalar dependencias base
npm install

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Instalar librerías adicionales
npm install lucide-react date-fns
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Inicializar Tailwind
npx tailwindcss init -p
```

### Paso 4: Estructura de Carpetas

Crea la siguiente estructura:

```
obra-manager/
├── src/
│   ├── components/     👈 Crea esta carpeta
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── package.json
└── index.html
```

```bash
# Desde la raíz del proyecto
mkdir src/components
```

### Paso 5: Copiar Archivos

Copia los archivos que te proporcioné en las siguientes ubicaciones:

**Raíz del proyecto:**
- `tailwind.config.js` → `./tailwind.config.js`
- `postcss.config.js` → `./postcss.config.js`
- `vite.config.js` → `./vite.config.js`
- `index.html` → `./index.html`
- `package.json` → `./package.json`

**Carpeta src:**
- `index.css` → `./src/index.css`
- `App.jsx` → `./src/App.jsx`
- `main.jsx` → `./src/main.jsx`

**Carpeta src/components:**
- `Sidebar.jsx` → `./src/components/Sidebar.jsx`
- `TopBar.jsx` → `./src/components/TopBar.jsx`
- `ProjectBoard.jsx` → `./src/components/ProjectBoard.jsx`
- `TaskCard.jsx` → `./src/components/TaskCard.jsx`

### Paso 6: Verificar que todo esté en su lugar

```bash
# Verifica la estructura con:
ls -la
ls -la src/
ls -la src/components/
```

Deberías ver todos los archivos en sus lugares correspondientes.

### Paso 7: Instalar Dependencias (de nuevo, por si acaso)

```bash
npm install
```

### Paso 8: ¡Ejecutar la Aplicación! 🎉

```bash
npm run dev
```

La aplicación debería abrirse automáticamente en tu navegador en:
**http://localhost:3000**

## 🎨 Lo que verás:

- ✅ Sidebar con navegación
- ✅ Barra superior con búsqueda
- ✅ Dashboard con estadísticas
- ✅ Tablero Kanban con 4 columnas
- ✅ Tarjetas de tareas con prioridades
- ✅ Diseño moderno y profesional

## 🔧 Comandos Útiles

```bash
# Iniciar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación
npm preview
```

## ⚠️ Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error de puerto ocupado
```bash
# Cambia el puerto en vite.config.js
server: {
  port: 3001,  // Cambia a otro puerto
  open: true
}
```

### Tailwind no funciona
```bash
# Verifica que postcss.config.js exista
# Reinicia el servidor
npm run dev
```

## 📱 Próximos Pasos

Una vez que la app esté corriendo:

1. **Personaliza los proyectos** editando `src/App.jsx`
2. **Agrega más tareas** en `src/components/ProjectBoard.jsx`
3. **Cambia los colores** en `tailwind.config.js`
4. **Implementa drag & drop** usando @dnd-kit
5. **Conecta un backend** para persistencia de datos

## 🎯 Características Incluidas

- 📊 Dashboard con métricas
- 🎯 Sistema de prioridades
- 👥 Asignación de personal
- 📅 Fechas de vencimiento
- ✅ Progreso de tareas
- 🏷️ Etiquetas personalizadas
- 🎨 Diseño responsivo

## 💡 Tips

- Usa `Cmd + K` para buscar en la mayoría de editores
- Instala la extensión de Tailwind CSS para VS Code
- Usa React DevTools para debugging

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:
1. Verifica que todos los archivos estén en su lugar
2. Asegúrate de que Node.js esté actualizado
3. Revisa la consola del navegador para errores
4. Verifica que todas las dependencias estén instaladas

---

**¡Listo! Tu app de gestión de obras está funcionando** 🎉
