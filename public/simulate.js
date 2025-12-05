// public/simulate.js

class SimulationApp {
    constructor() {
        this.strategies = [];
        this.currentSimulation = null;
        this.currentStep = 0;
        this.isPlaying = false;
        this.intervalId = null;
        this.speed = 500; // milliseconds

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadStrategies();
    }

    setupEventListeners() {
        // Speed control
        const speedSlider = document.getElementById('speed');
        const speedValue = document.getElementById('speed-value');
        
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            speedValue.textContent = `${this.speed}ms`;
        });

        // Control buttons
        document.getElementById('start-simulation').addEventListener('click', () => {
            this.startSimulation();
        });

        document.getElementById('pause-simulation').addEventListener('click', () => {
            this.pauseSimulation();
        });

        document.getElementById('reset-simulation').addEventListener('click', () => {
            this.resetSimulation();
        });
    }

    async loadStrategies() {
        try {
            const response = await fetch('/api/strategies');
            const data = await response.json();
            this.strategies = data.strategies;
            this.populateStrategySelectors();
        } catch (error) {
            console.error('Error loading strategies:', error);
            this.showError('Error al cargar las estrategias');
        }
    }

    populateStrategySelectors() {
        const selectA = document.getElementById('strategy-a');
        const selectB = document.getElementById('strategy-b');

        // Limpiar opciones existentes (excepto la primera)
        selectA.innerHTML = '<option value="">Seleccionar estrategia...</option>';
        selectB.innerHTML = '<option value="">Seleccionar estrategia...</option>';

        // Agregar estrategias
        this.strategies.forEach(strategy => {
            const optionA = document.createElement('option');
            optionA.value = strategy.name;
            optionA.textContent = strategy.name;
            selectA.appendChild(optionA);

            const optionB = document.createElement('option');
            optionB.value = strategy.name;
            optionB.textContent = strategy.name;
            selectB.appendChild(optionB);
        });

        // Seleccionar estrategias por defecto si hay suficientes
        if (this.strategies.length >= 2) {
            selectA.value = this.strategies[0].name;
            selectB.value = this.strategies[1].name;
        }
    }

    async startSimulation() {
        const strategyA = document.getElementById('strategy-a').value;
        const strategyB = document.getElementById('strategy-b').value;
        const rounds = parseInt(document.getElementById('rounds').value);

        if (!strategyA || !strategyB) {
            this.showError('Selecciona ambas estrategias');
            return;
        }

        if (strategyA === strategyB) {
            this.showError('Las estrategias deben ser diferentes');
            return;
        }

        try {
            // Hacer petición al servidor para generar la simulación
            const response = await fetch('/api/simulate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    strategyA,
                    strategyB,
                    rounds
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const simulation = await response.json();
            this.currentSimulation = simulation;
            this.currentStep = 0;

            this.initializeArena();
            this.startPlayback();

        } catch (error) {
            console.error('Error starting simulation:', error);
            this.showError('Error al iniciar la simulación: ' + error.message);
        }
    }

    initializeArena() {
        const arena = document.getElementById('battle-arena');
        const resultsSection = document.getElementById('results-summary');
        
        arena.classList.remove('hidden');
        resultsSection.classList.add('hidden');

        // Configurar nombres y valores iniciales
        document.getElementById('player-a-name').textContent = this.currentSimulation.strategyA;
        document.getElementById('player-b-name').textContent = this.currentSimulation.strategyB;
        document.getElementById('total-rounds').textContent = this.currentSimulation.totalRounds;
        document.getElementById('current-round').textContent = '0';

        // Resetear puntuaciones
        document.getElementById('player-a-score').textContent = '0';
        document.getElementById('player-b-score').textContent = '0';

        // Limpiar historiales
        document.getElementById('player-a-history').innerHTML = '';
        document.getElementById('player-b-history').innerHTML = '';

        // Resetear indicadores de movimiento
        this.resetMoveIndicators();

        // Resetear barra de progreso
        document.getElementById('progress-fill').style.width = '0%';
        document.getElementById('progress-percentage').textContent = '0%';

        // Limpiar resultado de ronda
        document.getElementById('round-outcome').textContent = '';
        document.getElementById('round-points').textContent = '';
    }

    resetMoveIndicators() {
        const moveA = document.getElementById('player-a-move');
        const moveB = document.getElementById('player-b-move');

        moveA.className = 'move-indicator';
        moveB.className = 'move-indicator';

        moveA.innerHTML = '<i class="fas fa-question"></i><span>Esperando...</span>';
        moveB.innerHTML = '<i class="fas fa-question"></i><span>Esperando...</span>';

        // Remover clases activas de los jugadores
        document.querySelector('.player-a').classList.remove('active');
        document.querySelector('.player-b').classList.remove('active');
    }

    startPlayback() {
        this.isPlaying = true;
        this.updateControlButtons();

        if (this.currentStep < this.currentSimulation.steps.length) {
            this.intervalId = setTimeout(() => this.playNextStep(), this.speed);
        }
    }

    pauseSimulation() {
        this.isPlaying = false;
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
        this.updateControlButtons();
    }

    resetSimulation() {
        this.pauseSimulation();
        this.currentStep = 0;
        this.currentSimulation = null;
        
        document.getElementById('battle-arena').classList.add('hidden');
        document.getElementById('results-summary').classList.add('hidden');
        
        this.updateControlButtons();
    }

    playNextStep() {
        if (!this.isPlaying || this.currentStep >= this.currentSimulation.steps.length) {
            return;
        }

        const step = this.currentSimulation.steps[this.currentStep];
        
        // Animar el paso actual
        this.animateStep(step);
        
        this.currentStep++;

        // Continuar con el siguiente paso o finalizar
        if (this.currentStep < this.currentSimulation.steps.length && this.isPlaying) {
            this.intervalId = setTimeout(() => this.playNextStep(), this.speed);
        } else if (this.currentStep >= this.currentSimulation.steps.length) {
            this.finishSimulation();
        }
    }

    async animateStep(step) {
        // Actualizar contador de ronda
        document.getElementById('current-round').textContent = step.round;

        // Activar jugadores
        document.querySelector('.player-a').classList.add('active');
        document.querySelector('.player-b').classList.add('active');

        // Actualizar indicadores de movimiento con animación
        await this.updateMoveIndicator('player-a-move', step.moveA);
        await this.updateMoveIndicator('player-b-move', step.moveB);

        // Mostrar resultado de la ronda
        this.updateRoundResult(step);

        // Actualizar puntuaciones con animación
        this.animateScoreUpdate('player-a-score', step.scoreA);
        this.animateScoreUpdate('player-b-score', step.scoreB);

        // Agregar movimiento al historial
        this.addToHistory('player-a-history', step.moveA);
        this.addToHistory('player-b-history', step.moveB);

        // Actualizar barra de progreso
        const progress = (step.round / this.currentSimulation.totalRounds) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-percentage').textContent = `${Math.round(progress)}%`;

        // Desactivar jugadores después de un momento
        setTimeout(() => {
            document.querySelector('.player-a').classList.remove('active');
            document.querySelector('.player-b').classList.remove('active');
        }, 200);
    }

    async updateMoveIndicator(elementId, move) {
        const indicator = document.getElementById(elementId);
        
        // Determinar clase y contenido basado en el movimiento
        const isCooperate = move === 'C';
        const moveClass = isCooperate ? 'cooperate' : 'defect';
        const icon = isCooperate ? 'fas fa-handshake' : 'fas fa-times-circle';
        const text = isCooperate ? 'Coopera' : 'Traiciona';

        // Aplicar la nueva clase y contenido
        indicator.className = `move-indicator ${moveClass}`;
        indicator.innerHTML = `<i class="${icon}"></i><span>${text}</span>`;

        // Promesa para sincronizar con la animación CSS
        return new Promise(resolve => {
            setTimeout(resolve, 100);
        });
    }

    updateRoundResult(step) {
        const outcomeElement = document.getElementById('round-outcome');
        const pointsElement = document.getElementById('round-points');

        outcomeElement.textContent = step.outcome;
        pointsElement.textContent = `${step.payA} - ${step.payB} puntos`;
    }

    animateScoreUpdate(elementId, newScore) {
        const element = document.getElementById(elementId);
        const currentScore = parseInt(element.textContent);

        if (currentScore !== newScore) {
            element.style.transform = 'scale(1.2)';
            element.style.color = 'var(--primary-color)';
            
            setTimeout(() => {
                element.textContent = newScore.toLocaleString();
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 150);
        }
    }

    addToHistory(elementId, move) {
        const historyContainer = document.getElementById(elementId);
        const moveElement = document.createElement('div');
        
        const isCooperate = move === 'C';
        moveElement.className = `history-move ${isCooperate ? 'cooperate' : 'defect'}`;
        moveElement.textContent = move;
        moveElement.title = isCooperate ? 'Coopera' : 'Traiciona';

        historyContainer.appendChild(moveElement);

        // Auto-scroll para mantener visible el último movimiento
        historyContainer.scrollLeft = historyContainer.scrollWidth;
    }

    finishSimulation() {
        this.isPlaying = false;
        this.showFinalResults();
        this.updateControlButtons();
    }

    showFinalResults() {
        const resultsSection = document.getElementById('results-summary');
        const simulation = this.currentSimulation;

        resultsSection.classList.remove('hidden');

        // Configurar nombres
        document.getElementById('final-player-a-name').textContent = simulation.strategyA;
        document.getElementById('final-player-b-name').textContent = simulation.strategyB;

        // Configurar puntuaciones finales
        document.getElementById('final-player-a-score').textContent = simulation.finalScores.A.toLocaleString();
        document.getElementById('final-player-b-score').textContent = simulation.finalScores.B.toLocaleString();

        // Determinar ganador y configurar etiquetas
        const scoreA = simulation.finalScores.A;
        const scoreB = simulation.finalScores.B;
        
        const labelA = document.getElementById('player-a-result-label');
        const labelB = document.getElementById('player-b-result-label');

        if (scoreA > scoreB) {
            labelA.textContent = '¡GANADOR!';
            labelA.className = 'result-label winner';
            labelB.textContent = 'Perdedor';
            labelB.className = 'result-label loser';
        } else if (scoreB > scoreA) {
            labelB.textContent = '¡GANADOR!';
            labelB.className = 'result-label winner';
            labelA.textContent = 'Perdedor';
            labelA.className = 'result-label loser';
        } else {
            labelA.textContent = 'EMPATE';
            labelA.className = 'result-label tie';
            labelB.textContent = 'EMPATE';
            labelB.className = 'result-label tie';
        }

        // Calcular y mostrar estadísticas detalladas
        this.calculateDetailedStats();
    }

    calculateDetailedStats() {
        const simulation = this.currentSimulation;
        const steps = simulation.steps;

        // Contar cooperaciones
        const coopA = steps.filter(step => step.moveA === 'C').length;
        const coopB = steps.filter(step => step.moveB === 'C').length;
        const totalRounds = steps.length;

        // Contar cooperación y traición mutua
        const mutualCoop = steps.filter(step => step.moveA === 'C' && step.moveB === 'C').length;
        const mutualDefect = steps.filter(step => step.moveA === 'D' && step.moveB === 'D').length;

        // Actualizar DOM
        document.getElementById('final-total-rounds').textContent = totalRounds;
        document.getElementById('final-coop-a').textContent = `${((coopA / totalRounds) * 100).toFixed(1)}%`;
        document.getElementById('final-coop-b').textContent = `${((coopB / totalRounds) * 100).toFixed(1)}%`;
        document.getElementById('final-mutual-coop').textContent = `${mutualCoop} rondas (${((mutualCoop / totalRounds) * 100).toFixed(1)}%)`;
        document.getElementById('final-mutual-defect').textContent = `${mutualDefect} rondas (${((mutualDefect / totalRounds) * 100).toFixed(1)}%)`;
    }

    updateControlButtons() {
        const startBtn = document.getElementById('start-simulation');
        const pauseBtn = document.getElementById('pause-simulation');
        const resetBtn = document.getElementById('reset-simulation');

        if (this.isPlaying) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            resetBtn.disabled = true;
        } else if (this.currentSimulation && this.currentStep < this.currentSimulation.steps.length) {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
        }
    }

    showError(message) {
        alert(message);
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new SimulationApp();
});