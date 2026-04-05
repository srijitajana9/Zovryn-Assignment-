const express = require("express");

const validate = require("../../middlewares/validate");
const { allowRoles, requireAuth } = require("../../middlewares/auth");
const { createRateLimiter } = require("../../middlewares/rateLimit");
const env = require("../../config/env");
const {
  loginSchema,
  bootstrapAdminSchema,
  registerSchema,
} = require("./auth.validation");
const {
  loginHandler,
  meHandler,
  bootstrapAdminHandler,
  registerHandler,
} = require("./auth.controller");

const router = express.Router();
const authRateLimiter = createRateLimiter({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
});

router.post("/login", authRateLimiter, validate(loginSchema), loginHandler);
router.post("/bootstrap-admin", authRateLimiter, validate(bootstrapAdminSchema), bootstrapAdminHandler);
router.get("/me", requireAuth, meHandler);
router.post("/register", authRateLimiter, requireAuth, allowRoles(["admin"]), validate(registerSchema), registerHandler);

module.exports = router;
