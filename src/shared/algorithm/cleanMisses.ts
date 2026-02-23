import Decimal from "decimal.js";
import type Sample from "./sample";
import { AlgorithmError } from "../error";

export type UTable = Record<number, Decimal>

export const U_TABLE_95: UTable = {
  3: new Decimal(0.94),
  4: new Decimal(0.76),
  5: new Decimal(0.64),
  7: new Decimal(0.51),
  10: new Decimal(0.41),
  15: new Decimal(0.35),
  20: new Decimal(0.30),
  30: new Decimal(0.26),
  100: new Decimal(0.20),
}

export class CleaningResult {
  constructor(
    public missSide: "left" | "right" | null,
    public leftDiff: Decimal,
    public rightDiff: Decimal,
    public allowedDiff: Decimal,
    public u: Decimal,
    public sample: Decimal[],
  ) {}
}

export class EmptySampleError extends Error {
  constructor() {
    super("sample should contain at least one element");
  }
}

export class NotAscendingSampleError extends Error {
  constructor() {
    super("sample should be ascending");
  }
}

export class InvalidSampleLengthError extends AlgorithmError {
  constructor(public length: number) {
    if (length > 2) {
      super(`sample length ${length} is invalid`,
        "Неподдерживаемый размер выборки",
        `В ходе расчетов была получена выборка длины ${length}. ` +
        `Для данной длины отсутствует соотствутствующий параметр u, добавьте его или измените выборку.`
      );
    } else {
      super(`sample length ${length} is invalid`,
        "Неподдерживаемый размер выборки",
        `Кажется, данная выборка имеет слишком много грубых промахов. Длина очищенной выборки: ${length}`
      );
    }
  }
}

function missClearSampleOnce(sample: Sample, uTable: UTable = U_TABLE_95): CleaningResult {
  if (sample.length() == 0) throw new EmptySampleError()
  if (!sample.isAscending()) throw new NotAscendingSampleError();
  if (uTable[sample.length()] === undefined) throw new InvalidSampleLengthError(sample.length());

  const range = sample.range();

  const u = uTable[sample.length()]!;
  const allowedDiff = u.mul(range)
  const leftDiff = sample.at(1).minus(sample.at(0))
  const rightDiff = sample.at(sample.length() - 1).minus(sample.at(sample.length() - 2))
  
  const isLeftDiffSelected = leftDiff.greaterThan(rightDiff)
  const diff = isLeftDiffSelected ? leftDiff : rightDiff;

  return new CleaningResult(
    diff.greaterThan(allowedDiff) ?
      (isLeftDiffSelected ? "left" : "right") :
      null,
    leftDiff,
    rightDiff,
    allowedDiff,
    u,
    sample.values(),
  )
}

export function missClearSample(sample: Sample, uTable: UTable = U_TABLE_95): CleaningResult[] {
  let result = [];
  do {
    const cleanResult = missClearSampleOnce(sample, uTable)
    result.push(cleanResult)
    switch (cleanResult.missSide) {
      case "left":
        sample.popFront();
        break;

      case "right":
        sample.popBack();
        break;
    }
  } while (result[result.length - 1]!.missSide != null);
  return result;
}
