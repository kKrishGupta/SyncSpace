import apiClient from "./apiClient";

/*
|--------------------------------------------------------------------------
| CREATE TASK
|--------------------------------------------------------------------------
*/

const createTask = async (projectId, taskData) => {
  return await apiClient(
    `/projects/${projectId}/tasks`,
    {
      method: "POST",
      body: JSON.stringify(taskData)
    }
  );
};


/*
|--------------------------------------------------------------------------
| GET TASKS BY PROJECT
|--------------------------------------------------------------------------
*/

const getTasksByProject = async (projectId) => {
  return await apiClient(
    `/projects/${projectId}/tasks`
  );
};


/*
|--------------------------------------------------------------------------
| GET TASK BY ID
|--------------------------------------------------------------------------
*/

const getTaskById = async (taskId) => {
  return await apiClient(
    `/tasks/${taskId}`
  );
};


/*
|--------------------------------------------------------------------------
| UPDATE TASK
|--------------------------------------------------------------------------
*/

const updateTask = async (
  taskId,
  taskData
) => {
  return await apiClient(
    `/tasks/${taskId}`,
    {
      method: "PATCH",
      body: JSON.stringify(taskData)
    }
  );
};


/*
|--------------------------------------------------------------------------
| DELETE TASK
|--------------------------------------------------------------------------
*/

const deleteTask = async (taskId) => {
  return await apiClient(
    `/tasks/${taskId}`,
    {
      method: "DELETE"
    }
  );
};


/*
|--------------------------------------------------------------------------
| UPDATE TASK STATUS
|--------------------------------------------------------------------------
*/

const updateTaskStatus = async (
  taskId,
  status,
  version
) => {
  return await apiClient(
    `/tasks/${taskId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        version
      })
    }
  );
};


/*
|--------------------------------------------------------------------------
| UPDATE TASK ASSIGNEE
|--------------------------------------------------------------------------
*/

const updateTaskAssignee = async (
  taskId,
  assigneeId,
  version
) => {
  return await apiClient(
    `/tasks/${taskId}/assignee`,
    {
      method: "PATCH",
      body: JSON.stringify({
        assigneeId,
        version
      })
    }
  );
};


export {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskAssignee
};