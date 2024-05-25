import { Token } from "./tokenize";

type _BaseInfixNode = {
  left: ExpressionNode;
  right: ExpressionNode;
};

type OrNode = _BaseInfixNode & {
  kind: "Or";
};

type AndNode = _BaseInfixNode & {
  kind: "And";
};

type ImplicationNode = _BaseInfixNode & {
  kind: "Implication";
};

type NotNode = {
  kind: "Not";
  negated: ExpressionNode;
};

type IdentifierNode = {
  kind: "Ident";
  name: string;
};

type InfixNode = OrNode | AndNode | ImplicationNode;
type OperatorNode = InfixNode | NotNode;
type ExpressionNode = OperatorNode | IdentifierNode;

export type AstNode = ExpressionNode;

type ParserState = {
  cursor: number;
  tokens: Token[];
  ast: AstNode;
};

const log = (depth: number, content: string) => {
  // console.log(" ".repeat(depth), content);
};

export const statement = (tokens: Token[]) => {
  const initialState: ParserState = {
    cursor: 0,
    tokens,
    ast: {
      kind: "Ident",
      // temporary root node
      name: "A",
    },
  };

  log(0, "Statement");

  const parserState = expression(initialState, { depth: 1 });
  if (!isAllTokensConsumed(parserState)) throw new Error();

  return parserState;
};

export const isAllTokensConsumed = (state: ParserState) => {
  const EOFTrimmedTokens = state.tokens.slice(0, -1);
  return state.cursor == EOFTrimmedTokens.length;
};

const getHeadToken = (state: ParserState): Token => {
  if (state.cursor < state.tokens.length) {
    return state.tokens[state.cursor];
  } else {
    return {
      kind: "EOF",
    };
  }
};

const group = (
  state: ParserState,
  { depth }: { depth: number }
): ParserState => {
  log(depth, "Group");
  expect(state, "LeftParen");

  const afterLeftParen = nextState(state);
  const afterLeftExp = expression(afterLeftParen, { depth: depth + 1 });

  const operatorToken = expectInfixOperator(afterLeftExp, { depth: depth + 1 });
  const afterOperator = nextState(afterLeftExp);

  const afterRightExp = expression(afterOperator, { depth: depth + 1 });
  expect(afterRightExp, "RightParen");
  const afterRightParen = nextState(afterRightExp);

  return {
    ...afterRightParen,
    ast: {
      kind: operatorToken.kind,
      left: afterLeftExp.ast,
      right: afterRightExp.ast,
    },
  };
};

const expression = (
  state: ParserState,
  { depth }: { depth: number }
): ParserState => {
  const head = getHeadToken(state);
  log(depth, "Expression");

  switch (head.kind) {
    case "Ident":
      const afterIdent = nextState(state);
      log(depth + 1, `Ident ${head.name}`);
      return {
        ...afterIdent,
        ast: {
          kind: "Ident",
          name: head.name,
        },
      };
    case "LeftParen":
      return group(state, { depth: depth + 1 });
    case "Not":
      const afterNot = nextState(state);
      log(depth + 1, "Not");

      const afterNegatedExp = expression(afterNot, { depth: depth + 1 });

      return {
        ...afterNegatedExp,
        ast: {
          kind: "Not",
          negated: afterNegatedExp.ast,
        },
      };
    default:
      throw new Error();
  }
};

const expectInfixOperator = (
  state: ParserState,
  { depth }: { depth: number }
) => {
  const head = getHeadToken(state);
  log(depth, `Infix Operator ${head.kind}`);

  switch (head.kind) {
    case "And":
    case "Or":
    case "Implication":
      return head;
    default:
      throw new Error();
  }
};

const expect = (state: ParserState, kind: Token["kind"]) => {
  const head = getHeadToken(state);

  if (head.kind == kind) {
    return head;
  } else {
    throw new Error("Head don't satisfy expectation");
  }
};

const nextState = (state: ParserState): ParserState => {
  return {
    ...state,
    cursor: state.cursor + 1,
  };
};
