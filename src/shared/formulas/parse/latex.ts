import { AlgorithmError } from "@/shared/error";
import { Node, parse } from "@scicave/math-latex-parser";
import type { Formula } from "../formula";
import { AddOperatorFormula, DivideOperatorFormula, MultiplyOperatorFormula, SubtractOperatorFormula } from "../impl/operators";
import { ConstantNumberFormula } from "../impl/constant";
import Decimal from "decimal.js";
import { VariableFormula } from "../impl/variable";
import { PowFormula } from "../impl/pow";

class InvalidLatexException extends AlgorithmError {
  constructor () {
    super("failed to parse latex expression", 
      "Неверно введена формула",
      "Не удалось распознать содержимое формулы. Проверьте ещё раз"
    )
  }
}

class UnknownLatexFeature extends AlgorithmError {
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

function astNodeParseNumber(node: Node): Formula {
  return new ConstantNumberFormula(new Decimal(node.value!));
}

function astNodeParseId(node: Node): Formula {
  return new VariableFormula(node.name!);
}

function astNodeParse(node: Node): Formula {
  switch (node.type) {
    case 'operator': return astNodeParseOperator(node);
    case 'automult': return astNodeParseAutomult(node);
    case 'number': return astNodeParseNumber(node);
    case 'id': return astNodeParseId(node);
    default: throw new UnknownLatexFeature(`Node.type = ${node.type}`, node);
  }
}

export function parseFormulaFromLatex(latex: string): Formula {
  const node = parse(latex, {
    autoMult: true,
    keepParentheses: false,
    functions: [],
    builtinFunctions: [],
    extra: {
      memberExpressions: false,
      sets: false,
      matrices: false,
      tuples: false,
      intervals: false,
      ellipsis: false
    }
  });
  return astNodeParse(node);
}