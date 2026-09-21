import assert from "node:assert/strict";
import { test } from "node:test";

import { compareStrings, type DiffChange, type DiffGranularity } from "./string-diff.ts";

function textA(changes: DiffChange[]): string {
  return changes.map((change) => change.a).join("");
}

function textB(changes: DiffChange[]): string {
  return changes.map((change) => change.b).join("");
}

function lcsLength(left: string[], right: string[], equals: (leftToken: string, rightToken: string) => boolean): number {
  const columns = right.length + 1;
  let previous = new Uint32Array(columns);
  let current = new Uint32Array(columns);

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      if (equals(left[row - 1] ?? "", right[column - 1] ?? "")) {
        current[column] = (previous[column - 1] ?? 0) + 1;
      } else {
        current[column] = Math.max(previous[column] ?? 0, current[column - 1] ?? 0);
      }
    }

    [previous, current] = [current, previous];
    current.fill(0);
  }

  return previous[right.length] ?? 0;
}

test("identical strings produce one equal change", () => {
  const result = compareStrings("same text", "same text");

  assert.equal(result.identical, true);
  assert.equal(result.removed, 0);
  assert.equal(result.added, 0);
  assert.equal(result.firstDifferenceIndex, null);
  assert.equal(result.approximate, false);
  assert.deepEqual(result.changes, [
    { type: "equal", a: "same text", b: "same text", count: 1, ignored: false },
  ]);
});

test("empty strings are identical and have no changes", () => {
  const result = compareStrings("", "");

  assert.equal(result.identical, true);
  assert.deepEqual(result.changes, []);
});

test("character diff highlights a single substitution", () => {
  const result = compareStrings("cat", "car", { granularity: "character" });

  assert.equal(result.identical, false);
  assert.equal(result.removed, 1);
  assert.equal(result.added, 1);
  assert.equal(result.firstDifferenceIndex, 2);
  assert.deepEqual(
    result.changes.map((change) => [change.type, change.a, change.b]),
    [
      ["equal", "ca", "ca"],
      ["delete", "t", ""],
      ["insert", "", "r"],
    ],
  );
});

test("character diff reports insertions and deletions", () => {
  const inserted = compareStrings("ac", "abc", { granularity: "character" });
  assert.equal(inserted.added, 1);
  assert.equal(inserted.removed, 0);
  assert.equal(inserted.firstDifferenceIndex, 1);
  assert.equal(textA(inserted.changes), "ac");
  assert.equal(textB(inserted.changes), "abc");

  const deleted = compareStrings("abc", "ac", { granularity: "character" });
  assert.equal(deleted.removed, 1);
  assert.equal(deleted.added, 0);
  assert.equal(deleted.firstDifferenceIndex, 1);
});

test("word diff highlights only the changed word", () => {
  const result = compareStrings("the quick brown fox", "the slow brown fox", { granularity: "word" });

  assert.equal(result.removed, 1);
  assert.equal(result.added, 1);
  assert.deepEqual(
    result.changes.map((change) => [change.type, change.a, change.b]),
    [
      ["equal", "the ", "the "],
      ["delete", "quick", ""],
      ["insert", "", "slow"],
      ["equal", " brown fox", " brown fox"],
    ],
  );
});

test("line diff replaces a single line", () => {
  const result = compareStrings("a\nb\nc\n", "a\nx\nc\n", { granularity: "line" });

  assert.equal(result.removed, 1);
  assert.equal(result.added, 1);
  assert.ok(result.changes.some((change) => change.type === "delete" && change.a === "b\n"));
  assert.ok(result.changes.some((change) => change.type === "insert" && change.b === "x\n"));
  assert.equal(textA(result.changes), "a\nb\nc\n");
  assert.equal(textB(result.changes), "a\nx\nc\n");
});

test("ignore case treats case-only changes as equal", () => {
  const result = compareStrings("Hello World", "hello world", { ignoreCase: true, granularity: "character" });

  assert.equal(result.identical, true);
  assert.equal(result.firstDifferenceIndex, null);
  assert.equal(textA(result.changes), "Hello World");
  assert.equal(textB(result.changes), "hello world");
  assert.ok(result.changes.every((change) => change.type === "equal"));
});

test("ignore whitespace hides spacing differences", () => {
  const words = compareStrings("a  b", "a b", { ignoreWhitespace: true, granularity: "word" });
  assert.equal(words.identical, true);

  const characters = compareStrings("ab", "a b", { ignoreWhitespace: true, granularity: "character" });
  assert.equal(characters.identical, true);
  assert.equal(textA(characters.changes), "ab");
  assert.equal(textB(characters.changes), "a b");
  assert.ok(characters.changes.some((change) => change.ignored && change.b === " "));
});

