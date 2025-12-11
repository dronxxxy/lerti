import { missClearSample, U_TABLE_95, type CleaningResult } from "@/shared/algorithm/cleanMisses";
import { roundErrorString, roundValueString } from "@/shared/algorithm/rounding";
import Sample from "@/shared/algorithm/sample";
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
  const machineError = ref<number>(0);
  const result = ref<SimpleErrorResult | null>(null);
  const failed = ref<boolean>();

  const reset = () => {
    failed.value = false;
    result.value = null;
  }

  const process = () => {
    reset();
    const sample = new Sample([...values.value].map(Decimal));
    sample.sort();
    const rudeCleaning = missClearSample(sample, {
      ...U_TABLE_95,
      ...Object.fromEntries(Object.entries(additionalUs.value).map(([key, value]) => [key, new Decimal(value)]))
    });
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
    additionalUs,
    machineError,
    result,
    failed,
    process: () => {
      try {
        process()
      } catch (e) {
        console.log(e)
        failed.value = true;      
      }
    }
  }
}
