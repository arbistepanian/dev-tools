import assert from "node:assert/strict";
import { test } from "node:test";

import { formatXml, minifyXml } from "./xml-format.ts";

test("formatXml prettifies compact XML", () => {
  const formatted = formatXml("<root><item>a</item></root>");
  assert.match(formatted, /<root>\n/);
  assert.match(formatted, /<item>a<\/item>/);
});

test("formatXml returns empty string for blank input", () => {
  assert.equal(formatXml("   "), "");
});

test("minifyXml removes whitespace between tags", () => {
  const minified = minifyXml(`<root>
    <item>a</item>
  </root>`);
  assert.equal(minified, "<root><item>a</item></root>");
});

test("formatXml throws on invalid XML", () => {
  assert.throws(() => formatXml("<root><</root>"), /Invalid|char/i);
});
