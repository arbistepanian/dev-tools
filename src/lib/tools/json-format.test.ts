import assert from "node:assert/strict";
import { test } from "node:test";

import { formatJson, minifyJson } from "./json-format.ts";

test("formatJson prettifies compact JSON", () => {
  const formatted = formatJson('{"a":1,"b":[2,3]}');
  assert.match(formatted, /{\n/);
  assert.match(formatted, /"a": 1/);
  assert.match(formatted, /"b": \[\n/);
});

test("formatJson supports tab indentation", () => {
  const formatted = formatJson('{"a":1}', "tab");
  assert.match(formatted, /{\n\t"a": 1/);
});

test("formatJson returns empty string for blank input", () => {
  assert.equal(formatJson("   "), "");
});

test("minifyJson removes whitespace", () => {
  const minified = minifyJson(`{
    "hello": "world"
  }`);
  assert.equal(minified, '{"hello":"world"}');
});

test("formatJson throws on invalid JSON", () => {
  assert.throws(() => formatJson("{not json"), SyntaxError);
});
