const asyncHandler = require("../../utils/asyncHandler");
const { User } = require("../../models/User");
const { createUser, updateUser } = require("./user.service");

const createUserHandler = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json({
    success: true,
    data: user.toJSON(),
    message: "User created successfully",
  });
});

const listUsersHandler = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: users,
  });
});

const updateUserHandler = asyncHandler(async (req, res) => {
  const user = await updateUser(req.params.userId, req.body);

  res.status(200).json({
    success: true,
    data: user.toJSON(),
    message: "User updated successfully",
  });
});

module.exports = {
  createUserHandler,
  listUsersHandler,
  updateUserHandler,
};
