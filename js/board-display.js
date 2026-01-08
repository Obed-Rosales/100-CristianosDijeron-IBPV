// board-display.js - Lógica de visualización del tablero

// Canal de comunicación entre ventanas
const syncChannel = new BroadcastChannel('gameSync');
let lastStateHash = '';
let previousRevealedAnswers = []; // Rastrear respuestas reveladas anteriormente
let currentQuestionId = null; // Rastrear cambios de pregunta

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    gameState.loadFromStorage();
    lastStateHash = getStateHash();
    loadBoardState();
    setupAutoRefresh();
    setupMessageListener();
    setupStorageListener();
    setupBroadcastListener();
    setupResizeListener();
});

function getStateHash() {
    // Crear un hash del estado para detectar cambios
    return JSON.stringify(getCurrentDisplayState());
}

function setupAutoRefresh() {
    // Refrescar cada 200ms para sincronización más rápida
    setInterval(() => {
        gameState.loadFromStorage();
        const newHash = getStateHash();
        
        if (lastStateHash !== newHash) {
            lastStateHash = newHash;
            loadBoardState();
        }
    }, 200);
}

function setupMessageListener() {
    // Escuchar mensajes del panel de control via postMessage
    window.addEventListener('message', (event) => {
        if (event.data.type === 'update') {
            gameState.loadFromStorage();
            lastStateHash = getStateHash();
            loadBoardState();
        } else if (event.data.type === 'showX') {
            displayXOverlay();
        }
    });
}

function setupStorageListener() {
    // Escuchar cambios directos en localStorage (solo funciona entre ventanas diferentes)
    window.addEventListener('storage', (event) => {
        if (event.key === 'familyFeudGameState') {
            gameState.loadFromStorage();
            lastStateHash = getStateHash();
            loadBoardState();
        }
    });
}

function setupBroadcastListener() {
    // Escuchar mensajes del BroadcastChannel (funciona entre todas las ventanas)
    syncChannel.onmessage = (event) => {
        if (event.data.type === 'stateUpdate') {
            gameState.loadFromStorage();
            lastStateHash = getStateHash();
            loadBoardState();
        } else if (event.data.type === 'showX') {
            displayXOverlay();
        }
    };
}

function setupResizeListener() {
    // Reajustar tamaño de fuente cuando cambie el tamaño de la ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (gameState.currentQuestion) {
                const questionElement = document.getElementById('boardQuestion');
                adjustQuestionFontSize(questionElement, gameState.currentQuestion.text);
            }
        }, 250); // Debounce de 250ms
    });
}

function getCurrentDisplayState() {
    return {
        team1: gameState.team1,
        team2: gameState.team2,
        currentQuestion: gameState.currentQuestion,
        revealedAnswers: gameState.revealedAnswers,
        repliedAnswers: gameState.repliedAnswers,
        roundPoints: gameState.roundPoints,
        multiplier: gameState.multiplier
    };
}

function loadBoardState() {
    updateTeamsDisplay();
    updateQuestionDisplay();
    updateAnswersDisplay();
    updateRoundPoints();
}

function updateTeamsDisplay() {
    // Equipo 1
    document.getElementById('boardTeam1Name').textContent = gameState.team1.name;
    document.getElementById('boardTeam1Score').textContent = gameState.team1.score;
    updateErrorsDisplay(1, gameState.team1.errors);
    
    // Equipo 2
    document.getElementById('boardTeam2Name').textContent = gameState.team2.name;
    document.getElementById('boardTeam2Score').textContent = gameState.team2.score;
    updateErrorsDisplay(2, gameState.team2.errors);
}

function updateErrorsDisplay(teamNumber, errorCount) {
    const errorsContainer = document.getElementById(`boardTeam${teamNumber}Errors`);
    const errorElements = errorsContainer.querySelectorAll('.error-x');
    
    errorElements.forEach((element, index) => {
        if (index < errorCount) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });
}

function updateQuestionDisplay() {
    const questionElement = document.getElementById('boardQuestion');
    
    if (gameState.currentQuestion) {
        const questionText = gameState.currentQuestion.text;
        
        // Detectar cambio de pregunta y resetear tracking de respuestas
        if (currentQuestionId !== questionText) {
            currentQuestionId = questionText;
            previousRevealedAnswers = [];
        }
        
        questionElement.textContent = questionText;
        questionElement.style.color = 'var(--text-light)';
        questionElement.classList.remove('loading');
        
        // Ajustar tamaño de fuente basado en longitud del texto
        adjustQuestionFontSize(questionElement, questionText);
    } else {
        // Reset al no haber pregunta
        currentQuestionId = null;
        previousRevealedAnswers = [];
        
        // Si usedQuestions tiene elementos, significa que ya jugamos
        if (gameState.usedQuestions && gameState.usedQuestions.length > 0) {
            questionElement.textContent = 'Cargando pregunta...';
            questionElement.classList.add('loading');
        } else {
            questionElement.textContent = '¡Bienvenidos a 100 Cristianos Dijeron!';
            questionElement.classList.remove('loading');
        }
        questionElement.style.color = 'rgba(255, 255, 255, 0.7)';
        questionElement.style.fontSize = ''; // Reset font size
    }
}

