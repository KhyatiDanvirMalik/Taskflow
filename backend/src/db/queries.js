// All hand-written SQL lives here so it's easy for a reviewer to find and read.
const db = require('./index');

/* ---------- Boards ---------- */

const getBoardById = db.prepare(`
  SELECT id, name, created_at FROM boards WHERE id = ?
`);

const getFirstBoard = db.prepare(`
  SELECT id, name, created_at FROM boards ORDER BY id ASC LIMIT 1
`);

/* ---------- Columns ---------- */

const getColumnsByBoard = db.prepare(`
  SELECT id, board_id, name, position, created_at
  FROM columns
  WHERE board_id = ?
  ORDER BY position ASC, id ASC
`);

const getColumnById = db.prepare(`
  SELECT id, board_id, name, position, created_at FROM columns WHERE id = ?
`);

/* ---------- Tasks: basic CRUD ---------- */

const getTasksByColumn = db.prepare(`
  SELECT id, column_id, title, description, priority, created_at
  FROM tasks
  WHERE column_id = ?
  ORDER BY created_at DESC, id DESC
`);

const getTasksByBoard = db.prepare(`
  SELECT tasks.id, tasks.column_id, tasks.title, tasks.description, tasks.priority, tasks.created_at
  FROM tasks
  JOIN columns ON columns.id = tasks.column_id
  WHERE columns.board_id = ?
  ORDER BY tasks.created_at DESC, tasks.id DESC
`);

const getTaskById = db.prepare(`
  SELECT id, column_id, title, description, priority, created_at FROM tasks WHERE id = ?
`);

const insertTask = db.prepare(`
  INSERT INTO tasks (column_id, title, description, priority)
  VALUES (@column_id, @title, @description, @priority)
`);

const updateTask = db.prepare(`
  UPDATE tasks
  SET title = @title,
      description = @description,
      priority = @priority
  WHERE id = @id
`);

const updateTaskColumn = db.prepare(`
  UPDATE tasks SET column_id = @column_id WHERE id = @id
`);

const deleteTask = db.prepare(`
  DELETE FROM tasks WHERE id = ?
`);

/* ---------- Required "non-trivial" queries ---------- */
// These are the two queries the assignment specifically asks for:
// aggregation (count per column) and a filtered, sorted lookup (by priority).

// 1. Count of tasks per column, for a given board.
// Uses LEFT JOIN + GROUP BY so columns with zero tasks still show a count of 0,
// rather than silently disappearing (which an INNER JOIN would do).
const getTaskCountsByColumn = db.prepare(`
  SELECT columns.id AS column_id,
         columns.name AS column_name,
         COUNT(tasks.id) AS task_count
  FROM columns
  LEFT JOIN tasks ON tasks.column_id = columns.id
  WHERE columns.board_id = ?
  GROUP BY columns.id, columns.name
  ORDER BY columns.position ASC
`);

// 2. Tasks with a given priority on a board, newest first.
// Joins through columns to scope by board_id, since priority alone isn't board-specific.
const getTasksByPriority = db.prepare(`
  SELECT tasks.id, tasks.column_id, tasks.title, tasks.description, tasks.priority, tasks.created_at
  FROM tasks
  JOIN columns ON columns.id = tasks.column_id
  WHERE columns.board_id = ? AND tasks.priority = ?
  ORDER BY tasks.created_at DESC, tasks.id DESC
`);

module.exports = {
  getBoardById,
  getFirstBoard,
  getColumnsByBoard,
  getColumnById,
  getTasksByColumn,
  getTasksByBoard,
  getTaskById,
  insertTask,
  updateTask,
  updateTaskColumn,
  deleteTask,
  getTaskCountsByColumn,
  getTasksByPriority,
};
