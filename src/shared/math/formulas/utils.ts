import type { Formula } from "./formula";
import { VariableFormula } from "./impl/variable";

export function detectVariableList(formula: Formula): Set<string> {
  let result = new Set<string>();
  for (const child of formula.iterate())
    if (child instanceof VariableFormula)
      result.add(child.name)
  return result;
}