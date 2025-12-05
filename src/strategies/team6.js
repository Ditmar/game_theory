// src/strategies/alwaysDefect.js
let isDefect = false;
module.exports = {
  name: 'aron',
  play(historySelf, historyOpponent) {
    const round = historySelf.length;
    if (round === 0) return 'D';
    const myLast = historySelf[round - 1];
    const oppLast = historyOpponent[round - 1];
    if ((myLast === 'C' && oppLast === 'C') || (myLast === 'D' && oppLast === 'D')) {
      return myLast;
    }
    return myLast === 'C' ? 'D' : 'C';
  },
};

//Jhonny Martinez Flres CI 8616626 RU 88682
//Marcelo Aron Condori Flores Ci 8515847 RU92644