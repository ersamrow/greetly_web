import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connectionOptions, loadMigrations, migrate } from './migrate-mysql.mjs';

function database({ locked = false, failAt = '' } = {}) {
  const history = [], statements = [];
  return { history, statements, async execute(sql, values) {
    statements.push(sql);
    if (sql.includes('GET_LOCK')) return [[{ acquired: locked ? 0 : 1 }]];
    if (sql === 'SELECT id, checksum FROM greetly_migrations') return [history];
    if (failAt && sql.includes(failAt)) throw Error('Simulated interruption');
    if (sql.startsWith('INSERT INTO greetly_migrations')) history.push({ id: values[0], checksum: values[1] });
    return [[]];
  } };
}
const quiet = () => {};

test('initial migration creates all four tables and skips an applied migration', async () => {
  const migrations = await loadMigrations();
  assert.equal(migrations[0].statements.length, 4);
  for (const table of ['greetings', 'events', 'published', 'photos']) {
    assert(migrations[0].statements.some(sql => sql.startsWith(`CREATE TABLE IF NOT EXISTS ${table} (`)));
  }
  const db = database();
  await migrate(db, 'test', migrations, quiet);
  assert.equal(db.history.length, 1);
  db.statements.length = 0;
  await migrate(db, 'test', migrations, quiet);
  assert.equal(db.history.length, 1);
  assert(!db.statements.some(sql => sql.startsWith('CREATE TABLE IF NOT EXISTS greetings (')));
  assert(db.statements.at(-1).includes('RELEASE_LOCK'));
});
test('failed migration is not recorded and releases its lock', async () => {
  const db = database({ failAt: 'CREATE TABLE IF NOT EXISTS photos (' });
  await assert.rejects(migrate(db, 'test', await loadMigrations(), quiet), /interruption/);
  assert.equal(db.history.length, 0);
  assert(db.statements.at(-1).includes('RELEASE_LOCK'));
});
test('lock contention and changed migration checksums fail without schema changes', async () => {
  const migrations = await loadMigrations();
  const locked = database({ locked: true });
  await assert.rejects(migrate(locked, 'test', migrations, quiet), /Another migration/);
  assert.equal(locked.statements.length, 1);
  const changed = database();
  changed.history.push({ id: migrations[0].id, checksum: 'old-checksum' });
  await assert.rejects(migrate(changed, 'test', migrations, quiet), /has changed/);
  assert(!changed.statements.some(sql => sql.startsWith('CREATE TABLE IF NOT EXISTS greetings (')));
});
test('configuration requires credentials and validates port without exposing secrets', () => {
  assert.throws(() => connectionOptions({}), /Missing MYSQL_HOST/);
  const env = { MYSQL_HOST: 'db', MYSQL_DATABASE: 'test', MYSQL_USER: 'user', MYSQL_PASSWORD: 'secret' };
  assert.equal(connectionOptions(env).port, 3306);
  assert.equal(connectionOptions(env).multipleStatements, false);
  assert.throws(() => connectionOptions({ ...env, MYSQL_PORT: 'invalid' }), /Invalid MYSQL_PORT/);
});
