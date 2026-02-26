import { AlgorithmError, throwAlgorithmError } from "@/shared/error";
import { DefaultOptimisator } from "@/shared/math/formulas/optimisators/default";
import { parseFormulaFromLatex } from "@/shared/math/formulas/parse/latex";
import type { CalculationResult } from "@/shared/math/indirectError";
import indirectErrorCalculate, { VarTable } from "@/shared/math/indirectError";
import { computed, reactive, ref, watch } from "vue";
import useVarTableInput from "./varTableInput";
import { detectVariableList as formulaExtractVariables } from "@/shared/math/formulas/utils";

export default function useIndirectErrorCalculator() {
  const formula = ref("");
  const table = useVarTableInput();
  const error = ref<AlgorithmError | null>(null);
  const result = ref<CalculationResult | null>(null);

  watch(formula, (formula) => {
    let parsed = throwAlgorithmError(
      () => parseFormulaFromLatex(formula),
      (e) => error.value = e,
    )
    if (!parsed) return;
    error.value = null;
    table.applyNames(formulaExtractVariables(DefaultOptimisator.optimise(parsed) ?? parsed));
  })

  const canProcess = computed(() => error.value == null && formula.value != "");

  const process = () => {
    if (!canProcess.value) return;
    const parsed = parseFormulaFromLatex(formula.value);
    result.value = indirectErrorCalculate(DefaultOptimisator.optimise(parsed) ?? parsed, table.build());
  }

  return {
    formula,
    table,
    error,
    result,
    process,
    canProcess
  }
}

