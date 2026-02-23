import type Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula } from "../formula";
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
    writer.scopeIf(() => this.inner.write(writer), !this.inner.isPrimary());
  }

  public isPrimary(): boolean {
    return false;
  }

  protected *getChildren(): IterableIterator<Formula> {
    yield this.inner; 
  }
}