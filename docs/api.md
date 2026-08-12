# SyncSpace — API Design

Base URL:

/api/v1

## Authentication

POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me

## Workspaces

POST   /workspaces
GET    /workspaces
GET    /workspaces/:id
PATCH  /workspaces/:id
DELETE /workspaces/:id

## Members

POST   /workspaces/:id/members
GET    /workspaces/:id/members
PATCH  /workspaces/:id/members/:userId
DELETE /workspaces/:id/members/:userId

## Teams

POST   /workspaces/:id/teams
GET    /workspaces/:id/teams

## Projects

POST   /workspaces/:id/projects
GET    /workspaces/:id/projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id

## Tasks

POST   /projects/:id/tasks
GET    /projects/:id/tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id

## Comments

POST   /tasks/:id/comments
GET    /tasks/:id/comments
PATCH  /comments/:id
DELETE /comments/:id

## Notifications

GET    /notifications
PATCH  /notifications/:id/read
PATCH  /notifications/read-all

## Search

GET    /search?q=

## Files

POST   /files
GET    /files/:id
DELETE /files/:id

## Health

GET    /health
GET    /ready
GET    /live