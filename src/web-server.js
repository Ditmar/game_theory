// src/web-server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Strategy, runTournament } = require('./core/game');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

const STRATEGIES_DIR = path.join(__dirname, 'strategies');

function loadStrategies() {
  const files = fs
    .readdirSync(STRATEGIES_DIR)
    .filter((file) => file.endsWith('.js'));

  const strategies = [];

  for (const file of files) {
    const fullPath = path.join(STRATEGIES_DIR, file);
    
    // Limpiar cache para recargar estrategias
    delete require.cache[require.resolve(fullPath)];
    
    const mod = require(fullPath);

    if (!mod || typeof mod.play !== 'function' || !mod.name) {
      console.warn(`⚠️  El archivo ${file} no exporta un objeto válido { name, play }`);
      continue;
    }

    const strategy = new Strategy(mod.name, mod.play);
    strategies.push(strategy);
  }

  return strategies;
}

app.get('/api/strategies', (req, res) => {
  try {
    const strategies = loadStrategies();
    const strategiesList = strategies.map(s => ({
      name: s.name,
      description: getStrategyDescription(s.name)
    }));
    res.json({ strategies: strategiesList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tournament', (req, res) => {
  try {
    const { rounds = 100, selectedStrategies = [] } = req.body;
    
    let strategies = loadStrategies();
    
    if (selectedStrategies.length > 0) {
      strategies = strategies.filter(s => selectedStrategies.includes(s.name));
    }

    if (strategies.length < 2) {
      return res.status(400).json({ 
        error: 'Se necesitan al menos 2 estrategias para el torneo' 
      });
    }

    console.log(`Ejecutando torneo web con ${strategies.length} estrategias y ${rounds} rondas`);
    
    const startTime = Date.now();
    const { results, ranking } = runTournament(strategies, rounds);
    const executionTime = Date.now() - startTime;

    const stats = calculateTournamentStats(results, strategies);

    res.json({
      ranking,
      results,
      stats,
      config: {
        rounds,
        strategiesCount: strategies.length,
        executionTime
      }
    });
  } catch (error) {
    console.error('Error en torneo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Función auxiliar para obtener descripciones de estrategias
function getStrategyDescription(name) {
  const descriptions = {
    'Always Cooperate': 'Siempre coopera. Estrategia "buena" pero vulnerable.',
    'Always Defect': 'Siempre traiciona. Estrategia agresiva.',
    'Tit for Tat': 'Coopera primero, luego copia la última jugada del oponente.',
    'Random': 'Coopera o traiciona aleatoriamente (50% cada una).'
  };
  return descriptions[name] || 'Estrategia personalizada';
}

// Función para calcular estadísticas del torneo
function calculateTournamentStats(results, strategies) {
  const stats = {
    totalMatches: results.length,
    totalRounds: results.reduce((sum, match) => sum + match.historyA.length, 0),
    cooperationRate: 0,
    defectionRate: 0,
    strategiesStats: {}
  };

  let totalMoves = 0;
  let totalCooperations = 0;

  // Inicializar stats por estrategia
  strategies.forEach(strategy => {
    stats.strategiesStats[strategy.name] = {
      wins: 0,
      losses: 0,
      ties: 0,
      totalScore: 0,
      cooperationRate: 0,
      matches: 0
    };
  });

  results.forEach(match => {
    const stratA = match.strategyA;
    const stratB = match.strategyB;
    
    totalMoves += match.historyA.length * 2;
    totalCooperations += match.historyA.filter(move => move === 'C').length;
    totalCooperations += match.historyB.filter(move => move === 'C').length;

    stats.strategiesStats[stratA].totalScore += match.scoreA;
    stats.strategiesStats[stratB].totalScore += match.scoreB;
    stats.strategiesStats[stratA].matches++;
    stats.strategiesStats[stratB].matches++;

    const coopA = match.historyA.filter(move => move === 'C').length;
    const coopB = match.historyB.filter(move => move === 'C').length;
    stats.strategiesStats[stratA].cooperationRate = 
      (stats.strategiesStats[stratA].cooperationRate * (stats.strategiesStats[stratA].matches - 1) + 
       (coopA / match.historyA.length)) / stats.strategiesStats[stratA].matches;
    stats.strategiesStats[stratB].cooperationRate = 
      (stats.strategiesStats[stratB].cooperationRate * (stats.strategiesStats[stratB].matches - 1) + 
       (coopB / match.historyB.length)) / stats.strategiesStats[stratB].matches;

    if (match.scoreA > match.scoreB) {
      stats.strategiesStats[stratA].wins++;
      stats.strategiesStats[stratB].losses++;
    } else if (match.scoreB > match.scoreA) {
      stats.strategiesStats[stratB].wins++;
      stats.strategiesStats[stratA].losses++;
    } else {
      stats.strategiesStats[stratA].ties++;
      stats.strategiesStats[stratB].ties++;
    }
  });

  stats.cooperationRate = totalCooperations / totalMoves;
  stats.defectionRate = 1 - stats.cooperationRate;

  return stats;
}

// API para simular match paso a paso
app.post('/api/simulate', (req, res) => {
  try {
    const { strategyA, strategyB, rounds = 20 } = req.body;
    
    const strategies = loadStrategies();
    const stA = strategies.find(s => s.name === strategyA);
    const stB = strategies.find(s => s.name === strategyB);

    if (!stA || !stB) {
      return res.status(400).json({ 
        error: 'Una o ambas estrategias no fueron encontradas' 
      });
    }

    // Generar la simulación completa
    const simulation = generateSimulation(stA, stB, rounds);
    
    res.json(simulation);
  } catch (error) {
    console.error('Error en simulación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Función para generar simulación paso a paso
function generateSimulation(strategyA, strategyB, rounds) {
  const steps = [];
  const historyA = [];
  const historyB = [];
  let scoreA = 0;
  let scoreB = 0;

  // Matriz de pagos
  const PAYOFFS = {
    CC: [3, 3],
    CD: [0, 5],
    DC: [5, 0],
    DD: [1, 1],
  };

  for (let i = 0; i < rounds; i++) {
    // Obtener movimientos
    const moveA = strategyA.nextMove(historyA, historyB);
    const moveB = strategyB.nextMove(historyB, historyA);

    // Calcular puntajes de la ronda
    const key = moveA + moveB;
    const [payA, payB] = PAYOFFS[key];
    
    scoreA += payA;
    scoreB += payB;

    // Agregar a historiales
    historyA.push(moveA);
    historyB.push(moveB);

    // Crear step de la simulación
    const step = {
      round: i + 1,
      moveA,
      moveB,
      payA,
      payB,
      scoreA,
      scoreB,
      historyA: [...historyA],
      historyB: [...historyB],
      outcome: getOutcomeDescription(moveA, moveB)
    };

    steps.push(step);
  }

  return {
    strategyA: strategyA.name,
    strategyB: strategyB.name,
    totalRounds: rounds,
    finalScores: { A: scoreA, B: scoreB },
    steps
  };
}

// Función auxiliar para describir el resultado de cada ronda
function getOutcomeDescription(moveA, moveB) {
  if (moveA === 'C' && moveB === 'C') {
    return 'Cooperación mutua';
  } else if (moveA === 'C' && moveB === 'D') {
    return 'A coopera, B traiciona';
  } else if (moveA === 'D' && moveB === 'C') {
    return 'A traiciona, B coopera';
  } else {
    return 'Traición mutua';
  }
}

// Rutas principales
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/simulate', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'simulate.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor web iniciado en http://localhost:${PORT}`);
  console.log(`📊 Torneo principal: http://localhost:${PORT}`);
  console.log(`🎮 Simulación: http://localhost:${PORT}/simulate`);
  console.log('💡 Usa Ctrl+C para detener el servidor');
});