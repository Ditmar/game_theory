//alvaro moyata pascual ru:103164
//poky

// src/strategies/alwaysDefect.js
let isDefect = false;

module.exports = {
  name: 'poky',
  play(historySelf, historyOpponent) {
    if (historyOpponent.length === 0) {
      return 'D';
    }
    if (historyOpponent[historyOpponent.length - 1] === 'D') {
        return 'D';
    }
    if (historyOpponent[historyOpponent.length - 1] === 'C') {
        return Math.random() < 0.5 ? 'C' : 'D';
    }
  },
};