test("word diff treats a spacing-only change as whitespace", () => {
  const result = compareStrings("a b", "a  b", { granularity: "word" });

  assert.equal(result.identical, false);
  assert.equal(result.removed, 0);
  assert.equal(result.added, 0);
  assert.equal(result.firstDifferenceIndex, 1);
});

test("ignore whitespace still reports real character changes", () => {
  const result = compareStrings("a b", "a  c", {
    ignoreWhitespace: true,
    granularity: "character",
  });

  assert.equal(result.identical, false);
  assert.ok(result.changes.some((change) => change.type === "delete" && change.a === "b" && !change.ignored));
  assert.ok(result.changes.some((change) => change.type === "insert" && change.b === "c" && !change.ignored));
});

test("reconstructed strings always match the inputs", () => {
  const pairs = [
    ["", ""],
    ["a", ""],
    ["", "b"],
    ["abc", "abc"],
    ["abc", "axc"],
    ["abcdef", "abXYef"],
    ["hello world", "hello there"],
    ["line1\nline2\n", "line1\nline3\n"],
    ["café", "cafe"],
    ["👋hello", "hello👋"],
    ["a".repeat(800), `${"a".repeat(400)}b${"a".repeat(400)}`],
    ["alpha\nbeta\ngamma\n", "alpha\ndelta\ngamma\n"],
  ];
  const granularities: DiffGranularity[] = ["character", "word", "line"];

  for (const [left, right] of pairs) {
    for (const granularity of granularities) {
      const result = compareStrings(left, right, { granularity, ignoreCase: true, ignoreWhitespace: true });
      assert.equal(textA(result.changes), left, `left mismatch for ${granularity}`);
      assert.equal(textB(result.changes), right, `right mismatch for ${granularity}`);
    }
  }
});

test("character diffs are minimal against an LCS oracle", () => {
  const samples = [
    ["ABCABBA", "CBABAC"],
    ["cat", "car"],
    ["kitten", "sitting"],
    ["the quick brown fox", "the slow brown fox"],
    ["aaaa", "aaabaaa"],
    ["", "xyz"],
    ["xyz", ""],
  ];

  for (const [left, right] of samples) {
    const result = compareStrings(left, right, { granularity: "character" });
    const leftTokens = Array.from(left);
    const rightTokens = Array.from(right);
    const lcs = lcsLength(leftTokens, rightTokens, (leftToken, rightToken) => leftToken === rightToken);
    const equalCount = result.changes
      .filter((change) => change.type === "equal")
      .reduce((total, change) => total + change.count, 0);

    assert.equal(result.approximate, false);
    assert.equal(equalCount, lcs, `LCS mismatch for ${left} -> ${right}`);
    assert.equal(textA(result.changes), left);
    assert.equal(textB(result.changes), right);
  }
});

test("random character diffs stay optimal and reconstruct both strings", () => {
  let seed = 42;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed;
  };
  const alphabet = "abcde \n";

  for (let sample = 0; sample < 40; sample += 1) {
    const leftLength = next() % 36;
    const rightLength = next() % 36;
    let left = "";
    let right = "";

    for (let index = 0; index < leftLength; index += 1) {
      left += alphabet[next() % alphabet.length];
    }

    for (let index = 0; index < rightLength; index += 1) {
      right += alphabet[next() % alphabet.length];
    }

    const result = compareStrings(left, right, { granularity: "character" });
    const lcs = lcsLength(Array.from(left), Array.from(right), (leftToken, rightToken) => leftToken === rightToken);
    const equalCount = result.changes
      .filter((change) => change.type === "equal")
      .reduce((total, change) => total + change.count, 0);

    assert.equal(textA(result.changes), left);
    assert.equal(textB(result.changes), right);
    assert.equal(equalCount, lcs);
    assert.equal(
      result.identical,
      left === right,
    );
  }
});

test("a change near the end of a long shared prefix is exact", () => {
  const left = `${"x".repeat(2_000)}tail`;
  const right = `${"x".repeat(2_000)}tale`;
  const result = compareStrings(left, right, { granularity: "character" });

  assert.equal(result.approximate, false);
  assert.equal(result.removed, 1);
  assert.equal(result.added, 1);
  assert.equal(result.firstDifferenceIndex, 2_002);
  assert.equal(textA(result.changes), left);
  assert.equal(textB(result.changes), right);
});
