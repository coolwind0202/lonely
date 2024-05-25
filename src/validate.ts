import { isValidAst } from "./evaluate";
import { AstNode, statement } from "./parse";
import { InfixOperatorToken, Token, tokenize } from "./tokenize";

const parseTokens = (tokens: Token[]) => {
  try {
    const parserState = statement(tokens);
    return parserState.ast;
  } catch {
    const parenFilledTokens = fillLeftRightParen(tokens);
    const parserState = statement(parenFilledTokens);
    return parserState.ast;
  }
};

const fillLeftRightParen = (tokens: Token[]): Token[] => {
  const identifierTokens = tokens.filter((token) => token.kind == "Ident");
  if (identifierTokens.length == 1) return tokens;

  const tokensEOFTrimmed = tokens.slice(0, tokens.length - 1);

  return [
    {
      kind: "LeftParen",
    },
    ...tokensEOFTrimmed,
    { kind: "RightParen" },
    { kind: "EOF" },
  ];
};

export const validate = (premises: string[], inference: string): boolean => {
  const premiseNode = getPremiseNode(premises);
  const analyteNode = parseTokens(tokenize(inference));

  const joinedAnalyte = joinWithInfixOperator(
    [premiseNode, analyteNode],
    "Implication"
  );

  const isValidAnalyte = isValidAst(joinedAnalyte);
  return isValidAnalyte;
};

const joinWithInfixOperator = (
  nodes: AstNode[],
  kind: InfixOperatorToken["kind"]
): AstNode => {
  if (nodes.length == 1) return nodes[0];

  return nodes.reduce((prev, node) => ({
    kind: kind,
    left: prev,
    right: node,
  }));
};

const getPremiseNode = (premises: string[]) => {
  const premiseNodes = premises
    .map((premise) => tokenize(premise))
    .map((tokens) => parseTokens(tokens));

  const joinedNode = joinWithInfixOperator(premiseNodes, "And");
  return joinedNode;
};
