# Script de despliegue automático para GitHub Pages
# Uso: .\deploy.ps1 "mensaje de commit"

param(
    [string]$mensaje = "Actualización automática"
)

Write-Host "🚀 Iniciando despliegue automático..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la rama main
$ramaActual = git branch --show-current
if ($ramaActual -ne "main") {
    Write-Host "❌ Error: Debes estar en la rama main" -ForegroundColor Red
    exit 1
}

# Verificar si hay cambios
$cambios = git status --porcelain
if ($cambios) {
    Write-Host "📝 Agregando cambios al staging..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Creando commit..." -ForegroundColor Yellow
    git commit -m $mensaje
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al crear el commit" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  No hay cambios nuevos para commitear" -ForegroundColor Blue
}

# Push a main
Write-Host "⬆️  Subiendo cambios a main..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir a main" -ForegroundColor Red
    exit 1
}

# Push a gh-pages para GitHub Pages
Write-Host "🌐 Desplegando a GitHub Pages..." -ForegroundColor Yellow
git push origin main:gh-pages -f

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar a GitHub Pages" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ ¡Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Tu sitio estará disponible en:" -ForegroundColor Cyan
Write-Host "   https://obed-rosales.github.io/100-CristianosDijeron-IBPV/" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Espera 1-2 minutos para que GitHub Pages actualice el sitio" -ForegroundColor Yellow
