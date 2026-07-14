import assert from "node:assert/strict";
import { test } from "node:test";

import { decodeJwt, formatJwtTimestamp } from "./jwt.ts";

const sampleJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

test("decodeJwt parses header and payload", () => {
  const decoded = decodeJwt(sampleJwt);
  assert.equal(decoded.header.json.alg, "HS256");
  assert.equal(decoded.header.json.typ, "JWT");
  assert.equal(decoded.payload.json.sub, "1234567890");
  assert.equal(decoded.payload.json.name, "John Doe");
  assert.equal(decoded.signature, "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
});

test("decodeJwt throws on malformed token", () => {
  assert.throws(() => decodeJwt("only-one-part"), /at least header and payload/);
  assert.throws(() => decodeJwt("a.b"), /Invalid header segment/);
});

test("formatJwtTimestamp converts unix seconds to ISO", () => {
  assert.equal(formatJwtTimestamp(1516239022), "2018-01-18T01:30:22.000Z");
  assert.equal(formatJwtTimestamp("bad"), null);
});
