import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from '../config/db.js';

const directory = join(dirname(fileURLToPath(import.meta.url)), 'migrations');
const command = process.argv[2] || 'status';

async function migrations() {
  let names;
  try {
    names = (await readdir(directory)).filter((name) => /^\d+[\w-]*\.sql$/.test(name)).sort();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return Promise.all(names.map(async (name) => {
    const sql = await readFile(join(directory, name), 'utf8');
    return { name, sql, checksum: createHash('sha256').update(sql).digest('hex') };
  }));
}

async function main() {
  if (!['up', 'status'].includes(command)) throw new Error('Usage: node src/db/migrate.js [up|status]');
  const files = await migrations();
  const connection = await pool.getConnection();
  try {
    // MySQL DDL auto-commits; each migration must be idempotent when recovered manually.
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    const [rows] = await connection.query('SELECT name, checksum FROM schema_migrations');
    const applied = new Map(rows.map((row) => [row.name, row.checksum]));
    for (const file of files) {
      const previous = applied.get(file.name);
      if (previous && previous !== file.checksum) throw new Error(`Applied migration changed: ${file.name}`);
    }
    for (const file of files) {
      const previous = applied.get(file.name);
      if (command === 'status') {
        console.log(`${previous ? 'applied' : 'pending'}  ${file.name}`);
      } else if (!previous) {
        // One SQL statement per file; MySQL DDL auto-commits and cannot be rolled back.
        await connection.query(file.sql);
        await connection.execute('INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)', [file.name, file.checksum]);
        console.log(`applied  ${file.name}`);
      }
    }
    if (!files.length) console.log('No migrations found.');
  } finally {
    connection.release();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
