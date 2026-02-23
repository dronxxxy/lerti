import { parseFormulaFromLatex } from "@/shared/formulas/parse/latex";
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
    const parsed = parseFormulaFromLatex(formula);
    const derivative = parsed.buildDerivative();
    const writer = new AsciiFormulaWriter();
    derivative?.write(writer);
    console.log(writer.get())
  })

  return {
    formula
  }
}

