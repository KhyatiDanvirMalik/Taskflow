const express = require('express');
const queries = require('../db/queries');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../middleware/ApiError');
const { parseIdParam } = require('../validation');

const router = express.Router();

// GET /api/boards/:id — full board with columns and tasks nested, plus
// task counts per column (uses the required aggregation query).
router.get(
  '/:id',
  asyncHandler((req, res) => {
    const boardId = parseIdParam(req.params.id, 'board id');

    const board = queries.getBoardById.get(boardId);
    if (!board) {
      throw new ApiError(404, `No board found with id ${boardId}.`);
    }

    const columns = queries.getColumnsByBoard.all(boardId);
    const counts = queries.getTaskCountsByColumn.all(boardId);
    const countByColumnId = Object.fromEntries(counts.map((c) => [c.column_id, c.task_count]));

    const columnsWithTasks = columns.map((column) => ({
      ...column,
      task_count: countByColumnId[column.id] ?? 0,
      tasks: queries.getTasksByColumn.all(column.id),
    }));

    res.json({ ...board, columns: columnsWithTasks });
  })
);

module.exports = router;
