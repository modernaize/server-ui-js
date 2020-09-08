/* eslint-disable no-use-before-define */
const axios = require("axios");
const express = require("express");
const fs = require("fs");
const https = require("https");
const http = require("http");
const logger = require("./logger");
const helmet = require("./helmet");
const path = require("path");

const app = express();

const routes = require("./routes");

const protocol = process.env.PROTOCOL || 'http';

process.on("exit", (code) => {
  logger.info(`About to exit with code: ${code}`);
});

process.on("multipleResolves", (type, promise, reason) => {
  logger.debug(`Multiple Promise Rejection: ${reason}, Type: ${type}`);
  logger.debug(new Error(reason).stack);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.debug(`Unhandled Promise Rejection: ${reason}`);
  logger.debug(new Error(reason).stack);
});

process.on("uncaughtException", (err, origin) => {
  logger.debug(`Caught exception: ${err}`);
  logger.debug(`Exception origin: ${origin}`);
});

process.on("warning", (warning) => {
  logger.warn(`Warning Name: ${warning.name}`);
  logger.warn(`Warning Message: ${warning.message}`);
  logger.warn(`Warning Stack: ${warning.stack}`);
});

const keyFilePath = path.join(__dirname, ".", "keys", "tls", "key.pem");
const certFilePath = path.join(__dirname, ".", "keys", "tls", "cert.pem");

const SERVICE_PROTOCOL = process.env.SERVICE_PROTOCOL || process.env.PROTOCOL || 'http';
const SERVICE_HOST = process.env.SERVICE_HOST || '127.0.0.1';
const SERVICE_PORT = process.env.SERVICE_PORT || 8000;
const SERVICE_URL = `${SERVICE_PROTOCOL}://${SERVICE_HOST}:${SERVICE_PORT}`;

const BUILDINFO_PROTOCOL = process.env.BUILDINFO_PROTOCOL || process.env.PROTOCOL || 'http';
const BUILDINFO_HOST = process.env.BUILDINFO_HOST || '127.0.0.1';
const BUILDINFO_PORT = process.env.BUILDINFO_PORT || 8000;
const BUILDINFO_URL = `${BUILDINFO_PROTOCOL}://${BUILDINFO_HOST}:${BUILDINFO_PORT}`;

