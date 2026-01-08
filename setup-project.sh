#!/bin/bash

# Script para crear proyecto de gestión de obras estilo Monday
# Para MacBook M5

echo "🏗️  Creando proyecto de gestión de obras..."

# Crear proyecto con Vite
npm create vite@latest obra-manager -- --template react

cd obra-manager

# Instalar dependencias base
npm install

# Instalar dependencias adicionales para la app
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react
npm install date-fns
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Inicializar Tailwind CSS
npx tailwindcss init -p

echo "✅ Proyecto creado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. cd obra-manager"
echo "2. Reemplazar archivos con la configuración personalizada"
echo "3. npm run dev"
