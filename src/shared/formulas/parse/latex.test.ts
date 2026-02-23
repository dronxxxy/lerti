import { expect, test } from "vitest";
import { parseFormulaFromLatex } from "./latex";
import { AsciiFormulaWriter } from "../writers/ascii";

function testParsing(source: string, target: string) {
  test(`parse "${source}"`, () => {
    const formula = parseFormulaFromLatex(source);
    const writer = new AsciiFormulaWriter();
    formula.write(writer);
    expect(writer.get()).toBe(target);
  })
}

testParsing(
  "2 \\cdot x - 3y / 8 + 3 * 5",
  "(((2)*(x))-(((3)*(y))/(8)))+((3)*(5))"
)