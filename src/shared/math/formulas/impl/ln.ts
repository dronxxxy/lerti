import Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import { DivideOperatorFormula, MultiplyOperatorFormula } from "./operators";
import { PowFormula } from "./pow";
import { ConstantNumberFormula } from "./constant";
import { UnaryMinusFormula } from "./unary";

export abstract class FunctionFormula extends Formula {
  constructor(public inner: Formula) {
    super();
  }

  protected abstract getName(): string;
  protected abstract directExecute(argument: Decimal): Decimal;
  protected abstract directDerivative(value: Formula): Formula;
  protected abstract sameType(value: Formula): boolean;

  public toLatex(): string {
    return `\\${this.getName()} ${this.inner.toLatexPrioritized(FormulaLevel.POW)}`;
  }

  public buildDerivative(context: DerivativeContext): Formula | null {
    const inner = this.inner.buildDerivative(context);
    if (!inner) return null;
    return new MultiplyOperatorFormula(inner, this.directDerivative(this.inner));
  }

  public execute(context: ExecutionContext): Decimal {
    return this.directExecute(this.inner.execute(context));
  }

  public mapChildren(mapper: (child: Formula) => Formula | null): void {
    this.inner = mapper(this.inner) ?? this.inner;
  }

  public *getChildren(): IterableIterator<Formula> {
    yield this.inner;
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.VALUE;
  }

  public equals(other: Formula): boolean {
    return other instanceof FunctionFormula && this.sameType(other) && this.inner.equals(other.inner);
  }
}

export class LnFormula extends FunctionFormula {
  constructor(inner: Formula) {
    super(inner);
  }

  protected getName(): string {
    return "ln";
  }

  protected directDerivative(value: Formula): Formula {
    return new PowFormula(this.inner, new ConstantNumberFormula(new Decimal(-1)));
  }

  protected directExecute(argument: Decimal): Decimal {
    return argument.ln();
  }

  protected sameType(other: Formula): boolean {
    return other instanceof LnFormula;
  }
}

export class SinFormula extends FunctionFormula {
  constructor(inner: Formula) {
    super(inner);
  }

  protected getName(): string {
    return "sin";
  }

  protected directDerivative(value: Formula): Formula {
    return new CosFormula(this.inner);
  }

  protected directExecute(argument: Decimal): Decimal {
    return argument.sin();
  }

  protected sameType(other: Formula): boolean {
    return other instanceof SinFormula;
  }
}

export class CosFormula extends FunctionFormula {
  constructor(inner: Formula) {
    super(inner);
  }

  protected getName(): string {
    return "cos";
  }

  protected directDerivative(value: Formula): Formula {
    return new UnaryMinusFormula(new SinFormula(this.inner));
  }

  protected directExecute(argument: Decimal): Decimal {
    return argument.cos();
  }

  protected sameType(other: Formula): boolean {
    return other instanceof CosFormula;
  }
}
