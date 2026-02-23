import Decimal from "decimal.js";
import type { FormulaWriter } from "./writer";

export class DerivativeContext {
  constructor(public byVariable: string) {}
}

export class ExecutionContext {
  constructor(private variables: Record<string, Decimal>) {}

  public getVariable(name: string) {
    if (this.variables[name] === undefined)
      throw new Error(`unregistered variable ${name}`);

    return this.variables[name];
  }
}

export enum FormulaLevel {
  BINOP_ADD = 0,
  BINOP_MUL,
  UNARY,
  POW,
  VALUE,
}

export abstract class Formula {
  public abstract buildDerivative(context: DerivativeContext): Formula | null;
  public abstract execute(context: ExecutionContext): Decimal;
  public abstract write(writer: FormulaWriter): void;
  public abstract getLevel(): FormulaLevel;

  public writePrioritized(writer: FormulaWriter, outerLevel: FormulaLevel, equals: boolean = false): string {
    const level = this.getLevel();
    const shouldBeScoped = outerLevel > level || (equals && outerLevel == level);
    if (shouldBeScoped) writer.beginScope(); 
    this.write(writer);
    if (shouldBeScoped) writer.endScope(); 
    return writer.get();
  }

  public toString(writer: FormulaWriter): string {
    this.write(writer);
    return writer.get();
  }

  protected abstract getChildren(): IterableIterator<Formula>;

  public *iterate(): IterableIterator<Formula> {
    yield this;
    for (const formula of this.getChildren()) {
      for (const child of formula.iterate())
        yield child;
    }
  }
}