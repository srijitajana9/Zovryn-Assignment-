const express = require("express");

const { requireAuth, allowRoles } = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const {
  dateRangeQuerySchema,
  recentActivityQuerySchema,
  trendsQuerySchema,
} = require("./dashboard.validation");
const {
  summaryHandler,
  categoryTotalsHandler,
  recentActivityHandler,
  trendsHandler,
} = require("./dashboard.controller");

const router = express.Router();

router.use(requireAuth, allowRoles(["viewer", "analyst", "admin"]));

router.get("/summary", validate(dateRangeQuerySchema, "query"), summaryHandler);
router.get("/category-totals", validate(dateRangeQuerySchema, "query"), categoryTotalsHandler);
router.get("/recent-activity", validate(recentActivityQuerySchema, "query"), recentActivityHandler);
router.get("/trends", validate(trendsQuerySchema, "query"), trendsHandler);

module.exports = router;
