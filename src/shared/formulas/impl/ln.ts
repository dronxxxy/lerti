import type Decimal from "decimal.js";
import { ExecutionContext, Formula } from "../formula";
import type { FormulaWriter } from "../writer";
import { DivideOperatorFormula, MultiplyOperatorFormula } from "./operators";

export class LnFormula extends Formula {
  constructor(private inner: Formula) {
    super();
  }

  public buildDerivative(): Formula | null {
    const inner = this.inner.buildDerivative();
    if (!inner) return null;
    return new DivideOperatorFormula(inner, this.inner);
  }

  public execute(context: ExecutionContext): Decimal {
    return this.inner.execute(context).ln();
  }

  public write(writer: FormulaWriter): void {
    writer.writeFnName("ln");
    writer.beginScope();
    this.inner.write(writer);
    writer.endScope();
  }

  protected *getChildren(): IterableIterator<Formula> {
    yield this.inner;
  }
}
