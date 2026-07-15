import { md5 } from "js-md5";

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";
export type HashMode = "digest" | "hmac";
export type HashOutputFormat = "hex" | "base64";

export const HASH_ALGORITHMS: { value: HashAlgorithm; label: string }[] = [
  { value: "md5", label: "MD5" },
  { value: "sha1", label: "SHA-1" },
  { value: "sha256", label: "SHA-256" },
  { value: "sha512", label: "SHA-512" },
];

export const HASH_OUTPUT_FORMATS: { value: HashOutputFormat; label: string }[] = [
  { value: "hex", label: "Hex" },
  { value: "base64", label: "Base64" },
];

const WEB_CRYPTO_ALGORITHM: Record<Exclude<HashAlgorithm, "md5">, string> = {
  sha1: "SHA-1",
  sha256: "SHA-256",
  sha512: "SHA-512",
};

export interface ComputeHashOptions {
  message: string;
  algorithm: HashAlgorithm;
  mode?: HashMode;
  secret?: string;
  outputFormat?: HashOutputFormat;
  uppercaseHex?: boolean;
}

function bytesToHex(bytes: ArrayBuffer, uppercase = false): string {
  const hex = Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return uppercase ? hex.toUpperCase() : hex;
}

function bytesToBase64(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function formatHashBytes(
  bytes: ArrayBuffer,
  outputFormat: HashOutputFormat,
  uppercaseHex = false,
): string {
  if (outputFormat === "base64") {
    return bytesToBase64(bytes);
  }

  return bytesToHex(bytes, uppercaseHex);
}

async function digestShaBytes(
  algorithm: Exclude<HashAlgorithm, "md5">,
  input: string,
): Promise<ArrayBuffer> {
  const bytes = new TextEncoder().encode(input);
  return crypto.subtle.digest(WEB_CRYPTO_ALGORITHM[algorithm], bytes);
}

async function hmacShaBytes(
  algorithm: Exclude<HashAlgorithm, "md5">,
  secret: string,
  input: string,
): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: WEB_CRYPTO_ALGORITHM[algorithm] },
    false,
    ["sign"],
  );

  return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
}

function digestMd5Bytes(input: string): ArrayBuffer {
  return md5.arrayBuffer(input);
}

function hmacMd5Bytes(secret: string, input: string): ArrayBuffer {
  return md5.hmac.arrayBuffer(secret, input);
}

export function hashMd5(input: string): string {
  return md5(input);
}

export async function hashSha(
  algorithm: Exclude<HashAlgorithm, "md5">,
  input: string,
): Promise<string> {
  const digest = await digestShaBytes(algorithm, input);
  return bytesToHex(digest);
}

export async function hashString(input: string, algorithm: HashAlgorithm): Promise<string> {
  if (algorithm === "md5") {
    return hashMd5(input);
  }
  return hashSha(algorithm, input);
}

export async function computeHash({
  message,
  algorithm,
  mode = "digest",
  secret = "",
  outputFormat = "hex",
  uppercaseHex = false,
}: ComputeHashOptions): Promise<string> {
  if (mode === "hmac" && !secret) {
    throw new Error("Secret key is required for HMAC.");
  }

  let digestBytes: ArrayBuffer;

  if (mode === "hmac") {
    digestBytes =
      algorithm === "md5"
        ? hmacMd5Bytes(secret, message)
        : await hmacShaBytes(algorithm, secret, message);
  } else {
    digestBytes =
      algorithm === "md5" ? digestMd5Bytes(message) : await digestShaBytes(algorithm, message);
  }

  return formatHashBytes(digestBytes, outputFormat, uppercaseHex);
}

export function isHashAlgorithm(value: string): value is HashAlgorithm {
  return HASH_ALGORITHMS.some((item) => item.value === value);
}

export function isHashOutputFormat(value: string): value is HashOutputFormat {
  return HASH_OUTPUT_FORMATS.some((item) => item.value === value);
}

export function getHashOutputHelperText(
  outputFormat: HashOutputFormat,
  uppercaseHex: boolean,
): string {
  if (outputFormat === "base64") {
    return "Base64-encoded digest";
  }

  return uppercaseHex ? "Uppercase hexadecimal" : "Lowercase hexadecimal";
}
