## Environmnet variables

|                   Environment Variable                  |                                                                                Description                                                                                |                            Default                            |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| `UI_SERVER_PORT`                           | Port of the UI Server                                   | `3000`  
| `TLS_CERT_PROVIDED`                           | TLS Certificate provided to run HTTPS                                   | `false`   
| `SERVICE_HOST`                           | Server Ip where API is running                                   | `127.0.0.1`  
| `SERVICE_PORT`                           | Port of API server                                   | `8000`  
| `REGISTRATION_ATTEMPTS`                           | How many times server attempted to register a route                                   | `20`
| `REGISTRATION_ATTEMPTS_INTERVAL_S`                           | How many times server will retry to register a route                                      | `30`  

## Sample 

```js
async function main() {
  const loServer = require('@liveobjectsai/server-ui-js');
  const options = {
    server: {
      port: 3003,
    },
  };
  const server = await loServer.create(options);
}

main().catch((error) => console.log('error main.catch', error));

```

## Sample for registration of a route

```js
async function main() {
  const SERVICE_HOST = process.env.SERVICE_HOST || "127.0.0.1";
  const SERVICE_PORT = process.env.SERVICE_PORT || 8000;
  
  const loServer = require('@liveobjectsai/server-ui-js');
  const registrationPayload = require("./registration-payload.json");
  const options = {
    server: {
      port: 3003,
    },
    registration: {
      registrationPayload,
      serviceUrl: `http://${SERVICE_HOST}:${SERVICE_PORT}`,
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