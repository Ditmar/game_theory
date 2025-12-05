// src/strategies/alwaysDefect.js
// Adriel Jurgen Barrenechea Tellez
//sandra Ayarachi Gallego
//Matias Alvaro Gutierrez  ARGANDOÑA
let isDefect = false;
module.exports = {
  name: 'LOS MAS CAPITOS ',
  cont : 0,
  play(historySelf, historyOpponent,cont) {
    if (historyOpponent.length === 0) {
      return 'D';
    }
     
    if (historyOpponent[historyOpponent.length - 1] === 'C') {
        
        cont = cont +1;
        if(cont == 2){
            isDefect=false;
            play(historySelf, historyOpponent,cont)
        } else{
             isDefect = true;
        }
     
    }
    if (historyOpponent[historyOpponent.length - 1] === 'D') {
      isDefect = false;
    }
    return isDefect ? 'D' : 'C';
  },
};