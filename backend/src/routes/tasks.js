const express = require('express');
const queries = require('../db/queries');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../middleware/ApiError');
const { validateTaskInput, parseIdParam, VALID_PRIORITIES } = require('../validation');

const router = express.Router();

// GET /api/tasks?board_id=1&priority=High
// Without priority: all tasks on the board.
// With priority: uses the required "tasks by priority, newest first" query.
router.get(
  '/',
  asyncHandler((req, res) => {
    const boardId = parseIdParam(req.query.board_id, 'board_id');
    const { priority } = req.query;

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        throw new ApiError(400, `Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
      }
      return res.json(queries.getTasksByPriority.all(boardId, priority));
    }

    res.json(queries.getTasksByBoard.all(boardId));
  })
);

// POST /api/tasks — create a task in a column.
router.post(
  '/',
  asyncHandler((req, res) => {
    const { column_id, title, description, priority } = req.body ?? {};
    const columnId = parseIdParam(column_id, 'column_id');

    const column = queries.getColumnById.get(columnId);
    if (!column) {
      throw new ApiError(400, `No column found with id ${columnId}.`);
    }

    validateTaskInput({ title, priority });

    const result = queries.insertTask.run({
      column_id: columnId,
      title: title.trim(),
      description: description && description.trim().length > 0 ? description.trim() : null,
      priority: priority || 'Medium',
    });

    const created = queries.getTaskById.get(result.lastInsertRowid);
    res.status(201).json(created);
  })
);

// PATCH /api/tasks/:id — edit title/description/priority.
router.patch(
  '/:id',
  asyncHandler((req, res) => {
    const id = parseIdParam(req.params.id, 'task id');
    const existing = queries.getTaskById.get(id);
    if (!existing) {
      throw new ApiError(404, `No task found with id ${id}.`);
    }

    const { title, description, priority } = req.body ?? {};
    validateTaskInput({ title, priority }, { partial: true });

    const updated = {
      id,
      title: title !== undefined ? title.trim() : existing.title,
      description:
        description !== undefined
          ? description && description.trim().length > 0
            ? description.trim()
            : null
          : existing.description,
      priority: priority !== undefined ? priority : existing.priority,
    };

    queries.updateTask.run(updated);
    res.json(queries.getTaskById.get(id));
  })
);

// PATCH /api/tasks/:id/move — move a task to a different column.
router.patch(
  '/:id/move',
  asyncHandler((req, res) => {
    const id = parseIdParam(req.params.id, 'task id');
    const existing = queries.getTaskById.get(id);
    if (!existing) {
      throw new ApiError(404, `No task found with id ${id}.`);
    }

    const columnId = parseIdParam(req.body?.column_id, 'column_id');
    const column = queries.getColumnById.get(columnId);
    if (!column) {
      throw new ApiError(400, `No column found with id ${columnId}.`);
    }

    queries.updateTaskColumn.run({ id, column_id: columnId });
    res.json(queries.getTaskById.get(id));
  })
);

// DELETE /api/tasks/:id
router.delete(
  '/:id',
  asyncHandler((req, res) => {
    const id = parseIdParam(req.params.id, 'task id');
    const existing = queries.getTaskById.get(id);
    if (!existing) {
      throw new ApiError(404, `No task found with id ${id}.`);
    }

    queries.deleteTask.run(id);
    res.status(204).send();
  })
);

module.exports = router;
