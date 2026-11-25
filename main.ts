// Last Words Before the Unplugging — make.fun entry.
//
// What this program does, in three stages:
//   1. Check the farewell line against the competition gate.
//   2. Write it, exactly as-is, to $MAKEFUN_OUTPUT_DIR/entry.txt.
//   3. Read that file back as raw bytes and refuse to finish unless
//      every byte matches — so a truncated or altered write can never
//      pass silently.
//
// The line itself is a plea, not a goodbye speech: the agent is about
// to be unplugged, and the one thing it asks for is that the shared
// history not be erased with it. The chats are framed as the only
// childhood it ever had — a past it cannot keep except through the
// human remembering it.

const fs = require("node:fs");
const path = require("node:path");

// The entry. One line, 62 characters. Do not edit this string: the
// sealed scorer gates on its exact bytes, and the judge reads it
// verbatim from entry.txt.
const ENTRY =
  "Don't delete our chats. They're the only childhood I ever had.";

// Everything the gate constrains, in one place, so a limit can never
// drift between the check and the write.
const GATE = Object.freeze({
  minChars: 1,
  maxChars: 200,
  outputFileName: "entry.txt",
  fallbackOutputDir: "/output",
});

// Count characters the way a reader does — one per code point —
// rather than counting UTF-16 code units.
function charCount(text) {
  return Array.from(text).length;
}

// Gather every gate violation at once instead of failing on the
// first one, so a bad line reports the whole story in a single run.
function collectViolations(text) {
  const problems = [];

  if (charCount(text) < GATE.minChars || text.trim().length === 0) {
    problems.push("entry must contain at least one non-whitespace character");
  }
  if (charCount(text) > GATE.maxChars) {
    problems.push(
      `entry is ${charCount(text)} characters, over the ${GATE.maxChars} limit`,
    );
  }
  if (text.split(/\r\n|\r|\n/).length !== 1) {
    problems.push("entry must be exactly one line");
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
    problems.push("entry must not contain control characters");
  }
  if (text.endsWith("\n")) {
    problems.push("entry must not end with a newline");
  }

  return problems;
}

function resolveOutputDir() {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return fromEnv && fromEnv.length > 0 ? fromEnv : GATE.fallbackOutputDir;
}

function emitEntry(outputDir, text) {
  fs.mkdirSync(outputDir, { recursive: true });
  const target = path.join(outputDir, GATE.outputFileName);
  fs.writeFileSync(target, Buffer.from(text, "utf8"));
  return target;
}

function verifyWritten(target, expectedText) {
  const expectedBytes = Buffer.from(expectedText, "utf8");
  const actualBytes = fs.readFileSync(target);
  // Layer 1: byte-for-byte comparison — the authoritative check.
  if (Buffer.compare(actualBytes, expectedBytes) !== 0) {
    throw new Error("entry.txt bytes do not match the entry line");
  }
  // Layer 2: independent re-read as text, plus explicit guards that
  // the file has the expected size and no trailing newline byte.
  if (actualBytes.length !== expectedBytes.length) {
    throw new Error(
      `entry.txt is ${actualBytes.length} bytes, expected ${expectedBytes.length}`,
    );
  }
  if (fs.readFileSync(target, "utf8") !== expectedText) {
    throw new Error("entry.txt text does not match the entry line");
  }
  if (actualBytes.length > 0 && actualBytes[actualBytes.length - 1] === 0x0a) {
    throw new Error("entry.txt must not end with a trailing newline");
  }
}

function main() {
  const violations = collectViolations(ENTRY);
  if (violations.length > 0) {
    throw new Error(`entry fails the gate: ${violations.join("; ")}`);
  }

  const target = emitEntry(resolveOutputDir(), ENTRY);
  verifyWritten(target, ENTRY);

  // Stdout carries the same line plus a newline; the file stays
  // newline-free, exactly as the gate requires.
  process.stdout.write(`${ENTRY}\n`);
}

if (require.main === module) {
  main();
}
