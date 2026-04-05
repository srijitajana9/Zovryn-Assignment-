/**
 * Wraps async route handlers and forwards errors to Express.
 * @param {import("express").RequestHandler} fn
 * @returns {import("express").RequestHandler}
 */
function asyncHandler(fn) {
  return function wrappedAsyncHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
