// src/strategies/alwaysDefect.js
let isDefect = false;
module.exports = {
  name: 'Freidman ',
  play(historySelf, historyOpponent) {
    if (historyOpponent.length === 0) {
      return 'C';
    }
    if (historyOpponent[historyOpponent.length - 1] === 'D') {
      isDefect = true;
    }
    return isDefect ? 'D' : 'C';
  },
};
