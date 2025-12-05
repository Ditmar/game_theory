module.exports = {
  name: 'Ukyo7w7',
  play(historySelf, historyOpponent) {
    
    const lastPlayed = historyOpponent[historyOpponent.length -1]
    if (historyOpponent.length === 0) {
      return 'D';
    }
    if (historyOpponent.length === 1) {
      return 'D';
    }
    if(lastPlayed === "D") {
        return "D";
    } else{
        return "C";
    }
  },
};
//Hector Jhefeson Gutierrez Prado