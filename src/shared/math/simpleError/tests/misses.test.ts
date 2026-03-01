import { expect, test } from "vitest";
import { EmptySampleError, InvalidSampleLengthError, missClearSample, NotAscendingSampleError} from "../cleanMisses";
import Sample from "../../sample";
import Decimal from "decimal.js";

test("sample validation", () => {
  expect(() => missClearSample(new Sample([10, 2, 3, 4, 5].map((e) => new Decimal(e)))))
    .toThrowError(NotAscendingSampleError)

  expect(() => missClearSample(new Sample([])))
    .toThrowError(EmptySampleError)

  expect(() => missClearSample(new Sample([1, 2, 3, 4, 5, 6].map((e) => new Decimal(e)))))
    .toThrowError(InvalidSampleLengthError)

  missClearSample(new Sample([1, 2, 3, 4, 5].map((e) => new Decimal(e))))
})

test("should not remove an element", () => {
  expect(missClearSample(new Sample([1, 2, 3, 4, 5].map((e) => new Decimal(e)))).length).toBe(1)
})

test("should remove an element", () => {
  expect(missClearSample(new Sample([1, 2, 3, 4, 100].map((e) => new Decimal(e)))).length).toBe(2)
  expect(missClearSample(new Sample([-1000, 2, 3, 4, 100].map((e) => new Decimal(e)))).length).toBe(3)
})
