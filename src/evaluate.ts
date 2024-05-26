import { AstNode } from "./parse";
import { IdentifierToken, Token } from "./tokenize";

const evaluate = (
  ast: AstNode,
  identifierValues: Map<string, boolean>
): boolean => {
  switch (ast.kind) {
    case "Ident":
      const value = identifierValues.get(ast.name);
      if (value === undefined) throw new Error();
      return value;
    case "And":
    case "Or":
    case "Implication":
      const leftValue = evaluate(ast.left, identifierValues);
      const rightValue = evaluate(ast.right, identifierValues);

      switch (ast.kind) {
        case "And":
          return leftValue && rightValue;
        case "Or":
          return leftValue || rightValue;
        case "Implication":
          return !leftValue || rightValue;
      }
    case "Not":
      const negatedValue = evaluate(ast.negated, identifierValues);
      return !negatedValue;
  }
};

const extractIdentifierToken = (ast: AstNode): IdentifierToken[] => {
  switch (ast.kind) {
    case "Or":
    case "And":
    case "Implication":
      return [
        ...extractIdentifierToken(ast.left),
        ...extractIdentifierToken(ast.right),
      ];
    case "Ident":
      return [ast];
    case "Not":
      return extractIdentifierToken(ast.negated);
  }
};

export const identValueCombination = (
  ast: AstNode,
  identifiers: string[],
  identifierValues: Map<string, boolean>
): boolean => {
  if (identifiers.length == 0) {
    const ret = evaluate(ast, identifierValues);
    // console.log(`${ret} (when`, identifierValues, ")");
    return ret;
  }

  const [identifierName, ...rest] = identifiers;
  if (identifierName == undefined) {
    throw new Error();
  }

  identifierValues.set(identifierName, false);
  const ifZero = identValueCombination(ast, rest, identifierValues);

  identifierValues.set(identifierName, true);
  const ifOne = identValueCombination(ast, rest, identifierValues);

  return ifOne && ifZero;
};

export const isValidAst = (ast: AstNode) => {
  const identifierNames = Array.from(
    new Set(extractIdentifierToken(ast).map((token) => token.name))
  );
  const isValid = identValueCombination(ast, identifierNames, new Map());

  return isValid;
};
