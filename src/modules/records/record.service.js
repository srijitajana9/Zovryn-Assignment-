const ApiError = require("../../utils/ApiError");
const { FinancialRecord } = require("../../models/FinancialRecord");

/**
 * @param {{ amount: number, type: "income" | "expense", category: string, date: Date, note?: string }} input
 * @param {string} creatorId
 */
async function createRecord(input, creatorId) {
  const record = await FinancialRecord.create({
    ...input,
    createdBy: creatorId,
  });

  return record;
}

/**
 * @param {string} recordId
 */
async function getRecordById(recordId) {
  const record = await FinancialRecord.findById(recordId).populate("createdBy", "name email role");
  if (!record) {
    throw new ApiError(404, "RECORD_NOT_FOUND", "Financial record not found");
  }
  return record;
}

/**
 * @param {string} recordId
 * @param {{ amount?: number, type?: "income" | "expense", category?: string, date?: Date, note?: string }} updates
 */
async function updateRecord(recordId, updates) {
  const record = await FinancialRecord.findById(recordId);
  if (!record) {
    throw new ApiError(404, "RECORD_NOT_FOUND", "Financial record not found");
  }

  if (updates.amount !== undefined) record.amount = updates.amount;
  if (updates.type !== undefined) record.type = updates.type;
  if (updates.category !== undefined) record.category = updates.category;
  if (updates.date !== undefined) record.date = updates.date;
  if (updates.note !== undefined) record.note = updates.note;

  await record.save();
  return record;
}

/**
 * @param {string} recordId
 */
async function deleteRecord(recordId) {
  const record = await FinancialRecord.findById(recordId);
  if (!record) {
    throw new ApiError(404, "RECORD_NOT_FOUND", "Financial record not found");
  }

  await record.deleteOne();
}

/**
 * @param {{ type?: "income" | "expense", category?: string, startDate?: Date, endDate?: Date, page: number, limit: number, sortBy: "date" | "amount" | "createdAt", sortOrder: "asc" | "desc" }} query
 */
async function listRecords(query) {
  /** @type {Record<string, unknown>} */
  const filters = {};

  if (query.type) filters.type = query.type;
  if (query.category) filters.category = query.category;
  if (query.startDate || query.endDate) {
    filters.date = {};
    if (query.startDate) filters.date.$gte = query.startDate;
    if (query.endDate) filters.date.$lte = query.endDate;
  }

  const skip = (query.page - 1) * query.limit;
  const sortDirection = query.sortOrder === "asc" ? 1 : -1;
  const sort = { [query.sortBy]: sortDirection };

  const [records, total] = await Promise.all([
    FinancialRecord.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .populate("createdBy", "name email role"),
    FinancialRecord.countDocuments(filters),
  ]);

  return {
    records,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

module.exports = {
  createRecord,
  getRecordById,
  updateRecord,
  deleteRecord,
  listRecords,
};
