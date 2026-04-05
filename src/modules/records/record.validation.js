const { z } = require("zod");

const recordTypeEnum = z.enum(["income", "expense"]);

const createRecordSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  type: recordTypeEnum,
  category: z.string().trim().min(2).max(60),
  date: z.coerce.date(),
  note: z.string().trim().max(300).optional(),
});

const updateRecordSchema = z
  .object({
    amount: z.number().positive("Amount must be greater than 0").optional(),
    type: recordTypeEnum.optional(),
    category: z.string().trim().min(2).max(60).optional(),
    date: z.coerce.date().optional(),
    note: z.string().trim().max(300).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

const recordIdParamSchema = z.object({
  recordId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid record id"),
});

const listRecordsQuerySchema = z
  .object({
    type: recordTypeEnum.optional(),
    category: z.string().trim().min(1).max(60).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(["date", "amount", "createdAt"]).default("date"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (query) => {
      if (!query.startDate || !query.endDate) return true;
      return query.startDate <= query.endDate;
    },
    {
      message: "startDate must be before or equal to endDate",
      path: ["startDate"],
    }
  );

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
  listRecordsQuerySchema,
};