function adjustQuestionFontSize(element, text) {
    const textLength = text.length;
    const screenWidth = window.innerWidth;
    let fontSize;
    
    // Factor de escala según tamaño de pantalla
    let scaleFactor = 1;
    if (screenWidth <= 768) {
        scaleFactor = 0.5; // Móviles
    } else if (screenWidth <= 1200) {
        scaleFactor = 0.7; // Tablets
    }
    
    // Ajustar tamaño según longitud del texto
    if (textLength <= 30) {
        // Texto muy corto - fuente extra grande
        fontSize = 4.5 * scaleFactor;
    } else if (textLength <= 50) {
        // Texto corto - fuente grande
        fontSize = 3.8 * scaleFactor;
    } else if (textLength <= 80) {
        // Texto medio - fuente normal-grande
        fontSize = 3.2 * scaleFactor;
    } else if (textLength <= 120) {
        // Texto largo - fuente normal
        fontSize = 2.8 * scaleFactor;
    } else if (textLength <= 160) {
        // Texto muy largo - fuente pequeña
        fontSize = 2.3 * scaleFactor;
    } else {
        // Texto extra largo - fuente mínima
        fontSize = 2 * scaleFactor;
    }
    
    // Asegurar tamaño mínimo legible
    fontSize = Math.max(fontSize, 1.5);
    
    element.style.fontSize = `${fontSize}rem`;
}

function adjustAnswerTextFontSize(element, text) {
    const card = element.closest('.answer-card');
    if (!card) return;
    
    const cardHeight = card.offsetHeight;
    const cardWidth = card.offsetWidth;
    const availableWidth = element.offsetWidth;
    const textLength = text.length;
    
    // Calcular tamaño base en píxeles (30% más grande que antes)
    let baseSizeInPixels = Math.min(cardHeight * 0.68, availableWidth * 0.156);
    
    // Ajustar según longitud del texto (factores aumentados 30%)
    let lengthFactor;
    if (textLength <= 10) {
        lengthFactor = 0.975; // Texto muy corto
    } else if (textLength <= 15) {
        lengthFactor = 0.819;
    } else if (textLength <= 20) {
        lengthFactor = 0.702;
    } else if (textLength <= 30) {
        lengthFactor = 0.585;
    } else if (textLength <= 40) {
        lengthFactor = 0.4875;
    } else if (textLength <= 50) {
        lengthFactor = 0.429;
    } else {
        lengthFactor = 0.351; // Texto muy largo
    }
    
    let fontSizeInPixels = baseSizeInPixels * lengthFactor;
    
    // Calcular ancho aproximado del texto en píxeles
    const estimatedTextWidth = fontSizeInPixels * textLength * 0.6;
    
    // Si el texto es demasiado ancho, reducir proporcionalmente
    if (estimatedTextWidth > availableWidth) {
        fontSizeInPixels = fontSizeInPixels * (availableWidth / estimatedTextWidth) * 0.75;
    }
    
    // Convertir de píxeles a rem (16px = 1rem)
    let fontSize = fontSizeInPixels / 16;
    
    // Límites absolutos en rem (30% más grandes)
    const minSize = 0.975; // Mínimo 0.975rem
    const maxSize = 4.875; // Máximo 4.875rem
    
    fontSize = Math.max(minSize, Math.min(maxSize, fontSize));
    
    element.style.fontSize = `${fontSize}rem`;
}

