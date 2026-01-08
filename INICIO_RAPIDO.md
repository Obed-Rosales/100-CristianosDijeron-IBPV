# 🚀 Guía de Inicio Rápido

## Opción 1: Abrir directamente en el navegador

1. Navega a la carpeta del proyecto
2. Haz doble clic en `index.html`
3. Se abrirá el panel de control en tu navegador
4. Haz clic en "Abrir Tablero" para abrir la ventana del juego

## Opción 2: Usar Live Server en VS Code (Recomendado)

1. Abre VS Code
2. Instala la extensión "Live Server" (si no la tienes)
   - Ve a Extensiones (Ctrl+Shift+X)
   - Busca "Live Server"
   - Instala la extensión de Ritwick Dey
3. Abre esta carpeta en VS Code
4. Haz clic derecho en `index.html`
5. Selecciona "Open with Live Server"
6. Se abrirá automáticamente en tu navegador

## Opción 3: Visual Studio 2022

1. Abre Visual Studio 2022
2. Archivo → Abrir → Carpeta
3. Selecciona la carpeta del proyecto
4. Haz clic en el botón de reproducir o F5
5. Selecciona tu navegador preferido

## Primer Uso

1. **Cargar preguntas de ejemplo**
   - En el panel de control, haz clic en "📝 Cargar Datos de Ejemplo"
   - Se cargarán 3 preguntas de prueba

2. **Abrir el tablero**
   - Haz clic en "Abrir Tablero"
   - Coloca esta ventana en una segunda pantalla si es posible

3. **Seleccionar una pregunta**
   - En el selector, elige una pregunta
   - Haz clic en "Cargar Pregunta al Tablero"

4. **Jugar**
   - Configura los nombres de los equipos
   - Revela respuestas usando los botones
   - O usa la búsqueda de palabras clave
   - Marca errores y actualiza puntos

## Cargar tus propias preguntas

### Desde archivo Excel/CSV

1. Usa el archivo `res/docs/preguntas_ejemplo.csv` o `res/docs/preguntas_ejemplo.xlsx` como plantilla
2. Edita en Excel o cualquier editor de texto
3. En el panel, haz clic en "📁 Seleccionar archivo Excel/CSV"
4. Selecciona tu archivo

### Desde Google Sheets

1. Crea una hoja en Google Sheets
2. Usa el formato del archivo de ejemplo
3. Archivo → Compartir → Publicar en la web
4. Copia el enlace
5. Pégalo en el campo de URL
6. Haz clic en "Cargar desde Sheets"

## Agregar Sonidos

1. Descarga sonidos de:
   - https://freesound.org
   - https://pixabay.com/sound-effects/
2. Nómbralos: `start.mp3`, `correct.mp3`, `wrong.mp3`
3. Colócalos en la carpeta `sounds/`

## Atajos Útiles

- **F11** en el tablero: Pantalla completa
- **Enter** en búsqueda: Buscar
- **Ctrl+R**: Recargar si hay problemas de sincronización

## Solución Rápida de Problemas

**El tablero no se sincroniza:**
- Ambas ventanas deben abrirse desde el mismo origen
- Usa Live Server o un servidor local

**No aparecen las preguntas:**
- Verifica el formato del archivo
- Debe tener: Pregunta, Respuesta1, Puntos1, etc.

**No se oyen sonidos:**
- Verifica que los archivos MP3 existan
- El juego funciona sin sonidos

## ¿Necesitas Ayuda?

Consulta el `README.md` para documentación completa.

---

**¡Listo para jugar! 🎮🙏**
