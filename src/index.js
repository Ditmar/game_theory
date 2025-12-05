// src/index.js

const fs = require('fs');
const path = require('path');
const { Strategy, runTournament } = require('./core/game');

const STRATEGIES_DIR = path.join(__dirname, 'strategies');

function loadStrategies() {
  const files = fs
    .readdirSync(STRATEGIES_DIR)
    .filter((file) => file.endsWith('.js'));

  const strategies = [];

  for (const file of files) {
    const fullPath = path.join(STRATEGIES_DIR, file);
    // Import dinámico simple
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

function main() {
  console.log('=== Torneo de Dilema del Prisionero Iterado (Axelrod-style) ===');

  const strategies = loadStrategies();

  if (strategies.length < 2) {
    console.log('Se necesitan al menos 2 estrategias en src/strategies para correr el torneo.');
    process.exit(1);
  }

  console.log(`Estrategias cargadas (${strategies.length}):`);
  strategies.forEach((s) => console.log(` - ${s.name}`));

  const roundsArg = process.argv[2];
  const roundsPerMatch = roundsArg ? parseInt(roundsArg, 10) : 100;

  console.log(`\nCorriendo torneo todos contra todos con ${roundsPerMatch} rondas por match...\n`);

  const { results, ranking } = runTournament(strategies, roundsPerMatch);

  console.log('=== Ranking final ===');
  ranking.forEach((row, index) => {
    console.log(`${index + 1}. ${row.name} -> ${row.score} puntos`);
  });

  console.log('\n=== Último match jugado (para inspección rápida) ===');
  const last = results[results.length - 1];
  console.log(`Match: ${last.strategyA} vs ${last.strategyB}`);
  console.log(`Puntaje: ${last.scoreA} - ${last.scoreB}`);
  console.log(`Historial ${last.strategyA}: ${last.historyA.join('')}`);
  console.log(`Historial ${last.strategyB}: ${last.historyB.join('')}`);
}

main();
