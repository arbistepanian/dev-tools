import assert from "node:assert/strict";
import { test } from "node:test";

import {
  computeHash,
  formatHashBytes,
  hashMd5,
  hashSha,
  hashString,
} from "./hash.ts";

test("hashMd5 returns hex digest", () => {
  assert.equal(hashMd5("hello"), "5d41402abc4b2a76b9719d911017c592");
  assert.equal(hashMd5(""), "d41d8cd98f00b204e9800998ecf8427e");
});

test("hashSha returns SHA-256 hex digest", async () => {
  const digest = await hashSha("sha256", "hello");
  assert.equal(digest, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
});

test("hashSha returns SHA-1 hex digest", async () => {
  const digest = await hashSha("sha1", "hello");
  assert.equal(digest, "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
});

test("hashSha returns SHA-512 hex digest", async () => {
  const digest = await hashSha("sha512", "hello");
  assert.equal(
    digest,
    "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
  );
});

test("hashString dispatches by algorithm", async () => {
  assert.equal(await hashString("hello", "md5"), hashMd5("hello"));
  assert.equal(
    await hashString("hello", "sha256"),
    await hashSha("sha256", "hello"),
  );
});

test("computeHash returns base64 output", async () => {
  const digest = await computeHash({
    message: "hello",
    algorithm: "sha256",
    outputFormat: "base64",
  });

  assert.equal(digest, "LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=");
});

test("computeHash returns uppercase hex output", async () => {
  const digest = await computeHash({
    message: "hello",
    algorithm: "md5",
    uppercaseHex: true,
  });

  assert.equal(digest, "5D41402ABC4B2A76B9719D911017C592");
});

test("computeHash returns HMAC digest", async () => {
  const digest = await computeHash({
    message: "hello",
    algorithm: "sha256",
    mode: "hmac",
    secret: "secret",
  });

  assert.equal(
    digest,
    "88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b",
  );
});

test("computeHash returns MD5 HMAC digest", async () => {
  const digest = await computeHash({
    message: "hello",
    algorithm: "md5",
    mode: "hmac",
    secret: "secret",
  });

  assert.equal(digest, "bade63863c61ed0b3165806ecd6acefc");
});

test("computeHash throws when HMAC secret is missing", async () => {
  await assert.rejects(
    () =>
      computeHash({
        message: "hello",
        algorithm: "sha256",
        mode: "hmac",
      }),
    /Secret key is required for HMAC/,
  );
});

test("formatHashBytes supports base64 output", () => {
  const bytes = new Uint8Array([102, 111, 111]).buffer;
  assert.equal(formatHashBytes(bytes, "base64"), "Zm9v");
});
