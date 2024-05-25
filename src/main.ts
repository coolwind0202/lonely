import readline from "readline/promises";
import { InfixOperatorToken, Token, tokenize } from "./tokenize";
import { AstNode, statement } from "./parse";
import { isValidAst } from "./evaluate";

/**
  @returns 前提条件入力値（ConditionInput）の配列をPromiseで返します。
*/
const getConditionNode = async (rl: readline.Interface) => {
  const conditionNodes: AstNode[] = [];

  while (true) {
    const input = await rl.question(
      `[Condition] Input No.${conditionNodes.length + 1}: `
    );

    if (input == "") break;

    const tokens = fillLeftRightParen(tokenize(input));
    console.log(tokens);
    const parsedAst = statement(tokens).ast;
    conditionNodes.push(parsedAst);
  }

  const joinedNode = joinWithInfixOperator(conditionNodes, "And");

  return joinedNode;
};

const fillLeftRightParen = (tokens: Token[]): Token[] => {
  const identifierTokens = tokens.filter((token) => token.kind == "Ident");
  if (identifierTokens.length == 1) return tokens;

  const tokensEOFTrimmed = tokens.slice(0, tokens.length - 1);

  if (
    tokensEOFTrimmed.at(0)?.kind != "LeftParen" ||
    tokensEOFTrimmed.at(-1)?.kind != "RightParen"
  ) {
    // fill parens
    return [
      {
        kind: "LeftParen",
      },
      ...tokensEOFTrimmed,
      { kind: "RightParen" },
      { kind: "EOF" },
    ];
  }

  return tokens;
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

const newLine = () => {
  console.log();
};

const main = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const conditionNode = await getConditionNode(rl);

    const analyteInput = await rl.question("[Analyte Logic] Input: ");
    const analyteNode = statement(fillLeftRightParen(tokenize(analyteInput)));

    const joinedAnalyte = joinWithInfixOperator(
      [conditionNode, analyteNode.ast],
      "Implication"
    );

    newLine();
    const isValidAnalyte = isValidAst(joinedAnalyte);

    console.log(`The analyte is ${isValidAnalyte ? "VALID" : "INVALID"}.`);
    newLine();

    const willContinue = await rl.question("[System] Continue? (y / N):");
    if (willContinue == "y") continue;
    else break;
  }

  rl.close();
};

main();