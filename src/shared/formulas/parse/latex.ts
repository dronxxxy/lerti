import { AlgorithmError } from "@/shared/error";
import { Node, parse } from "@scicave/math-latex-parser";
import type { Formula } from "../formula";
import { AddOperatorFormula, DivideOperatorFormula, MultiplyOperatorFormula, SubtractOperatorFormula } from "../impl/operators";
import { ConstantNumberFormula } from "../impl/constant";
import Decimal from "decimal.js";
import { VariableFormula } from "../impl/variable";
import { PowFormula } from "../impl/pow";
import { LnFormula } from "../impl/ln";
import { UnaryMinusFormula } from "../impl/unary";

export class InvalidLatexException extends AlgorithmError {
  constructor(exception: string) {
    super(`failed to parse latex expression: ${exception}`,
      "Неверно введена формула",
      `Не удалось распознать содержимое формулы: ${exception}`
    )
  }
}

export class UnknownLatexFeature extends AlgorithmError {
  constructor(kind: string, description: string, node: Node) {
    super(`unsupported latex feature: ${kind}\n${JSON.stringify(node)}`,
      "Неподдерживаемая функция",
      description
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
      throw new UnknownLatexFeature(
        `OperatorNode(prefix).name = ${node.name}`,
        `Неизвестный бинарный оператор "${node.name}"`,
        node
      );
    return new Operator(left, right);
  }

  if (node.operatorType === 'prefix') {
    const inner = astNodeParse(node.args[0]);
    const Operator = {
      '-': UnaryMinusFormula,
    }[node.name ?? ""]
    if (Operator === undefined)
      throw new UnknownLatexFeature(
        `OperatorNode(infix).name = ${node.name}`,
        `Неизвестный унарный оператор "${node.name}"`,
        node
      );
    return new Operator(inner);
  }

  throw new UnknownLatexFeature(
    `OperatorNode.operatorType = ${node.operatorType}`,
    `Оператор "${node.name}" не реализован`,
    node
  );
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
    throw new UnknownLatexFeature(
      `FunctionNode.args.length = ${node.args.length}`,
      "Поддерживаются функции только с одним аргументом",
      node
    );
  const Function = {
    "ln": LnFormula,
  }[node.name!];
  if (Function === undefined)
    throw new UnknownLatexFeature(
      `FunctionNode.name = ${node.name}`,
      `Неизвестная функция "${node.name}"`,
      node
    );
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
    default: throw new UnknownLatexFeature(
      `Node.type = ${node.type}`,
      `Неизвестная конструкция "${node.type}"`,
      node
    );
  }
}

export function parseFormulaFromLatex(latex: string): Formula {
  let node;
  try {
    node = parse(latex, {
      autoMult: true,
      keepParentheses: false,
      functions: [],
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
    throw new InvalidLatexException(e instanceof Error ? e.message : String(e));
  }
  return astNodeParse(node);
}