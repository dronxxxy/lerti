import Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import { PowFormula } from "./pow";
import { ConstantNumberFormula } from "./constant";
import { UnaryMinusFormula } from "./unary";

export abstract class OperatorFormula extends Formula {
  constructor(
    public left: Formula,
    public right: Formula,
  ) {
    super();
  }

  public *getChildren(): IterableIterator<Formula> {
    yield this.left;
    yield this.right;
  }

  public mapChildren(mapper: (child: Formula) => Formula | null): void {
    this.left = mapper(this.left) ?? this.left;
    this.right = mapper(this.right) ?? this.right;
  }

  protected abstract buildLatex(left: string, right: string): string;
  protected isRightSideHigher(): boolean { return false };

  public toLatex(): string {
    const left = this.left.toLatexPrioritized(this.getLevel())
    const right = this.right.toLatexPrioritized(this.getLevel())
    return this.buildLatex(left, right);
  }
}

export class AddOperatorFormula extends OperatorFormula {
  public buildDerivative(context: DerivativeContext): Formula | null {
    const left = this.left.buildDerivative(context);
    const right = this.right.buildDerivative(context);
    if (!left) return right;
    if (!right) return left;
    return new AddOperatorFormula(left, right);
  }

  public execute(context: ExecutionContext): Decimal {
    const left = this.left.execute(context);
    const right = this.right.execute(context);
    return left.plus(right);
  }

  protected buildLatex(left: string, right: string): string {
    return `${left} + ${right}`;
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.BINOP_ADD;
  }

  public equals(other: Formula): boolean {
    return other instanceof AddOperatorFormula &&
      ((this.left.equals(other.left) && this.right.equals(other.right)) ||
      (this.left.equals(other.right) && this.right.equals(other.left)));
  }
}

export class SubtractOperatorFormula extends OperatorFormula {
  public buildDerivative(context: DerivativeContext): Formula | null {
    const left = this.left.buildDerivative(context);
    const right = this.right.buildDerivative(context);
    if (!left) return right;
    if (!right) return left;
    return new SubtractOperatorFormula(left, right);
  }

  public execute(context: ExecutionContext): Decimal {
    const left = this.left.execute(context);
    const right = this.right.execute(context);
    return left.minus(right);
  }

  protected buildLatex(left: string, right: string): string {
    return `${left} - ${right}`;
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.BINOP_ADD;
  }

  public equals(other: Formula): boolean {
    return other instanceof SubtractOperatorFormula && 
      ((this.left.equals(other.left) && this.right.equals(other.right)) ||
      (this.left.equals(other.right) && this.right.equals(other.left)));
  }
}

export class MultiplyOperatorFormula extends OperatorFormula {
  public buildDerivative(context: DerivativeContext): Formula | null {
    const left = this.left.buildDerivative(context);
    const right = this.right.buildDerivative(context);

    if (!left) {
      if (!right) return null;
      return new MultiplyOperatorFormula(right, this.left);
    }

    if (!right) {
      return new MultiplyOperatorFormula(left, this.right);
    }

    return new AddOperatorFormula(
      new MultiplyOperatorFormula(left, this.right),
      new MultiplyOperatorFormula(right, this.left),
    );
  }

  public execute(context: ExecutionContext): Decimal {
    const left = this.left.execute(context);
    const right = this.right.execute(context);
    return left.mul(right);
  }


  protected buildLatex(left: string, right: string): string {
    return `${left} \\cdot ${right}`;
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.BINOP_MUL;
  }

  public equals(other: Formula): boolean {
    return other instanceof MultiplyOperatorFormula &&
      ((this.left.equals(other.left) && this.right.equals(other.right)) ||
      (this.left.equals(other.right) && this.right.equals(other.left)));
  }
}

export class DivideOperatorFormula extends OperatorFormula {
  public buildDerivative(context: DerivativeContext): Formula | null {
    const left = this.left.buildDerivative(context);
    const right = this.right.buildDerivative(context);

    if (!left) {
      if (!right) return null;
      return new DivideOperatorFormula(
        new UnaryMinusFormula(new MultiplyOperatorFormula(right, this.left)),
        new PowFormula(this.right, new ConstantNumberFormula(new Decimal(2))),
      );
    }

    if (!right) return new DivideOperatorFormula(left, this.right);

    return new DivideOperatorFormula(
      new SubtractOperatorFormula(
        new MultiplyOperatorFormula(left, this.right),
        new MultiplyOperatorFormula(this.left, right),
      ),
      new PowFormula(this.right, new ConstantNumberFormula(new Decimal(2))),
    );
  }

  public execute(context: ExecutionContext): Decimal {
    const left = this.left.execute(context);
    const right = this.right.execute(context);
    return left.div(right);
  }

  protected buildLatex(left: string, right: string): string {
    return `\\frac ${left} ${right}`;
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.BINOP_MUL;
  }

  protected override isRightSideHigher(): boolean { return true }

  public equals(other: Formula): boolean {
    return other instanceof DivideOperatorFormula && this.left.equals(other.left) && this.right.equals(other.right);
  }
}
