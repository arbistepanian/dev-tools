import assert from "node:assert/strict";
import { test } from "node:test";

import { decodeBase64, encodeBase64 } from "./base64.ts";

test("encodeBase64 and decodeBase64 round-trip UTF-8 text", () => {
  const original = "Hello, 世界!";
  const encoded = encodeBase64(original);
  assert.equal(encoded, "SGVsbG8sIOS4lueVjCE=");
  assert.equal(decodeBase64(encoded), original);
});

test("url-safe base64 omits padding and uses -_", () => {
  const encoded = encodeBase64("?>?", { urlSafe: true });
  assert.equal(encoded, "Pz4_");
  assert.equal(decodeBase64(encoded, { urlSafe: true }), "?>?");
});

test("decodeBase64 throws on invalid input", () => {
  assert.throws(() => decodeBase64("not!!!base64"), /Invalid base64 input/);
});
