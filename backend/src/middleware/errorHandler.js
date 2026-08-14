const ApiError = require('./ApiError');

// Centralized error handler. Any error thrown or passed to next() lands here,
// so the client always gets a consistent JSON shape instead of an HTML stack
// trace or a hung connection.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
