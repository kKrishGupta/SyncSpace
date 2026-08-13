const { z } = require("zod");

const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name cannot exceed 100 characters"),

  key: z
    .string()
    .trim()
    .min(2, "Project key must be at least 2 characters")
    .max(10, "Project key cannot exceed 10 characters")
    .regex(
      /^[A-Za-z0-9]+$/,
      "Project key can contain only letters and numbers"
    )
    .transform((value) => value.toUpperCase()),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .default("")
});

const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters")
      .max(100, "Project name cannot exceed 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),

    status: z
      .enum(["ACTIVE", "INACTIVE"])
      .optional()
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required"
    }
  );

module.exports = {
  createProjectSchema,
  updateProjectSchema
};