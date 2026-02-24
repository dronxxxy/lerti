import type { Formula } from "../formula";
import { ConstantNumberFormula } from "../impl/constant";
import { PowFormula } from "../impl/pow";
import { UnaryMinusFormula } from "../impl/unary";
import { FormulaOptimisator } from "../optimisator"

export class PowUnaryOptimisator extends FormulaOptimisator {
  public optimise(formula: Formula): Formula | null {
    if (
      !(formula instanceof PowFormula) ||
      !(formula.inner instanceof UnaryMinusFormula) ||
      !(formula.power instanceof ConstantNumberFormula)
    ) return null;

    if (!formula.power.value.isInteger()) return null;

    formula.inner = formula.inner.inner;
    if (formula.power.value.modulo(2).isZero()) return formula;
    else return new UnaryMinusFormula(formula);
  }
}
