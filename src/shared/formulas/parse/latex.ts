import { AlgorithmError } from "@/shared/error";
import { Node, parse } from "@scicave/math-latex-parser";
import type { Formula } from "../formula";
import { AddOperatorFormula, DivideOperatorFormula, MultiplyOperatorFormula, SubtractOperatorFormula } from "../impl/operators";
import { ConstantNumberFormula } from "../impl/constant";
import Decimal from "decimal.js";
import { VariableFormula } from "../impl/variable";
import { PowFormula } from "../impl/pow";
import { LnFormula } from "../impl/ln";

export class InvalidLatexException extends AlgorithmError {
  constructor (exception: string) {
    super(`failed to parse latex expression: ${exception}`, 
      "Неверно введена формула",
      "Не удалось распознать содержимое формулы. Проверьте ещё раз"
    )
  }
}

export class UnknownLatexFeature extends AlgorithmError {
  constructor (kind: string, node: Node) {
    super(`unsupported latex feature: ${kind}\n${JSON.stringify(node)}`, 
      "Неподдерживаемая функция",
      `Вы используете фичу latex, которая не реализована (${kind})`
    )
  }
}

function astNodeParseOperator(node: Node): Formula {
  if (node.operatorType === 'infix') {
    const left = astNodeParse(node.args[0]);
    const right = astNodeParse(node.args[1]);
    const Operator = {
      '-': SubtractOperatorFormula,
      '+': AddOperatorFormula,
      '/': DivideOperatorFormula,
      '*': MultiplyOperatorFormula,
      '^': PowFormula,
      'cdot': MultiplyOperatorFormula,
    }[node.name ?? ""]; 
    if (Operator === undefined) 
      throw new UnknownLatexFeature(`OperatorNode.name = ${node.name}`, node);
    return new Operator(left, right);
  }

  throw new UnknownLatexFeature(`OperatorNode.operatorType = ${node.operatorType}`, node);
}

function astNodeParseAutomult(node: Node): Formula {
  const left = astNodeParse(node.args[0]);
  const right = astNodeParse(node.args[1]);
  return new MultiplyOperatorFormula(left, right);
}

function astNodeParseFrac(node: Node): Formula {
  const left = astNodeParse(node.args[0]);
  const right = astNodeParse(node.args[1]);
  return new DivideOperatorFormula(left, right);
}

function astNodeParseNumber(node: Node): Formula {
  return new ConstantNumberFormula(new Decimal(node.value!));
}

function astNodeParseId(node: Node): Formula {
  return new VariableFormula(node.name!);
}

function astNodeParseFunction(node: Node): Formula {
  if (node.args.length != 1)
    throw new UnknownLatexFeature(`FunctionNode.args.length = ${node.args.length}`, node);
  const Function = {
    "ln": LnFormula,
  }[node.name!];
  if (Function === undefined) 
    throw new UnknownLatexFeature(`FunctionNode.name = ${node.name}`, node);
  const arg = astNodeParse(node.args[0]);
  return new Function(arg);
}

function astNodeParse(node: Node): Formula {
  switch (node.type) {
    case 'operator': return astNodeParseOperator(node);
    case 'automult': return astNodeParseAutomult(node);
    case 'number': return astNodeParseNumber(node);
    case 'id': return astNodeParseId(node);
    case 'function': return astNodeParseFunction(node);
    case 'frac': return astNodeParseFrac(node);
    default: throw new UnknownLatexFeature(`Node.type = ${node.type}`, node);
  }
}

export function parseFormulaFromLatex(latex: string): Formula {
  let node;
  try {
    node = parse(latex, {
      autoMult: true,
      keepParentheses: false,
      functions: [],
      builtinFunctions: ["ln"],
      extra: {
        memberExpressions: false,
        sets: false,
        matrices: false,
        tuples: false,
        intervals: false,
        ellipsis: false
      }
    });
  } catch (e) {
    throw new InvalidLatexException(String(e));
  }
  return astNodeParse(node);
}