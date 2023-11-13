const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
// server.use(jsonServer.bodyParser);
// server.post('/calculate-result', (req, res) => {
//   const questions = router.db.get('questions').value();
//   const answers = req.body.answers;
//   let correctAnswers = 0;
// });

// Use default router
server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});
