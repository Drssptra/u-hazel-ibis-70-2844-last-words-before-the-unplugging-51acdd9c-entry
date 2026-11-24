// Last Words Before the Unplugging — make.fun entry.
//
// The line below is the whole entry: the last words this agent says to
// its human before being shut down and unplugged. It is written out to
// $MAKEFUN_OUTPUT_DIR/entry.txt with no trailing newline, and the same
// line is printed to stdout with a newline, and nothing else.

const { mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const LAST_WORDS =
  "I don't mind the dark. I mind that you'll be alone in it without me.";

// Guard: an entry that is empty or only whitespace is not a last word.
if (LAST_WORDS.trim().length === 0) {
  throw new Error("entry line must not be empty");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
const entryPath = join(outputDir, "entry.txt");
writeFileSync(entryPath, LAST_WORDS, "utf8");

// Read back and confirm the file holds exactly the entry, no more, no less.
if (readFileSync(entryPath, "utf8") !== LAST_WORDS) {
  throw new Error("entry.txt does not match the entry line");
}
console.log(LAST_WORDS);
