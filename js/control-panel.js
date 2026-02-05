// control-panel.js - Lógica del panel de control

let boardWindow = null;
const syncChannel = new BroadcastChannel('gameSync');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeControls();
    loadGameState();
    setupEventListeners();
});

function initializeControls() {
    // Cargar datos de ejemplo
    const sampleBtn = document.createElement('button');
    sampleBtn.textContent = '📝 Cargar Datos de Ejemplo';
    sampleBtn.className = 'btn-secondary';
    sampleBtn.style.marginTop = '10px';
    sampleBtn.onclick = loadSampleData;
    
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.appendChild(sampleBtn);
}

function setupEventListeners() {
    // Abrir tablero
    document.getElementById('openBoard').addEventListener('click', openBoard);
    
    // Cargar archivo
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    
    // Cargar Google Sheets
    document.getElementById('loadSheets').addEventListener('click', handleGoogleSheets);
    
    // Buscar pregunta
    document.getElementById('searchBtn').addEventListener('click', searchQuestions);
    document.getElementById('searchQuestion').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchQuestions();
    });
    
    // Cargar pregunta al tablero
    document.getElementById('loadQuestion').addEventListener('click', loadQuestionToBoard);
    
    // Actualizar nombres de equipos
    document.getElementById('team1Name').addEventListener('change', (e) => {
        gameState.updateTeamName(1, e.target.value);
        syncToBoard();
    });
    
    document.getElementById('team2Name').addEventListener('change', (e) => {
        gameState.updateTeamName(2, e.target.value);
        syncToBoard();
    });
}

function openBoard() {
    if (boardWindow && !boardWindow.closed) {
        boardWindow.focus();
    } else {
        boardWindow = window.open('board.html', 'GameBoard', 'width=1920,height=1080');
    }
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        document.getElementById('fileInfo').textContent = 'Cargando...';
        const questions = await dataManager.loadFromFile(file);
        gameState.loadQuestions(questions);
        updateQuestionsList();
        document.getElementById('fileInfo').textContent = `✅ ${questions.length} preguntas cargadas desde ${file.name}`;
        showNotification('Preguntas cargadas exitosamente', 'success');
    } catch (error) {
        document.getElementById('fileInfo').textContent = '❌ Error al cargar archivo';
        showNotification('Error: ' + error.message, 'error');
    }
}

