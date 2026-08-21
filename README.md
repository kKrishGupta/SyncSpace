# SyncSpace 🌌

### Real-Time Team Collaboration & Development Platform
> **"Code together. Review together. Ship together."**

SyncSpace is a production-grade, highly scalable real-time collaboration platform designed for modern development teams. It unifies project management, Kanban task organization, live multi-user code editing, Pull Request-style code reviews, team chat, decision logs, and team presence tracking into a single, cohesive workspace.

---

## 🗺️ System Architecture

SyncSpace is architected to support high-concurrency real-time interactions, using a decoupled Client-Server architecture orchestrated with Docker.

```
                    Internet / Client App
                              │
                              ▼
                     AWS Application Load
                        Balancer (ALB)
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       SyncSpace-Backend 1           SyncSpace-Backend 2
       (Node/Express + WS)           (Node/Express + WS)
               │                             │
               └──────────────┬──────────────┘
                              ▼
                        Redis Cluster
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
           Pub / Sub    Presence TTL    Cache / Rate
          (WS Sync)      (Heartbeat)      Limiting
                              │
                              ▼
                        MongoDB Atlas
                         (Persistent)
                              │
                              ▼
                         Amazon S3
                      (File Storage)
```

### Flow and Component Interaction:
1. **Frontend:** Built with **React 19**, **Vite**, and **Tailwind CSS v4.0**. Integrated with **Monaco Editor** for code rooms and **@dnd-kit** for interactive Kanban boards.
2. **Backend Services:** Built with **Express 5.x** running stateless Node.js clusters, handling API routing, security checks (Helmet, CORS), and holding stateful WebSocket connections (`ws`).
3. **Redis Event Bus:** Connects multiple server instances using a Redis Pub/Sub backend, ensuring WebSocket events (like keystrokes, cursors, chat notifications, and presence states) scale horizontally across multiple instances.
4. **Data Layer:** **MongoDB** persists application domains, while ephemeral presence datasets (who is online, active cursors, active files) are managed in Redis with auto-expiring TTL keys.

---

## 📁 Product Domain Hierarchy

SyncSpace leverages a multi-tenant domain structure mapping to a clear database model hierarchy:

```
Workspace (Multi-tenant boundary)
  ├── Members & Roles (OWNER, ADMIN, MANAGER, MEMBER, VIEWER)
  ├── Teams (Sub-groups of developers)
  └── Projects
        ├── Code Rooms (Collaborative Monaco IDE sessions)
        ├── Project File System (Folders, files, and versions)
        ├── Tasks & Kanban Board (TODO, IN_PROGRESS, IN_REVIEW, DONE)
        ├── Code Reviews / Pull Requests (Line-level comments & reviews)
        ├── Team Chat & Mentions (Persistent message threads)
        ├── Technical Blockers (High-severity impediments)
        ├── Decision Logs (ADR: Architecture Decision Records)
        └── Activity Feed (Audit trails)
```

---

## ⚡ Core Features

### 1. Workspaces & Roles (RBAC)
- Complete workspace organization enabling isolated environment contexts.
- Role-Based Access Control matrix securing HTTP routes and WebSocket rooms:
  - **OWNER / ADMIN:** Global management permissions (billing, deletion, invites).
  - **MAINTAINER:** Workflow and code review merges, task assignments, board management.
  - **DEVELOPER:** Code editing, task updates, review creations, code comments.
  - **REVIEWER:** Inspection-only code rooms, line commenting, PR approvals.
  - **VIEWER:** Read-only access to code, kanban, and project metrics.

### 2. Code Room (Collaborative IDE)
- **Monaco Editor Integration:** Native syntax highlighting for over 12 languages (JS, TS, Python, Go, C++, HTML, etc.), minimap support, tabbed file management, and line indicators.
- **Real-Time Cursor Tracking:** Instant broadcast of remote cursor coordinates (line and column) and text selections, rendered with custom user color flags and name tags.
- **Active Team Presence:** Real-time visibility into what project files other developers are working on (e.g., `Aman (Editing index.js)`, `Krish (Viewing database.js)`).
- **Simulated Build Runner:** Compile code directly inside the Code Room with visual terminal feedback.

### 3. Workflow & Code Reviews (PRs)
- Create code reviews referencing additions, deletions, descriptions, and reviewers.
- Line-level code comments allowing direct inline reviews on specific files.
- Merge pipeline supporting status changes (`OPEN`, `CHANGES_REQUESTED`, `APPROVED`, `MERGED`).
- Project Decision Logs (ADRs) to propose, approve, or reject key architectural changes.

