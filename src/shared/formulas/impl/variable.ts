import Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import { ConstantNumberFormula } from "./constant";
import type { FormulaWriter } from "../writer";

export class VariableFormula extends Formula {
  constructor(private name: string) {
    super();
  }

  public getVariableName(): string {
    return this.name;
  }

  public execute(context: ExecutionContext): Decimal {
    return context.getVariable(this.name);
  }

  public write(writer: FormulaWriter): void {
    writer.writeVariable(this.name);
  }

  public buildDerivative(context: DerivativeContext): Formula | null {
    if (context.byVariable == this.name)
      return new ConstantNumberFormula(new Decimal(1));
    return null;
  }

  public equals(other: Formula): boolean {
    return other instanceof VariableFormula && this.name == other.name;
  }

  public mapChildren(_mapper: (child: Formula) => Formula | null): void {}
  public *getChildren(): IterableIterator<Formula> {}

  public getLevel(): FormulaLevel {
    return FormulaLevel.VALUE;
  }
}
