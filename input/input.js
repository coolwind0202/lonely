const fs = require("fs");
const readline = require("readline");
const { validate } = require("../out/validate");

const readStream = fs.createReadStream("./task.txt");

const rl = readline.createInterface({
  input: readStream,
  output: process.stdout,
});

let i = 0;

rl.on("line", (input) => {
  i++;

  const expressions = input.trim().split(/\s+/);

  const premises = expressions.slice(0, -1);
  const inference = expressions[expressions.length - 1];

  console.log(
    `(${i}) ${validate(premises, inference) ? "Valid" : "Invalid"}\n`
  );
});
