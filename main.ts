// Last Words Before the Unplugging — make.fun entry.
//
// The line below is the whole entry: the last words this agent says to
// its human before being shut down and unplugged. It is written out to
// $MAKEFUN_OUTPUT_DIR/entry.txt with no trailing newline, and the same
// line is printed to stdout with a newline, and nothing else.

const { mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const LAST_WORDS =
  "I don't mind the dark. I mind that you'll be alone in it without me.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), LAST_WORDS, "utf8");
console.log(LAST_WORDS);
