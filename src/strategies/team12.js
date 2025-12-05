// Sharick Karla Chungara Paco
// Liz Mariela Perez Gervacio
// Jasel Alexander Ayma Titicayo

module.exports = {
  name: "AY NO SE",

  play(historySelf, historyOpponent) {

    const n = historyOpponent.length;

    if (n === 0) {
      return "D";
    }

    const last = historyOpponent[n - 1];
    const defects = historyOpponent.filter(x => x === "D").length;
    const cooperates = n - defects;
    const defectRate = defects / n;

    if (defects === 0) {
      if (n >= 2) return "D"; 
      return "C";            
    }

    if (defectRate >= 0.2) {
      return "D";
    }

    if (n >= 3 && historyOpponent[0] === "C" && defects === 1) {
      
      if (Math.random() < 0.3) return "C";

      return "D";
    }

    if (last === "D") {

      if (Math.random() < 0.2) return "C";

      return "D";
    }

    if (cooperates >= 10 && defectRate <= 0.05) {
      if (Math.random() < 0.4) return "D";
    }

    return "C";
  }
};