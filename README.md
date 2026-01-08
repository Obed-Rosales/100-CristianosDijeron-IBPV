# 100 Cristianos Dijeron 🎮

Un juego interactivo basado en "100 Mexicanos Dijeron" (Family Feud) diseñado para la comunidad cristiana.

## 🎯 Características

- **Interfaz Dual**: Panel de control separado del tablero de juego
- **Carga de Preguntas**: Soporte para archivos Excel (.xlsx, .xls) y Google Sheets
- **Búsqueda Inteligente**: Encuentra respuestas por palabras clave
- **Efectos de Sonido**: Sonidos para inicio, aciertos y errores
- **Sincronización en Tiempo Real**: Los cambios se reflejan instantáneamente en ambas pantallas
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Sin Backend**: Funciona 100% en el navegador

## 📋 Requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Para desarrollo: Visual Studio Code (opcional)
- Para ejecutar: No requiere instalación de dependencias

## 🚀 Cómo Usar

### Inicio Rápido

1. **Abrir el Panel de Control**
   - Abre `index.html` en tu navegador
   - Este es el panel desde donde controlarás el juego

2. **Abrir el Tablero**
   - Haz clic en "Abrir Tablero" en el panel de control
   - Se abrirá una nueva ventana con el tablero del juego
   - Coloca esta ventana en una segunda pantalla o proyector

3. **Cargar Preguntas**
   - Puedes usar los datos de ejemplo haciendo clic en "Cargar Datos de Ejemplo"
   - O cargar tu propio archivo Excel/CSV
   - O conectar con Google Sheets

### Desde Visual Studio Code

1. Instala la extensión "Live Server"
2. Abre la carpeta del proyecto
3. Clic derecho en `index.html` → "Open with Live Server"
4. Se abrirá automáticamente en el navegador

### Desde Visual Studio 2022

1. Archivo → Abrir → Carpeta
2. Selecciona la carpeta del proyecto
3. Configura IIS Express o usa la opción de abrir en navegador

## 📊 Formato de Archivo Excel/CSV

El archivo debe tener el siguiente formato:

| Pregunta | Respuesta1 | Puntos1 | Respuesta2 | Puntos2 | ... | Respuesta8 | Puntos8 |
|----------|-----------|---------|-----------|---------|-----|-----------|---------|
| ¿Qué cosas encuentras en la iglesia? | Biblia | 35 | Cruz | 28 | ... | Bancas | 10 |

**Archivos de ejemplo disponibles en `res/docs/`:**
- `preguntas_ejemplo.xlsx` - Archivo Excel con preguntas de ejemplo
- `preguntas_ejemplo.csv` - Archivo CSV con las mismas preguntas

**Ejemplo:**
```
Pregunta,Respuesta1,Puntos1,Respuesta2,Puntos2,Respuesta3,Puntos3
¿Qué libros de la Biblia conoces?,Génesis,40,Éxodo,25,Salmos,20
¿Qué hace un cristiano todos los días?,Orar,45,Leer la Biblia,30,Agradecer,15
```

## 🎮 Cómo Jugar

### Panel de Control

1. **Cargar Preguntas**: Sube tu archivo o usa datos de ejemplo
2. **Seleccionar Pregunta**: Busca y selecciona una pregunta de la lista
3. **Cargar al Tablero**: La pregunta aparecerá en el tablero
4. **Control de Equipos**: 
   - Actualiza nombres y puntos
   - Marca errores (máximo 3 por equipo)
5. **Revelar Respuestas**:
   - Usa búsqueda de palabras clave para encontrar respuestas
   - O revela manualmente desde el panel
6. **Sonidos**: Reproduce efectos de sonido para cada acción

### Tablero de Juego

- Muestra la pregunta actual
- Muestra respuestas ocultas/reveladas con animaciones
- Muestra puntuación de ambos equipos
- Muestra errores de cada equipo (X rojas)

## 🎵 Sonidos

El proyecto incluye placeholders para sonidos. Puedes agregar tus propios archivos:

- `sounds/start.mp3` - Sonido al iniciar ronda
- `sounds/correct.mp3` - Sonido al acertar
- `sounds/wrong.mp3` - Sonido al fallar

Reemplaza estos archivos con tus propios sonidos en formato MP3.

## 🔧 Configuración de Google Sheets

1. Crea una hoja de cálculo en Google Sheets
2. Usa el formato especificado arriba
3. Archivo → Compartir → Publicar en la web → Publicar
4. Copia el enlace y pégalo en el panel de control

**Nota**: Asegúrate de que la hoja sea pública o accesible.

## 🛠️ Estructura del Proyecto

```
100-cristianos-dijeron/
├── index.html              # Panel de control
├── board.html              # Tablero de juego
├── css/
│   ├── control.css         # Estilos del panel
│   └── board.css           # Estilos del tablero
├── js/
│   ├── game-logic.js       # Lógica central del juego
│   ├── data-manager.js     # Gestión de datos
│   ├── control-panel.js    # Funciones del panel
│   └── board-display.js    # Funciones del tablero
├── res/
│   ├── audio/              # Efectos de sonido
│   │   ├── start.mp3       # Sonido de inicio
│   │   ├── correct.mp3     # Sonido de acierto
│   │   ├── wrong.mp3       # Sonido de error
│   │   ├── win.mp3         # Sonido de victoria
│   │   └── timer.mp3       # Sonido de tiempo
│   ├── img/                # Imágenes y recursos visuales
│   └── docs/               # Documentos de ejemplo
│       ├── preguntas_ejemplo.xlsx
│       └── preguntas_ejemplo.csv
└── README.md               # Este archivo
```

## 💡 Consejos

- Usa dos monitores o un proyector para mejor experiencia
- F11 en el tablero para pantalla completa
- Los datos se guardan en localStorage
- Recarga la página si hay problemas de sincronización

## 🔍 Búsqueda de Respuestas

La función de búsqueda es inteligente:
- Busca palabras parciales
- Encuentra respuestas similares
- Ordena por relevancia
- Permite revelar directamente desde los resultados

**Ejemplo**: Si buscas "bibli", encontrará "Biblia"

## 🎨 Personalización

Puedes personalizar colores editando las variables CSS en los archivos:
- `css/control.css`
- `css/board.css`

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #7c3aed;
    --success-color: #10b981;
    --error-color: #ef4444;
}
```

## 📝 Notas Técnicas

- **Sincronización**: Usa localStorage y eventos de storage
- **Excel**: Usa la librería SheetJS (XLSX)
- **Sin dependencias del servidor**: Todo corre en el cliente
- **Navegadores soportados**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

## 🐛 Solución de Problemas

**El tablero no se sincroniza:**
- Verifica que ambas ventanas estén en el mismo origen (mismo protocolo y puerto)
- Recarga ambas ventanas

**No se cargan las preguntas:**
- Verifica el formato del archivo Excel/CSV
- Asegúrate de que tenga el formato correcto

**No se reproducen los sonidos:**
- Verifica que los archivos MP3 existan en la carpeta `sounds/`
- Algunos navegadores bloquean autoplay de audio

## 📄 Licencia

Este proyecto es de código abierto y puede ser usado libremente para propósitos educativos y comunitarios.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Siéntete libre de:
- Reportar bugs
- Sugerir nuevas características
- Mejorar la documentación
- Agregar más preguntas de ejemplo

## 📧 Contacto

Para preguntas o sugerencias, puedes crear un issue en el repositorio del proyecto.

---

**¡Que Dios bendiga tu juego! 🙏**
