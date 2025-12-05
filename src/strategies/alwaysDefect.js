// src/strategies/alwaysDefect.js

module.exports = {
  name: 'Always Defect',
  play(historySelf, historyOpponent) {
    return 'D';
  },
};
