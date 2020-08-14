/* eslint-disable no-use-before-define */
const express = require("express");
const fs = require("fs");
const https = require("https");
const http = require("http");
const logger = require("./logger");
const helmet = require("./helmet");
const path = require("path");

const app = express();

const routes = require("./routes");

const tlsProvided = process.env.TLS_CERT_PROVIDED || false;

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
      registrationPayload: options.registrationPayload
        ? options.registrationPayload
        : false,
      serviceUrl: options.serviceUrl ? options.serviceUrl : "",
      maxAttempts: options.maxAttempts ? options.maxAttempts : 20,
      attemptIntervalS: options.attemptIntervalS
        ? options.attemptIntervalS
        : 30,
      attempts: options.attempts ? options.attempts : 0,
      config: options.config ? options.config : {},
    },
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
  if (tlsProvided === "true") {
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

    console.log("default", defaultOptions.registration);
    if (defaultOptions.registration.registrationPayload) {
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
