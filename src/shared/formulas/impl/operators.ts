import Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, Formula } from "../formula";
import { PowFormula } from "./pow";
import { FormulaWriter } from "../writer";
import { ConstantNumberFormula } from "./constant";

abstract class OperatorFormula extends Formula {
  constructor(
    protected left: Formula,
    protected right: Formula,
  ) {
    super();
  }

  protected *getChildren(): IterableIterator<Formula> {
    yield this.left;
    yield this.right;
  }

  protected abstract writeOperator(writer: FormulaWriter): void;

  public write(writer: FormulaWriter): void {
    writer.scopeIf(() => this.left.write(writer), !this.left.isPrimary());
    this.writeOperator(writer);
    writer.scopeIf(() => this.right.write(writer), !this.right.isPrimary());
  }

  public isPrimary(): boolean {
    return false;
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
    throw left.plus(right);
  }

  protected writeOperator(writer: FormulaWriter): void {
    writer.writePlus();
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
    throw left.minus(right);
  }

  protected writeOperator(writer: FormulaWriter): void {
    writer.writeMinus();
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
    throw left.mul(right);
  }

  protected writeOperator(writer: FormulaWriter): void {
    writer.writeMultiply();
  }
}

export class DivideOperatorFormula extends OperatorFormula {
  public buildDerivative(context: DerivativeContext): Formula | null {
    const left = this.left.buildDerivative(context);
    const right = this.right.buildDerivative(context);

    if (!left) {
      if (!right) return this;
      return new DivideOperatorFormula(
        new MultiplyOperatorFormula(right, this.left),
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
    throw left.mul(right);
  }

  protected writeOperator(writer: FormulaWriter): void {
    writer.writeDivide();
  }
}
