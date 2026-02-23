import { VariableFormula } from "@/shared/formulas/impl/variable";
import { InvalidLatexException, parseFormulaFromLatex } from "@/shared/formulas/parse/latex";
import { AsciiFormulaWriter } from "@/shared/formulas/writers/ascii";
import type Decimal from "decimal.js";
import { ref, watch } from "vue";

export type VarInfo = {
  name: string,
  initialValue: Decimal,
  error: Decimal,
}

export type VarTable = VarInfo[]

export default function useIndirectError() {
  const formula = ref("");

  const reloadTable = () => {

  }

  watch(formula, (formula) => {
    let parsed;
    try {
      parsed = parseFormulaFromLatex(formula);
    } catch (exception) {
      if (exception instanceof InvalidLatexException) {
      } else {
        console.error(exception)
      }
      return;
    }
    console.log("detecting variables...")
    for (const formula of parsed.iterate()) {
      if (formula instanceof VariableFormula) {
        console.log(formula.getVariableName())
      }
    }
  })

  return {
    formula
  }
}

