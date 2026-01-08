// data-manager.js - Gestión de carga de datos desde Excel y Google Sheets

class DataManager {
    constructor() {
        this.questions = [];
    }

    // Cargar desde archivo Excel o CSV
    async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Leer la primera hoja
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    
                    // Parsear los datos
                    const questions = this.parseQuestionsData(jsonData);
                    
                    if (questions.length === 0) {
                        reject(new Error('No se encontraron preguntas válidas en el archivo'));
                    } else {
                        this.questions = questions;
                        resolve(questions);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsArrayBuffer(file);
        });
    }

    // Cargar desde URL de Google Sheets
    async loadFromGoogleSheets(url) {
        try {
            // Convertir URL de Google Sheets a formato CSV exportable
            let csvUrl = url;
            
            if (url.includes('docs.google.com/spreadsheets')) {
                // Extraer el ID de la hoja
                const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
                if (match) {
                    const sheetId = match[1];
                    csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
                }
            }
            
            const response = await fetch(csvUrl);
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de Google Sheets');
            }
            
            const csvText = await response.text();
            const rows = this.parseCSV(csvText);
            const questions = this.parseQuestionsData(rows);
            
            if (questions.length === 0) {
                throw new Error('No se encontraron preguntas válidas');
            }
            
            this.questions = questions;
            return questions;
        } catch (error) {
            throw error;
        }
    }

    // Parser CSV simple
    parseCSV(text) {
        const rows = [];
        const lines = text.split('\n');
        
        for (let line of lines) {
            if (line.trim()) {
                // Split simple por comas (puede necesitar mejoras para CSV complejos)
                const cells = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
                rows.push(cells);
            }
        }
        
        return rows;
    }

    // Parsear datos de preguntas
    // Formato esperado:
    // Pregunta | Respuesta1 | Puntos1 | Respuesta2 | Puntos2 | ... | Respuesta8 | Puntos8
    parseQuestionsData(rows) {
        const questions = [];
        
        // Saltar la primera fila si es encabezado
        const startRow = this.isHeaderRow(rows[0]) ? 1 : 0;
        
        for (let i = startRow; i < rows.length; i++) {
            const row = rows[i];
            
            if (!row[0] || row[0].trim() === '') continue;
            
            const question = {
                text: row[0].trim(),
                answers: []
            };
            
            // Leer respuestas y puntos (máximo 8 respuestas)
            for (let j = 1; j < row.length && j < 17; j += 2) {
                const answerText = row[j] ? row[j].trim() : '';
                const points = row[j + 1] ? parseInt(row[j + 1]) : 0;
                
                if (answerText) {
                    question.answers.push({
                        text: answerText,
                        points: points || 0
                    });
                }
            }
            
            // Solo agregar si tiene al menos una respuesta
            if (question.answers.length > 0) {
                questions.push(question);
            }
        }
        
        return questions;
    }

    // Verificar si la primera fila es encabezado
    isHeaderRow(row) {
        if (!row || row.length === 0) return false;
        
        const firstCell = row[0].toLowerCase();
        return firstCell.includes('pregunta') || 
               firstCell.includes('question') ||
               firstCell === 'q';
    }

    // Obtener preguntas cargadas
    getQuestions() {
        return this.questions;
    }

    // Buscar preguntas por texto
    searchQuestions(searchText) {
        const normalized = searchText.toLowerCase().trim();
        
        return this.questions.filter(q => 
            q.text.toLowerCase().includes(normalized)
        );
    }

    // Crear datos de ejemplo para testing
    createSampleData() {
        return [
            {
                text: "¿Qué cosas encuentras en la iglesia?",
                answers: [
                    { text: "Biblia", points: 35 },
                    { text: "Cruz", points: 28 },
                    { text: "Altar", points: 15 },
                    { text: "Púlpito", points: 12 },
                    { text: "Bancas", points: 10 }
                ]
            },
            {
                text: "¿Qué libros de la Biblia conoces?",
                answers: [
                    { text: "Génesis", points: 40 },
                    { text: "Éxodo", points: 25 },
                    { text: "Salmos", points: 20 },
                    { text: "Juan", points: 15 }
                ]
            },
            {
                text: "¿Qué hace un cristiano todos los días?",
                answers: [
                    { text: "Orar", points: 45 },
                    { text: "Leer la Biblia", points: 30 },
                    { text: "Agradecer", points: 15 },
                    { text: "Servir", points: 10 }
                ]
            }
        ];
    }
}

// Instancia global
const dataManager = new DataManager();
