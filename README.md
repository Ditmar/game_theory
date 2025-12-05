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
