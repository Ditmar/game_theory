# Torneo Axelrod en Node.js

Este proyecto implementa un torneo del **Dilema del Prisionero Iterado** al estilo de los experimentos de **Robert Axelrod**.

## Requisitos

- Node.js 16+ (cualquier versión moderna sirve)
- npm

## Instalación

```bash
npm install
```

## Ejecución del torneo

```bash
npm start
```

Por defecto corre un torneo *todos contra todos* con 100 rondas por enfrentamiento.

También puedes especificar el número de rondas:

```bash
node src/index.js 200
```

## Juegos (matriz de pagos)

| Juego | CC | CD (yo, rival) | DC (yo, rival) | DD |
| --- | --- | --- | --- | --- |
| `clasico` (por defecto) | 3, 3 | 0, 5 | 5, 0 | 1, 1 |
| `turnos` | 3, 3 | 0, 8 | 8, 0 | 1, 1 |

```bash
npm run tournament:turnos      # torneo en consola con el juego "turnos"
npm run web:turnos             # interfaz web con el juego "turnos"
node src/index.js 200 --game=turnos
```

La interfaz web muestra siempre la matriz del juego activo.

## Variante: ruido y final incierto

En el torneo clásico gana Tit for Tat. Esta variante cambia las reglas para que
copiar una estrategia conocida ya no alcance:

```bash
node src/index.js --noise=0.05 --end=0.005 --reps=50 --seed=1
```

| Opción | Efecto |
| --- | --- |
| `--noise=0.05` | Cada jugada sale al revés (C↔D) con 5% de probabilidad. Tu historial y el del rival muestran lo que **se ejecutó**, no lo que se quiso hacer: no podés distinguir un error de una traición. |
| `--end=0.005` | Después de cada ronda el match termina con 0.5% de probabilidad (~200 rondas en promedio). Nadie sabe cuál es la última ronda. Ignora el argumento de rondas. |
| `--reps=50` | Repite el torneo y promedia, para que el azar no decida el ranking. |
| `--seed=1` | Hace el resultado reproducible. Sin semilla, cada corrida es distinta. |

Sin estas opciones el torneo es el clásico de siempre.

Notas para escribir estrategias:

- `play` debe depender **solo** de los historiales. No guardes estado en variables
  fuera de `play`: se comparte entre todos los matches y los contamina.
- Recibís copias de los historiales; modificarlos no afecta al juego.
- El nombre de cada estrategia debe ser único.

## Añadir estrategias (para estudiantes)

1. Ir a la carpeta `src/strategies/`.
2. Crear un archivo nuevo, por ejemplo: `miEstrategia.js`.
3. Exportar un objeto con esta forma:

```js
module.exports = {
  name: 'MiNombreDeEstrategia',
  play(historySelf, historyOpponent) {
    // historySelf: array de mis jugadas anteriores, ej. ['C', 'D', 'C']
    // historyOpponent: array de jugadas del oponente
    // Debe devolver 'C' (cooperar) o 'D' (traicionar)

    // Ejemplo: Tit for Tat simple
    if (historyOpponent.length === 0) {
      return 'C';
    }
    return historyOpponent[historyOpponent.length - 1];
  },
};
```

4. Guardar el archivo.
5. Volver a correr el torneo con `npm start`.

El sistema cargará automáticamente todos los archivos `.js` dentro de `src/strategies/` que exporten `{ name, play }`.

## Interpretación de la salida

- Se muestra una lista de estrategias cargadas.
- Se ejecuta un torneo round-robin (todos contra todos).
- Se imprime un **ranking final** con el puntaje total de cada estrategia.
- Luego se imprime información del **último match** como referencia:
  - Names de las estrategias
  - Puntajes del match
  - Historial de jugadas (C/D) de cada una.
