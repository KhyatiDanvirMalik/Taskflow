// Each test run gets its own throwaway SQLite file so tests never touch
// the real dev database and can run in isolation / in parallel-safe order.
const fs = require('fs');
const os = require('os');
const path = require('path');

function setupTestDb() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-test-'));
  const dbPath = path.join(tmpDir, 'test.db');
  process.env.DB_PATH = dbPath;

  // Clear require cache so modules re-initialize against the new DB_PATH.
  Object.keys(require.cache).forEach((key) => {
    if (key.includes(`${path.sep}src${path.sep}`)) {
      delete require.cache[key];
    }
  });

  const db = require('../db/index');
  const queries = require('../db/queries');
  const createApp = require('../app');

  // Minimal seed: one board, one column, so route tests have something to hang off.
  const boardId = db.prepare('INSERT INTO boards (name) VALUES (?)').run('Test Board').lastInsertRowid;
  const todoId = db
    .prepare('INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)')
    .run(boardId, 'To Do', 0).lastInsertRowid;
  const doneId = db
    .prepare('INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)')
    .run(boardId, 'Done', 1).lastInsertRowid;

  const app = createApp();

  return { app, db, queries, boardId, todoId, doneId, dbPath, tmpDir };
}

function teardownTestDb({ db, tmpDir }) {
  db.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

module.exports = { setupTestDb, teardownTestDb };
