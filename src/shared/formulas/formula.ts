import Decimal from "decimal.js";
import type { FormulaWriter } from "./writer";

export abstract class ExecutionContext {
  constructor(private variables: Record<string, Decimal>) {}

  public getVariable(name: string) {
    if (this.variables[name] === undefined)
      throw new Error(`unregistered variable ${name}`);

    return this.variables[name];
  }
}

export abstract class Formula {
  public abstract buildDerivative(): Formula | null;
  public abstract execute(context: ExecutionContext): Decimal;
  public abstract write(writer: FormulaWriter): void;
  public abstract isPrimary(): boolean;

  protected abstract getChildren(): IterableIterator<Formula>;

  public *iterate(): IterableIterator<Formula> {
    for (const formula of this.getChildren()) {
      yield formula;
      for (const child of formula.iterate()) yield child;
    }
  }
}
