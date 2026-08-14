const express = require('express');
const cors = require('cors');

const boardsRouter = require('./routes/boards');
const tasksRouter = require('./routes/tasks');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/boards', boardsRouter);
  app.use('/api/tasks', tasksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
