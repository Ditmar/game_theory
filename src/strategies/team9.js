// src/strategies/randomStrategy.js

module.exports = {
    name: 'los chispilitos',
    play(historySelf, historyOpponent) {
        let last = historyOpponent.length-1
        let thirdToLast = last-1;
        if (historyOpponent.length === 0) {
            return 'C';
        }

        if(last ==='C'){
            return 'C';
        }

        if(last ==='C' && thirdToLast === 'C'){
            return 'D';
        }

        else(last === 'D')
            return 'D';
    },
};

//Jeaneth Cuenca Mamani
//Ibeth Viviana Flores Gardeazabal
//Alvaro Ricaldi Sanchez