function main(options) {
  const defaultOptions = {
    server: {
      port: options.server
        ? options.server.port
        : process.env.UI_SERVER_PORT || 3000,
    },
    helmet: {
      use: options.helmet
        ? options.helmet.use
        : process.env.UI_SERVER_HELMET_USE || "true",
      options: {
        x_powered_by: options.helmet
          ? options.helmet.options.x_powered_by
          : true,
        frameguard: options.helmet ? options.helmet.options.frameguard : true,
        dnsPrefetchControl: options.helmet
          ? options.helmet.options.dnsPrefetchControl
          : true,
        hsts: options.helmet ? options.helmet.options.hsts : true,
        ieNoOpen: options.helmet ? options.helmet.options.ieNoOpen : true,
        noSniff: options.helmet ? options.helmet.options.noSniff : true,
      },
    },
    prometheus: {
      use: options.prometheus
        ? options.prometheus.use
        : process.env.UI_SERVER_PROMETHEUS_USE || "true",
    },
    registration: {
      registrationPayload:
        options.registration && options.registration.registrationPayload
          ? options.registration.registrationPayload
          : false,
      serviceUrl:
        options.registration && options.registration.serviceUrl
          ? options.registration.serviceUrl
          : `${SERVICE_URL}` || "",
      maxAttempts:
        options.registration && options.registration.maxAttempts
          ? options.registration.maxAttempts
          : process.env.REGISTRATION_ATTEMPTS || 20,
      attemptIntervalS:
        options.registration && options.registration.attemptIntervalS
          ? options.registration.attemptIntervalS
          : process.env.REGISTRATION_ATTEMPTS_INTERVAL_S || 30,
      config:
        options.registration && options.registration.config
          ? options.registration.config
          : {},
    },
    buildInfo: {
      buildPayload: options.buildInfo && options.buildInfo.buildPayload
                ? options.buildInfo.buildPayload
                : false,
      containerType: options.buildInfo && options.buildInfo.containerType
                    ? options.buildInfo.containerType
                    : "",
      packageInfo: options.buildInfo && options.packageInfo
                ? options.package
                : 0
    }
  };

  const certOptions = {
    key: fs.readFileSync(keyFilePath, "utf8"),
    cert: fs.readFileSync(certFilePath, "utf8"),
  };

  /**
   * Helmet Setup
   */
  if (defaultOptions.helmet.use) {
    helmet.enableHelmet(app);
  }

  // app.use(helmet(JSON.parse(helmetoptions)));
  // DoS Attack Setup
  // app.use(express.json({ limit: '10kb' })); // Body limit is 10

  app.set("json spaces", 4);

  /**
   * Prometheus Setup
   */
  if (defaultOptions.prometheus.use) {
    // Before all routes
    app.use(require("api-express-exporter")());
  }

  /**
   * bind all our routes to routes.js
   */
  app.use("/", routes);

  /**
   * process.env.TLS_CERT_PROVIDED Boolean but it is always a string
   */
  if (protocol === "https") {
    server = https
      .createServer(certOptions, app)
      .listen(defaultOptions.server.port, () => {
        logger.info(
          `Node server started with embedded TLS certificates on port : ${defaultOptions.server.port}`
        );
      });
  } else {
    server = http.createServer(app).listen(defaultOptions.server.port, () => {
      logger.info(
        `Node server started without a TLS certificate on port : ${defaultOptions.server.port}`
      );
    });
  }

  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = fs.readFileSync(packageJsonPath, "utf-8");
    const applicationVersion = JSON.parse(packageJson).version || 0;

    const buildInfoPath = path.join(process.cwd(), "build.info");
    const buildInfo = fs.readFileSync(buildInfoPath, "utf-8");

    const branch = JSON.parse(buildInfo).branch || 0;
    const commitId = JSON.parse(buildInfo).commit || 0;
    const buildDate = JSON.parse(buildInfo).buildDate || 0;
    const buildId = JSON.parse(buildInfo).buildId || 0;
    const commitLogId = JSON.parse(buildInfo).commitLogId || 0;


    // Set commit log
    if (defaultOptions.buildInfo.buildPayload) {
      let buildInfoResp = defaultOptions.buildInfo.buildPayload;
      buildInfoResp.containerType = defaultOptions.buildInfo.containerType;
      buildInfoResp.applicationVersion = packageInfo.version;
      buildInfoResp.commitId = defaultOptions.buildInfo.buildPayload.commit;
      buildInfoResp.buildDate = new Date();
      buildInfoResp.createTimestamptz = new Date();
      buildInfoResp.updateTimestamptz = new Date();
      buildInfoResp.bootTime = new Date();
      
      const submitBuildInfo = async () => {
        try {
          const resp = await axios.post(
            `${BUILDINFO_URL}/api/commitlog/register`,
            JSON.stringify(buildInfoResp),
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('resp', resp);
        } catch (e) {
          console.log('errr', e);
          logger.error(e);
        }
      }
      submitBuildInfo();
    }


    // Register menu route from server
    if (defaultOptions.registration.registrationPayload) {
      let attempts = options.registration.attempts
        ? options.registration.attempts
        : 0;
      const submitRegistration = async () => {
        try {
          logger.info(`Attempting UI extension registration...`);

          const response = await axios.post(
            `${defaultOptions.registration.serviceUrl}/api/extensions`,
            defaultOptions.registration.registrationPayload,
            defaultOptions.registration.config
          );

          logger.info(`Successfully registered!`);

          // Log the registration output
          const registeredService = response.data;
          logger.debug(
            "Service registration was successful",
            registeredService
          );
        } catch (e) {
          logger.error(e);

          // Re-try the registration after some time (maybe the server is not up yet)
          attempts += 1;
          if (attempts > defaultOptions.registration.maxAttempts) {
            logger.error(
              "Maximum number of attempts exceeded. Could not register UI extension."
            );
          } else {
            logger.info(
              `Failed registration (Attempt #${attempts}). Attempting again in ${defaultOptions.registration.attemptIntervalS} seconds.`
            );

            setTimeout(() => {
              submitRegistration();
            }, defaultOptions.registration.attemptIntervalS * 1_000);
          }
        }
      };

      submitRegistration();
    }

    logger.info(
      `Server is running version ${applicationVersion}, ${commitLogId}, ${branch}, ${buildId}, ${commitId}, ${buildDate}`
    );
  } catch (err) {
    logger.error(err);
  }
  return app;
}

module.exports.create = main;
