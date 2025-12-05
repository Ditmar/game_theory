/*Max Emiliana Pacci Copa
  Diego Victor Janco Condori
  Yoselin Santos Chiri
  Luis Fabricio Valle Aviza */

// src/strategies/titForTat.js
module.exports = {
  name: 'Los Traicioneros',
  play(historySelf, historyOpponent) {
    
    if (historyOpponent.length === 0) {
      return 'C';
    }

    const lastOpponentMove = historyOpponent[historyOpponent.length - 1];
    return lastOpponentMove === 'D' ? 'D' : 'C';
  },
};