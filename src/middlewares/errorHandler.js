const ApiError = require("../utils/ApiError");

/**
 * Centralized API error handler.
 * @type {import("express").ErrorRequestHandler}
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: "BAD_JSON",
        message: "Request body contains invalid JSON",
      },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
  }

  if (err && err.name === "MongoServerError" && err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_KEY",
        message: "A record with the same unique field already exists",
      },
    });
  }

  if (err && err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "Invalid resource identifier",
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      ...(isDevelopment ? { details: err.message } : {}),
    },
  });
}

module.exports = errorHandler;
