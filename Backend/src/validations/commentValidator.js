const {z} = require("zod");

const createCommentSchema = z.object({
  content:z
  .string()
  .trim()
  .min(1,"Content is required")
  .max(1000,"Content cannot exceed 1000 characters"),

  mentions : z
  .array(z.string())
  .optional()
  .default([]),

  parentCommentId : z
  .string()
  .optional()
  .nullable()
  .default(null)
});

const updateCommentSchema = z.object({
  content:z
  .string()
  .trim()
  .min(1,"Content is required")
  .max(1000,"Content cannot exceed 1000 characters"),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
};