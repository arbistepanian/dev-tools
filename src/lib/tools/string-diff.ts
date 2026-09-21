export type DiffGranularity = "character" | "word" | "line";

export interface CompareStringsOptions {
  granularity?: DiffGranularity;
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
  /** Stop searching once this many milliseconds have elapsed and return a non-minimal diff. */
  deadlineMs?: number;
}

export interface DiffChange {
  type: "equal" | "insert" | "delete";
  /** Text from the first string. Empty when this change is an insertion. */
  a: string;
  /** Text from the second string. Empty when this change is a deletion. */
  b: string;
  /** How many compared tokens this change represents. */
  count: number;
  /** Whitespace-only change that is not highlighted because ignoreWhitespace is on. */
  ignored: boolean;
}

export interface StringComparison {
  changes: DiffChange[];
  identical: boolean;
  removed: number;
  added: number;
  /** Index in the first string where the strings first differ, or null when they match. */
  firstDifferenceIndex: number | null;
  /** True when the edit limit was hit and the script may not be minimal. */
  approximate: boolean;
}

interface ResolvedOptions {
  granularity: DiffGranularity;
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  deadlineMs?: number;
}

interface TokenChange {
  type: DiffChange["type"];
  a: string;
  b: string;
  ignored: boolean;
}

const MAX_EDIT_DISTANCE = 4_000;

export const SAMPLE_STRING_A = `function greet(name) {
  return "Hello, " + name;
}

const total = 1 + 2;
`;

export const SAMPLE_STRING_B = `function greet(name) {
  return \`Hello, \${name}!\`;
}

const total = 1 + 3;
`;

export function compareStrings(
  left: string,
  right: string,
  options: CompareStringsOptions = {},
): StringComparison {
  const resolved = resolveOptions(options);

  if (left === right) {
    return {
      changes: left
        ? [{ type: "equal", a: left, b: right, count: 1, ignored: false }]
        : [],
      identical: true,
      removed: 0,
      added: 0,
      firstDifferenceIndex: null,
      approximate: false,
    };
  }

  const leftTokens = tokenize(left, resolved.granularity);
  const rightTokens = tokenize(right, resolved.granularity);
  const equals = (leftToken: string, rightToken: string) =>
    normalizeToken(leftToken, resolved) === normalizeToken(rightToken, resolved);

  const { changes: tokenChanges, approximate } = diffTokens(leftTokens, rightTokens, equals, resolved.deadlineMs);
  const withFlags = tokenChanges.map((change) => ({
    ...change,
    ignored: isIgnorableWhitespace(change, resolved.ignoreWhitespace),
  }));

  return summarize(withFlags, resolved.granularity, approximate);
}

function resolveOptions(options: CompareStringsOptions): ResolvedOptions {
  return {
    granularity: options.granularity ?? "word",
    ignoreCase: options.ignoreCase ?? false,
    ignoreWhitespace: options.ignoreWhitespace ?? false,
    deadlineMs: options.deadlineMs,
  };
}

function tokenize(text: string, granularity: DiffGranularity): string[] {
  if (text.length === 0) {
    return [];
  }

  if (granularity === "character") {
    return Array.from(text);
  }

  if (granularity === "word") {
    return text.match(/[\p{L}\p{N}_]+|[^\p{L}\p{N}_\s]+|\s+/gu) ?? [];
  }

  const lines = text.split("\n");
  if (text.endsWith("\n")) {
    lines.pop();
  }

  return lines.map((line, index) =>
    index < lines.length - 1 || text.endsWith("\n") ? `${line}\n` : line,
  );
}

function normalizeToken(token: string, options: ResolvedOptions): string {
  let value = token;

  if (options.ignoreWhitespace) {
    value = value.replace(/\s+/g, "");
  }

  if (options.ignoreCase) {
    value = value.toLowerCase();
  }

  return value;
}

function isIgnorableWhitespace(change: { type: DiffChange["type"]; a: string; b: string }, ignoreWhitespace: boolean): boolean {
  if (!ignoreWhitespace || change.type === "equal") {
    return false;
  }

  const text = change.type === "delete" ? change.a : change.b;
  return /^\s+$/.test(text);
}

