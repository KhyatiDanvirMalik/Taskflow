// Wraps a route handler so any thrown error (sync or from a rejected promise)
// is forwarded to Express's error handler instead of crashing the process
// or leaving the request hanging.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
