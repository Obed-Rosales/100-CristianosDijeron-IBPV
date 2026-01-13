#!/bin/bash
# Script de despliegue automático para GitHub Pages
# Uso: ./deploy.sh "mensaje de commit"

MENSAJE="${1:-Actualización automática}"

echo "🚀 Iniciando despliegue automático..."
echo ""

# Verificar que estamos en la rama main
RAMA_ACTUAL=$(git branch --show-current)
if [ "$RAMA_ACTUAL" != "main" ]; then
    echo "❌ Error: Debes estar en la rama main"
    exit 1
fi

# Verificar si hay cambios
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Agregando cambios al staging..."
    git add .
    
    echo "💾 Creando commit..."
    git commit -m "$MENSAJE"
    
    if [ $? -ne 0 ]; then
        echo "❌ Error al crear el commit"
        exit 1
    fi
else
    echo "ℹ️  No hay cambios nuevos para commitear"
fi

# Push a main
echo "⬆️  Subiendo cambios a main..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Error al subir a main"
    exit 1
fi

# Push a gh-pages para GitHub Pages
echo "🌐 Desplegando a GitHub Pages..."
git push origin main:gh-pages -f

if [ $? -ne 0 ]; then
    echo "❌ Error al desplegar a GitHub Pages"
    exit 1
fi

echo ""
echo "✅ ¡Despliegue completado exitosamente!"
echo ""
echo "🌐 Tu sitio estará disponible en:"
echo "   https://obed-rosales.github.io/100-CristianosDijeron-IBPV/"
echo ""
echo "⏱️  Espera 1-2 minutos para que GitHub Pages actualice el sitio"
