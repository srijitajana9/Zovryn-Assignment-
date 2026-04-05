const express = require("express");

const { requireAuth, allowRoles } = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} = require("./user.validation");
const {
  createUserHandler,
  listUsersHandler,
  updateUserHandler,
} = require("./user.controller");

const router = express.Router();

router.use(requireAuth, allowRoles(["admin"]));
router.post("/", validate(createUserSchema), createUserHandler);
router.get("/", listUsersHandler);
router.patch("/:userId", validate(userIdParamSchema, "params"), validate(updateUserSchema), updateUserHandler);

module.exports = router;
