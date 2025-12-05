// pan_vino 
// jhosue
// maria
let isDefect = false;
module.exports = {
  name: 'pan_vino ',
  play(historySelf, historyOpponent) {
    const jugador = historyOpponent[historyOpponent.length];
    if (jugador === 'C') {
        return 'C';}
    else {
        return 'D';
}
    if (!isDefect) {
        isDefect = true ;
        return 'D';
    } else {
        return 'C';}  
    if(jugador === 'D')  {
        isDefect ==true
        return 'D'
    }
    else {
        return 'D'
    }
    if(!isDefect){
        return true
        if (jugador === 'C') {
            return 'C';
        }else
            return 'D'
    }

  }
};