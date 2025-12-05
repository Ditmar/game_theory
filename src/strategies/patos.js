// src/strategies/alwaysDefect.js

module.exports = {
  name: 'team a ',
  play(historySelf, historyOpponent) {
    if (historyOpponent.length === 0) {
      return 'C';
    }
    if (historyOpponent[historyOpponent.length - 1] === 'C') {
      return 'C';
    } else {
      return 'D';
    }
  },
};
