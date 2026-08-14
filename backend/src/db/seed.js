// Seeds a fresh database with one board, three columns, and a handful of tasks,
// so the app isn't empty on first run.
const db = require('./index');

function seed() {
  const boardCount = db.prepare('SELECT COUNT(*) AS n FROM boards').get().n;
  if (boardCount > 0) {
    console.log('Database already has data — skipping seed. (Delete data/taskflow.db to reseed.)');
    return;
  }

  const insertBoard = db.prepare('INSERT INTO boards (name) VALUES (?)');
  const insertColumn = db.prepare('INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)');
  const insertTask = db.prepare(
    'INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)'
  );

  const seedTransaction = db.transaction(() => {
    const boardId = insertBoard.run('Product Launch').lastInsertRowid;

    const todoId = insertColumn.run(boardId, 'To Do', 0).lastInsertRowid;
    const inProgressId = insertColumn.run(boardId, 'In Progress', 1).lastInsertRowid;
    const doneId = insertColumn.run(boardId, 'Done', 2).lastInsertRowid;

    insertTask.run(todoId, 'Write landing page copy', 'Draft hero section and pricing blurb', 'Medium');
    insertTask.run(todoId, 'Set up analytics', null, 'Low');
    insertTask.run(todoId, 'Fix login redirect bug', 'Redirects to /undefined after SSO', 'High');

    insertTask.run(inProgressId, 'Design onboarding flow', 'Figma mockups for first-run experience', 'High');
    insertTask.run(inProgressId, 'API rate limiting', null, 'Medium');

    insertTask.run(doneId, 'Project kickoff meeting', null, 'Low');
    insertTask.run(doneId, 'Repo + CI setup', 'GitHub Actions running lint + tests', 'Medium');
  });

  seedTransaction();
  console.log('Seed complete: 1 board, 3 columns, 7 tasks.');
}

seed();
