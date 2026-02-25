import type { Formula } from "../formula";
import { ConstantNumberFormula } from "../impl/constant";
import { DivideOperatorFormula, MultiplyOperatorFormula, OperatorFormula } from "../impl/operators";
import { UnaryMinusFormula } from "../impl/unary";
import { FormulaOptimisator } from "../optimisator"

export class MultiplyUnaryOptimisator extends FormulaOptimisator {
  public optimise(formula: Formula): Formula | null {
    if (
      !(formula instanceof DivideOperatorFormula) &&
      !(formula instanceof MultiplyOperatorFormula)
    ) return null;

    const operator = formula as OperatorFormula;

    let isNegated = false;
    let wasOptimised = false;
    if (operator.left instanceof UnaryMinusFormula) {
      operator.left = operator.left.inner;
      isNegated = !isNegated;
      wasOptimised = true;
    }

    if (operator.left instanceof ConstantNumberFormula && operator.left.value.isNegative()) {
      operator.left.value = operator.left.value.negated();
      isNegated = !isNegated;
      wasOptimised = true;
    }

    if (operator.right instanceof UnaryMinusFormula) {
      operator.right = operator.right.inner;
      isNegated = !isNegated;
      wasOptimised = true;
    }
    
    if (operator.right instanceof ConstantNumberFormula && operator.right.value.isNegative()) {
      operator.right.value = operator.right.value.negated();
      isNegated = !isNegated;
      wasOptimised = true;
    }

    if (!wasOptimised) return null;
    if (isNegated) return new UnaryMinusFormula(formula);
    return formula;
  }
}