import type Decimal from "decimal.js";

export abstract class FormulaWriter {
  public abstract writeVariable(name: string): void;
  public abstract writeFnName(name: string): void;
  public abstract writeNumber(number: Decimal): void;

  public abstract writePlus(): void;
  public abstract writeMinus(): void;
  public abstract writeMultiply(): void;
  public abstract writeDivide(): void;
  public abstract writePow(): void;

  public abstract writeComma(): void;

  public abstract beginScope(): void;
  public abstract endScope(): void;
  public scopeIf(inner: () => void, condition: boolean): void {
    if (condition) this.beginScope();
    inner();
    if (condition) this.endScope();
  }

  public abstract get(): string;
}
