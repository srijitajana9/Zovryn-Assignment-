const bcrypt = require("bcryptjs");
const ApiError = require("../../utils/ApiError");
const { signAccessToken } = require("../../utils/jwt");
const { User } = require("../../models/User");
const { createUser } = require("../users/user.service");

/**
 * @param {{ email: string, password: string }} input
 */
async function login(input) {
  const user = await User.findOne({ email: input.email.toLowerCase() });

  if (!user) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "USER_INACTIVE", "User account is inactive");
  }

  const token = signAccessToken({ userId: user.id, role: user.role });

  return {
    token,
    user: user.toJSON(),
  };
}

/**
 * @param {{ name: string, email: string, password: string }} input
 */
async function bootstrapAdmin(input) {
  const userCount = await User.countDocuments();

  if (userCount > 0) {
    throw new ApiError(409, "BOOTSTRAP_LOCKED", "Bootstrap is only allowed before any user exists");
  }

  const admin = await createUser({
    ...input,
    role: "admin",
    status: "active",
  });

  return {
    token: signAccessToken({ userId: admin.id, role: admin.role }),
    user: admin.toJSON(),
  };
}

module.exports = {
  login,
  bootstrapAdmin,
};
