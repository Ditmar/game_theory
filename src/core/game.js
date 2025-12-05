// src/core/game.js

const PAYOFFS = {
  CC: [3, 3],
  CD: [0, 5],
  DC: [5, 0],
  DD: [1, 1],
};

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
      move = this.fn(historySelf, historyOpponent);
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

/**
 * Juega un match entre dos estrategias durante N rondas
 * @param {Strategy} strategyA
 * @param {Strategy} strategyB
 * @param {number} rounds
 * @returns {{strategyA: string, strategyB: string, scoreA: number, scoreB: number, historyA: string[], historyB: string[]}}
 */
function playMatch(strategyA, strategyB, rounds = 100) {
  const historyA = [];
  const historyB = [];
  let scoreA = 0;
  let scoreB = 0;

  for (let i = 0; i < rounds; i++) {
    const moveA = strategyA.nextMove(historyA, historyB);
    const moveB = strategyB.nextMove(historyB, historyA);

    historyA.push(moveA);
    historyB.push(moveB);

    const key = moveA + moveB; // 'CC', 'CD', etc.
    const [payA, payB] = PAYOFFS[key];
    scoreA += payA;
    scoreB += payB;
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
 * @param {Strategy[]} strategies
 * @param {number} roundsPerMatch
 * @returns {{results: any[], ranking: {name: string, score: number}[]}}
 */
function runTournament(strategies, roundsPerMatch = 100) {
  const results = [];
  const totalScores = new Map();

  // Inicializar puntajes
  strategies.forEach((s) => totalScores.set(s.name, 0));

  for (let i = 0; i < strategies.length; i++) {
    for (let j = i + 1; j < strategies.length; j++) {
      const sA = strategies[i];
      const sB = strategies[j];

      const match = playMatch(sA, sB, roundsPerMatch);
      results.push(match);

      totalScores.set(sA.name, totalScores.get(sA.name) + match.scoreA);
      totalScores.set(sB.name, totalScores.get(sB.name) + match.scoreB);
    }
  }

  const ranking = Array.from(totalScores.entries())
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  return { results, ranking };
}

module.exports = {
  PAYOFFS,
  Strategy,
  playMatch,
  runTournament,
};