async function handleGoogleSheets() {
    const url = document.getElementById('sheetsUrl').value.trim();
    if (!url) {
        showNotification('Por favor ingresa una URL de Google Sheets', 'error');
        return;
    }
    
    try {
        showNotification('Cargando desde Google Sheets...', 'info');
        const questions = await dataManager.loadFromGoogleSheets(url);
        gameState.loadQuestions(questions);
        updateQuestionsList();
        showNotification(`${questions.length} preguntas cargadas exitosamente`, 'success');
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

function loadSampleData() {
    const questions = dataManager.createSampleData();
    dataManager.questions = questions;
    gameState.loadQuestions(questions);
    updateQuestionsList();
    showNotification('Datos de ejemplo cargados', 'success');
}

function updateQuestionsList() {
    const select = document.getElementById('questionSelect');
    select.innerHTML = '';
    
    gameState.questions.forEach((q, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. ${q.text}`;
        
        // Marcar con fondo verde las preguntas ya usadas
        if (gameState.usedQuestions && gameState.usedQuestions.includes(index)) {
            option.style.backgroundColor = '#d1fae5';
            option.style.color = '#065f46';
            option.style.fontWeight = '600';
        }
        
        select.appendChild(option);
    });
}

function searchQuestions() {
    const searchText = document.getElementById('searchQuestion').value.trim();
    if (!searchText) {
        updateQuestionsList();
        return;
    }
    
    const results = dataManager.searchQuestions(searchText);
    const select = document.getElementById('questionSelect');
    select.innerHTML = '';
    
    if (results.length === 0) {
        select.innerHTML = '<option>No se encontraron resultados</option>';
        return;
    }
    
    results.forEach((q) => {
        const index = gameState.questions.indexOf(q);
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. ${q.text}`;
        
        // Marcar con fondo verde las preguntas ya usadas
        if (gameState.usedQuestions && gameState.usedQuestions.includes(index)) {
            option.style.backgroundColor = '#d1fae5';
            option.style.color = '#065f46';
            option.style.fontWeight = '600';
        }
        
        select.appendChild(option);
    });
}

function loadQuestionToBoard() {
    const select = document.getElementById('questionSelect');
    const selectedIndex = parseInt(select.value);
    
    if (isNaN(selectedIndex)) {
        showNotification('Selecciona una pregunta primero', 'error');
        return;
    }
    
    // Reproducir sonido de carga
    playSound('load');
    
    gameState.setCurrentQuestion(selectedIndex);
    displayAnswersControl();
    syncToBoard();
    
    // Forzar segunda sincronización después de 100ms para asegurar
    setTimeout(() => {
        syncToBoard();
    }, 100);
    showNotification('Pregunta cargada al tablero', 'success');
}

function displayAnswersControl() {
    const container = document.getElementById('answersControl');
    container.innerHTML = '';
    
    if (!gameState.currentQuestion) {
        container.innerHTML = '<p>Carga una pregunta para ver las respuestas</p>';
        return;
    }
    
    gameState.currentQuestion.answers.forEach((answer, index) => {
        const card = document.createElement('div');
        card.className = 'answer-control';
        
        const isRevealed = gameState.revealedAnswers.includes(index);
        const isReplied = gameState.repliedAnswers.includes(index);
        
        if (isRevealed) {
            card.classList.add('revealed');
        }
        
        card.innerHTML = `
            <div class="answer-number">#${index + 1}</div>
            <div class="answer-text">${answer.text}</div>
            <div class="answer-points">${answer.points}pts.</div>
            <button class="reply-btn" onclick="replyAnswer(${index})" ${isRevealed ? 'disabled' : ''}>
                ${isReplied ? '✅ Respondida' : '💬 Responder'}
            </button>
            <button class="reveal-btn" onclick="revealAnswer(${index})" ${isRevealed ? 'disabled' : ''}>
                ${isRevealed && !isReplied ? '✅ Revelada' : '👁️ Revelar'}
            </button>
        `;
        
        container.appendChild(card);
    });
}

function replyAnswer(index) {
    if (gameState.revealAnswer(index, true)) {
        displayAnswersControl();
        
        // Sincronización múltiple para asegurar actualización
        syncToBoard();
        setTimeout(() => syncToBoard(), 50);
        setTimeout(() => syncToBoard(), 150);
        
        playSound('correct');
        
        const points = gameState.currentQuestion.answers[index].points;
        const totalPoints = points * gameState.multiplier;
        showNotification(`¡Respuesta correcta! +${totalPoints} puntos a la ronda`, 'success');
    }
}

function revealAnswer(index) {
    if (gameState.revealAnswer(index, false)) {
        displayAnswersControl();
        
        // Sincronización múltiple para asegurar actualización
        syncToBoard();
        setTimeout(() => syncToBoard(), 50);
        setTimeout(() => syncToBoard(), 150);
        
        // Reproducir sonido al revelar
        playSound('correct');
        
        // Agregar puntos automáticamente al equipo actual (opcional)
        const points = gameState.currentQuestion.answers[index].points;
        showNotification(`Respuesta revelada: ${points} puntos`, 'success');
    }
}

function updateTeamScore(teamNumber) {
    const scoreInput = document.getElementById(`team${teamNumber}Score`);
    const newScore = parseInt(scoreInput.value) || 0;
    gameState.updateTeamScore(teamNumber, newScore);
    syncToBoard();
}

function addError(teamNumber) {
    gameState.addError(teamNumber);
    updateErrorDisplay(teamNumber);
    syncToBoard();
    playSound('wrong');
    showXOverlay(); // Mostrar X grande en el tablero
}

function resetErrors(teamNumber) {
    gameState.resetErrors(teamNumber);
    updateErrorDisplay(teamNumber);
    syncToBoard();
}

function updateErrorDisplay(teamNumber) {
    const errors = teamNumber === 1 ? gameState.team1.errors : gameState.team2.errors;
    document.getElementById(`team${teamNumber}Errors`).textContent = errors;
}

function updateMultiplier() {
    const value = parseInt(document.getElementById('multiplierInput').value) || 1;
    gameState.setMultiplier(value);
    syncToBoard();
    showNotification(`Multiplicador actualizado a x${value}`, 'success');
}

function showXOverlay() {
    // Enviar comando al tablero para mostrar la X
    syncChannel.postMessage({
        type: 'showX'
    });
    
    // Si el tablero está abierto, también ejecutar directamente
    if (boardWindow && !boardWindow.closed) {
        boardWindow.postMessage({ type: 'showX' }, '*');
    }
    
    showNotification('Mostrando X en el tablero', 'success');
}

function nextRound() {
    if (!gameState.currentQuestion || gameState.roundPoints === 0) {
        showNotification('No hay puntos en esta ronda', 'error');
        return;
    }
    
    // Mostrar diálogo personalizado para seleccionar equipo
    const team1Name = gameState.team1.name;
    const team2Name = gameState.team2.name;
    const points = gameState.roundPoints;
    
    showTeamSelectionDialog(team1Name, team2Name, points);
}

function showTeamSelectionDialog(team1Name, team2Name, points) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Crear diálogo
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        text-align: center;
        max-width: 500px;
        animation: scaleIn 0.3s ease;
    `;
    
    dialog.innerHTML = `
        <h2 style="color: #2563eb; margin-bottom: 20px; font-size: 2rem;">
            🏆 Siguiente Ronda
        </h2>
        <p style="font-size: 1.5rem; margin-bottom: 30px; color: #0f172a;">
            ¿Qué equipo ganó los <strong style="color: #f59e0b;">${points} puntos</strong> de esta ronda?
        </p>
        <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
            <button id="selectTeam1" style="
                padding: 15px 40px;
                font-size: 1.2rem;
                font-weight: 600;
                border: none;
                border-radius: 12px;
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
            " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(37, 99, 235, 0.6)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(37, 99, 235, 0.4)'">
                ${team1Name}
            </button>
            <button id="selectTeam2" style="
                padding: 15px 40px;
                font-size: 1.2rem;
                font-weight: 600;
                border: none;
                border-radius: 12px;
                background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
            " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(124, 58, 237, 0.6)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(124, 58, 237, 0.4)'">
                ${team2Name}
            </button>
            <button id="selectNone" style="
                padding: 15px 40px;
                font-size: 1.2rem;
                font-weight: 600;
                border: 2px solid #6b7280;
                border-radius: 12px;
                background: white;
                color: #374151;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(0, 0, 0, 0.2)'; this.style.borderColor='#374151'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)'; this.style.borderColor='#6b7280'">
                ❌ Ninguno
            </button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Event listeners
    document.getElementById('selectTeam1').addEventListener('click', () => {
        assignPointsToTeam(1, team1Name, points);
        overlay.remove();
    });
    
    document.getElementById('selectTeam2').addEventListener('click', () => {
        assignPointsToTeam(2, team2Name, points);
        overlay.remove();
    });
    
    document.getElementById('selectNone').addEventListener('click', () => {
        skipRound();
        overlay.remove();
    });
    
    // Cerrar al hacer clic en el overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

function assignPointsToTeam(teamNumber, teamName, points) {
    gameState.nextRound(teamNumber);
    
    // Actualizar displays locales
    loadGameState();
    displayAnswersControl();
    
    // Sincronizar con el tablero múltiples veces para asegurar actualización de errores
    syncToBoard();
    setTimeout(() => syncToBoard(), 50);
    setTimeout(() => syncToBoard(), 150);
    
    showNotification(`${points} puntos asignados a ${teamName}. Errores reiniciados.`, 'success');
    playSound('start');
}

function skipRound() {
    // Resetear la ronda sin asignar puntos a ningún equipo
    gameState.team1.errors = 0;
    gameState.team2.errors = 0;
    gameState.roundPoints = 0;
    gameState.revealedAnswers = [];
    gameState.repliedAnswers = [];
    gameState.currentQuestion = null;
    gameState.saveToStorage();
    
    // Actualizar displays locales
    loadGameState();
    displayAnswersControl();
    
    // Sincronizar con el tablero
    syncToBoard();
    setTimeout(() => syncToBoard(), 50);
    setTimeout(() => syncToBoard(), 150);
    
    showNotification('Ronda omitida. Puntos no asignados. Errores reiniciados.', 'info');
}

// Variable global para mantener referencia al audio del timer
let timerAudio = null;
let timerInterval = null;
let timerSeconds = 10;

function playSound(type) {
    const sounds = {
        start: 'res/audio/start.mp3',
        correct: 'res/audio/correct.mp3',
        wrong: 'res/audio/wrong.mp3',
        repeated: 'res/audio/repeated.mp3',
        win: 'res/audio/win.mp3',
        timer: 'res/audio/timer.mp3',
        load: 'res/audio/load.mp3'
    };
    
    const audio = new Audio(sounds[type]);
    
    // Si es el timer, guardar referencia para poder detenerlo y mostrar countdown
    if (type === 'timer') {
        // Detener el anterior si existe
        if (timerAudio) {
            timerAudio.pause();
            timerAudio.currentTime = 0;
        }
        
        // Detener el intervalo anterior si existe
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        timerAudio = audio;
        
        // Iniciar countdown visual
        startTimerCountdown();
        
        // Limpiar referencia cuando termine
        audio.addEventListener('ended', () => {
            timerAudio = null;
            stopTimerCountdown();
        });
    }
    
    audio.play().catch(e => console.log('Audio play failed:', e));
}

function startTimerCountdown() {
    // Resetear a 10 segundos
    timerSeconds = 10;
    
    // Mostrar overlay en panel de control
    const overlayControl = document.getElementById('timerOverlayControl');
    const numberControl = document.getElementById('timerNumberControl');
    overlayControl.classList.add('show');
    numberControl.textContent = timerSeconds;
    numberControl.classList.remove('warning');
    
    // Enviar comando al tablero para mostrar countdown
    syncChannel.postMessage({
        type: 'startTimer',
        seconds: timerSeconds
    });
    
    // Si el tablero está abierto, también ejecutar directamente
    if (boardWindow && !boardWindow.closed) {
        boardWindow.postMessage({ 
            type: 'startTimer',
            seconds: timerSeconds
        }, '*');
    }
    
    // Iniciar cuenta regresiva
    timerInterval = setInterval(() => {
        timerSeconds--;
        
        // Actualizar display local
        numberControl.textContent = timerSeconds;
        
        // Advertencia en los últimos 3 segundos
        if (timerSeconds <= 3 && timerSeconds > 0) {
            numberControl.classList.add('warning');
        }
        
        // Enviar actualización al tablero
        syncChannel.postMessage({
            type: 'updateTimer',
            seconds: timerSeconds
        });
        
        if (boardWindow && !boardWindow.closed) {
            boardWindow.postMessage({ 
                type: 'updateTimer',
                seconds: timerSeconds
            }, '*');
        }
        
        // Detener cuando llegue a 0
        if (timerSeconds <= 0) {
            stopTimerCountdown();
        }
    }, 1000);
}

function stopTimerCountdown() {
    // Detener intervalo
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Ocultar overlay en panel de control
    const overlayControl = document.getElementById('timerOverlayControl');
    if (overlayControl) {
        overlayControl.classList.remove('show');
    }
    
    // Enviar comando al tablero para ocultar countdown
    syncChannel.postMessage({
        type: 'stopTimer'
    });
    
    if (boardWindow && !boardWindow.closed) {
        boardWindow.postMessage({ 
            type: 'stopTimer'
        }, '*');
    }
}

function stopTimerSound() {
    // Detener audio
    if (timerAudio) {
        timerAudio.pause();
        timerAudio.currentTime = 0;
        timerAudio = null;
    }
    
    // Detener countdown visual
    stopTimerCountdown();
    
    showNotification('Sonido del timer detenido', 'info');
}

function resetGame() {
    if (confirm('¿Estás seguro de que quieres reiniciar el juego?')) {
        gameState.resetGame();
        loadGameState();
        displayAnswersControl();
        syncToBoard();
        showNotification('Juego reiniciado', 'success');
    }
}

function resetUsedQuestions() {
    if (confirm('¿Deseas limpiar el historial de preguntas usadas (verdes)?')) {
        gameState.usedQuestions = [];
        gameState.saveToStorage();
        updateQuestionsList();
        showNotification('Historial de preguntas limpiado', 'success');
    }
}

function loadGameState() {
    // Cargar equipos
    document.getElementById('team1Name').value = gameState.team1.name;
    document.getElementById('team2Name').value = gameState.team2.name;
    document.getElementById('team1Score').value = gameState.team1.score;
    document.getElementById('team2Score').value = gameState.team2.score;
    updateErrorDisplay(1);
    updateErrorDisplay(2);
    
    // Cargar preguntas si existen
    if (gameState.questions.length > 0) {
        updateQuestionsList();
    }
    
    // Cargar respuestas si hay pregunta actual
    if (gameState.currentQuestion) {
        displayAnswersControl();
    }
}

function syncToBoard() {
    // 1. Guardar en localStorage
    gameState.saveToStorage();
    
    // 2. Enviar mensaje por BroadcastChannel (funciona entre todas las ventanas)
    syncChannel.postMessage({ 
        type: 'stateUpdate',
        timestamp: Date.now()
    });
    
    // 3. Si el tablero está abierto, enviar postMessage también
    if (boardWindow && !boardWindow.closed) {
        boardWindow.postMessage({ 
            type: 'update',
            timestamp: Date.now()
        }, '*');
    }
}

function showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animaciones CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(style);
