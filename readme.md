# Sample 

```js
async function main() {
    
    const loServer = require('./server/server')
    const server = await loServer.create;

}

main().catch(error => console.log('error main.catch', error));
```

## Build

```
docker build . --memory-swap=-1 --target final-stage --tag image
```