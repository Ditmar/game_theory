// src/index.js

const fs = require('fs');
const path = require('path');
const { Strategy, runTournament, getGame } = require('./core/game');

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

/**
 * Uso: node src/index.js [rondas] [--game=turnos] [--noise=0.05] [--end=0.005] [--reps=50] [--seed=1]
 *   --game   matriz de pagos: clasico (por defecto) o turnos
 *   --noise  probabilidad de que una jugada salga al revés (C<->D)
 *   --end    probabilidad de que el match termine tras cada ronda (ignora [rondas])
 *   --reps   cuántas veces repetir el torneo y promediar
 *   --seed   semilla para reproducir el resultado
 */
function parseArgs(argv) {
  let roundsPerMatch = 100;
  const options = { noise: 0, endProbability: 0, repetitions: 1, seed: undefined, game: 'clasico' };

  for (const arg of argv) {
    const g = arg.match(/^--game=(.+)$/);
    if (g) {
      options.game = g[1];
      continue;
    }
    const m = arg.match(/^--(noise|end|reps|seed)=(.+)$/);
    if (m) {
      const value = Number(m[2]);
      if (!Number.isFinite(value) || value < 0) {
        console.error(`Valor inválido en ${arg}`);
        process.exit(1);
      }
      if (m[1] === 'noise') options.noise = value;
      if (m[1] === 'end') options.endProbability = value;
      if (m[1] === 'reps') options.repetitions = Math.max(1, Math.floor(value));
      if (m[1] === 'seed') options.seed = value;
    } else if (/^\d+$/.test(arg)) {
      roundsPerMatch = parseInt(arg, 10);
    } else {
      console.error(`Argumento no reconocido: ${arg}`);
      process.exit(1);
    }
  }

  if (options.noise > 1 || options.endProbability > 1) {
    console.error('--noise y --end deben ser probabilidades entre 0 y 1');
    process.exit(1);
  }
  return { roundsPerMatch, options };
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

  const { roundsPerMatch, options } = parseArgs(process.argv.slice(2));
  const variant = options.noise > 0 || options.endProbability > 0;

  let game;
  try {
    game = getGame(options.game);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  options.payoffs = game.payoffs;
  const p = game.payoffs;
  console.log(
    `\nJuego: ${game.label} (CC=${p.CC[0]}, CD=${p.CD[0]}/${p.CD[1]}, DC=${p.DC[0]}/${p.DC[1]}, DD=${p.DD[0]})`
  );

  if (options.endProbability > 0) {
    console.log(
      `\nVariante: final incierto (cada ronda termina el match con prob. ${options.endProbability}, ` +
        `~${Math.round(1 / options.endProbability)} rondas en promedio)`
    );
  } else {
    console.log(`\nCorriendo torneo todos contra todos con ${roundsPerMatch} rondas por match...`);
  }
  if (options.noise > 0) console.log(`Variante: ruido del ${(options.noise * 100).toFixed(1)}% en cada jugada`);
  if (options.repetitions > 1) console.log(`Se promedian ${options.repetitions} repeticiones del torneo`);
  if (options.seed !== undefined) console.log(`Semilla: ${options.seed}`);
  console.log('');

  const { results, ranking } = runTournament(strategies, roundsPerMatch, options);

  console.log(variant ? '=== Ranking final (puntaje promedio) ===' : '=== Ranking final ===');
  ranking.forEach((row, index) => {
    const score = Number.isInteger(row.score) ? row.score : row.score.toFixed(1);
    console.log(`${index + 1}. ${row.name} -> ${score} puntos`);
  });

  console.log('\n=== Último match jugado (para inspección rápida) ===');
  const last = results[results.length - 1];
  console.log(`Match: ${last.strategyA} vs ${last.strategyB}`);
  console.log(`Puntaje: ${last.scoreA} - ${last.scoreB}`);
  console.log(`Historial ${last.strategyA}: ${last.historyA.join('')}`);
  console.log(`Historial ${last.strategyB}: ${last.historyB.join('')}`);
}

main();
