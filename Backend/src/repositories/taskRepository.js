const Task = require("../models/Task");

// Create a task
const createTask = async (taskData) => {
  return await Task.create(taskData);
};

// Find a task by ID
const findTaskById = async (taskId) => {
  return await Task.findById(taskId);
};

// Find all tasks belonging to a project
const findTasksByProject = async (projectId) => {
  return await Task.find({ projectId }).sort({ createdAt: -1 });
};

// Update a task
const updateTask = async (taskId, updateData) => {
  return await Task.findByIdAndUpdate(
    taskId,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );
};

// Update task only if the version matches
const updateTaskWithVersion = async (
  taskId,
  version,
  updateData
) => {
  return await Task.findOneAndUpdate(
    {
      _id: taskId,
      version: version
    },
    {
      $set: updateData,
      $inc: {
        version: 1
      }
    },
    {
      new: true,
      runValidators: true
    }
  );
};

// Delete a task
const deleteTask = async (taskId) => {
  return await Task.findByIdAndDelete(taskId);
};

module.exports = {
  createTask,
  findTaskById,
  findTasksByProject,
  updateTask,
  updateTaskWithVersion,
  deleteTask
};