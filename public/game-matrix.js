// Rellena la matriz de pagos con el juego activo del servidor (/api/game).
// Elementos con data-payoff="CC|CD|DC|DD"; data-format: "plus" (+3, +3) o "compact" (3,3).
(async function loadGameMatrix() {
  try {
    const res = await fetch('/api/game');
    if (!res.ok) return;
    const game = await res.json();

    const fmt = (n, style) => (style === 'plus' && n > 0 ? `+${n}` : String(n));
    document.querySelectorAll('[data-payoff]').forEach((el) => {
      const pair = game.payoffs[el.dataset.payoff];
      if (!pair) return;
      const style = el.dataset.format;
      const sep = style === 'compact' ? ',' : ', ';
      el.textContent = fmt(pair[0], style) + sep + fmt(pair[1], style);
    });
    document.querySelectorAll('[data-game-label]').forEach((el) => {
      el.textContent = `Juego activo: ${game.label}`;
    });
  } catch (err) {
    // Si falla, queda la matriz escrita en el HTML.
    console.warn('No se pudo cargar la matriz de pagos:', err);
  }
})();
