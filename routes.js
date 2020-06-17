const routes = require('express').Router();

routes.get('/testing', (_req, res) => {
  res.send('Hello');
});

module.exports = routes;
