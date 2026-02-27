import Decimal from "decimal.js";

function getErrorLevel(error: Decimal): Decimal {
  if (error.isZero()) return new Decimal(0)
  let level = error.abs().log(10).floor()
  const roundingFactor = new Decimal(10).pow(level);
  
  const firstDigit = error.abs().div(roundingFactor).floor().mod(10);
  if (firstDigit.lessThanOrEqualTo(3)) {
    level = level.minus(1);
  }
  return level;
}

export function roundValueToError(value: Decimal, error: Decimal): Decimal {
  const roundingFactor = new Decimal(10).pow(getErrorLevel(error));
  return value.div(roundingFactor).floor().mul(roundingFactor);
}

export function roundError(error: Decimal): Decimal {
  return roundValueToError(error, error);
}

export function roundValueString(value: Decimal, error: Decimal): string {
  let level = -getErrorLevel(error).toNumber();
  if (level < 0) {
    level = 0;
  }
  return roundValueToError(value, error).toFixed(level)
}

export function roundErrorString(error: Decimal): string {
  return roundValueString(error, error)
}