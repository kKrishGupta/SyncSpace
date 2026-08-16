const express = require("express");

const router = express.Router();

const taskController = require("../controllers/taskController");

router.post(
  "/projects/:id/tasks",
  taskController.createTask
);

router.get(
  "/projects/:id/tasks",
  taskController.getTasksByProject
);

router.get(
  "/tasks/:id",
  taskController.getTaskById
);

router.patch(
  "/tasks/:id",
  taskController.updateTask
);

router.delete(
  "/tasks/:id",
  taskController.deleteTask
);

router.patch(
  "/tasks/:id/status",
  taskController.updateTaskStatus
);

router.patch(
  "/tasks/:id/assignee",
  taskController.updateTaskAssignee
);

module.exports = router;