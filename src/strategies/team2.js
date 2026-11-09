module.exports = {
    name: 'Turnos con defensa',
    play(historySelf, historyOpponent) {
        const n = historySelf.length;
        if (n === 0) return 'C';                       // empiezo cediendo

        // Defensa: miro las últimas 10 rondas del rival
        if (n >= 10) {
            const coop = historyOpponent.slice(-10).filter((m) => m === 'C').length;
            if (coop <= 2) return 'D';                   // casi nunca coopera: no le regalo nada
            if (coop === 10) return 'D';                 // coopera siempre: lo exploto
        }

        // Turnarse según lo que pasó en la ronda anterior
        const yo = historySelf[n - 1];
        const el = historyOpponent[n - 1];
        if (yo === 'C' && el === 'D') return 'D';      // él tomó su turno, ahora me toca a mí
        if (yo === 'D' && el === 'C') return 'C';      // tomé mi turno, ahora le toca a él
        if (yo === 'C' && el === 'D') return 'D';
        if (yo === 'C' && el === 'C') return 'D';      // cooperamos: propongo empezar los turnos
        return Math.random() < 0.5 ? 'C' : 'D';        // ambos traicionamos: sorteo para desempatar
    },
};
