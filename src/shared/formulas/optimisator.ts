import type { Formula } from "./formula";

export abstract class FormulaOptimisator {
  public abstract optimise(formula: Formula): Formula | null;
}

export class ComplexOptimisator extends FormulaOptimisator {
  constructor (private optimisators: FormulaOptimisator[]) { super(); }

  public optimise(formula: Formula): Formula | null {
    let wasOptimised = false;
    optimiseLoop: while (true) {
      let innerOptimized = false;
      formula.mapChildren((formula) => {
        const value = this.optimise(formula)
        if (value !== null) {
          wasOptimised = true;
          innerOptimized = true;
        }
        return value;
      })
      if (innerOptimized) continue optimiseLoop;

      for (const optimisator of this.optimisators) {
        const optimised = optimisator.optimise(formula);
        if (optimised !== null) {
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