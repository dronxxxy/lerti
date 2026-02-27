import Decimal from "decimal.js";
import { DerivativeContext, ExecutionContext, type Formula } from "../formulas/formula";
import { DefaultOptimisator } from "../formulas/optimisators/default";

export type CalculationResult = {
  partials: Record<string, Formula | null>,
  errors: Decimal[],
  samples: {
    derivatives: Decimal[],
    result: Decimal,
    error: Decimal,
  }[], 
  error: Decimal,
  average: Decimal,
};

export type VarInfo = {
  name: string,
  error: Decimal,
  values: Decimal[],
}

export class VarTable {
  constructor (
    public length: number,
    public variables: VarInfo[],
  ) {}

  public buildContext(sampleId: number): ExecutionContext {
    if (sampleId >= this.length)
      throw new Error(`sampleId is out of range: ${sampleId} >= ${this.length}`);

    const list = <Record<string, Decimal>>{};
    for (const varInfo of this.variables) {
      if (varInfo.values[sampleId] === undefined) throw new Error(`inconsistent variable list`);
      list[varInfo.name] = varInfo.values[sampleId];
    }

    return new ExecutionContext(list);
  }
}

export default function indirectErrorCalculate(formula: Formula, table: VarTable): CalculationResult {
  const partials = table.variables
    .map((varInfo) => formula.buildDerivative(new DerivativeContext(varInfo.name)))
    .map(formula => formula && (DefaultOptimisator.optimise(formula) ?? formula));

  const samples = [];
  for (let i = 0; i < table.length; i++) {
    const context = table.buildContext(i);

    const derivatives: Decimal[] = partials
      .map((partial) => partial ? partial.execute(context) : new Decimal(0));

    const error = derivatives
      .map((e, i) => e.mul(table.variables[i]!.error))
      .map((e) => e.pow(2))
      .reduce((acc, val) => acc.add(val))
      .sqrt();

    const result = formula.execute(context);

    samples.push({
      derivatives,
      result,
      error,
    })
  }

  return {
    partials: Object.fromEntries(table.variables.map((varInfo, i) => [varInfo.name, partials[i]!])),
    errors: table.variables.map((varInfo) => varInfo.error),
    samples,
    error: samples
      .map((sample) => sample.error.pow(2))
      .reduce((acc, val) => acc.add(val))
      .sqrt().div(new Decimal(samples.length)),
    average: samples
      .map((sample) => sample.result)
      .reduce((acc, val) => acc.add(val))
      .div(new Decimal(samples.length))
  };
}