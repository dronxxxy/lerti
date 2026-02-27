import Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula, FormulaLevel } from "../formula";
import { PowFormula } from "./pow";
import { FormulaWriter } from "../writer";
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

  protected abstract writeOperator(writer: FormulaWriter): void;
  protected isRightSideHigher(): boolean { return false };

  public write(writer: FormulaWriter): void {
    const level = this.getLevel();
    this.left.writePrioritized(writer, level);
    this.writeOperator(writer);
    this.right.writePrioritized(writer, level, this.isRightSideHigher());
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

  protected writeOperator(writer: FormulaWriter): void {
    writer.writePlus();
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

  protected writeOperator(writer: FormulaWriter): void {
    writer.writeMinus();
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

  protected writeOperator(writer: FormulaWriter): void {
    writer.writeMultiply();
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

  protected writeOperator(writer: FormulaWriter): void {
    writer.writeDivide();
  }

  public getLevel(): FormulaLevel {
    return FormulaLevel.BINOP_MUL;
  }

  protected override isRightSideHigher(): boolean { return true }

  public equals(other: Formula): boolean {
    return other instanceof DivideOperatorFormula && this.left.equals(other.left) && this.right.equals(other.right);
  }
}
