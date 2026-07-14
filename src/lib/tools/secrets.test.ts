import assert from "node:assert/strict";
import { test } from "node:test";

import { generateSecret } from "./secrets.ts";

test("generateSecret returns hex of expected length", () => {
  const secret = generateSecret({ lengthBytes: 16, encoding: "hex" });
  assert.equal(secret.length, 32);
  assert.match(secret, /^[0-9a-f]+$/);
});

test("generateSecret returns base64 encoding", () => {
  const secret = generateSecret({ lengthBytes: 12, encoding: "base64" });
  assert.equal(secret.length, 16);
});

test("generateSecret rejects invalid byte length", () => {
  assert.throws(
    () => generateSecret({ lengthBytes: 4, encoding: "hex" }),
    /between 8 and 256/,
  );
});
