import type Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";

export class UnaryMinusFormula extends Formula {
  constructor (public inner: Formula) {
    super();
  }

  public buildDerivative(context: DerivativeContext): Formula | null {
    const inner = this.inner.buildDerivative(context);
    if (inner === null) return null;
    return new UnaryMinusFormula(inner);
  }

  public execute(context: ExecutionContext): Decimal {
    return this.inner.execute(context).negated();
  }

  public toLatex(): string {
    return  `- ${this.inner.toLatexPrioritized(FormulaLevel.POW)}`;
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.UNARY;
  }

  public equals(other: Formula): boolean {
    return other instanceof UnaryMinusFormula && this.inner.equals(other.inner);
  }

  public mapChildren(mapper: (child: Formula) => Formula | null): void {
    this.inner = mapper(this.inner) ?? this.inner;
  }

  public *getChildren(): IterableIterator<Formula> {
    yield this.inner; 
  }
}
