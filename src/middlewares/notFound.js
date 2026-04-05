const ApiError = require("../utils/ApiError");

/**
 * 404 handler for unmatched routes.
 * @type {import("express").RequestHandler}
 */
function notFound(req, res, next) {
  next(new ApiError(404, "NOT_FOUND", `Route ${req.method} ${req.originalUrl} not found`));
}

module.exports = notFound;
