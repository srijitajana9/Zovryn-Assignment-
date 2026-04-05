const asyncHandler = require("../../utils/asyncHandler");
const {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getTrends,
} = require("./dashboard.service");

const summaryHandler = asyncHandler(async (req, res) => {
  const data = await getSummary(req.query);
  res.status(200).json({ success: true, data });
});

const categoryTotalsHandler = asyncHandler(async (req, res) => {
  const data = await getCategoryTotals(req.query);
  res.status(200).json({ success: true, data });
});

const recentActivityHandler = asyncHandler(async (req, res) => {
  const data = await getRecentActivity(req.query);
  res.status(200).json({ success: true, data });
});

const trendsHandler = asyncHandler(async (req, res) => {
  const data = await getTrends(req.query);
  res.status(200).json({ success: true, data });
});

module.exports = {
  summaryHandler,
  categoryTotalsHandler,
  recentActivityHandler,
  trendsHandler,
};
