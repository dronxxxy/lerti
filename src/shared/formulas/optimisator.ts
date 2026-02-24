import type { Formula } from "./formula";

export abstract class FormulaOptimisator {
  public abstract optimise(formula: Formula): Formula | null;
}

export class ComplexOptimisator extends FormulaOptimisator {
  constructor (private optimisators: FormulaOptimisator[]) { super(); }

  public optimise(formula: Formula): Formula | null {
    let wasOptimised = false;
    optimiseLoop: while (true) {
      formula.mapChildren((formula) => this.optimise(formula))

      for (const optimisator of this.optimisators) {
        const optimised = optimisator.optimise(formula);
        if (optimised != null) {
          formula = optimised;
          wasOptimised = true;
          continue optimiseLoop;
        }
      }
      break;
    }

    return wasOptimised ? formula : null;
  }
}