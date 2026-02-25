import type Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import type { FormulaWriter } from "../writer";
import { DivideOperatorFormula, MultiplyOperatorFormula } from "./operators";

export class LnFormula extends Formula {
  constructor(private inner: Formula) {
    super();
  }

  public buildDerivative(context: DerivativeContext): Formula | null {
    const inner = this.inner.buildDerivative(context);
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

  public *getChildren(): IterableIterator<Formula> {
    yield this.inner;
  }

  public mapChildren(mapper: (child: Formula) => Formula | null): void {
    this.inner = mapper(this.inner) ?? this.inner;
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.VALUE;
  }

  public equals(other: Formula): boolean {
    return other instanceof LnFormula && this.inner.equals(other.inner);
  }
}
