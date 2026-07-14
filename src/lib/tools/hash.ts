import { md5 } from "js-md5";

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";

export const HASH_ALGORITHMS: { value: HashAlgorithm; label: string }[] = [
  { value: "md5", label: "MD5" },
  { value: "sha1", label: "SHA-1" },
  { value: "sha256", label: "SHA-256" },
  { value: "sha512", label: "SHA-512" },
];

const WEB_CRYPTO_ALGORITHM: Record<Exclude<HashAlgorithm, "md5">, string> = {
  sha1: "SHA-1",
  sha256: "SHA-256",
  sha512: "SHA-512",
};

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function hashMd5(input: string): string {
  return md5(input);
}

export async function hashSha(
  algorithm: Exclude<HashAlgorithm, "md5">,
  input: string,
): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(WEB_CRYPTO_ALGORITHM[algorithm], bytes);
  return bytesToHex(digest);
}

export async function hashString(input: string, algorithm: HashAlgorithm): Promise<string> {
  if (algorithm === "md5") {
    return hashMd5(input);
  }
  return hashSha(algorithm, input);
}

export function isHashAlgorithm(value: string): value is HashAlgorithm {
  return HASH_ALGORITHMS.some((item) => item.value === value);
}
