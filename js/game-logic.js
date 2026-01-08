// game-logic.js - Lógica central del juego
class GameState {
    constructor() {
        this.questions = [];
        this.currentQuestion = null;
        this.usedQuestions = [];  // Índices de preguntas ya usadas
        this.team1 = {
            name: 'Equipo 1',
            score: 0,
            errors: 0
        };
        this.team2 = {
            name: 'Equipo 2',
            score: 0,
            errors: 0
        };
        this.multiplier = 1;
        this.revealedAnswers = [];
        this.repliedAnswers = [];  // Respuestas respondidas con reply-btn
        this.roundPoints = 0;  // Puntos de la ronda actual
    }

    loadQuestions(questionsData) {
        this.questions = questionsData;
        this.saveToStorage();
    }

    setCurrentQuestion(questionIndex) {
        if (questionIndex >= 0 && questionIndex < this.questions.length) {
            this.currentQuestion = this.questions[questionIndex];
            this.revealedAnswers = [];
            this.repliedAnswers = [];
            this.roundPoints = 0;
            
            // Marcar pregunta como usada si no está ya
            if (!this.usedQuestions.includes(questionIndex)) {
                this.usedQuestions.push(questionIndex);
            }
            
            this.saveToStorage();
            return true;
        }
        return false;
    }

    revealAnswer(answerIndex, isReply = false) {
        if (!this.currentQuestion) return false;
        
        if (answerIndex >= 0 && answerIndex < this.currentQuestion.answers.length) {
            if (!this.revealedAnswers.includes(answerIndex)) {
                this.revealedAnswers.push(answerIndex);
                
                // Si es reply, sumar puntos y marcar como respondida
                if (isReply) {
                    this.repliedAnswers.push(answerIndex);
                    const points = this.currentQuestion.answers[answerIndex].points;
                    this.roundPoints += points * this.multiplier;
                }
                
                this.saveToStorage();
                return true;
            }
        }
        return false;
    }

    updateTeamScore(teamNumber, points) {
        if (teamNumber === 1) {
            this.team1.score = points;
        } else if (teamNumber === 2) {
            this.team2.score = points;
        }
        this.saveToStorage();
    }

    addTeamPoints(teamNumber, points) {
        if (teamNumber === 1) {
            this.team1.score += points;
        } else if (teamNumber === 2) {
            this.team2.score += points;
        }
        this.saveToStorage();
    }

    updateTeamName(teamNumber, name) {
        if (teamNumber === 1) {
            this.team1.name = name;
        } else if (teamNumber === 2) {
            this.team2.name = name;
        }
        this.saveToStorage();
    }

    addError(teamNumber) {
        if (teamNumber === 1 && this.team1.errors < 3) {
            this.team1.errors++;
        } else if (teamNumber === 2 && this.team2.errors < 3) {
            this.team2.errors++;
        }
        this.saveToStorage();
    }

    resetErrors(teamNumber) {
        if (teamNumber === 1) {
            this.team1.errors = 0;
        } else if (teamNumber === 2) {
            this.team2.errors = 0;
        }
        this.saveToStorage();
    }

    setMultiplier(value) {
        this.multiplier = value;
        this.saveToStorage();
    }

    nextRound(teamNumber) {
        // Sumar puntos de la ronda al equipo seleccionado
        if (teamNumber === 1) {
            this.team1.score += this.roundPoints;
        } else if (teamNumber === 2) {
            this.team2.score += this.roundPoints;
        }
        
        // Reiniciar errores de ambos equipos
        this.team1.errors = 0;
        this.team2.errors = 0;
        
        // Reiniciar puntos de ronda y respuestas
        this.roundPoints = 0;
        this.revealedAnswers = [];
        this.repliedAnswers = [];
        this.currentQuestion = null;
        
        this.saveToStorage();
        return this.roundPoints;
    }

    resetGame() {
        this.team1.score = 0;
        this.team1.errors = 0;
        this.team2.score = 0;
        this.team2.errors = 0;
        this.multiplier = 1;
        this.revealedAnswers = [];
        this.repliedAnswers = [];
        this.roundPoints = 0;
        this.currentQuestion = null;
        // No resetear usedQuestions para mantener historial
        this.saveToStorage();
    }

    searchAnswers(keyword) {
        if (!this.currentQuestion) return [];
        
        const results = [];
        const normalizedKeyword = keyword.toLowerCase().trim();
        
        this.currentQuestion.answers.forEach((answer, index) => {
            const normalizedAnswer = answer.text.toLowerCase();
            
            // Búsqueda flexible: palabras parciales y similares
            const words = normalizedKeyword.split(' ');
            let matchScore = 0;
            
            words.forEach(word => {
                if (normalizedAnswer.includes(word)) {
                    matchScore++;
                }
            });
            
            // También buscar coincidencia completa
            if (normalizedAnswer.includes(normalizedKeyword)) {
                matchScore += 2;
            }
            
            if (matchScore > 0) {
                results.push({
                    index: index,
                    answer: answer,
                    score: matchScore
                });
            }
        });
        
        // Ordenar por relevancia
        results.sort((a, b) => b.score - a.score);
        
        return results;
    }

    saveToStorage() {
        try {
            localStorage.setItem('gameState', JSON.stringify({
                questions: this.questions,
                currentQuestion: this.currentQuestion,
                usedQuestions: this.usedQuestions,
                team1: this.team1,
                team2: this.team2,
                multiplier: this.multiplier,
                revealedAnswers: this.revealedAnswers,
                repliedAnswers: this.repliedAnswers,
                roundPoints: this.roundPoints
            }));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('gameState');
            if (saved) {
                const data = JSON.parse(saved);
                this.questions = data.questions || [];
                this.currentQuestion = data.currentQuestion || null;
                this.usedQuestions = data.usedQuestions || [];
                this.team1 = data.team1 || { name: 'Equipo 1', score: 0, errors: 0 };
                this.team2 = data.team2 || { name: 'Equipo 2', score: 0, errors: 0 };
                this.multiplier = data.multiplier || 1;
                this.revealedAnswers = data.revealedAnswers || [];
                this.repliedAnswers = data.repliedAnswers || [];
                this.roundPoints = data.roundPoints || 0;
                return true;
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
        return false;
    }
}

// Instancia global del estado del juego
const gameState = new GameState();

// Cargar estado al iniciar
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key === 'gameState') {
            gameState.loadFromStorage();
            // Notificar a los listeners si existen
            if (window.onGameStateChange) {
                window.onGameStateChange();
            }
        }
    });
    
    // Cargar estado inicial
    gameState.loadFromStorage();
}
