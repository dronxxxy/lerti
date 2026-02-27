import Decimal from "decimal.js";
import type { Formula } from "../formula";
import { ConstantNumberFormula } from "../impl/constant";
import { DivideOperatorFormula, MultiplyOperatorFormula } from "../impl/operators";
import { FormulaOptimisator } from "../optimisator";

export class MultiplyOneOptimisator extends FormulaOptimisator {
  private one: Formula = new ConstantNumberFormula(new Decimal(1));

  public optimise(formula: Formula): Formula | null {
    if (!(formula instanceof MultiplyOperatorFormula) && !(formula instanceof DivideOperatorFormula)) return null;
    if (formula.left.equals(this.one) && formula instanceof MultiplyOperatorFormula) return formula.right;
    if (formula.right.equals(this.one)) return formula.left;
    return null;
  }
}
