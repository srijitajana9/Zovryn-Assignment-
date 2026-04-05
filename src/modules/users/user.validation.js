const { z } = require("zod");

const roleEnum = z.enum(["viewer", "analyst", "admin"]);
const statusEnum = z.enum(["active", "inactive"]);

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6).max(128),
  role: roleEnum.optional(),
  status: statusEnum.optional(),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    role: roleEnum.optional(),
    status: statusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

const userIdParamSchema = z.object({
  userId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid user id"),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
};
