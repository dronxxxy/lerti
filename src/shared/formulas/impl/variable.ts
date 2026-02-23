import Decimal from "decimal.js";
import { ExecutionContext, Formula } from "../formula";
import { ConstantNumberFormula } from "./constant";
import type { FormulaWriter } from "../writer";

export class VariableFormula extends Formula {
  constructor(private name: string) {
    super();
  }

  public execute(context: ExecutionContext): Decimal {
    return context.getVariable(this.name);
  }

  public write(writer: FormulaWriter): void {
    writer.writeVariable(this.name);
  }

  public buildDerivative(): Formula | null {
    return new ConstantNumberFormula(new Decimal(1));
  }

  protected *getChildren(): IterableIterator<Formula> {}

  public isPrimary(): boolean {
    return true;
  }
}
