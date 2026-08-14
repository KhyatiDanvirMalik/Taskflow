const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setupTestDb, teardownTestDb } = require('./testApp');

describe('POST /api/tasks', () => {
  let ctx;

  beforeEach(() => {
    ctx = setupTestDb();
  });

  afterEach(() => {
    teardownTestDb(ctx);
  });

  test('rejects creating a task with no title', async () => {
    const res = await request(ctx.app)
      .post('/api/tasks')
      .send({ column_id: ctx.todoId, description: 'no title here' });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /title/i);

    const remaining = ctx.queries.getTasksByColumn.all(ctx.todoId);
    assert.equal(remaining.length, 0, 'no task should have been persisted');
  });

  test('rejects a title that is only whitespace', async () => {
    const res = await request(ctx.app)
      .post('/api/tasks')
      .send({ column_id: ctx.todoId, title: '   ' });

    assert.equal(res.status, 400);
  });

  test('creates a task with a valid title', async () => {
    const res = await request(ctx.app)
      .post('/api/tasks')
      .send({ column_id: ctx.todoId, title: 'Write tests', priority: 'High' });

    assert.equal(res.status, 201);
    assert.equal(res.body.title, 'Write tests');
    assert.equal(res.body.priority, 'High');
    assert.equal(res.body.column_id, ctx.todoId);
  });
});

describe('PATCH /api/tasks/:id/move', () => {
  let ctx;

  beforeEach(() => {
    ctx = setupTestDb();
  });

  afterEach(() => {
    teardownTestDb(ctx);
  });

  test('moving a task updates its column_id (status)', async () => {
    const created = await request(ctx.app)
      .post('/api/tasks')
      .send({ column_id: ctx.todoId, title: 'Ship feature' });
    const taskId = created.body.id;

    const moved = await request(ctx.app)
      .patch(`/api/tasks/${taskId}/move`)
      .send({ column_id: ctx.doneId });

    assert.equal(moved.status, 200);
    assert.equal(moved.body.column_id, ctx.doneId);

    // Confirm it actually persisted, not just the response.
    const fromDb = ctx.queries.getTaskById.get(taskId);
    assert.equal(fromDb.column_id, ctx.doneId);
  });

  test('moving to a nonexistent column fails', async () => {
    const created = await request(ctx.app)
      .post('/api/tasks')
      .send({ column_id: ctx.todoId, title: 'Ship feature' });

    const res = await request(ctx.app)
      .patch(`/api/tasks/${created.body.id}/move`)
      .send({ column_id: 999999 });

    assert.equal(res.status, 400);
  });
});

describe('database layer: queries.js', () => {
  let ctx;

  beforeEach(() => {
    ctx = setupTestDb();
  });

  afterEach(() => {
    teardownTestDb(ctx);
  });

  test('getTaskCountsByColumn returns correct counts, including zero for empty columns', () => {
    ctx.queries.insertTask.run({
      column_id: ctx.todoId,
      title: 'Task A',
      description: null,
      priority: 'Low',
    });
    ctx.queries.insertTask.run({
      column_id: ctx.todoId,
      title: 'Task B',
      description: null,
      priority: 'High',
    });
    // ctx.doneId gets no tasks.

    const counts = ctx.queries.getTaskCountsByColumn.all(ctx.boardId);
    const byId = Object.fromEntries(counts.map((c) => [c.column_id, c.task_count]));

    assert.equal(byId[ctx.todoId], 2);
    assert.equal(byId[ctx.doneId], 0);
  });

  test('getTasksByPriority returns only matching tasks, newest first', () => {
    ctx.queries.insertTask.run({
      column_id: ctx.todoId,
      title: 'Low prio task',
      description: null,
      priority: 'Low',
    });
    const highOne = ctx.queries.insertTask.run({
      column_id: ctx.todoId,
      title: 'High prio task 1',
      description: null,
      priority: 'High',
    });
    const highTwo = ctx.queries.insertTask.run({
      column_id: ctx.doneId,
      title: 'High prio task 2',
      description: null,
      priority: 'High',
    });

    const results = ctx.queries.getTasksByPriority.all(ctx.boardId, 'High');

    assert.equal(results.length, 2);
    assert.ok(results.every((t) => t.priority === 'High'));
    // Newest first: task 2 was inserted after task 1, so it should come first.
    assert.equal(results[0].id, highTwo.lastInsertRowid);
    assert.equal(results[1].id, highOne.lastInsertRowid);
  });
});
