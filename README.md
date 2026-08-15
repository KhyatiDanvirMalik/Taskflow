# TaskFlow

A full-stack task board (Trello-lite): boards → columns → tasks, with drag-and-drop, priority
filtering, and a real relational database behind it.

**Live app:** https://taskflow-app-m9q0.onrender.com

**Backend API:** https://taskflow-api-uvg9.onrender.com ([health check](https://taskflow-api-uvg9.onrender.com/api/health))

> Free-tier hosting: the first request after a period of inactivity can take 30–60 seconds while
> the service wakes up. Because the free tier has no persistent disk, the database resets to seed
> data on restart/redeploy — it's still a real SQLite database being read and written on every
> action, just not durable forever on this particular free host.

## Features

- View a board with columns and tasks
- Create, edit, and delete tasks (title, description, priority)
- Move tasks between columns via drag-and-drop, or a dropdown on each card
- Filter tasks by priority (Low / Medium / High)
- Search tasks by title
- Empty titles are rejected on both the form and the API
- Failed requests show a dismissible error message instead of a blank screen, and moves roll back
  automatically if the server rejects them

## Technologies used

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React (Vite) | UI components and client-side state |
| Backend | Node.js + Express | REST API, validation, error handling |
| Database | SQLite (`better-sqlite3`) | Relational storage — boards, columns, tasks |
| Hosting | Render | Free web services for both frontend and backend |

## Data model

```sql
boards  (id PK, name NOT NULL, created_at)
columns (id PK, board_id FK -> boards.id, name NOT NULL, position, created_at)
tasks   (id PK, column_id FK -> columns.id, title NOT NULL CHECK(non-empty),
         description, priority NOT NULL CHECK(Low|Medium|High), created_at)
```

Full schema: [`backend/src/db/schema.sql`](backend/src/db/schema.sql). Foreign keys cascade on
delete. SQLite doesn't enforce foreign keys by default — this is explicitly turned on per
connection in `backend/src/db/index.js` (`PRAGMA foreign_keys = ON`).

A task's status **is** which column it's in (`tasks.column_id`) — there's no separate `status`
field that could drift out of sync with it.

The two required non-trivial queries live in `backend/src/db/queries.js`:

1. `getTaskCountsByColumn` — count of tasks per column on a board (`LEFT JOIN` + `GROUP BY`, so
   empty columns still show `0` instead of disappearing).
2. `getTasksByPriority` — tasks with a given priority on a board, newest first (joins through
   `columns` to scope by board).

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/boards/:id` | Board with columns, tasks, and per-column counts |
| GET | `/api/tasks?board_id=&priority=` | Tasks for a board, optionally filtered by priority |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Edit title/description/priority |
| PATCH | `/api/tasks/:id/move` | Move a task to a different column |
| DELETE | `/api/tasks/:id` | Delete a task |

## Running locally

Requires Node.js 18+.

```bash
# Backend
cd backend
npm install
npm run seed      # creates backend/data/taskflow.db with sample data
npm start          # API on http://localhost:4000

# Frontend (second terminal)
cd frontend
npm install
npm run dev         # app on http://localhost:5173
```

The frontend defaults to `http://localhost:4000` for the API. To point it elsewhere (e.g. at the
deployed backend), create `frontend/.env` with:

```
VITE_API_URL=https://taskflow-api-uvg9.onrender.com
```

## Tests

```bash
cd backend
npm test
```

7 tests: rejecting an empty/whitespace title (API + confirms nothing was persisted), moving a
task between columns (API response + direct DB read), and the two required database queries,
including the zero-tasks-in-a-column edge case.

## Assumptions & decisions

- **Single board.** The schema supports multiple boards, but the UI only shows the one created by
  the seed script — multi-board navigation was out of scope for the time budget.
- **Description is optional**, stored as `NULL` (not `""`) when left blank.
- **Move is a separate endpoint from edit** (`PATCH /:id/move` vs `PATCH /:id`) since it's a
  structurally different operation (changes `column_id` only).
- **Drag-and-drop and a dropdown both work**, wired to the same move endpoint — the dropdown is
  more accessible for keyboard/screen-reader use.
- **Optimistic UI on move**: the board updates instantly on drop, then reconciles with the server;
  a failed move rolls back and shows the error banner.

## What I'd improve with more time

- Multi-board support (the schema already allows it)
- Reordering tasks within a column, not just between columns
- A proper toast system instead of a single error banner
- Debounced search if it ever moved server-side

## Time spent

Roughly 5–6 hours: schema and backend (queries, validation, error handling, tests) took the
largest share, with the rest split between the React UI and deployment.

## Something I looked into

SQLite doesn't enforce foreign key constraints by default — even with a `FOREIGN KEY` clause in
the `CREATE TABLE` statement, it'll silently let you insert a task pointing at a nonexistent
column unless you separately run `PRAGMA foreign_keys = ON` on every connection. It's a legacy
default kept for backward compatibility with older SQLite databases that predate FK support.
