# TaskFlow

A small full-stack task board (Trello-lite): boards → columns → tasks, with drag-and-drop,
priority filtering, and a real SQLite database behind it.

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`)

## Quick start (local, no Docker)

Requires Node.js 18+.

```bash
# 1. Backend
cd backend
npm install
npm run seed      # creates backend/data/taskflow.db with sample data
npm start         # API on http://localhost:4000

# 2. Frontend (in a second terminal)
cd frontend
npm install
npm run dev        # app on http://localhost:5173
```

The frontend defaults to talking to `http://localhost:4000`. To point it elsewhere, copy
`frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.

The backend auto-seeds on first boot if its database is empty, so `npm run seed` is optional —
it's there if you want to reset to sample data (delete `backend/data/taskflow.db` first, or the
seed script will just no-op since data already exists).

## Quick start (Docker)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

The backend's SQLite file lives in a named Docker volume (`backend-data`), so it survives
`docker-compose down` / `up` cycles. Remove it with `docker-compose down -v` to start fresh.

## Running tests

```bash
cd backend
npm test
```

7 tests covering: rejecting an empty/whitespace-only title (both at the API layer and confirming
nothing was persisted), moving a task between columns (both the API response and a direct DB
read), and the two required non-trivial database queries (task counts per column, tasks filtered
by priority in date order) — including an edge case (a column with zero tasks still reports `0`,
not `undefined`, and isn't silently dropped).

## Database schema

Full schema: [`backend/src/db/schema.sql`](backend/src/db/schema.sql). Summary:

```sql
boards  (id PK, name NOT NULL, created_at)
columns (id PK, board_id FK -> boards.id, name NOT NULL, position, created_at)
tasks   (id PK, column_id FK -> columns.id, title NOT NULL CHECK(non-empty),
         description, priority NOT NULL CHECK(Low|Medium|High), created_at)
```

Foreign keys cascade on delete (deleting a board removes its columns and their tasks). SQLite
does not enforce foreign keys by default — this is explicitly turned on per-connection in
`backend/src/db/index.js` (`PRAGMA foreign_keys = ON`), which is easy to miss and worth calling
out for a reviewer.

**The two required non-trivial queries** live in `backend/src/db/queries.js`, clearly commented:

1. `getTaskCountsByColumn` — count of tasks per column on a board. Uses `LEFT JOIN` (not `INNER
   JOIN`) so empty columns still show a count of `0` instead of disappearing from the result.
2. `getTasksByPriority` — tasks with a given priority on a board, newest first. Joins through
   `columns` to scope by board, since `priority` alone isn't board-specific.

Both are real parameterized SQL run against the database (`db.prepare(...).all(...)`), not
`SELECT *` followed by filtering in JavaScript.

## API overview

| Method | Route                      | Purpose                                   |
|--------|-----------------------------|--------------------------------------------|
| GET    | `/api/boards/:id`           | Board with columns, tasks, and per-column counts |
| GET    | `/api/tasks?board_id=&priority=` | Tasks for a board, optionally filtered by priority |
| POST   | `/api/tasks`                | Create a task                             |
| PATCH  | `/api/tasks/:id`             | Edit title/description/priority            |
| PATCH  | `/api/tasks/:id/move`        | Move a task to a different column          |
| DELETE | `/api/tasks/:id`             | Delete a task                             |

All validation errors return `400` with `{ "error": "..." }`; not-found returns `404`; unexpected
failures return `500` with a generic message (details are logged server-side, not leaked to the
client).

## Assumptions & decisions

- **Single board.** The schema supports multiple boards, but the UI only ever shows board `id=1`
  (created by the seed script). Multi-board navigation was out of scope for the time budget, and
  the assignment's UI requirements only describe "a board," singular.
- **Status *is* the column.** Rather than storing a separate `status` string that could drift out
  of sync with `column_id`, a task's status is simply which column it belongs to
  (`tasks.column_id`). This matches how the assignment describes it ("a status (which column it's
  in)") and avoids a redundant field that needs to be kept consistent by hand.
- **Priority is a fixed enum** (`Low` / `Medium` / `High`), enforced with a `CHECK` constraint at
  the database level, not just in the frontend form.
- **Description is optional** and stored as `NULL` (not an empty string) when left blank, since
  that's a cleaner "no description" signal for the two representations to converge on.
- **Move endpoint is separate from edit** (`PATCH /:id/move` vs `PATCH /:id`) — moving a task is a
  structurally different operation (changes `column_id` only) from editing its content, and
  keeping them separate made both the optimistic-UI logic and the tests simpler to reason about.
- **Drag-and-drop plus a dropdown fallback**, both wired to the same move endpoint. The assignment
  explicitly allows either; shipping both took little extra time and drag-and-drop alone would
  have been less accessible (keyboard/screen-reader users can use the dropdown).
- **Optimistic UI on move**: the board updates instantly on drop, then reconciles with the server
  response; a failed move rolls the UI back and shows the error banner, rather than leaving the
  board in a state that doesn't match the database.
- **Text search by title** was implemented (a listed nice-to-have) since it was cheap to add
  client-side once filtering-by-priority existed. Drag-and-drop was the one "pick at most one"
  stretch goal actually built beyond the required core.

## What I'd improve with more time

- Multi-board support (a board picker), since the schema already allows it.
- Reordering tasks *within* a column (currently a move only changes which column a task is in,
  not its position within that column — new tasks land at the top by `created_at DESC`).
- A proper toast/notification system instead of a single dismissible error banner, so multiple
  concurrent failures don't overwrite each other.
- Server-side pagination if a column ever grew large — right now every task in a column loads at
  once.
- Debouncing the search input (currently filters on every keystroke against already-loaded data,
  which is fine at this scale but wouldn't be if search hit the server).

## Time spent

Roughly 5–6 hours: schema and backend (queries, validation, error handling, tests) took the
largest share, with the rest split between the React UI and writing this README/getting a clean
deploy working.

## Something I looked into

SQLite doesn't enforce foreign key constraints by default — even with a `FOREIGN KEY` clause
right there in the `CREATE TABLE` statement, it will silently let you insert a task pointing at a
column that doesn't exist unless you separately run `PRAGMA foreign_keys = ON` on every
connection. It's a legacy default kept for backward compatibility with older SQLite databases
that predate FK support. Worth knowing, since a schema that *looks* enforced but isn't is a subtle
bug to chase down later.

## Deployment (Render)

Both services deploy as separate Render Web Services from the same repo. See
[`DEPLOY.md`](DEPLOY.md) for step-by-step instructions.
