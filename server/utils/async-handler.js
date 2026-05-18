/**
 * Wraps an async route handler and forwards any thrown errors to Express next().
 * Eliminates repetitive try/catch in every controller.
 *
 * @param {Function} fn - Async Express route handler
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
