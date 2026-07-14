import assert from "node:assert/strict";
import { test } from "node:test";

import { htmlToMarkdown, markdownToHtml } from "./markdown.ts";

test("markdownToHtml converts headings and emphasis", () => {
  const html = markdownToHtml("# Title\n\n**bold** and *italic*");
  assert.match(html, /<h1[^>]*>Title<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
});

test("markdownToHtml returns empty string for blank input", () => {
  assert.equal(markdownToHtml("   "), "");
});

test("htmlToMarkdown converts headings and links", () => {
  const markdown = htmlToMarkdown('<h1>Title</h1><p>Visit <a href="https://example.com">Example</a>.</p>');
  assert.match(markdown, /^# Title/m);
  assert.match(markdown, /\[Example\]\(https:\/\/example\.com\)/);
});

test("htmlToMarkdown returns empty string for blank input", () => {
  assert.equal(htmlToMarkdown("\n"), "");
});

test("markdown and html round-trip preserves heading text", () => {
  const original = "## Round Trip";
  const html = markdownToHtml(original);
  const back = htmlToMarkdown(html);
  assert.match(back, /## Round Trip/);
});
