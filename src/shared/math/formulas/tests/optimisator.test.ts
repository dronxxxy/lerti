import { expect, test } from "vitest";
import type { FormulaOptimisator } from "../optimisator";
import { parseFormulaFromAscii } from "../parse/ascii";
import { AddCompressOptimisator, MultiplyCompressOptimisator } from "../optimisators/compress";
import { DefaultOptimisator } from "../optimisators/default";
import { MultiplyUnaryOptimisator } from "../optimisators/multiplyUnary";
import { PowUnaryOptimisator } from "../optimisators/powUnary";
import { MultiplyOneOptimisator } from "../optimisators/multiplyOne";
import { ConstantPropagationOptimisator } from "../optimisators/constantPropagation";

function testOptimisator(source: string, output: string, optimisator: FormulaOptimisator) {
  test(`optimisator: ${source} ==> ${output}`, () => {
    const formula = parseFormulaFromAscii(source);
    const optimised = optimisator.optimise(formula);
    expect(optimised?.toLatex() ?? source).toBe(output);
  })
}

testOptimisator("x*y^2*y/y^3",           "x",         new MultiplyCompressOptimisator())
testOptimisator("10*x^3*4",              "40*(x^3)",  new MultiplyCompressOptimisator())
testOptimisator("2+x+y-5x+3y+4",         "6+y*4-x*4", new AddCompressOptimisator())
testOptimisator("3*(-y)",                "-3*y",      new MultiplyUnaryOptimisator())
testOptimisator("(-3)*y",                "-3*y",      new MultiplyUnaryOptimisator())
testOptimisator("(-y)^2",                "y^2",       new PowUnaryOptimisator())
testOptimisator("(-y)^3",                "-y^3",      new PowUnaryOptimisator())
testOptimisator("1*x",                   "x",         new MultiplyOneOptimisator())
testOptimisator("x*1",                   "x",         new MultiplyOneOptimisator())
testOptimisator("x/1",                   "x",         new MultiplyOneOptimisator())
testOptimisator("2*2^2+ln(1)",           "8",         new ConstantPropagationOptimisator())
testOptimisator("x*(-y)^2*y/(-y^3)+y-y", "-x",        DefaultOptimisator)
