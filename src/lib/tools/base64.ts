export interface Base64Options {
  urlSafe?: boolean;
}

function bytesToBase64(bytes: Uint8Array, urlSafe: boolean): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  let encoded = btoa(binary);
  if (urlSafe) {
    encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  return encoded;
}

function base64ToBytes(encoded: string, urlSafe: boolean): Uint8Array {
  let normalized = encoded.trim();
  if (!normalized) {
    throw new Error("Input is empty.");
  }

  if (urlSafe) {
    normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4;
    if (padding > 0) {
      normalized += "=".repeat(4 - padding);
    }
  }

  try {
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    throw new Error("Invalid base64 input.");
  }
}

export function encodeBase64(text: string, options: Base64Options = {}): string {
  const bytes = new TextEncoder().encode(text);
  return bytesToBase64(bytes, options.urlSafe ?? false);
}

export function decodeBase64(text: string, options: Base64Options = {}): string {
  const bytes = base64ToBytes(text, options.urlSafe ?? false);
  return new TextDecoder().decode(bytes);
}
