// public/app.js

class TournamentApp {
    constructor() {
        this.strategies = [];
        this.currentResults = null;
        this.charts = {};
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadStrategies();
        this.setupTabs();
    }

    setupEventListeners() {
        // Tournament execution
        document.getElementById('run-tournament').addEventListener('click', () => {
            this.runTournament();
        });

        // Strategy selection
        document.getElementById('select-all').addEventListener('click', () => {
            this.toggleAllStrategies(true);
        });

        document.getElementById('clear-all').addEventListener('click', () => {
            this.toggleAllStrategies(false);
        });
    }

    setupTabs() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    }

    async loadStrategies() {
        try {
            const response = await fetch('/api/strategies');
            const data = await response.json();
            this.strategies = data.strategies;
            this.renderStrategies();
        } catch (error) {
            console.error('Error loading strategies:', error);
            this.showError('Error al cargar las estrategias');
        }
    }

    renderStrategies() {
        const container = document.getElementById('strategies-list');
        container.innerHTML = '';

        this.strategies.forEach((strategy, index) => {
            const card = document.createElement('div');
            card.className = 'strategy-card';
            
            card.innerHTML = `
                <label>
                    <input type="checkbox" value="${strategy.name}" ${index < 4 ? 'checked' : ''}>
                    <div class="strategy-name">${strategy.name}</div>
                    <div class="strategy-description">${strategy.description}</div>
                </label>
            `;

            // Update visual state
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                card.classList.add('selected');
            }

            // Add click handler
            card.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    checkbox.checked = !checkbox.checked;
                }
                card.classList.toggle('selected', checkbox.checked);
            });

            checkbox.addEventListener('change', () => {
                card.classList.toggle('selected', checkbox.checked);
            });

            container.appendChild(card);
        });
    }

    toggleAllStrategies(select) {
        document.querySelectorAll('#strategies-list input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = select;
            const card = checkbox.closest('.strategy-card');
            card.classList.toggle('selected', select);
        });
    }

    getSelectedStrategies() {
        const checkboxes = document.querySelectorAll('#strategies-list input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    async runTournament() {
        const selectedStrategies = this.getSelectedStrategies();
        const rounds = parseInt(document.getElementById('rounds').value);

        if (selectedStrategies.length < 2) {
            this.showError('Selecciona al menos 2 estrategias para el torneo');
            return;
        }

        this.showLoading(true);
        this.hideResults();

        try {
            const response = await fetch('/api/tournament', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rounds,
                    selectedStrategies
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.currentResults = data;
            this.showResults(data);
        } catch (error) {
            console.error('Error running tournament:', error);
            this.showError('Error al ejecutar el torneo: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
    }

    showResults(data) {
        document.getElementById('results-section').classList.remove('hidden');
        
        this.renderSummary(data);
        this.renderRanking(data.ranking);
        this.renderCharts(data);
        this.renderDetailedResults(data);
    }

    hideResults() {
        document.getElementById('results-section').classList.add('hidden');
    }

    renderSummary(data) {
        const container = document.getElementById('tournament-summary');
        
        const totalMatches = data.results.length;
        const totalRounds = data.results.reduce((sum, match) => sum + match.historyA.length, 0);
        const executionTime = data.config.executionTime;
        const cooperationRate = (data.stats.cooperationRate * 100).toFixed(1);

        container.innerHTML = `
            <div class="summary-item">
                <span class="summary-value">${data.config.strategiesCount}</span>
                <span class="summary-label">Estrategias</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${totalMatches}</span>
                <span class="summary-label">Enfrentamientos</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${data.config.rounds}</span>
                <span class="summary-label">Rondas por Match</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${totalRounds.toLocaleString()}</span>
                <span class="summary-label">Rondas Totales</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${cooperationRate}%</span>
                <span class="summary-label">Tasa de Cooperación</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${executionTime}ms</span>
                <span class="summary-label">Tiempo de Ejecución</span>
            </div>
        `;
    }

    renderRanking(ranking) {
        const container = document.getElementById('ranking-table');
        
        const table = document.createElement('table');
        table.className = 'ranking-table';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Posición</th>
                    <th>Estrategia</th>
                    <th>Puntuación Total</th>
                    <th>Puntuación Promedio</th>
                </tr>
            </thead>
            <tbody>
                ${ranking.map((strategy, index) => {
                    const matches = this.currentResults.stats.strategiesStats[strategy.name].matches;
                    const avgScore = (strategy.score / matches).toFixed(1);
                    const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';
                    
                    return `
                        <tr>
                            <td><span class="rank-position ${rankClass}">#${index + 1}</span></td>
                            <td><strong>${strategy.name}</strong></td>
                            <td>${strategy.score.toLocaleString()}</td>
                            <td>${avgScore}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    renderCharts(data) {
        this.renderScoresChart(data.ranking);
        this.renderCooperationChart(data.stats);
        this.renderPerformanceChart(data.stats);
    }

    renderScoresChart(ranking) {
        const ctx = document.getElementById('scores-chart').getContext('2d');
        
        // Destruir chart anterior si existe
        if (this.charts.scores) {
            this.charts.scores.destroy();
        }

        this.charts.scores = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ranking.map(s => s.name),
                datasets: [{
                    label: 'Puntuación Total',
                    data: ranking.map(s => s.score),
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
                    ],
                    borderColor: [
                        '#2563eb', '#059669', '#d97706', '#dc2626',
                        '#7c3aed', '#0891b2', '#65a30d', '#ea580c'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderCooperationChart(stats) {
        const ctx = document.getElementById('cooperation-chart').getContext('2d');
        
        if (this.charts.cooperation) {
            this.charts.cooperation.destroy();
        }

        const cooperationData = Object.entries(stats.strategiesStats).map(([name, stat]) => ({
            name,
            cooperation: stat.cooperationRate * 100
        }));

        this.charts.cooperation = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: cooperationData.map(s => s.name),
                datasets: [{
                    data: cooperationData.map(s => s.cooperation),
                    backgroundColor: [
                        '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
                        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderPerformanceChart(stats) {
        const ctx = document.getElementById('performance-chart').getContext('2d');
        
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        const performanceData = Object.entries(stats.strategiesStats).map(([name, stat]) => ({
            name,
            wins: stat.wins,
            losses: stat.losses,
            ties: stat.ties
        }));

        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: performanceData.map(s => s.name),
                datasets: [
                    {
                        label: 'Victorias',
                        data: performanceData.map(s => s.wins),
                        backgroundColor: '#10b981'
                    },
                    {
                        label: 'Empates',
                        data: performanceData.map(s => s.ties),
                        backgroundColor: '#f59e0b'
                    },
                    {
                        label: 'Derrotas',
                        data: performanceData.map(s => s.losses),
                        backgroundColor: '#ef4444'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderDetailedResults(data) {
        this.renderMatchesTable(data.results);
        this.renderStrategiesDetails(data.stats);
        this.renderResultsMatrix(data.results, data.ranking);
    }

    renderMatchesTable(results) {
        const container = document.getElementById('matches-table');
        
        const table = document.createElement('table');
        table.className = 'ranking-table';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Estrategia A</th>
                    <th>Estrategia B</th>
                    <th>Puntaje A</th>
                    <th>Puntaje B</th>
                    <th>Ganador</th>
                    <th>Cooperación A</th>
                    <th>Cooperación B</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(match => {
                    const coopA = (match.historyA.filter(m => m === 'C').length / match.historyA.length * 100).toFixed(1);
                    const coopB = (match.historyB.filter(m => m === 'C').length / match.historyB.length * 100).toFixed(1);
                    const winner = match.scoreA > match.scoreB ? match.strategyA : 
                                  match.scoreB > match.scoreA ? match.strategyB : 'Empate';
                    
                    return `
                        <tr>
                            <td>${match.strategyA}</td>
                            <td>${match.strategyB}</td>
                            <td>${match.scoreA}</td>
                            <td>${match.scoreB}</td>
                            <td><strong>${winner}</strong></td>
                            <td>${coopA}%</td>
                            <td>${coopB}%</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    renderStrategiesDetails(stats) {
        const container = document.getElementById('strategies-details');
        
        container.innerHTML = Object.entries(stats.strategiesStats)
            .map(([name, stat]) => `
                <div class="strategy-detail-card" style="background: var(--surface-alt); padding: 1.5rem; margin-bottom: 1rem; border-radius: var(--border-radius); border: 1px solid var(--border);">
                    <h3 style="margin-bottom: 1rem; color: var(--primary-color);">${name}</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                        <div><strong>Puntuación Total:</strong> ${stat.totalScore}</div>
                        <div><strong>Victorias:</strong> ${stat.wins}</div>
                        <div><strong>Empates:</strong> ${stat.ties}</div>
                        <div><strong>Derrotas:</strong> ${stat.losses}</div>
                        <div><strong>Cooperación:</strong> ${(stat.cooperationRate * 100).toFixed(1)}%</div>
                        <div><strong>Enfrentamientos:</strong> ${stat.matches}</div>
                    </div>
                </div>
            `).join('');
    }

    renderResultsMatrix(results, ranking) {
        const container = document.getElementById('results-matrix');
        const strategies = ranking.map(s => s.name);
        
        // Crear matriz de resultados
        const matrix = {};
        strategies.forEach(s1 => {
            matrix[s1] = {};
            strategies.forEach(s2 => {
                matrix[s1][s2] = s1 === s2 ? '-' : '0-0';
            });
        });

        // Llenar matriz con resultados
        results.forEach(match => {
            const diff = match.scoreA - match.scoreB;
            const resultA = diff > 0 ? 'V' : diff < 0 ? 'D' : 'E';
            const resultB = diff > 0 ? 'D' : diff < 0 ? 'V' : 'E';
            
            matrix[match.strategyA][match.strategyB] = 
                `${resultA} (${match.scoreA}-${match.scoreB})`;
            matrix[match.strategyB][match.strategyA] = 
                `${resultB} (${match.scoreB}-${match.scoreA})`;
        });

        // Crear tabla
        const table = document.createElement('table');
        table.className = 'ranking-table';
        table.style.fontSize = '0.875rem';
        
        let html = '<thead><tr><th></th>';
        strategies.forEach(s => {
            html += `<th style="writing-mode: vertical-lr; text-orientation: mixed;">${s}</th>`;
        });
        html += '</tr></thead><tbody>';

        strategies.forEach(s1 => {
            html += `<tr><th>${s1}</th>`;
            strategies.forEach(s2 => {
                const cell = matrix[s1][s2];
                const cellClass = cell.startsWith('V') ? 'style="background: #dcfce7; color: #166534;"' :
                                 cell.startsWith('D') ? 'style="background: #fee2e2; color: #991b1b;"' :
                                 cell.startsWith('E') ? 'style="background: #fef3c7; color: #92400e;"' : '';
                html += `<td ${cellClass}>${cell}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody>';
        table.innerHTML = html;
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    showError(message) {
        // Simple error display - in a real app you might want a more sophisticated notification system
        alert(message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TournamentApp();
});