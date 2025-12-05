module.exports = {
  name: 'Enzeta',
  play(historySelf, historyOpponent) {
    if (historyOpponent.length === 0) return 'C';

    const total = historyOpponent.length;
    const defects = historyOpponent.filter(m => m === 'D').length;
    const rate = defects / total;

   
    if (rate > 0.4) {
      return 'D';
    }

    const last = historyOpponent[total - 1];
    const prev = historyOpponent[total - 2];
    if (last === 'D' && prev === 'D') {
      return 'D';
    }

    return 'C';
  },
};
 // GRUPO:Enzeta
  //MIRNA NICOLE CALLA MAMANI
  //JOSE GABRIEL PALACIOS ARIZANA
  //VIVIANA VERONICA CONDORI PACO
 //MELISA CATARI LEANDRO