import type { Constructor } from "@/shared/constructor";
import type { Formula } from "../formula";
import { FormulaOptimisator } from "../optimisator";
import { AddOperatorFormula, DivideOperatorFormula, MultiplyOperatorFormula, OperatorFormula, SubtractOperatorFormula } from "../impl/operators";
import { PowFormula } from "../impl/pow";
import { ConstantNumberFormula } from "../impl/constant";
import Decimal from "decimal.js";
import { UnaryMinusFormula } from "../impl/unary";

export type BinopConstructor<T> = Constructor<[Formula, Formula], T>;

type ElementInfo = {
  count: Decimal,
  formula: Formula,
};

type QueueElementInfo = ElementInfo;

export abstract class BinopCompressOptimisator<AddBinop extends OperatorFormula, SubBinop extends OperatorFormula> extends FormulaOptimisator {
  constructor (private addBinop: BinopConstructor<AddBinop>, private subBinop: BinopConstructor<SubBinop>) {
    super()
  }

  protected abstract compressCount(info: ElementInfo): ElementInfo;
  protected abstract nullElement(): Formula;
  protected abstract multiply(element: ElementInfo): Formula;
  protected abstract onlySub(formula: Formula): Formula;

  private addAll(elements: ElementInfo[]): Formula {
    return elements
      .map((element) => element.count.equals(1) ? element.formula : this.multiply(element))
      .reduce((acc, value) => new this.addBinop(acc, value));
  }

  public optimise(formula: Formula): Formula | null {
    if (!(formula instanceof this.addBinop) && !(formula instanceof this.subBinop))
      return null;

    let elements: ElementInfo[] = [];

    const children = [...formula.getChildren()];
    if (children.length != 2) throw new Error("expected 2 children in binop");
    const queue: QueueElementInfo[] = [
      {
        count: new Decimal(1),
        formula: children[0]!,
      },
      {
        count: formula instanceof this.subBinop ? new Decimal(-1) : new Decimal(1),
        formula: children[1]!,
      }
    ];

    while (queue.length > 0) {
      const element = this.compressCount(queue.pop()!);

      if (element.formula instanceof this.addBinop) {
        queue.push({
          formula: element.formula.left,
          count: element.count
        })
        queue.push({
          formula: element.formula.right,
          count: element.count
        })
      } else if (element.formula instanceof this.subBinop) {
        queue.push({
          formula: element.formula.left,
          count: element.count
        })
        queue.push({
          formula: element.formula.right,
          count: element.count.negated(),
        })
      } else {
        elements.push({
          count: element.count,
          formula: element.formula
        });
      }
    }

    let wasCompressed = false;
    for (let compressingId = 0; compressingId < elements.length; compressingId++) {
      const element = elements[compressingId]!;
      for (let i = elements.length - 1; i > compressingId; i--) {
        const currentElement = elements[i]!;
        if (currentElement.formula.equals(element.formula)) {
          elements = elements.filter((_, index) => index !== i);
          element.count = element.count.add(currentElement.count);
          wasCompressed = true;
        }
      }
    }

    if (!wasCompressed) return null;

    elements = elements.filter((element) => !element.count.isZero());

    if (elements.length == 0) return this.nullElement();

    const add = elements.filter((element) => element.count.isPositive());

    const sub = elements
      .filter((element) => element.count.isNegative())
      .map((element) => {
        element.count = element.count.negated();
        return element;
      });

    if (add.length == 0 && sub.length == 0) return this.nullElement();
    if (add.length == 0) return this.onlySub(this.addAll(sub));
    if (sub.length == 0) return this.addAll(add);

    return new this.subBinop(this.addAll(add), this.addAll(sub));
  }
}

export class MultiplyCompressOptimisator extends BinopCompressOptimisator<MultiplyOperatorFormula, DivideOperatorFormula> {
  private cachedNullElement = new ConstantNumberFormula(new Decimal(1));

  constructor() { super(MultiplyOperatorFormula, DivideOperatorFormula); }

  protected nullElement(): Formula {
    return this.cachedNullElement;
  }

  protected multiply(element: ElementInfo): Formula {
    return new PowFormula(element.formula, new ConstantNumberFormula(element.count));
  }

  protected onlySub(formula: Formula): Formula {
    return new DivideOperatorFormula(this.nullElement(), formula);
  }

  protected compressCount(info: ElementInfo): ElementInfo {
    while (
      info.formula instanceof PowFormula &&
      info.formula.power instanceof ConstantNumberFormula
    ) {
      info.count = info.count.mul(info.formula.power.value);
      info.formula = info.formula.inner;
    }
    return info;
  }
}

export class AddCompressOptimisator extends BinopCompressOptimisator<AddOperatorFormula, SubtractOperatorFormula> {
  private cachedNullElement = new ConstantNumberFormula(new Decimal(0));

  constructor() { super(AddOperatorFormula, SubtractOperatorFormula); }

  protected nullElement(): Formula {
    return this.cachedNullElement;
  }

  protected multiply(element: ElementInfo): Formula {
    return new MultiplyOperatorFormula(element.formula, new ConstantNumberFormula(element.count));
  }

  protected compressCount(info: ElementInfo): ElementInfo {
    while (true) {
      if (info.formula instanceof MultiplyOperatorFormula) {
        if (info.formula.left instanceof ConstantNumberFormula) {
          info.count = info.count.mul(info.formula.left.value);
          info.formula = info.formula.right;
        } else if (info.formula.right instanceof ConstantNumberFormula) {
          info.count = info.count.mul(info.formula.right.value);
          info.formula = info.formula.left;
        } else break;
      } else if (info.formula instanceof UnaryMinusFormula) {
        info.count = info.count.negated();
        info.formula = info.formula.inner;
      } else break;
    }
    return info;
  }

  protected onlySub(formula: Formula): Formula {
    return new UnaryMinusFormula(formula);
  }
}