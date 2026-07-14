import assert from "node:assert/strict";
import { test } from "node:test";

import { escapeHtml, highlightJson, highlightXml } from "./syntax-highlight.ts";

test("escapeHtml encodes special characters", () => {
  assert.equal(escapeHtml("<script>&"), "&lt;script&gt;&amp;");
});

test("highlightJson wraps keys, strings, and numbers", () => {
  const html = highlightJson('{\n  "name": "Dev Tools",\n  "count": 2,\n  "active": true,\n  "meta": null\n}');

  assert.match(html, /<span class="syntax-key">"name":<\/span>/);
  assert.match(html, /<span class="syntax-string">"Dev Tools"<\/span>/);
  assert.match(html, /<span class="syntax-number">2<\/span>/);
  assert.match(html, /<span class="syntax-boolean">true<\/span>/);
  assert.match(html, /<span class="syntax-null">null<\/span>/);
});

test("highlightXml wraps tags, attributes, and comments", () => {
  const html = highlightXml('<!-- note --><book id="1"><title>Dev Tools</title></book>');

  assert.match(html, /<span class="syntax-comment">&lt;!-- note --&gt;<\/span>/);
  assert.match(html, /<span class="syntax-tag">&lt;book/);
  assert.match(html, /<span class="syntax-attr-name">id<\/span>=<span class="syntax-attr-value">"1"<\/span>/);
  assert.match(html, /Dev Tools/);
});
