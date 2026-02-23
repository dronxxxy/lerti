import { missClearSample, U_TABLE_95, type CleaningResult } from "@/shared/algorithm/cleanMisses";
import { AlgorithmError } from "@/shared/error";
import { roundErrorString, roundValueString } from "@/shared/algorithm/rounding";
import Sample, { T_TABLE_95 } from "@/shared/algorithm/sample";
import { catchAlgorithmError } from "@/shared/error";
import Decimal from "decimal.js";
import { ref } from "vue";

export type SimpleErrorResult = {
  rudeCleaning: CleaningResult[],
  sampleError: Decimal,
  error: string,
  value: string,
}

export default function useSimpleError() {
  const values = ref<number[]>([0, 0, 0, 0, 0]);
  const additionalUs = ref<Record<number, number>>({});
  const additionalTs = ref<Record<number, number>>({});
  const machineError = ref<number>(0);
  const result = ref<SimpleErrorResult | null>(null);
  const error = ref<AlgorithmError | null>(null);

  const reset = () => {
    error.value = null;
    result.value = null;
  }

  const extendTable = (source: Record<number, Decimal>, additional: Record<number, number>) => ({
    ...source,
    ...Object.fromEntries(Object.entries(additional).map(([key, value]) => [key, new Decimal(value ?? 0)]))
  })

  const process = () => {
    reset();
    const sample = new Sample([...values.value].map((value) => new Decimal(value ?? 0)));
    sample.sort();
    const rudeCleaning = missClearSample(sample, extendTable(U_TABLE_95, additionalUs.value));
    const sampleError = sample.getDerivationError(extendTable(T_TABLE_95, additionalTs.value));
    const machineErr = new Decimal(machineError.value);
    const error = machineErr.pow(2).add(sampleError.pow(2)).sqrt();
    const value = sample.average();

    result.value = {
      rudeCleaning,
      sampleError,
      error: roundErrorString(error),
      value: roundValueString(value, error),
    };
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
