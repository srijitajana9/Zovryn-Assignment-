const asyncHandler = require("../../utils/asyncHandler");
const { createUser } = require("../users/user.service");
const { login, bootstrapAdmin } = require("./auth.service");

const loginHandler = asyncHandler(async (req, res) => {
  const result = await login(req.body);

  res.status(200).json({
    success: true,
    data: result,
    message: "Login successful",
  });
});

const meHandler = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

const bootstrapAdminHandler = asyncHandler(async (req, res) => {
  const result = await bootstrapAdmin(req.body);

  res.status(201).json({
    success: true,
    data: result,
    message: "Admin bootstrapped successfully",
  });
});

const registerHandler = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);

  res.status(201).json({
    success: true,
    data: user.toJSON(),
    message: "User registered successfully",
  });
});

module.exports = {
  loginHandler,
  meHandler,
  bootstrapAdminHandler,
  registerHandler,
};
