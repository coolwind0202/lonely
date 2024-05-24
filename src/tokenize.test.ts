import { Token, tokenize } from "./tokenize";

const expectedTokens: Token[] = [
  { kind: "LeftParen" },
  { kind: "Ident", name: "A" },
  { kind: "And" },
  { kind: "LeftParen" },
  { kind: "Not" },
  { kind: "Not" },
  { kind: "Ident", name: "B" },
  { kind: "Or" },
  { kind: "LeftParen" },
  { kind: "Ident", name: "C" },
  { kind: "Implication" },
  { kind: "Ident", name: "D" },
  { kind: "RightParen" },
  { kind: "RightParen" },
  { kind: "RightParen" },
  { kind: "EOF" },
];

const tokens = tokenize("(A∧(￢￢B∨(C→D)))");

for (let i = 0; i < tokens.length; i++) {
  const expectedToken = expectedTokens[i];
  const token = tokens[i];

  if (expectedToken.kind != token.kind) {
    console.error(`Expected token kind was ${expectedTokens[i].kind}`);
    break;
  }

  if (token.kind == "Ident") {
    if (expectedToken.kind == "Ident") {
      if (token.name != expectedToken.name) {
        console.error(
          `Expected token name was ${expectedToken.name} (got=${token.name})`
        );
        break;
      }
    } else {
      console.error("unreachable");
      break;
    }
  }
}
