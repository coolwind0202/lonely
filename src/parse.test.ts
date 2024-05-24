import { tokenize } from "./tokenize";
import { statement } from "./parse";

console.dir(statement(tokenize("(A∧(￢￢B∨(C→D)))")), { depth: null });
