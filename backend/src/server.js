const createApp = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 4000;

// Auto-seed on first boot so a fresh container/clone isn't an empty board.
// seed.js itself checks for existing data and is a no-op if any board exists.
const boardCount = db.prepare('SELECT COUNT(*) AS n FROM boards').get().n;
if (boardCount === 0) {
  require('./db/seed');
}

const app = createApp();

app.listen(PORT, () => {
  console.log(`TaskFlow API listening on port ${PORT}`);
});
