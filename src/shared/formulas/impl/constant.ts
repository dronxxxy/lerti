import type Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import type { FormulaWriter } from "../writer";

export class ConstantNumberFormula extends Formula {
  constructor(private value: Decimal) {
    super();
  }

  public buildDerivative(context: DerivativeContext): Formula | null {
    return null;
  }

  public execute(_context: ExecutionContext): Decimal {
    return this.value;
  }

  public write(writer: FormulaWriter): void {
    writer.writeNumber(this.value);
  }

  protected *getChildren(): IterableIterator<Formula> {}

  public getLevel(): FormulaLevel {
    return FormulaLevel.VALUE;
  }
}
