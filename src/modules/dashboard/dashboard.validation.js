const { z } = require("zod");

const dateRangeQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
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

const recentActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const trendsQuerySchema = z.object({
  period: z.enum(["weekly", "monthly"]).default("monthly"),
  months: z.coerce.number().int().min(1).max(24).default(6),
});

module.exports = {
  dateRangeQuerySchema,
  recentActivityQuerySchema,
  trendsQuerySchema,
};
