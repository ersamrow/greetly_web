import { createPool, type Pool, type RowDataPacket } from "mysql2/promise";

let pool: Pool | undefined;

function database() {
  if (!pool) {
    for (const key of ["MYSQL_HOST", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD"]) {
      if (!process.env[key]) throw new Error(`Missing ${key}`);
    }
    pool = createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      charset: "utf8mb4",
      connectionLimit: 5,
      waitForConnections: true,
      queueLimit: 100,
      connectTimeout: 10000,
    });
  }
  return pool;
}

// Implements only the statement operations used by this app's existing routes.
type SqlValue = string | number | boolean | null | Buffer;

function prepare(sql: string, values: SqlValue[] = []) {
  const mysqlSql = sql.replace(
    "ON CONFLICT(id) DO UPDATE SET enabled=excluded.enabled",
    "ON DUPLICATE KEY UPDATE enabled=VALUES(enabled)",
  );
  return {
    bind(...parameters: SqlValue[]) { return prepare(sql, parameters); },
    async first<T>() {
      const [rows] = await database().execute<RowDataPacket[]>(mysqlSql, values);
      return (rows[0] as T | undefined) ?? null;
    },
    async all() {
      const [rows] = await database().execute<RowDataPacket[]>(mysqlSql, values);
      return { results: rows };
    },
    async run() {
      await database().execute(mysqlSql, values);
      return { success: true };
    },
  };
}

const photos = {
  async put(id: string, bytes: Uint8Array) {
    await database().execute(
      "INSERT INTO photos (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data=VALUES(data)",
      [id, Buffer.from(bytes)],
    );
  },
  async get(id: string) {
    const [rows] = await database().execute<RowDataPacket[]>(
      "SELECT data FROM photos WHERE id=?", [id],
    );
    return rows[0] ? { body: new Uint8Array(rows[0].data) } : null;
  },
  async delete(id: string) {
    await database().execute("DELETE FROM photos WHERE id=?", [id]);
  },
};

export const env = {
  get SITE_URL() { return process.env.SITE_URL; },
  DB: { prepare },
  BUCKET: photos,
  get ADMIN_TOKEN() { return process.env.ADMIN_TOKEN; },
  get ADSENSE_PUBLISHER_ID() { return process.env.ADSENSE_PUBLISHER_ID; },
  get ADSENSE_DISPLAY_SLOT() { return process.env.ADSENSE_DISPLAY_SLOT; },
  get ADSENSE_ENABLED() { return process.env.ADSENSE_ENABLED; },
  get ADSENSE_CONSENT_READY() { return process.env.ADSENSE_CONSENT_READY; },
};
