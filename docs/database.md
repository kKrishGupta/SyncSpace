
---

# STEP 10 — `database.md`

Don't design every field today.

Just create the initial model map.

```markdown
# SyncSpace — Database Design

## Collections

### users

Stores user accounts.

### workspaces

Stores workspace information.

### workspaceMembers

Maps users to workspaces and roles.

### teams

Stores team information.

### projects

Stores projects within workspaces.

### tasks

Stores project tasks.

### comments

Stores task comments and mentions.

### notifications

Stores user notifications.

### activities

Stores workspace/project activity.

### files

Stores uploaded file metadata.

## Relationships

User
  |
  +-- WorkspaceMember
          |
          +-- Workspace
                 |
                 +-- Projects
                        |
                        +-- Tasks
                               |
                               +-- Comments
                               |
                               +-- Files

User
  |
  +-- Notifications

Workspace
  |
  +-- Activities