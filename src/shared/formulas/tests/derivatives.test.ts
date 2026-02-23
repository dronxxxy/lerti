import { expect, test } from "vitest";
import { Formula } from "../formula";
import { AsciiFormulaWriter } from "../writers/ascii";
import { AddOperatorFormula, MultiplyOperatorFormula } from "../impl/operators";
import { VariableFormula } from "../impl/variable";
import { ConstantNumberFormula } from "../impl/constant";
import Decimal from "decimal.js";
import { LnFormula } from "../impl/ln";

function testDerivative(formula: Formula, output: string) {
  const writer = new AsciiFormulaWriter();
  const derivative = formula.buildDerivative();
  const content = derivative ? derivative.write(writer) : "0";
  expect(writer.get()).toBe(output);
}

test("x + y", () =>
  testDerivative(
    new AddOperatorFormula(new VariableFormula("x"), new VariableFormula("y")),
    "1+1",
  ));

test("ln(x * (2 * z)) * (1 + 2 + y)", () =>
  testDerivative(
    new MultiplyOperatorFormula(
      new LnFormula(
        new MultiplyOperatorFormula(
          new VariableFormula("x"),
          new MultiplyOperatorFormula(
            new ConstantNumberFormula(new Decimal(2)),
            new VariableFormula("z"),
          ),
        ),
      ),
      new AddOperatorFormula(
        new AddOperatorFormula(
          new ConstantNumberFormula(new Decimal(1)),
          new ConstantNumberFormula(new Decimal(2)),
        ),
        new VariableFormula("y"),
      ),
    ),
    "((((1*(2*z))+((1*2)*x))/(x*(2*z)))*((1+2)+y))+(1*ln(x*(2*z)))",
  ));
