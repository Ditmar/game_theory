// src/strategies/randomStrategy.js

module.exports = {
  name: 'Random',
  play(historySelf, historyOpponent) {
    return Math.random() < 0.5 ? 'C' : 'D';
  },
};
