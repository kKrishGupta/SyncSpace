const {z} = require('zod');

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH','URGENT'];

const createTaskSchema = z.object({
  title:z
  .string()
  .trim()
  .min(1,"Title is required")
  .max(100,"Title cannot exceed 100 characters"),
  description:z
  .string()
  .trim()
  .max(1000,"Description cannot exceed 1000 characters")
  .optional(),
  
  priority:z
  .enum(TASK_PRIORITIES, {message: "Invalid priority value"})
  .optional(),
  
  labels:z
  .array(z.string().trim().max(50,"Label cannot exceed 50 characters"))
  .optional(),

  dueDate:z
  .coerce
  .date()
  .optional(),

});

// Update task schema
const updateTaskSchema = z.object({
  title:z
  .string()
  .trim()
  .min(1,"Title is required")
  .max(200,"Title cannot exceed 200 characters")
  .optional(),

  description:z
  .string()
  .trim()
  .max(1000,"Description cannot exceed 1000 characters")
  .optional(),

  status:z
  .enum(TASK_STATUSES, {message: "Invalid status value"})
  .optional(),

  priority:z
  .enum(TASK_PRIORITIES, {message: "Invalid priority value"})
  .optional(),

  assigneeId:z
  .string()
  .min(1,"Assignee ID is required")
  .optional(),

  labels:z
  .array(z.string().trim().max(50,"Label cannot exceed 50 characters"))
  .optional(),


  dueDate:z
  .coerce
  .date()
  .optional(),

  version:z
  .number()
  .int("Version must be an integer")
  .positive("Version must be a positive number")
  .optional(),
})
.refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  TASK_STATUSES,
  TASK_PRIORITIES,
};