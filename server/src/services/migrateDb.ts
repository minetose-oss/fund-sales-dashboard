import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '../db/index.js';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('Running migrations...');

  const dbPath = join(__dirname, '../../database.sqlite');
  const sqlite = new Database(dbPath);
  const database = drizzle(sqlite);

  await migrate(database, { migrationsFolder: join(__dirname, '../../drizzle') });

  console.log('Migrations completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
});