function diffTokens(
  left: string[],
  right: string[],
  equals: (leftToken: string, rightToken: string) => boolean,
  deadlineMs?: number,
): { changes: TokenChange[]; approximate: boolean } {
  const prefix = commonPrefixLength(left, right, equals);
  const suffix = commonSuffixLength(left, right, equals, prefix);
  const leftMiddle = left.slice(prefix, left.length - suffix);
  const rightMiddle = right.slice(prefix, right.length - suffix);
  const middle = diffMiddle(leftMiddle, rightMiddle, equals, deadlineMs);

  const changes: TokenChange[] = [];

  for (let index = 0; index < prefix; index += 1) {
    changes.push({ type: "equal", a: left[index] ?? "", b: right[index] ?? "", ignored: false });
  }

  changes.push(...middle.changes);

  for (let index = 0; index < suffix; index += 1) {
    changes.push({
      type: "equal",
      a: left[left.length - suffix + index] ?? "",
      b: right[right.length - suffix + index] ?? "",
      ignored: false,
    });
  }

  return { changes, approximate: middle.approximate };
}

function diffMiddle(
  left: string[],
  right: string[],
  equals: (leftToken: string, rightToken: string) => boolean,
  deadlineMs?: number,
): { changes: TokenChange[]; approximate: boolean } {
  if (left.length === 0 && right.length === 0) {
    return { changes: [], approximate: false };
  }

  if (left.length === 0) {
    return {
      changes: right.map((token) => ({ type: "insert", a: "", b: token, ignored: false })),
      approximate: false,
    };
  }

  if (right.length === 0) {
    return {
      changes: left.map((token) => ({ type: "delete", a: token, b: "", ignored: false })),
      approximate: false,
    };
  }

  return myersDiff(left, right, equals, deadlineMs);
}

/**
 * Myers O(ND) diff. V snapshots are stored only for the diagonals each
 * iteration needs, and the search stops after MAX_EDIT_DISTANCE edits.
 */
function myersDiff(
  left: string[],
  right: string[],
  equals: (leftToken: string, rightToken: string) => boolean,
  deadlineMs?: number,
): { changes: TokenChange[]; approximate: boolean } {
  const leftLength = left.length;
  const rightLength = right.length;
  const max = leftLength + rightLength;
  const offset = max + 1;
  const furthestX = new Int32Array(2 * max + 3);
  furthestX[offset + 1] = 0;

  const trace: Int32Array[] = [];
  const startedAt = deadlineMs === undefined ? 0 : Date.now();
  const maxDistance = Math.min(max, MAX_EDIT_DISTANCE);
  let endDistance = -1;

  for (let distance = 0; distance <= maxDistance; distance += 1) {
    if (deadlineMs !== undefined && distance % 32 === 0 && Date.now() - startedAt > deadlineMs) {
      break;
    }

    const fromDiagonal = -(distance + 1);
    const snapshot = new Int32Array(distance + 2);
    for (let index = 0; index < snapshot.length; index += 1) {
      snapshot[index] = furthestX[offset + fromDiagonal + index * 2] ?? 0;
    }
    trace.push(snapshot);

    let reachedEnd = false;

    for (let diagonal = -distance; diagonal <= distance; diagonal += 2) {
      const stepDown =
        diagonal === -distance ||
        (diagonal !== distance &&
          (furthestX[offset + diagonal - 1] ?? 0) < (furthestX[offset + diagonal + 1] ?? 0));
      let x = stepDown
        ? (furthestX[offset + diagonal + 1] ?? 0)
        : (furthestX[offset + diagonal - 1] ?? 0) + 1;
      let y = x - diagonal;

      while (x < leftLength && y < rightLength && equals(left[x] ?? "", right[y] ?? "")) {
        x += 1;
        y += 1;
      }

      furthestX[offset + diagonal] = x;

      if (x >= leftLength && y >= rightLength) {
        reachedEnd = true;
        break;
      }
    }

    if (reachedEnd) {
      endDistance = distance;
      break;
    }
  }

  if (endDistance === -1) {
    return {
      changes: [
        ...left.map((token) => ({ type: "delete" as const, a: token, b: "", ignored: false })),
        ...right.map((token) => ({ type: "insert" as const, a: "", b: token, ignored: false })),
      ],
      approximate: true,
    };
  }

  const reversed: TokenChange[] = [];
  let x = leftLength;
  let y = rightLength;

  for (let distance = endDistance; distance > 0; distance -= 1) {
    const snapshot = trace[distance];
    const fromDiagonal = -(distance + 1);
    const readX = (diagonal: number) => snapshot?.[(diagonal - fromDiagonal) / 2] ?? 0;
    const diagonal = x - y;
    const previousDiagonal =
      diagonal === -distance || (diagonal !== distance && readX(diagonal - 1) < readX(diagonal + 1))
        ? diagonal + 1
        : diagonal - 1;
    const previousX = readX(previousDiagonal);
    const previousY = previousX - previousDiagonal;

    while (x > previousX && y > previousY) {
      x -= 1;
      y -= 1;
      reversed.push({
        type: "equal",
        a: left[x] ?? "",
        b: right[y] ?? "",
        ignored: false,
      });
    }

    if (x === previousX) {
      y -= 1;
      reversed.push({ type: "insert", a: "", b: right[y] ?? "", ignored: false });
    } else {
      x -= 1;
      reversed.push({ type: "delete", a: left[x] ?? "", b: "", ignored: false });
    }
  }

  while (x > 0 && y > 0) {
    x -= 1;
    y -= 1;
    reversed.push({
      type: "equal",
      a: left[x] ?? "",
      b: right[y] ?? "",
      ignored: false,
    });
  }

  while (x > 0) {
    x -= 1;
    reversed.push({ type: "delete", a: left[x] ?? "", b: "", ignored: false });
  }

  while (y > 0) {
    y -= 1;
    reversed.push({ type: "insert", a: "", b: right[y] ?? "", ignored: false });
  }

  reversed.reverse();
  return { changes: reversed, approximate: false };
}

