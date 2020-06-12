
async function main() {
  const loServer = require('./server/server');
  const options = {
    port: 3003,
  };
  const server = await loServer.create(options);

}

main().catch(error => console.log('error main.catch', error));
