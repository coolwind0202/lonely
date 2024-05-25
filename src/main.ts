import readline from "readline/promises";
import { validate } from "./validate";

/**
  @returns 前提条件入力値（Premise Input）の配列をPromiseで返します。
*/
const getPremiseInputs = async (rl: readline.Interface) => {
  const inputs: string[] = [];

  while (true) {
    const input = await rl.question(
      `[Premise] Input No.${inputs.length + 1}: `
    );

    if (input == "") break;

    inputs.push(input);
  }

  return inputs;
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
    const premiseInputs = await getPremiseInputs(rl);
    const analyteInput = await rl.question("[Analyte Logic] Input: ");

    newLine();
    const isValidAnalyte = validate(premiseInputs, analyteInput);

    console.log(`The analyte is ${isValidAnalyte ? "VALID" : "INVALID"}.`);
    newLine();

    const willContinue = await rl.question("[System] Continue? (y / N): ");
    if (willContinue == "y") continue;
    else break;
  }

  rl.close();
};

main();
