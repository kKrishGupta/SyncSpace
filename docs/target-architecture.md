# SyncSpace — Target Architecture & System Design Document

**Product:** SyncSpace — Real-Time Collaborative Development Platform  
**Tagline:** "Code together. Review together. Ship together."  
**Document Version:** 1.0.0  

---

## 1. System Overview & Core Product Architecture

SyncSpace is a high-performance, real-time collaborative development platform combining project management, code collaboration, live multi-user editing, code reviews, technical decision logs, and team communication into a single cohesive workspace.

```
                   +---------------------------------------+
                   |           React Frontend              |
                   | (Monaco Editor, Yjs CRDT, Tailwind)  |
                   +-------------------+-------------------+
                                       |
                         HTTP REST     |   WebSockets
                      (JSON / Auth)    | (Yjs / Events / Cursors)
                                       v
                   +-------------------+-------------------+
                   |         Express Backend Node          |
                   |   (RBAC, Controllers, WS Server)      |
                   +---------+-------------------+---------+
                             |                   |
            MongoDB Queries  |                   | Redis Pub/Sub & Caching
             & Snapshots     v                   v
                   +---------+----+         +----+--------+
                   |   MongoDB    |         |    Redis    |
                   | (Persistent) |         | (Transient) |
                   +--------------+         +-------------+
```

---

## 2. Product Hierarchy & Domain Model

```
Workspace (Multi-tenant Domain)
  ├── Workspace Members & Roles (OWNER, ADMIN, MAINTAINER, DEVELOPER, REVIEWER, VIEWER)
  ├── Teams
  └── Projects
        ├── Code Rooms (Collaborative Monaco IDE Session)
        ├── Project File System (Folders & Files + Version Snapshots)
        ├── Tasks & Kanban Board (TODO, IN_PROGRESS, IN_REVIEW, DONE)
        ├── Code Reviews / Simplified PR Workflow (OPEN, CHANGES_REQUESTED, APPROVED, MERGED)
        ├── Team Chat & @Mentions
        ├── Technical Blockers (OPEN, IN_PROGRESS, RESOLVED)
        ├── Decision Logs (ADR Records: PROPOSED, APPROVED, REJECTED)
        ├── Project Health Metrics
        └── Activity Feed
```

---

## 3. Core Feature Architecture

### A. Code Room & Monaco Collaborative Editor
- **IDE Layout:** Responsive 3-pane layout containing Left File Tree Explorer, Center Monaco Editor with Tabbed File Management, Right Active Team Collaboration Panel, and Bottom Terminal/Comments Drawer.
- **Monaco Integration:** Supports syntax highlighting for JS, TS, JSX, TSX, JSON, CSS, HTML, Markdown, Python, Java, C++, SQL, YAML, line numbers, minimap, diff viewer, and dark mode.
- **Real-Time Collaboration Engine (Yjs CRDT):**
  - Ephemeral editing updates synced via Yjs `Y.Doc` over WebSocket.
  - Document updates are maintained in-memory and buffered.
  - Periodic snapshots are persisted to MongoDB without hitting the database on every keystroke.
- **Live Ephemeral Cursors & Selection:**
  - Cursor coordinates (line, column, selection range) broadcasted via WebSocket.
  - Cursors rendered in Monaco Editor with custom user colored flags and names.
  - Stored in Redis with 30s TTL heartbeat (never persisted to MongoDB).
- **Active File Presence:**
  - Broadcasts `FILE_OPENED` and `FILE_CLOSED` events.
  - Team panel displays live state: `Krish (Editing taskController.js)`, `Aman (Viewing redis.js)`.

---

### B. Development Workflow Integrations
1. **Task ↔ Code Connection:**
   - Link tasks (`SYNC-142`) directly to project files and code lines.
   - Open Code Room pre-focused on a linked task file; mark tasks completed directly from Code Room.
2. **Code Review Workflow:**
   - Create Pull Request-like reviews referencing changed files, line diffs, author, and reviewers.
   - Line-level code commenting, change requests, approvals, and merge lifecycle.
3. **Blockers & Decision Log (ADR):**
   - High-severity technical blockers generating instant activity and WebSocket notifications.
   - ADR log for recording architectural decisions and team consensus.
4. **Team Chat & Mentions:**
   - Project-level real-time chat with `@User` notifications delivered instantly over WS and stored in MongoDB.

---

## 4. Backend & Security Architecture

### A. Authentication & Session Management
- Dual-token strategy: Short-lived JWT Access Token + Refresh Token with Session hash validation in MongoDB (`Session` model).
- Secure HTTP-only cookie support & Token rotation on refresh.

### B. Centralized RBAC Matrix
- **OWNER / ADMIN:** Complete workspace & project management privileges.
- **MAINTAINER:** Approve/merge reviews, manage development workflow and tasks.
- **DEVELOPER:** Code editing, task creation/updates, review creation, code comments.
- **REVIEWER:** Code review inspection, line comments, approval / request changes.
- **VIEWER:** Read-only access to code, tasks, and activity feed.

### C. Redis Coordination & Pub/Sub
- Redis handles:
  1. Distributed WebSocket event fan-out across multiple backend instances.
  2. Ephemeral presence sets and active file state.
  3. API Rate limiting (`redis-rate-limiter`).
  4. Header-based Idempotency key tracking (`Idempotency-Key: <uuid>`).

### D. System Health & Resiliency
- `GET /health/ready` verifies connection health to MongoDB and Redis.
- Graceful shutdown handles `SIGTERM` / `SIGINT` by stopping HTTP listeners, closing WebSocket sockets, unsubscribing Redis, and closing DB pools cleanly.

---

## 5. Docker Deployment Architecture

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: syncspace-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    container_name: syncspace-redis
    ports:
      - "6379:6379"

  backend:
    build: ./Backend
    container_name: syncspace-backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/syncspace
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=production_super_secret_jwt_key_syncspace_2026
      - CLIENT_URL=http://localhost:5173
    depends_on:
      - mongodb
      - redis

  frontend:
    build: ./Frontend
    container_name: syncspace-frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:5000/api/v1
      - VITE_WS_URL=ws://localhost:5000/ws
    depends_on:
      - backend
```

---
