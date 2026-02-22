import type Decimal from "decimal.js";
import { FormulaWriter } from "../writer";

export class AsciiFormulaWriter extends FormulaWriter {
  private content: string = "";

  public writeVariable(name: string): void {
    this.content += name;
  }

  public writeFnName(name: string): void {
    this.content += name;
  }

  public writeNumber(number: Decimal): void {
    this.content += number;
  }

  public writePlus(): void {
    this.content += "+";
  }

  public writeMinus(): void {
    this.content += "-";
  }

  public writeMultiply(): void {
    this.content += "*";
  }

  public writeDivide(): void {
    this.content += "/";
  }

  public writePow(): void {
    this.content += "^";
  }

  public writeComma(): void {
    this.content += ",";
  }

  public beginScope(): void {
    this.content += "(";
  }

  public endScope(): void {
    this.content += ")";
  }

  public get(): string {
    return this.content;
  }
}
