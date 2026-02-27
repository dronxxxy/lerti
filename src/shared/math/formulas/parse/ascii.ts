import { convertAsciiMathToLatex } from "mathlive";
import { parseFormulaFromLatex } from "./latex";
import type { Formula } from "../formula";

export function parseFormulaFromAscii(ascii: string): Formula {
  return parseFormulaFromLatex(convertAsciiMathToLatex(ascii))
}
