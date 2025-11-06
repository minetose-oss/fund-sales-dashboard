import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../database.sqlite');
const migrationPath = join(__dirname, '../../drizzle');

console.log('Initializing database...');

// Create database
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Read and execute migration SQL
const migrationFiles = ['0000_curvy_gorilla_man.sql'];

for (const file of migrationFiles) {
  try {
    console.log(`Running migration: ${file}`);
    const sql = readFileSync(join(migrationPath, file), 'utf8');

    // Split by statement-breakpoint
    const statements = sql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        try {
          db.exec(statement);
        } catch (err: any) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists')) {
            console.error('Error executing statement:', statement.substring(0, 100));
            throw err;
          }
        }
      }
    }

    console.log(`✓ Migration ${file} completed`);
  } catch (error) {
    console.error(`Failed to run migration ${file}:`, error);
    throw error;
  }
}

db.close();
console.log('Database initialized successfully!');
