export type SecretEncoding = "hex" | "base64" | "base64url";

export interface GenerateSecretOptions {
  lengthBytes: number;
  encoding: SecretEncoding;
}

const MIN_BYTES = 8;
const MAX_BYTES = 256;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
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

export function generateSecret(options: GenerateSecretOptions): string {
  const { lengthBytes, encoding } = options;

  if (!Number.isInteger(lengthBytes) || lengthBytes < MIN_BYTES || lengthBytes > MAX_BYTES) {
    throw new Error(`Length must be an integer between ${MIN_BYTES} and ${MAX_BYTES} bytes.`);
  }

  const bytes = new Uint8Array(lengthBytes);
  crypto.getRandomValues(bytes);

  switch (encoding) {
    case "hex":
      return bytesToHex(bytes);
    case "base64":
      return bytesToBase64(bytes, false);
    case "base64url":
      return bytesToBase64(bytes, true);
    default:
      throw new Error(`Unsupported encoding: ${encoding as string}`);
  }
}

export const SECRET_BYTE_LIMITS = { min: MIN_BYTES, max: MAX_BYTES };
