import { marked } from "marked";
import TurndownService from "turndown";

export type ConversionDirection = "markdown-to-html" | "html-to-markdown";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
});

marked.setOptions({
  gfm: true,
  breaks: false,
});

export function markdownToHtml(markdown: string): string {
  const trimmed = markdown.trim();
  if (!trimmed) {
    return "";
  }

  return marked.parse(trimmed, { async: false }) as string;
}

export function htmlToMarkdown(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) {
    return "";
  }

  return turndown.turndown(trimmed);
}

export function convert(input: string, direction: ConversionDirection): string {
  return direction === "markdown-to-html"
    ? markdownToHtml(input)
    : htmlToMarkdown(input);
}

export const SAMPLE_MARKDOWN = `# Sample Markdown

This is some basic, sample markdown.

## Second Heading

* Unordered lists, and:
  1. One
  2. Two
  3. Three
* More

> Blockquote. And **bold**, *italics*, and even *italics and later **bold***. Even ~~strikethrough~~. [A link](https://example.com) to somewhere.

\`\`\`js
var foo = 'bar';

function baz(s) {
  return foo + ':' + s;
}
\`\`\`

Or inline code like \`var foo = 'bar';\`.`;

export const SAMPLE_HTML = `<h1>Sample HTML</h1>
<p>This is some basic, sample HTML.</p>
<h2>Second Heading</h2>
<ul>
  <li>Unordered lists, and:
    <ol>
      <li>One</li>
      <li>Two</li>
      <li>Three</li>
    </ol>
  </li>
  <li>More</li>
</ul>
<blockquote>
  <p>Blockquote. And <strong>bold</strong>, <em>italics</em>, and a <a href="https://example.com">link</a>.</p>
</blockquote>
<pre><code class="language-js">var foo = 'bar';

function baz(s) {
  return foo + ':' + s;
}</code></pre>
<p>Or inline code like <code>var foo = 'bar';</code>.</p>`;
