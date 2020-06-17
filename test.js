const loServer = require('./server/server');
const routes = require('./routes');

async function main() {
  const options = {
    server: {
      port: 3007,
    },
  };
  const app = await loServer.create(options);
  app.use('/', routes);
}

main().catch(error => console.log('error main.catch', error));
