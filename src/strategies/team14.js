module.exports = {
  name: "4MIRADORES",

  play(historySelf, historyOpponent) {

    if (historyOpponent.length === 0) {
      return 'D';
    }

    const lastOpponentMove = historyOpponent[historyOpponent.length - 1];

    return lastOpponentMove;
  },
};