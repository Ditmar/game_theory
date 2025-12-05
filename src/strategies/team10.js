// Destructor
// Alex Vladimir Quecaña Ramos
let isDefect = false;
module.exports = {
  name: 'Destructor ',
    play(historySelf, historyOpponent) {
  const round = historyOpponent.length;

 if (round === 0) return 'C';

 const half = Math.floor(round / 0.5); 
  if (round < half) {
    const lastMove = historyOpponent[historyOpponent.length - 1];
    return lastMove === 'C' ? 'C' : 'D';
  }
   if (round === half) {
    const coopCount = historyOpponent.filter(m => m === 'C').length;
    const coopRate = coopCount / half;
   if (coopRate >= 0.5) {
      shouldCooperateAlways = true;
    } else {
      shouldDefectAlways = true;
    }
  }
  if (shouldCooperateAlways) return 'C';
  if (shouldDefectAlways) return 'D';
  const lastMove = historyOpponent[historyOpponent.length - 1];
  return lastMove === 'C' ? 'C' : 'D';
}
};