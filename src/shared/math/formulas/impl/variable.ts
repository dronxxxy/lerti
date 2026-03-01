import Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import { ConstantNumberFormula } from "./constant";

export class VariableFormula extends Formula {
  constructor(public readonly name: string) {
    super();
  }

  public execute(context: ExecutionContext): Decimal {
    return context.getVariable(this.name);
  }

  public toLatex(): string {
    return this.name.length == 1 ? this.name : `\\${this.name}`;
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