### 4. Kanban Task Board & Chat
- Fully functional drag-and-drop Kanban board (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`) with priority markers.
- Project-level real-time chat with `@mention` autocompletion and instant notification popups.
- Centralized Activity Feeds tracking edits, task states, and workspace logs.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19, Tailwind CSS v4, Vite | High-performance SPA, Monaco Editor, @dnd-kit, Lucide Icons |
| **Backend** | Node.js, Express.js (v5) | RESTful API controllers, centralized error handling |
| **Real-Time** | WebSockets (ws), Redis Pub/Sub | Scalable websocket connection manager, event distribution |
| **Database** | MongoDB (Mongoose v9) | Document storage, indices for global searches |
| **Caching/State**| Redis (v7) | Distributed caching, rate-limiting, active presence, TTLs |
| **Infrastructure**| Docker, Docker Compose, AWS | Containerized development, scalable container instances |

---

## 🚀 Local Development Setup

You can run SyncSpace locally using Docker (recommended) or by starting the backend and frontend separately.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Docker & Docker Compose](https://www.docker.com/)
- [MongoDB](https://www.mongodb.com/) & [Redis](https://redis.io/) (if running manually)

---

### Method A: Docker Compose (Quick Start)
The easiest way to boot the entire stack (Database, Cache, Backend API, Frontend App):

1. **Clone the repository** and navigate to the project directory:
   ```bash
   cd SyncSpace
   ```
2. **Setup environment variables:**
   Copy `.env.example` to the root folder:
   ```bash
   cp .env.example .env
   ```
3. **Build and launch containers:**
   ```bash
   docker-compose up --build
   ```
4. Once completed, access the applications at:
   - **Frontend App:** [http://localhost:5173](http://localhost:5173)
   - **Backend API Server:** [http://localhost:5000](http://localhost:5000)
   - **MongoDB Connection:** `mongodb://localhost:27017`
   - **Redis Connection:** `redis://localhost:6379`

---

### Method B: Manual Manual Installation (Step-by-Step)

If you prefer to run the services individually for step-by-step debugging:

#### 1. Setup Backend
1. Navigate to the `Backend` directory:
   ```bash
   cd SyncSpace/Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory using the `.env.example` as a reference:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/syncspace
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret_key_change_in_production
   CLIENT_URL=http://localhost:5173
   ```
4. **Seed Development User (Optional):**
   To create the default developer user (`dev@syncspace.local`), run:
   ```bash
   node src/scripts/createDevUser.js
   ```
5. Start the backend server in development mode:
   ```bash
   npm run dev
   ```

#### 2. Setup Frontend
1. Navigate to the `Frontend` directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_WS_URL=ws://localhost:5000/ws
   ```
4. Start the frontend application:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

---

## 📬 API & WebSocket Events

### HTTP REST Endpoints
Check out the detailed API routes documentation in [`Backend/backend_routes.md`](file:///d:/desktop/newwss/SyncSpace/Backend/backend_routes.md).

### WebSocket Event Map
WebSocket events communicate real-time states using JSON messages structured as `{ type: "EVENT_TYPE", workspaceId: "ID", payload: {} }`.

| Event Type | Direction | Description |
| :--- | :--- | :--- |
| `WORKSPACE_JOIN` | Client ➔ Server | Scope the WS connection to a specific Workspace room |
| `WORKSPACE_LEAVE`| Client ➔ Server | Leave the Workspace room scope |
| `PRESENCE_HEARTBEAT` | Client ➔ Server | Regular ping to maintain user's online state |
| `USER_ONLINE` | Server ➔ Client | Broadcasts when a team member comes online |
| `USER_OFFLINE` | Server ➔ Client | Broadcasts when a team member goes offline |
| `FILE_OPENED` | Client ⇄ Server | Notifies team that a user opened a file |
| `FILE_EDITED` | Client ⇄ Server | Syncs multi-user code edits in the editor |
| `CURSOR_MOVED` | Client ⇄ Server | Broadcasts live coordinate changes for remote cursors |
| `TASK_MOVED` | Client ⇄ Server | Syncs card drag-and-drop actions on the Kanban board |

---

## 🔒 Security & Resiliency Features
- **Stateless Authentication:** Short-lived JWTs coupled with HTTP-Only refresh token cookies.
- **Security Headers:** Express app hardened using [Helmet](https://helmetjs.github.io/) to prevent cross-site scripting (XSS), clickjacking, and mime-type sniffing.
- **Graceful Shutdown:** Cleans up active MongoDB connections, closes Redis channels, disconnects WebSocket clients, and closes HTTP listeners when `SIGTERM` or `SIGINT` is received.
- **Reconnection Resiliency:** Frontend websocket client automatically attempts reconnection with an exponential backoff algorithm (up to 10 attempts).