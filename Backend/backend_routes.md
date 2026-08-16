# Backend API Routes

Base URL: `http://localhost:<PORT>/api/v1`

## 1. Workspaces
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/workspaces` | Get all workspaces |
| `POST` | `/workspaces` | Create a workspace |
| `GET` | `/workspaces/:id` | Get a single workspace by ID |
| `PATCH` | `/workspaces/:id` | Update a workspace by ID |

## 2. Projects
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/workspaces/:id/projects` | Get all projects for a specific workspace |
| `POST` | `/workspaces/:id/projects` | Create a new project in a workspace |
| `GET` | `/projects/:id` | Get a specific project by ID |
| `PATCH` | `/projects/:id` | Update a specific project by ID |
| `DELETE` | `/projects/:id` | Delete a specific project by ID |

## 3. Tasks
> Note: Make sure `taskRoutes` is mounted in `app.js` (e.g., `app.use('/api/v1', taskRoutes);`). Currently, it seems to be missing from `app.js`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/projects/:id/tasks` | Create a new task in a project |
| `GET` | `/projects/:id/tasks` | Get all tasks for a specific project |
| `GET` | `/tasks/:id` | Get a specific task by ID |
| `PATCH` | `/tasks/:id` | Update a specific task by ID |
| `DELETE` | `/tasks/:id` | Delete a specific task by ID |
| `PATCH` | `/tasks/:id/status` | Update the status of a task |
| `PATCH` | `/tasks/:id/assignee` | Update the assignee of a task |

## Postman Testing Guide

For testing in Postman, you can set a global or environment variable `{{base_url}}` to your local development URL (e.g., `http://localhost:3000/api/v1` or `http://localhost:5000/api/v1`).

### Example JSON Payloads

**Create Workspace (`POST /workspaces`)**
```json
{
  "name": "My Workspace",
  "description": "Optional description"
}
```

**Create Project (`POST /workspaces/:id/projects`)**
```json
{
  "name": "New Project",
  "description": "Project description"
}
```

**Create Task (`POST /projects/:id/tasks`)**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "assignee": "user_id"
}
```