function commonPrefixLength(
  left: string[],
  right: string[],
  equals: (leftToken: string, rightToken: string) => boolean,
): number {
  const limit = Math.min(left.length, right.length);
  let index = 0;

  while (index < limit && equals(left[index] ?? "", right[index] ?? "")) {
    index += 1;
  }

  return index;
}

function commonSuffixLength(
  left: string[],
  right: string[],
  equals: (leftToken: string, rightToken: string) => boolean,
  prefixLength: number,
): number {
  const limit = Math.min(left.length, right.length) - prefixLength;
  let index = 0;

  while (
    index < limit &&
    equals(left[left.length - 1 - index] ?? "", right[right.length - 1 - index] ?? "")
  ) {
    index += 1;
  }

  return index;
}

function summarize(tokenChanges: TokenChange[], granularity: DiffGranularity, approximate: boolean): StringComparison {
  const changes = mergeChanges(tokenChanges);
  let removed = 0;
  let added = 0;
  let identical = true;
  let firstDifferenceIndex: number | null = null;
  let index = 0;

  for (const change of tokenChanges) {
    if (change.type !== "equal" && !change.ignored) {
      identical = false;

      if (firstDifferenceIndex === null) {
        firstDifferenceIndex = index;
      }

      if (!(granularity === "word" && /^\s+$/.test(change.type === "delete" ? change.a : change.b))) {
        if (change.type === "delete") {
          removed += 1;
        } else {
          added += 1;
        }
      }
    }

    if (change.type !== "insert") {
      index += change.a.length;
    }
  }

  return {
    changes,
    identical,
    removed,
    added,
    firstDifferenceIndex: identical ? null : firstDifferenceIndex,
    approximate,
  };
}

function mergeChanges(changes: TokenChange[]): DiffChange[] {
  const merged: DiffChange[] = [];

  for (const change of changes) {
    const previous = merged[merged.length - 1];

    if (previous && previous.type === change.type && previous.ignored === change.ignored) {
      previous.a += change.a;
      previous.b += change.b;
      previous.count += 1;
      continue;
    }

    merged.push({
      type: change.type,
      a: change.a,
      b: change.b,
      count: 1,
      ignored: change.ignored,
    });
  }

  return merged;
}

export function diffUnit(granularity: DiffGranularity): string {
  if (granularity === "character") {
    return "character";
  }

  if (granularity === "line") {
    return "line";
  }

  return "word";
}

export function formatDiffCount(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}
