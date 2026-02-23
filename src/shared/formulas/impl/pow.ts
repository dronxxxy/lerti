import Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import { MultiplyOperatorFormula } from "./operators";
import type { FormulaWriter } from "../writer";
import { LnFormula } from "./ln";

export class PowFormula extends Formula {
  constructor(
    private inner: Formula,
    private power: Formula,
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

  protected *getChildren(): IterableIterator<Formula> {
    yield this.inner;
    yield this.power;
  }

  public write(writer: FormulaWriter): void {
    const level = this.getLevel();
    this.inner.writePrioritized(writer, level, true);
    writer.writePow();
    this.power.writePrioritized(writer, level);
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.POW;
  }
}
