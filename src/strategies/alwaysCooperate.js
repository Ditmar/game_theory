// src/strategies/alwaysCooperate.js

module.exports = {
  name: 'Always Cooperate',
  play(historySelf, historyOpponent) {
    return 'C';
  },
};
