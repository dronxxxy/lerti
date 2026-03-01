import { expect, test } from "vitest";
import { DerivativeContext } from "../formula";
import { parseFormulaFromAscii } from "../parse/ascii";
import { DefaultOptimisator } from "../optimisators/default";

function testDerivative(source: string, output: string) {
  test(`derivative: ${source}`, () => {
    const formula = parseFormulaFromAscii(source);
    const derivative = formula.buildDerivative(new DerivativeContext("x"));
    const outputFormula = parseFormulaFromAscii(output);
    expect((derivative && (DefaultOptimisator.optimise(derivative) ?? derivative))
      ?.equals(DefaultOptimisator.optimise(outputFormula) ?? outputFormula)).toBeTruthy();
  })
}

testDerivative("x + 1", "1")
testDerivative("x * 6", "1*6")
testDerivative("6 * x", "1*6")
testDerivative("x * (2 * x)", "2*x+2*x")
testDerivative("1/x", "(-1*1)/(x^2)")
testDerivative("x/1", "1/1")
testDerivative("x/(x^2)", "(1*(x^2)-x*(x^2)*1/x*2)/((x^2)^2)")
testDerivative("ln(x)", "x^-1")
testDerivative("ln(2*x)", "1*2/(2*x)")
testDerivative("-(x*2)", "-1*2")

