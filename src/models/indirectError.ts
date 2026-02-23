import { AlgorithmError, catchAlgorithmError, throwAlgorithmError } from "@/shared/error";
import { ExecutionContext, type Formula } from "@/shared/formulas/formula";
import { VariableFormula } from "@/shared/formulas/impl/variable";
import { parseFormulaFromLatex } from "@/shared/formulas/parse/latex";
import Decimal from "decimal.js";
import { reactive, ref, watch } from "vue";

export type VarInfo = {
  name: string,
  error: Decimal,
  values: Decimal[],
}

export class VarTable {
  private length: number = 1;
  public variables: VarInfo[] = [];

  public getLength(): number { return this.length; }

  private stretchSample(sample: Decimal[]): Decimal[] {
    if (sample.length >= length)
      sample.length = this.length;
    else
      while (sample.length != this.length)
        sample.push(new Decimal(0))
    return sample;
  }

  public addVariable(name: string) {
    this.variables.push({
      name,
      error: new Decimal(0),
      values: this.stretchSample([])
    })
  }

  public hasVariable(name: string) {
    return this.variables.find((varInfo) => varInfo.name === name) != null
  }

  public removeVariable(name: string) {
    this.variables = this.variables.filter((varInfo) => varInfo.name !== name)
  }

  public setLength(length: number) {
    this.length = length;
    for (const varInfo of this.variables)
      this.stretchSample(varInfo.values)
  }

  public buildContext(sampleId: number): ExecutionContext {
    if (sampleId >= this.length)
      throw new Error(`sampleId is out of range: ${sampleId} >= ${this.length}`);

    const list = <Record<string, Decimal>>{};
    for (const varInfo of this.variables)
      list[varInfo.name] = varInfo.values[sampleId]!;

    return new ExecutionContext(list);
  }

  public applyNewVariables(vars: Set<string>) {
    for (const varInfo of this.variables)
      if (!vars.has(varInfo.name))
        this.removeVariable(varInfo.name);      

    for (const varName of vars)
      if (!this.hasVariable(varName))
        this.addVariable(varName)
  }
}

function detectVariableList(formula: Formula): Set<string> {
  let result = new Set<string>();
  for (const child of formula.iterate())
    if (child instanceof VariableFormula)
      result.add(child.getVariableName())
  return result;
}

export default function useIndirectError() {
  const formula = ref("");
  const table = reactive<VarTable>(new VarTable());
  const error = ref<AlgorithmError | null>(null);

  watch(formula, (formula) => {
    let parsed = throwAlgorithmError(
      () => parseFormulaFromLatex(formula),
      (e) => error.value = e,
    )
    if (!parsed) return;
    error.value = null;
    const vars = detectVariableList(parsed)
    table.applyNewVariables(vars);
  })

  return {
    formula,
    table,
    error,
  }
}

