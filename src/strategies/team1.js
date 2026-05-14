// Estrategia de Misha
// Mishael Manrrique Taboada
// Brayan Coquira Cruz


module.exports = {
    name: 'Estrategia de Misha',
    play(historySelf, historyOpponent) {
        const round1 = historySelf.length;
        const round2 = historyOpponent.length;
        const round = Math.max(round1, round2) + 1;
        if (round === 1) {
            return 'C';
        }
        if (round % 2 === 0) {
            return historyOpponent[round - 2];
        }
        return 'D';
    },
};
