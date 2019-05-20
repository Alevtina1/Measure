import { Parser } from 'expr-eval';

const parser = new Parser();

const DEFAULT_DELTA = 0.000000004;

class Derivative {
  constructor (fun, delta = DEFAULT_DELTA) {
    this.delta = delta;
    this.function = typeof fun === 'string' ? parser.parse(fun) : fun;
  }

  getBy(variable, dot = { x: 0, y: 0 }) {
    const funValue = this.function.evaluate(dot);
    const funChanges = this.function.evaluate({
      ...dot,
      [variable]: dot[variable] + this.delta,
    });

    return (funChanges - funValue)/this.delta;
  }
}

export default Derivative;
