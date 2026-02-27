import { ExecutionContext, type Formula } from "../formula";
import { ConstantNumberFormula } from "../impl/constant";
import { FormulaOptimisator } from "../optimisator";
import { VariableFormula } from "../impl/variable";

export class ConstantPropagationOptimisator extends FormulaOptimisator {
  public optimise(formula: Formula): Formula | null {
    if (formula instanceof ConstantNumberFormula) return null;
    for (const child of formula.iterate())
      if (child instanceof VariableFormula)
        return null;
    return new ConstantNumberFormula(formula.execute(new ExecutionContext({})));
  }
}

