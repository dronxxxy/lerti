import Decimal from "decimal.js";
import { ExecutionContext, Formula } from "../formula";
import {
  AddOperatorFormula,
  MultiplyOperatorFormula,
  SubtractOperatorFormula,
} from "./operators";
import { ConstantNumberFormula } from "./constant";
import type { FormulaWriter } from "../writer";
import { LnFormula } from "./ln";

export class PowFormula extends Formula {
  constructor(
    private inner: Formula,
    private power: Formula,
  ) {
    super();
  }

  public buildDerivative(): Formula | null {
    // u^v = u^v * (v ln(u))'
    const derivative = new MultiplyOperatorFormula(
      this.power,
      new LnFormula(this.inner),
    ).buildDerivative();
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
    writer.scopeIf(() => this.inner.write(writer), !this.inner.isPrimary());
    writer.writePow();
    writer.scopeIf(() => this.power.write(writer), !this.power.isPrimary());
  }

  public isPrimary(): boolean {
    return false;
  }
}
