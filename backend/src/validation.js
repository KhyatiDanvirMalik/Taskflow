const ApiError = require('./middleware/ApiError');

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

function validateTaskInput({ title, priority }, { partial = false } = {}) {
  // Title: required (unless this is a partial update that doesn't touch it),
  // must be a non-empty string after trimming.
  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new ApiError(400, 'Title is required and cannot be empty.');
    }
    if (title.length > 200) {
      throw new ApiError(400, 'Title must be 200 characters or fewer.');
    }
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    throw new ApiError(400, `Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  }
}

function parseIdParam(raw, label = 'id') {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `Invalid ${label}.`);
  }
  return id;
}

module.exports = { validateTaskInput, parseIdParam, VALID_PRIORITIES };
