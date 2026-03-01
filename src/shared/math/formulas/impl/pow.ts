import Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import { MultiplyOperatorFormula } from "./operators";
import { FunctionFormula, LnFormula } from "./ln";

export class PowFormula extends Formula {
  constructor(
    public inner: Formula,
    public power: Formula,
  ) {
    super();
  }

  public buildDerivative(context: DerivativeContext): Formula | null {
    // u^v = u^v * (v ln(u))'
    const derivative = new MultiplyOperatorFormula(
      this.power,
      new LnFormula(this.inner),
    ).buildDerivative(context);
    if (!derivative) return null;
    return new MultiplyOperatorFormula(this, derivative);
  }

  public execute(context: ExecutionContext): Decimal {
    return this.inner.execute(context).pow(this.power.execute(context));
  }

  public *getChildren(): IterableIterator<Formula> {
    yield this.inner;
    yield this.power;
  }

  public toLatex(): string {
    if (this.inner instanceof FunctionFormula) {
      return `\\${this.inner.getName()} ^ ${this.power.toLatexPrioritized()} ${this.inner.inner.toLatexPrioritized(FormulaLevel.VALUE)}`;
    }
    return `${this.inner.toLatexPrioritized(FormulaLevel.POW)} ^ ${this.power.toLatexPrioritized()}`;
  }

  public equals(other: Formula): boolean {
    return other instanceof PowFormula && this.inner.equals(other.inner) && this.power.equals(other.power);
  }

  public mapChildren(mapper: (child: Formula) => Formula | null): void {
    this.inner = mapper(this.inner) ?? this.inner;
    this.power = mapper(this.power) ?? this.power;
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.POW;
  }
}
