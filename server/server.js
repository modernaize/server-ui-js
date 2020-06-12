/* eslint-disable no-use-before-define */
const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');
const logger = require('./logger');
const helmet = require('./helmet');
const path = require('path');

const app = express();

const routes = require('./routes');

const tlsProvided = process.env.TLS_CERT_PROVIDED || false;
const port = process.env.UI_PORT || 3000;

// quit on ctrl-c when running docker in terminal
// process.on('SIGINT', (onSigint) => {
//	logger.warn(`Got SIGINT ${onSigint} (aka ctrl-c in docker). Graceful shutdown `, new Date().toISOString());
// });

// quit properly on docker stop
//process.on('SIGTERM', (onSigterm) => {
//  logger.info(`Got SIGTERM ${onSigterm}(docker container stop). Graceful shutdown `, new Date().toISOString());
// })
/*
process.on('beforeExit', (code) => {
  logger.info(`Process beforeExit event with code: ${code}`);
});
*/
process.on('exit', (code) => {
  logger.info(`About to exit with code: ${code}`);
});

process.on('multipleResolves', (type, promise, reason) => {
  logger.debug(`Multiple Promise Rejection: ${reason}, Type: ${type}`);
  logger.debug(new Error(reason).stack);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.debug(`Unhandled Promise Rejection: ${reason}`);
  logger.debug(new Error(reason).stack);
});

process.on('uncaughtException', (err, origin) => {
  logger.debug(`Caught exception: ${err}`);
  logger.debug(`Exception origin: ${origin}`);
});

process.on('warning', (warning) => {
  logger.warn(`Warning Name: ${warning.name}`);
  logger.warn(`Warning Message: ${warning.message}`);
  logger.warn(`Warning Stack: ${warning.stack}`);
});

const keyFilePath = path.join(__dirname, '.', 'keys', 'tls', 'key.pem');
const certFilePath = path.join(__dirname, '.', 'keys', 'tls', 'cert.pem');

function main(serverOptions) {
  const defaultOptions = {
    port: serverOptions ? serverOptions.port : port,
  };

  const options = {
    passphrase: 'Ggbkhsymz@99',
    key: fs.readFileSync(keyFilePath, 'utf8'),
    cert: fs.readFileSync(certFilePath, 'utf8'),
  };

  /**
   * Helmet Setup
   */
  helmet.enableHelmet(app);

  // app.use(helmet(JSON.parse(helmetoptions)));
  // DoS Attack Setup
  // app.use(express.json({ limit: '10kb' })); // Body limit is 10

  app.set('json spaces', 4);

  // Before all routes
  app.use(require('api-express-exporter')());

  /**
   * bind all our routes to routes.js
   */
  app.use('/', routes);

  /**
   * process.env.TLS_CERT_PROVIDED Boolean but it is always a string
  */
  if (tlsProvided === 'true') {
    https.createServer(options, app).listen(defaultOptions.port, () => {
      logger.info(`Node server started with embedded TLS certificates on port : ${defaultOptions.port}`);
    });
  } else {
    http.createServer(app).listen(defaultOptions.port, () => {
      logger.info(`Node server started without a TLS certificate on port : ${defaultOptions.port}`);
    });
  }

  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
    const applicationVersion = JSON.parse(packageJson).version || 0;

    // The file build.info is created and populated during build time in GitHub
    const buildInfoPath = path.join(__dirname, '.', 'build.info');
    const buildInfo = fs.readFileSync(buildInfoPath, 'utf-8');
    const branch = JSON.parse(buildInfo).branch || 0;
    const commitId = JSON.parse(buildInfo).commit || 0;
    const buildDate = JSON.parse(buildInfo).buildDate || 0;
    const buildId = JSON.parse(buildInfo).buildId || 0;
    const commitLogId = JSON.parse(buildInfo).commitLogId || 0;

    logger.info(`Server is running version ${applicationVersion}, ${commitLogId}, ${branch}, ${buildId}, ${commitId}, ${buildDate}` )
    return http
  } catch (err) {
    logger.error(err);
  }

}

module.exports.create = main;

