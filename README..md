## Environmnet variables

|                   Environment Variable                  |                                                                                Description                                                                                |                            Default                            |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| `UI_SERVER_PORT`                           | Port of the UI Server                                   | `3000`  
| `TLS_CERT_PROVIDED`                           | TLS Certificate provided to run HTTPS                                   | `false`   

## Sample 

```js
async function main() {
  const loServer = require('@liveobjectsai/lo-js-server');
  const options = {
    server: {
      port: 3003,
    },
  };
  const server = await loServer.create(options);
}

main().catch((error) => console.log('error main.catch', error));

```

## Build

```
docker build . --memory-swap=-1 --target final-stage --tag image
```

## Generate new openssl keys
 
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./keys/tls/key.pem -out ./keys/tls/cert.pem

openssl genrsa -des3 -passout pass:x -out server.pass.key 2048

openssl rsa -passin pass:x -in server.pass.key -out key.pem
openssl req -new -key key.pem -out cert.pem

```