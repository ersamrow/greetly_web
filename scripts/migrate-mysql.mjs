import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createConnection } from 'mysql2/promise';

export function connectionOptions(env) {
  for (const key of ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD']) {
    if (!env[key]) throw new Error(`Missing ${key}. Configure the app's MySQL environment variables first.`);
  }
  const port = Number(env.MYSQL_PORT || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid MYSQL_PORT.');
  return { host: env.MYSQL_HOST, port, database: env.MYSQL_DATABASE, user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD, charset: 'utf8mb4', connectTimeout: 10000, multipleStatements: false };
}

export async function loadMigrations() {
  const sql = (await readFile(new URL('../db/hostinger.sql', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
  // This baseline contains only CREATE TABLE statements, with no SQL routines
  // or semicolons inside quoted values. Add future migrations as separate entries.
  return [{ id: '001_initial_tables', checksum: createHash('sha256').update(sql).digest('hex'),
    statements: sql.replace(/^\s*--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean) }];
}

export async function migrate(connection, database, migrations, log = console.log) {
  const lock = 'greetly:migrate:' + createHash('sha256').update(database).digest('hex').slice(0, 40);
  const [rows] = await connection.execute('SELECT GET_LOCK(?, 30) AS acquired', [lock]);
  if (Number(rows[0]?.acquired) !== 1) throw new Error('Another migration is running. Try again shortly.');
  try {
    await connection.execute(`CREATE TABLE IF NOT EXISTS greetly_migrations (
      id VARCHAR(191) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
      checksum CHAR(64) CHARACTER SET ascii NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    const [applied] = await connection.execute('SELECT id, checksum FROM greetly_migrations');
    const history = new Map(applied.map(row => [row.id, row.checksum]));
    // Validate all recorded checksums before executing any pending migration.
    for (const migration of migrations) {
      if (history.has(migration.id) && history.get(migration.id) !== migration.checksum) {
        throw new Error(`Applied migration ${migration.id} has changed. Restore it and add a new migration instead.`);
      }
    }
    for (const migration of migrations) {
      if (history.has(migration.id)) { log(`Already applied: ${migration.id}`); continue; }
      // MySQL DDL commits implicitly. The baseline is idempotent so an
      // interrupted run can safely retry before recording its completion.
      for (const sql of migration.statements) await connection.execute(sql);
      await connection.execute('INSERT INTO greetly_migrations (id, checksum) VALUES (?, ?)', [migration.id, migration.checksum]);
      log(`Applied: ${migration.id}`);
    }
  } finally {
    await connection.execute('SELECT RELEASE_LOCK(?)', [lock]);
  }
}

async function main() {
  const options = connectionOptions(process.env);
  const migrations = await loadMigrations();
  const connection = await createConnection(options);
  try { await migrate(connection, options.database, migrations); }
  finally { await connection.end(); }
  console.log('Database migrations complete. Greeting storage is ready.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    // Driver messages can contain usernames, hosts, or SQL; print only their
    // stable error code. Configuration and migration errors are safe to show.
    console.error('Migration failed:', error.code || error.message);
    process.exitCode = 1;
  });
}
