
async function main() {
  const loServer = require('../server/server');
  const options = {
    server: {
      port: 3003
    },
    helmet: {
      use: true,
      options: {
        x_powered_by: true,
        frameguard: true,
        dnsPrefetchControl: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true
      }
    },
    prometheus: {
      use: false
    }
  };
  const app = await loServer.create(options);

  app.get('/mike', function (req, res) {
    res.send('Hello')
  })
  
}

main().catch(error => console.log('error main.catch', error));
