const bcrypt = require("bcryptjs");
const { User } = require("../../models/User");
const ApiError = require("../../utils/ApiError");

const PASSWORD_SALT_ROUNDS = 10;

/**
 * @param {{ name: string, email: string, password: string, role?: "viewer" | "analyst" | "admin", status?: "active" | "inactive" }} input
 */
async function createUser(input) {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "USER_EXISTS", "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    role: input.role || "viewer",
    status: input.status || "active",
  });

  return user;
}

/**
 * @param {string} userId
 * @param {{ name?: string, role?: "viewer" | "analyst" | "admin", status?: "active" | "inactive" }} updates
 */
async function updateUser(userId, updates) {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.status !== undefined) user.status = updates.status;

  await user.save();
  return user;
}

module.exports = {
  createUser,
  updateUser,
};
