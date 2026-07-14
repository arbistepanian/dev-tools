import assert from "node:assert/strict";
import { test } from "node:test";

import { hashMd5, hashSha, hashString } from "./hash.ts";

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
