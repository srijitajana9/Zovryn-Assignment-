const ApiError = require("../utils/ApiError");

/**
 * @param {import("zod").ZodTypeAny} schema
 * @param {"body" | "query" | "params"} [source]
 * @returns {import("express").RequestHandler}
 */
function validate(schema, source = "body") {
  return function validateRequest(req, res, next) {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return next(new ApiError(400, "VALIDATION_ERROR", "Invalid request payload", details));
    }

    req[source] = result.data;
    return next();
  };
}

module.exports = validate;
