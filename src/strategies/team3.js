// src/strategies/alwaysDefect.js
/*FRANCKLIN MAMANI JULIAN
ALFREDO MAMANI CORDOVA
MAURICO DAVID AGUILAR RIOS 
*/
let isDefect = false;
module.exports = {
  name: 'el alto, el bajo, el negro ',
  play(historySelf, historyOpponent) {
    if (historyOpponent.length === 1) {
      return 'C';
    }
    if (historyOpponent.length === 10) {
      return 'C';
    }
    if (historyOpponent.length === 15) {
      return 'C';
    }
    if (historyOpponent.length === 17) {
      return 'C';
    }
    if (historyOpponent.length === 20) {
      return 'C';
    }
    if (historyOpponent.length === 5) {
      return 'C';
    }
    if (historyOpponent.length === 2) {
      return 'C';
    }
    if (historyOpponent.length === 7) {
      return 'C';
    }
    if (historyOpponent.length === 0) {
      return 'C';
    }
    if (historyOpponent.length === 11) {
      return 'C';
    }
    return isDefect ? 'C' : 'D';
  },
};