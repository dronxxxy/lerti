import { missClearSample, type CleaningResult } from "@/shared/algorithm/cleanMisses";
import { roundErrorString, roundValueString } from "@/shared/algorithm/rounding";
import Sample from "@/shared/algorithm/sample";
import Decimal from "decimal.js";
import { reactive, ref } from "vue";

export type SimpleErrorResult = {
  rudeCleaning: CleaningResult[],
  sampleError: Decimal,
  error: string,
  value: string,
}

export default function useSimpleError() {
  const values = reactive<number[]>([0, 0, 0, 0, 0]);
  const machineError = ref<number>(0);
  const result = ref<SimpleErrorResult | null>(null);
  const failed = ref<boolean>();

  const reset = () => {
    failed.value = false;
    result.value = null;
  }

  const process = () => {
    reset();
    const sample = new Sample([...values.values()].map(Decimal));
    sample.sort();
    const rudeCleaning = missClearSample(sample);
    const sampleError = sample.getDerivationError();
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
    machineError,
    result,
    failed,
    process: () => {
      try {
        process()
      } catch {
        failed.value = true;      
      }
    }
  }
}
