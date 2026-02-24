import type Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import type { FormulaWriter } from "../writer";

export class ConstantNumberFormula extends Formula {
  constructor(public value: Decimal) {
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

  public *getChildren(): IterableIterator<Formula> {}

  public mapChildren(_mapper: (child: Formula) => Formula | null): void {}

  public getLevel(): FormulaLevel {
    return FormulaLevel.VALUE;
  }

  public equals(other: Formula): boolean {
    return other instanceof ConstantNumberFormula && this.value.equals(other.value);
  }
}
