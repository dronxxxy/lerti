import type Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import type { FormulaWriter } from "../writer";

export class UnaryMinusFormula extends Formula {
  constructor (private inner: Formula) {
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

  public write(writer: FormulaWriter): void {
    writer.writeMinus();
    this.inner.writePrioritized(writer, this.getLevel());
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.UNARY;
  }

  protected *getChildren(): IterableIterator<Formula> {
    yield this.inner; 
  }
}