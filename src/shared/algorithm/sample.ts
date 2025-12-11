import Decimal from "decimal.js";
import { AlgorithmError } from "./error";

export type TTable = Record<number, Decimal>

export const T_TABLE_95: TTable = {
  2: new Decimal(12.7),
  3: new Decimal(4.3),
  4: new Decimal(3.2),
  5: new Decimal(2.8),
  6: new Decimal(2.6),
  7: new Decimal(2.5),
  8: new Decimal(2.4),
  9: new Decimal(2.3),
  10: new Decimal(2.3),
  100: new Decimal(2),
}

export const T_TABLE_68: TTable = {
  2: new Decimal(2.0),
  3: new Decimal(1.4),
  4: new Decimal(1.3),
  5: new Decimal(1.2),
  6: new Decimal(1.3),
  7: new Decimal(1.1),
  8: new Decimal(1.1),
  9: new Decimal(1.1),
  10: new Decimal(1.1),
  100: new Decimal(1),
}

export class TooSmallToGetDerivationError extends Error {
  constructor() { super("cannot get derivation of sample with length < 2"); }
}

export class InvalidLengthToGetError extends AlgorithmError {
  constructor(length: number) {
    super("unsupported sample size",
      "Неподдерживаемый размер выборки",
      `В ходе расчетов была получена выборка длины ${length}. ` +
      `Для данной длины отсутствует соотствутствующий параметр t, добавьте его или измените выборку.`
    );
  }
}

export default class Sample {
  constructor (private elements: Decimal[]) {}

  length(): number { return this.elements.length; }
  sum(): Decimal { return this.elements.reduce((acc, x) => x.plus(acc), new Decimal(0)); }
  average(): Decimal { return this.sum().div(new Decimal(this.length())); }
  min(): Decimal { return this.elements.reduce((acc, x) => x < acc ? x : acc, this.elements[0]!); }
  max(): Decimal { return this.elements.reduce((acc, x) => x > acc ? x : acc, this.elements[0]!); }
  range(): Decimal { return this.max().minus(this.min()); }
  at(i: number): Decimal { return this.elements[i]!; }

  isAscending(): boolean {
    for (let i = 1; i < this.elements.length; i++) {
      if (this.elements[i - 1]!.greaterThan(this.elements[i]!)) {
        return false;
      }
    }
    return true;
  }

  dispersion(): Decimal {
    if (this.length() < 2) {
      throw new TooSmallToGetDerivationError()
    }
    const average = this.average();
    const sum = this.elements.reduce((acc, x) => x.minus(average).pow(2).add(acc), new Decimal(0));
    return sum.div(this.length() - 1).sqrt()
  }

  popBack() { this.elements.length -= 1; }
  popFront() { this.elements.shift(); }

  getDerivationError(tTable: TTable = T_TABLE_95) {
    if (tTable[this.length()] === undefined) {
      throw new InvalidLengthToGetError(this.length());
    }
    const dispersion = this.dispersion();
    const standardDerivative = dispersion.div(new Decimal(this.length()).sqrt())
    return standardDerivative.mul(tTable[this.length()]!)
  }

  copy() {
    return new Sample([...this.elements]);
  }

  values(): Decimal[] {
    return [...this.elements]
  }

  sort() {
    this.elements.sort((a, b) => {
      if (a.equals(b)) return 0;
      return a.lessThan(b) ? -1 : 1
    });
  }
}
