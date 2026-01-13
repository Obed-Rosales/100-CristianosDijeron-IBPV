# Scripts de Despliegue

Este directorio contiene scripts automáticos para facilitar el despliegue del proyecto a GitHub Pages.

## 📝 Uso

### Windows (PowerShell)
```powershell
.\deploy.ps1 "Tu mensaje de commit"
```

O simplemente:
```powershell
.\deploy.ps1
```
(Usará el mensaje por defecto: "Actualización automática")

### Linux/Mac (Bash)
Primero, dar permisos de ejecución:
```bash
chmod +x deploy.sh
```

Luego ejecutar:
```bash
./deploy.sh "Tu mensaje de commit"
```

O simplemente:
```bash
./deploy.sh
```

## ✨ Lo que hace el script automáticamente:

1. ✅ Verifica que estés en la rama `main`
2. 📝 Agrega todos los cambios al staging (`git add .`)
3. 💾 Crea un commit con tu mensaje
4. ⬆️ Sube los cambios a la rama `main` en GitHub
5. 🌐 Despliega automáticamente a GitHub Pages (rama `gh-pages`)
6. 🎉 ¡Listo! Tu sitio se actualizará en 1-2 minutos

## 🌐 URL del sitio

Después de cada despliegue, tu sitio estará disponible en:
**https://obed-rosales.github.io/100-CristianosDijeron-IBPV/**

## 💡 Ejemplos

```powershell
# Despliegue con mensaje personalizado
.\deploy.ps1 "Agregado nuevo diseño de tablero"

# Despliegue con mensaje por defecto
.\deploy.ps1

# En Linux/Mac
./deploy.sh "Corrección de bugs en el marcador"
```

## ⚠️ Nota

Si es la primera vez que usas GitHub Pages, recuerda configurarlo en:
**GitHub → Settings → Pages → Source: gh-pages branch**
