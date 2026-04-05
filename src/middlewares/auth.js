const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/jwt");
const { User } = require("../models/User");

/**
 * @type {import("express").RequestHandler}
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Missing or invalid authorization token"));
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).select("-passwordHash");

    if (!user) {
      return next(new ApiError(401, "UNAUTHORIZED", "User not found for this token"));
    }

    if (user.status !== "active") {
      return next(new ApiError(403, "USER_INACTIVE", "User account is inactive"));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, "UNAUTHORIZED", "Token is invalid or expired"));
  }
}

/**
 * @param {string[]} roles
 * @returns {import("express").RequestHandler}
 */
function allowRoles(roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Authentication is required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "FORBIDDEN", "You do not have permission to access this resource"));
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  allowRoles,
};
