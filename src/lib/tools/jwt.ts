export interface DecodedJwtSegment {
  raw: string;
  json: Record<string, unknown>;
}

export interface DecodedJwt {
  header: DecodedJwtSegment;
  payload: DecodedJwtSegment;
  signature: string;
}

function decodeBase64Url(segment: string): string {
  let normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  if (padding > 0) {
    normalized += "=".repeat(4 - padding);
  }
  return normalized;
}

function parseJsonSegment(segment: string, label: string): DecodedJwtSegment {
  try {
    const decoded = atob(decodeBase64Url(segment));
    const json = JSON.parse(decoded) as Record<string, unknown>;
    return { raw: decoded, json };
  } catch {
    throw new Error(`Invalid ${label} segment.`);
  }
}

export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error("JWT is empty.");
  }

  const parts = trimmed.split(".");
  if (parts.length < 2) {
    throw new Error("JWT must have at least header and payload segments.");
  }

  const [headerPart, payloadPart, signaturePart = ""] = parts;

  return {
    header: parseJsonSegment(headerPart, "header"),
    payload: parseJsonSegment(payloadPart, "payload"),
    signature: signaturePart,
  };
}

export function formatJwtTimestamp(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return new Date(value * 1000).toISOString();
}

export function prettyPrintJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
