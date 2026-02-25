import { AlgorithmError } from "@/shared/error";
import Sample from "@/shared/math/sample";
import { catchAlgorithmError } from "@/shared/error";
import Decimal from "decimal.js";
import { ref } from "vue";
import type { CalculationResult } from "@/shared/math/simpleError/main";
import simpleErrorCalculate from "@/shared/math/simpleError/main";

export default function useSimpleError() {
  const values = ref<Decimal[]>([0, 0, 0, 0, 0].map((e) => new Decimal(e)));
  const additionalUs = ref<Record<number, Decimal>>({});
  const additionalTs = ref<Record<number, Decimal>>({});
  const machineError = ref<Decimal>(new Decimal(0));
  const result = ref<CalculationResult | null>(null);
  const error = ref<AlgorithmError | null>(null);

  const reset = () => {
    error.value = null;
    result.value = null;
  }

  const process = () => {
    reset();
    result.value = simpleErrorCalculate(
      new Sample([...values.value].map((value) => new Decimal(value ?? 0))),
      new Decimal(machineError.value),
      additionalUs.value,
      additionalTs.value,
    );
  }

  return {
    reset,
    values,
    additionalUs,
    additionalTs,
    machineError,
    result,
    error,
    process: () => error.value = catchAlgorithmError(process),
  }
}
