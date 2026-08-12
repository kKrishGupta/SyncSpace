# SyncSpace — WebSocket Design

## Connection

Client connects to the WebSocket server after authentication.

## Authentication

Each connection is associated with:

- userId
- workspaceId
- project membership

## Events

### Tasks

TASK_CREATED
TASK_UPDATED
TASK_DELETED
TASK_MOVED

### Comments

COMMENT_CREATED
COMMENT_UPDATED
COMMENT_DELETED

### Presence

USER_ONLINE
USER_OFFLINE

### Collaboration

TYPING_STARTED
TYPING_STOPPED

### Notifications

NOTIFICATION_CREATED

## Event Structure

```json
{
  "eventId": "uuid",
  "type": "TASK_UPDATED",
  "workspaceId": "workspace-id",
  "projectId": "project-id",
  "entityId": "task-id",
  "actorId": "user-id",
  "timestamp": "ISO_DATE",
  "payload": {}
}