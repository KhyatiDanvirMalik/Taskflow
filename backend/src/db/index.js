const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'taskflow.db');

// Make sure the data directory exists (Render's disk / local dev alike).
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// SQLite does not enforce foreign keys by default — must be turned on per connection.
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

function initSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

initSchema();

module.exports = db;