function updateAnswersDisplay() {
    const answersContainer = document.getElementById('boardAnswers');
    
    if (!gameState.currentQuestion) {
        answersContainer.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-text">...</div>
            </div>
        `;
        previousRevealedAnswers = [];
        return;
    }
    
    // Detectar respuestas recién reveladas ANTES de recrear el DOM
    const newlyRevealed = gameState.revealedAnswers.filter(
        index => !previousRevealedAnswers.includes(index)
    );
    
    console.log('Board: Respuestas reveladas actuales:', gameState.revealedAnswers);
    console.log('Board: Respuestas reveladas anteriores:', previousRevealedAnswers);
    console.log('Board: Respuestas recién reveladas:', newlyRevealed);
    
    // Solo recrear si el número de tarjetas cambió o si no hay tarjetas
    const existingCards = answersContainer.querySelectorAll('.answer-card');
    const shouldRecreate = existingCards.length !== gameState.currentQuestion.answers.length;
    
    if (shouldRecreate) {
        answersContainer.innerHTML = '';
        
        gameState.currentQuestion.answers.forEach((answer, index) => {
            const card = document.createElement('div');
            card.className = 'answer-card';
            card.dataset.index = index;
            card.classList.add('hidden');
            
            card.innerHTML = `
                <div class="answer-number">${index + 1}</div>
                <div class="answer-text">${answer.text}</div>
                <div class="answer-points">${String(answer.points).padStart(2, '0')}</div>
            `;
            
            answersContainer.appendChild(card);
        });
    }
    
    // Actualizar el estado de las tarjetas existentes
    const allCards = answersContainer.querySelectorAll('.answer-card');
    allCards.forEach((card, index) => {
        const isRevealed = gameState.revealedAnswers.includes(index);
        const isNewlyRevealed = newlyRevealed.includes(index);
        
        // Actualizar clases
        if (isRevealed) {
            if (!card.classList.contains('revealed')) {
                card.classList.remove('hidden');
                card.classList.add('revealed');
                
                // Ajustar tamaño de fuente
                const answerTextElement = card.querySelector('.answer-text');
                const answer = gameState.currentQuestion.answers[index];
                if (answerTextElement && answer) {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            adjustAnswerTextFontSize(answerTextElement, answer.text);
                        }, 10);
                    });
                }
            }
        } else {
            if (!card.classList.contains('hidden')) {
                card.classList.remove('revealed');
                card.classList.add('hidden');
            }
        }
        
        // Aplicar animación SOLO a las recién reveladas
        if (isNewlyRevealed) {
            console.log(`Board: Aplicando animación a respuesta #${index + 1}`);
            card.style.animation = 'none';
            // Forzar reflow
            void card.offsetWidth;
            card.style.animation = 'revealAnimation 0.5s ease';
            setTimeout(() => {
                card.style.animation = '';
            }, 500);
        }
    });
    
    // Actualizar el registro SOLO si hubo cambios reales
    if (newlyRevealed.length > 0) {
        previousRevealedAnswers = [...gameState.revealedAnswers];
        console.log('Board: Actualizado previousRevealedAnswers:', previousRevealedAnswers);
    }
}

function updateRoundPoints() {
    const roundPointsElement = document.getElementById('roundPoints');
    if (roundPointsElement) {
        const previousPoints = parseInt(roundPointsElement.getAttribute('data-points')) || 0;
        const currentPoints = gameState.roundPoints || 0;
        const multiplier = gameState.multiplier || 1;
        
        roundPointsElement.textContent = `${currentPoints}`;
        
        // Activar animación solo si los puntos aumentaron
        if (currentPoints > previousPoints) {
            roundPointsElement.classList.remove('animate');
            // Forzar reflow para reiniciar la animación
            void roundPointsElement.offsetWidth;
            roundPointsElement.classList.add('animate');
            
            // Remover la clase después de la animación
            setTimeout(() => {
                roundPointsElement.classList.remove('animate');
            }, 600);
        }
        
        // Guardar puntos actuales para la próxima comparación
        roundPointsElement.setAttribute('data-points', currentPoints);
        
        // Actualizar multiplicador si existe
        const multiplierDisplay = document.getElementById('multiplierDisplay');
        if (multiplierDisplay) {
            multiplierDisplay.textContent = `x${multiplier}`;
        }
    }
}

// Función para reproducir sonidos (sincronizada con el panel)
function playBoardSound(type) {
    const sounds = {
        start: 'res/audio/start.mp3',
        correct: 'res/audio/correct.mp3',
        wrong: 'res/audio/wrong.mp3',
        win: 'res/audio/win.mp3',
        timer: 'res/audio/timer.mp3',
        load: 'res/audio/load.mp3'
    };
    
    const audio = new Audio(sounds[type]);
    audio.volume = 0.7;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// Efectos visuales adicionales
function showRevealEffect(element) {
    element.style.transform = 'scale(1.1)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 300);
}

// Actualizar multiplicador (funcionalidad futura)
function updateMultiplier(value) {
    const multiplierDisplay = document.getElementById('multiplierDisplay');
    if (multiplierDisplay) {
        multiplierDisplay.textContent = `x${value}`;
        multiplierDisplay.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            multiplierDisplay.style.animation = 'pulse 2s ease-in-out infinite';
        }, 500);
    }
}

// Teclas de acceso rápido (opcional)
document.addEventListener('keydown', (e) => {
    // F11 para pantalla completa
    if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
});

// Ajustar tamaños de fuente al redimensionar ventana
function setupResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Reajustar pregunta
            const questionElement = document.getElementById('boardQuestion');
            if (questionElement && gameState.currentQuestion) {
                adjustQuestionFontSize(questionElement, gameState.currentQuestion.text);
            }
            
            // Reajustar respuestas - usar requestAnimationFrame para mejor rendimiento
            requestAnimationFrame(() => {
                const answerCards = document.querySelectorAll('.answer-card.revealed .answer-text');
                answerCards.forEach(element => {
                    const text = element.textContent.trim();
                    if (text) {
                        adjustAnswerTextFontSize(element, text);
                    }
                });
            });
        }, 150);
    });
}

// Inicializar listener de resize
setupResizeListener();

// Función para mostrar overlay de X grande
function displayXOverlay() {
    // Reproducir sonido de error
    playBoardSound('wrong');
    
    // Mostrar overlay
    const overlay = document.getElementById('xOverlay');
    if (overlay) {
        overlay.classList.add('show');
        
        // Ocultar después de 2 segundos
        setTimeout(() => {
            overlay.classList.remove('show');
        }, 2000);
    }
}
