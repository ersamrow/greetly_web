import { test, mock } from "node:test";
import assert from "node:assert/strict";

// Run with Node 22.13+:
// node --experimental-strip-types --experimental-test-module-mocks --test scripts/test-hostinger.mjs
test("Hostinger adapter preserves parameters, photos, and runtime settings", async () => {
  const calls = [];
  let nextRows = [];
  let poolOptions;
  mock.module("mysql2/promise", {
    namedExports: {
      createPool(options) {
        poolOptions = options;
        return { async execute(sql, values) { calls.push({ sql, values }); return [nextRows]; } };
      },
    },
  });
  const keys = ["MYSQL_HOST", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD", "ADMIN_TOKEN"];
  const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    for (const key of keys) delete process.env[key];
    const { env } = await import("../lib/node-env.ts");
    await assert.rejects(env.DB.prepare("SELECT id FROM greetings").all(), /Missing MYSQL_HOST/);
    for (const key of keys) process.env[key] = "test-value";

    const untrusted = "x' OR 1=1 --";
    nextRows = [{ payload: '{"name":"Hello 🌸"}' }];
    assert.deepEqual(await env.DB.prepare("SELECT payload FROM greetings WHERE id=?").bind(untrusted).first(), nextRows[0]);
    assert.equal(calls.at(-1).sql, "SELECT payload FROM greetings WHERE id=?");
    assert.deepEqual(calls.at(-1).values, [untrusted]);
    assert.equal(poolOptions.charset, "utf8mb4");
    nextRows = [];
    assert.equal(await env.DB.prepare("SELECT id FROM greetings WHERE id=?").bind("missing").first(), null);
    assert.deepEqual(await env.DB.prepare("SELECT id FROM published WHERE enabled=0").all(), { results: [] });

    await env.DB.prepare("INSERT INTO published (id,enabled) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET enabled=excluded.enabled").bind("birthday", false).run();
    assert.match(calls.at(-1).sql, /ON DUPLICATE KEY UPDATE enabled=VALUES\(enabled\)/);
    assert.deepEqual(calls.at(-1).values, ["birthday", false]);

    const photo = Uint8Array.from([255, 216, 0, 128, 255, 217]);
    await env.BUCKET.put("photo-id", photo);
    assert.deepEqual(calls.at(-1).values, ["photo-id", Buffer.from(photo)]);
    nextRows = [{ data: Buffer.from(photo) }];
    assert.deepEqual((await env.BUCKET.get("photo-id")).body, photo);
    nextRows = [];
    assert.equal(await env.BUCKET.get("missing"), null);
    await env.BUCKET.delete("photo-id");
    assert.deepEqual(calls.at(-1), { sql: "DELETE FROM photos WHERE id=?", values: ["photo-id"] });
    process.env.ADMIN_TOKEN = "changed-at-runtime";
    assert.equal(env.ADMIN_TOKEN, "changed-at-runtime");
  } finally {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
    mock.restoreAll();
  }
});
