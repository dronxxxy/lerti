import Decimal from "decimal.js";
import type Sample from "../sample";
import { CleaningResult, missClearSample, U_TABLE_95 } from "./cleanMisses";
import { T_TABLE_95 } from "../sample";
import { roundErrorString, roundValueString } from "../rounding";

export type CalculationResult = {
  rudeCleaning: CleaningResult[],
  sampleError: Decimal,
  error: Decimal,
  value: Decimal,
}
  
function extendTable (source: Record<number, Decimal>, additional: Record<number, Decimal>) {
  return ({
    ...source,
    ...additional,
  })
}

export default function simpleErrorCalculate(
  sample: Sample,
  machineError: Decimal,
  additionalUs: Record<number, Decimal>,
  additionalTs: Record<number, Decimal>
): CalculationResult {
  sample.sort();
  const rudeCleaning = missClearSample(sample, extendTable(U_TABLE_95, additionalUs));
  const sampleError = sample.getDerivationError(extendTable(T_TABLE_95, additionalTs));
  const machineErr = new Decimal(machineError);
  const error = machineErr.pow(2).add(sampleError.pow(2)).sqrt();
  const value = sample.average();

  return {
    rudeCleaning,
    sampleError,
    error,
    value,
  };
}
