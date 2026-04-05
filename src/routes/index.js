const express = require("express");

const healthRoutes = require("./health.routes");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const recordRoutes = require("../modules/records/record.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/records", recordRoutes);
router.use("/dashboard", dashboardRoutes);

router.get("/error-test", (req, res, next) => {
  next(new Error("Intentional test error"));
});

module.exports = router;
