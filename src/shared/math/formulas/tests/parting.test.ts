import { expect, test } from "vitest";
import { parseFormulaFromAscii } from "../parse/ascii"

function testConvertion(source: string) {
  test(`convert: ${source}`, () => {
    const formula = parseFormulaFromAscii(source);
    const result = formula.toLatex();
    expect(result).toBe(source);
  })
}

testConvertion("2*x")
testConvertion("2+x")
testConvertion("2/x")
testConvertion("2-x")
testConvertion("2*x*y")
testConvertion("2/x/y")
testConvertion("(2+x)*y")
testConvertion("(2+x)/y")
testConvertion("y/(2-x)")
testConvertion("y^(2-x)")
testConvertion("(y-4)^(2-x)")
testConvertion("(y-4)^(-2)")
testConvertion("-4^(-2)")
testConvertion("(-4)^(-2)")
testConvertion("ln(-4)^(-2)")
testConvertion("2+(-4)")
