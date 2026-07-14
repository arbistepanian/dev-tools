export type JsonIndent = 2 | 4 | "tab";

export const SAMPLE_JSON = `{"name":"Dev Tools","version":1,"features":["hash","uuid","base64"],"config":{"theme":"blue","drawer":true}}`;

export function formatJson(input: string, indent: JsonIndent = 2): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  const parsed: unknown = JSON.parse(trimmed);
  const spacing = indent === "tab" ? "\t" : indent;
  return JSON.stringify(parsed, null, spacing);
}

export function minifyJson(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  return JSON.stringify(JSON.parse(trimmed));
}

export function validateJson(input: string): void {
  const trimmed = input.trim();
  if (!trimmed) {
    return;
  }

  JSON.parse(trimmed);
}

export function getJsonErrorMessage(error: unknown): string {
  if (error instanceof SyntaxError) {
    return error.message;
  }

  return error instanceof Error ? error.message : "Invalid JSON.";
}
