const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * @param {{ userId: string, role: string }} payload
 * @returns {string}
 */
function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

/**
 * @param {string} token
 * @returns {{ userId: string, role: string, iat: number, exp: number }}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
