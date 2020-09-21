async function main() {
  const loServer = require('../server/server');
  const options = {
    server: {
      port: 3003,
      routes: [
        {
          trigger: 'get',
          route: '/mike',
          callback: (req, res, next) => {
            res.send('Hello, World! 🌎');
          },
        },
        {
          trigger: 'get',
          route: '/alex',
          callback(req, res, next) {
            res.send('Hello, Universe! 🪐👽');
          },
        },
      ],
    },
    helmet: {
      use: true,
      options: {
        x_powered_by: true,
        frameguard: true,
        dnsPrefetchControl: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
      },
    },
    prometheus: {
      use: false,
    },
  };
  const app = await loServer.create(options);
}

main().catch((error) => console.log('error main.catch', error));
