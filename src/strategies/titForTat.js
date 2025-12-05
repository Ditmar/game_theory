// src/strategies/titForTat.js

module.exports = {
  name: 'Tit for Tat',
  play(historySelf, historyOpponent) {
    if (historyOpponent.length === 0) {
      return 'C'; // empieza cooperando
    }
    console.log('Tit for Tat juega:', historyOpponent[historyOpponent.length - 1]);
    // copia la última jugada del rival
    return historyOpponent[historyOpponent.length - 1];
  },
};
