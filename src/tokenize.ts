type EOFToken = {
  kind: "EOF";
};

type IdentifierToken = {
  kind: "Ident";
  name: string;
};

type AndOperatorToken = {
  kind: "And";
};

type OrOperatorToken = {
  kind: "Or";
};

type ImplicationOperatorToken = {
  kind: "Implication";
};

type LeftParenToken = {
  kind: "LeftParen";
};

type RightParenToken = {
  kind: "RightParen";
};

type NotOperatorToken = {
  kind: "Not";
};

type InfixOperatorToken =
  | AndOperatorToken
  | OrOperatorToken
  | ImplicationOperatorToken;
type ParenToken = LeftParenToken | RightParenToken;
type SymbolToken = InfixOperatorToken | ParenToken | NotOperatorToken;

type ConvertableToken = IdentifierToken | SymbolToken;
export type Token = EOFToken | ConvertableToken;

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = [];

  for (let cursor = 0; cursor < input.length; ) {
    const head = input.substring(cursor);

    const attempt = convert(head);
    if (attempt.isSucceeded) {
      cursor += attempt.seekableLength;
      tokens.push(attempt.token);
      continue;
    }

    throw new Error(`Failed to convert: ${head} (index = ${cursor})`);
  }

  tokens.push({
    kind: "EOF",
  });

  return tokens;
};

type ConvertResult =
  | {
      isSucceeded: false;
    }
  | {
      isSucceeded: true;
      token: ConvertableToken;
      seekableLength: number;
    };

const convert = (head: string): ConvertResult => {
  const attempts = [convertToSymbolToken(head), convertToIdentifierToken(head)];

  for (const attempt of attempts) {
    if (attempt.isSucceeded) return attempt;
  }

  return {
    isSucceeded: false,
  };
};

const convertToSymbolToken = (head: string): ConvertResult => {
  if (head.length == 0)
    return {
      isSucceeded: false,
    };

  const symbolAndTokenKindTable: { [key: string]: SymbolToken["kind"] } = {
    "∧": "And",
    "∨": "Or",
    "￢": "Not",
    "→": "Implication",
    "(": "LeftParen",
    ")": "RightParen",
  };

  const tokenKind = symbolAndTokenKindTable[head[0]];
  if (tokenKind == undefined)
    return {
      isSucceeded: false,
    };

  return {
    isSucceeded: true,
    token: {
      kind: tokenKind,
    },
    seekableLength: 1,
  };
};

const isValidIdentifierName = (name: string) => {
  if (name.length == 0) return false;

  return name[0].match(/[A-Z]/);
};

const convertToIdentifierToken = (head: string): ConvertResult => {
  if (!isValidIdentifierName(head))
    return {
      isSucceeded: false,
    };

  return {
    isSucceeded: true,
    token: {
      kind: "Ident",
      name: head[0],
    },
    seekableLength: 1,
  };
};
