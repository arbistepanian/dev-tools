import { XMLValidator } from "fast-xml-parser";
import xmlFormatter from "xml-formatter";

export type XmlIndent = 2 | 4;

export const SAMPLE_XML = `<catalog>
<book id="1"><title>Dev Tools</title><author>Local</author></book>
<book id="2"><title>JSON Formatter</title><author>Local</author></book>
</catalog>`;

function getIndentation(indent: XmlIndent): string {
  return " ".repeat(indent);
}

export function validateXml(input: string): void {
  const trimmed = input.trim();
  if (!trimmed) {
    return;
  }

  const result = XMLValidator.validate(trimmed);
  if (result !== true) {
    throw new Error(result.err.msg);
  }
}

export function formatXml(input: string, indent: XmlIndent = 2): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  validateXml(trimmed);

  try {
    return xmlFormatter(trimmed, {
      indentation: getIndentation(indent),
      collapseContent: true,
      lineSeparator: "\n",
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Invalid XML.");
  }
}

export function minifyXml(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  validateXml(trimmed);

  return trimmed
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function getXmlErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Invalid XML.";
}
