const { FinancialRecord } = require("../../models/FinancialRecord");

/**
 * @param {{ startDate?: Date, endDate?: Date }} query
 * @returns {{ date?: { $gte?: Date, $lte?: Date } }}
 */
function buildDateMatch(query) {
  /** @type {{ date?: { $gte?: Date, $lte?: Date } }} */
  const match = {};

  if (query.startDate || query.endDate) {
    match.date = {};
    if (query.startDate) match.date.$gte = query.startDate;
    if (query.endDate) match.date.$lte = query.endDate;
  }

  return match;
}

/**
 * @param {{ startDate?: Date, endDate?: Date }} query
 */
async function getSummary(query) {
  const match = buildDateMatch(query);

  const [result] = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  const totalIncome = result ? result.totalIncome : 0;
  const totalExpense = result ? result.totalExpense : 0;

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
}

/**
 * @param {{ startDate?: Date, endDate?: Date }} query
 */
async function getCategoryTotals(query) {
  const match = buildDateMatch(query);

  const grouped = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.category": 1 } },
  ]);

  /** @type {Record<string, { category: string, income: number, expense: number, net: number }>} */
  const byCategory = {};

  for (const row of grouped) {
    const category = row._id.category;
    const type = row._id.type;

    if (!byCategory[category]) {
      byCategory[category] = {
        category,
        income: 0,
        expense: 0,
        net: 0,
      };
    }

    if (type === "income") byCategory[category].income = row.total;
    if (type === "expense") byCategory[category].expense = row.total;
    byCategory[category].net = byCategory[category].income - byCategory[category].expense;
  }

  return Object.values(byCategory);
}

/**
 * @param {{ limit: number }} query
 */
async function getRecentActivity(query) {
  const records = await FinancialRecord.find({})
    .sort({ date: -1, createdAt: -1 })
    .limit(query.limit)
    .populate("createdBy", "name email role");

  return records;
}

/**
 * @param {{ period: "weekly" | "monthly", months: number }} query
 */
async function getTrends(query) {
  const startDate = new Date();
  startDate.setUTCDate(1);
  startDate.setUTCHours(0, 0, 0, 0);
  startDate.setUTCMonth(startDate.getUTCMonth() - (query.months - 1));

  const labelFormat = query.period === "weekly" ? "%G-W%V" : "%Y-%m";

  const trends = await FinancialRecord.aggregate([
    { $match: { date: { $gte: startDate } } },
    {
      $group: {
        _id: {
          label: {
            $dateToString: {
              format: labelFormat,
              date: "$date",
              timezone: "UTC",
            },
          },
        },
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
      },
    },
    { $sort: { "_id.label": 1 } },
    {
      $project: {
        _id: 0,
        label: "$_id.label",
        income: 1,
        expense: 1,
        net: { $subtract: ["$income", "$expense"] },
      },
    },
  ]);

  return {
    period: query.period,
    months: query.months,
    startDate: startDate.toISOString(),
    points: trends,
  };
}

module.exports = {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getTrends,
};
