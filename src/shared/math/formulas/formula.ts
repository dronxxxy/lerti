import Decimal from "decimal.js";

export class DerivativeContext {
  constructor(public byVariable: string) {}
}

export class ExecutionContext {
  constructor(private variables: Record<string, Decimal>) {}

  public getVariable(name: string) {
    if (this.variables[name] === undefined)
      throw new Error(`unregistered variable ${name}`);

    return this.variables[name];
  }
}

export enum FormulaLevel {
  UNARY,
  BINOP_ADD,
  BINOP_MUL,
  POW,
  VALUE,
}

export abstract class Formula {
  public abstract buildDerivative(context: DerivativeContext): Formula | null;
  public abstract execute(context: ExecutionContext): Decimal;
  public abstract getLevel(): FormulaLevel;
  public abstract equals(other: Formula): boolean;

  public toLatexPrioritized(minLevel: FormulaLevel = FormulaLevel.UNARY): string {
    const str = this.toLatex();
    return this.getLevel() >= minLevel ? 
      `{ ${str} }` :
      `\\left( ${str} \\right)`;
  }

  public abstract toLatex(): string;

  public abstract mapChildren(mapper: (child: Formula) => Formula | null): void;
  public abstract getChildren(): IterableIterator<Formula>;

  public *iterate(): IterableIterator<Formula> {
    yield this;
    for (const formula of this.getChildren()) {
      for (const child of formula.iterate())
        yield child;
    }
  }
}
