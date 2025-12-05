// src/strategies/blaugrana.js

module.exports = {
  name: 'Blaugrana Humillador',

  play(historySelf, historyOpponent) {
    const n = historyOpponent.length;
    if (n === 0) {
      return 'D';
    }
    const opp = historyOpponent;
    const me  = historySelf;
    const coopCount = opp.filter(x => x === 'C').length;
    const defectCount = n - coopCount;
    const coopRate = coopCount / n;
    const lastOpp = opp[n - 1];
    const prevOpp = opp[n - 2] || opp[n - 1];
    const alwaysCooperate = defectCount === 0; 
    const alwaysDefect    = coopCount === 0;   
    if (alwaysCooperate) {
      return 'D'; 
    }
    if (alwaysDefect) {
      return 'D'; 
    }
    function detectCycle(sequence, maxSize = 6) {
      for (let size = 1; size <= maxSize; size++) {
        if (sequence.length < size * 2) continue;
        const cycle = sequence.slice(-size);
        const prev  = sequence.slice(-2 * size, -size);
        if (cycle.join('') === prev.join('')) {
          return cycle;
        }
      }
      return null;
    }
    const cycle = detectCycle(opp);

    if (cycle) {
      const idx = n % cycle.length;
      const predicted = cycle[idx];

      if (predicted === 'C') return 'D';
      return 'D';
    }

    const transitions = {
      C: { C: 1, D: 1 }, 
      D: { C: 1, D: 1 },
    };

    for (let i = 1; i < opp.length; i++) {
      const prev = opp[i - 1];
      const curr = opp[i];
      transitions[prev][curr]++;
    }

    const base = opp[n - 1];
    const probC =
      transitions[base].C /
      (transitions[base].C + transitions[base].D);

  
    if (lastOpp === 'D' && prevOpp === 'D') {
      return 'D';
    }

    if (coopRate >= 0.6) {
      if (Math.random() < 0.35) return 'D';
      return 'C';
    }

    if (coopRate <= 0.4) {
      if (Math.random() < 0.8) return 'D';
      return 'C';
    }

    const EV_C = probC * 3 + (1 - probC) * 0;

    const EV_D = probC * 5 + (1 - probC) * 1;

    if (EV_D >= EV_C) return 'D';

    return 'C';
  },
};