// src/core/game.js

const PAYOFFS = {
  CC: [3, 3],
  CD: [0, 5],
  DC: [5, 0],
  DD: [1, 1],
};

/**
 * Juegos disponibles. Cada uno es [pago para mí, pago para el rival]
 * con la clave = mi jugada + jugada del rival.
 *
 * - clasico: el dilema del prisionero de Axelrod.
 * - turnos:  misma estructura, con otro pago por traicionar a quien coopera.
 */
const GAMES = {
  clasico: {
    label: 'Dilema del prisionero clásico',
    payoffs: PAYOFFS,
  },
  turnos: {
    label: 'Dilema de turnos',
    payoffs: {
      CC: [3, 3],
      CD: [0, 8],
      DC: [8, 0],
      DD: [1, 1],
    },
  },
};

function getGame(name = 'clasico') {
  const game = GAMES[name];
  if (!game) {
    throw new Error(`Juego desconocido: "${name}". Opciones: ${Object.keys(GAMES).join(', ')}`);
  }
  return { name, ...game };
}

class Strategy {
  /**
   * @param {string} name
   * @param {(historySelf: string[], historyOpponent: string[]) => 'C'|'D'} fn
   */
  constructor(name, fn) {
    this.name = name;
    this.fn = fn;
  }

  nextMove(historySelf, historyOpponent) {
    let move = 'C';
    try {
      // Se pasan copias: una estrategia no puede alterar los historiales reales
      // (ni el suyo ni el del rival).
      move = this.fn(historySelf.slice(), historyOpponent.slice());
    } catch (err) {
      console.error(`Error en la estrategia "${this.name}":`, err.message);
    }
    // Validar salida
    if (move !== 'C' && move !== 'D') {
      // fallback seguro
      move = 'C';
    }
    return move;
  }
}

/** Generador pseudoaleatorio con semilla (mulberry32): permite reproducir un torneo. */
function makeRng(seed) {
  if (seed === undefined || seed === null) return Math.random;
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Juega un match entre dos estrategias.
 *
 * Opciones de la variante (todas desactivadas por defecto = torneo clásico):
 *  - noise:          probabilidad de que una jugada se ejecute al revés de lo
 *                    decidido (C->D o D->C). Los historiales guardan lo EJECUTADO,
 *                    que es lo único que ven las estrategias.
 *  - endProbability: si > 0, el match termina con esa probabilidad después de cada
 *                    ronda (horizonte incierto) y `rounds` se ignora. Las
 *                    estrategias no conocen la duración.
 *  - rng:            función aleatoria (ver makeRng).
 *
 * @param {Strategy} strategyA
 * @param {Strategy} strategyB
 * @param {number} rounds
 * @param {{noise?: number, endProbability?: number, rng?: () => number}} [opts]
 * @returns {{strategyA: string, strategyB: string, scoreA: number, scoreB: number, historyA: string[], historyB: string[]}}
 */
function playMatch(strategyA, strategyB, rounds = 100, opts = {}) {
  const { noise = 0, endProbability = 0, rng = Math.random, payoffs = PAYOFFS } = opts;
  const historyA = [];
  const historyB = [];
  let scoreA = 0;
  let scoreB = 0;

  const MAX_ROUNDS = 5000; // tope de seguridad para el horizonte incierto
  const flip = (m) => (m === 'C' ? 'D' : 'C');

  for (let i = 0; endProbability > 0 ? i < MAX_ROUNDS : i < rounds; i++) {
    let moveA = strategyA.nextMove(historyA, historyB);
    let moveB = strategyB.nextMove(historyB, historyA);

    if (noise > 0) {
      if (rng() < noise) moveA = flip(moveA);
      if (rng() < noise) moveB = flip(moveB);
    }

    historyA.push(moveA);
    historyB.push(moveB);

    const key = moveA + moveB; // 'CC', 'CD', etc.
    const [payA, payB] = payoffs[key];
    scoreA += payA;
    scoreB += payB;

    if (endProbability > 0 && rng() < endProbability) break;
  }

  return {
    strategyA: strategyA.name,
    strategyB: strategyB.name,
    scoreA,
    scoreB,
    historyA,
    historyB,
  };
}

/**
 * Torneo round-robin: todos contra todos
 *
 * Con la variante (noise / endProbability) el resultado depende del azar, así que
 * conviene repetir el torneo (`repetitions`) y promediar. `seed` lo hace reproducible.
 *
 * @param {Strategy[]} strategies
 * @param {number} roundsPerMatch
 * @param {{noise?: number, endProbability?: number, repetitions?: number, seed?: number}} [opts]
 * @returns {{results: any[], ranking: {name: string, score: number}[]}}
 *   `score` es el puntaje promedio por repetición; `results` son los matches de la última repetición.
 */
function runTournament(strategies, roundsPerMatch = 100, opts = {}) {
  const { noise = 0, endProbability = 0, repetitions = 1, seed, payoffs = PAYOFFS } = opts;

  // Los puntajes se acumulan por nombre: dos estrategias con el mismo nombre se mezclarían.
  const names = new Set();
  for (const s of strategies) {
    if (names.has(s.name)) throw new Error(`Nombre de estrategia duplicado: "${s.name}"`);
    names.add(s.name);
  }

  const rng = makeRng(seed);
  const totalScores = new Map(strategies.map((s) => [s.name, 0]));
  let results = [];

  for (let rep = 0; rep < repetitions; rep++) {
    results = [];
    for (let i = 0; i < strategies.length; i++) {
      for (let j = i + 1; j < strategies.length; j++) {
        const sA = strategies[i];
        const sB = strategies[j];

        const match = playMatch(sA, sB, roundsPerMatch, { noise, endProbability, rng, payoffs });
        results.push(match);

        totalScores.set(sA.name, totalScores.get(sA.name) + match.scoreA);
        totalScores.set(sB.name, totalScores.get(sB.name) + match.scoreB);
      }
    }
  }

  const ranking = Array.from(totalScores.entries())
    .map(([name, score]) => ({ name, score: score / repetitions }))
    .sort((a, b) => b.score - a.score);

  return { results, ranking };
}

module.exports = {
  PAYOFFS,
  GAMES,
  getGame,
  Strategy,
  makeRng,
  playMatch,
  runTournament,
};
