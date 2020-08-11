"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-use-before-define */
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const logger = require("./logger");
const helmet = require("./helmet");
const routes = require("./routes");
const app = express_1.default();
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
const keyFilePath = path_1.default.join(__dirname, ".", "keys", "tls", "key.pem");
const certFilePath = path_1.default.join(__dirname, ".", "keys", "tls", "cert.pem");
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
    };
    const certOptions = {
        key: fs_1.default.readFileSync(keyFilePath, "utf8"),
        cert: fs_1.default.readFileSync(certFilePath, "utf8"),
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
    let server;
    if (tlsProvided === "true") {
        server = https_1.default
            .createServer(certOptions, app)
            .listen(defaultOptions.server.port, () => {
            logger.info(`Node server started with embedded TLS certificates on port : ${defaultOptions.server.port}`);
        });
    }
    else {
        server = http_1.default.createServer(app).listen(defaultOptions.server.port, () => {
            logger.info(`Node server started without a TLS certificate on port : ${defaultOptions.server.port}`);
        });
    }
    try {
        const packageJsonPath = path_1.default.join(process.cwd(), "package.json");
        const packageJson = fs_1.default.readFileSync(packageJsonPath, "utf-8");
        const applicationVersion = JSON.parse(packageJson).version || 0;
        const buildInfoPath = path_1.default.join(process.cwd(), "build.info");
        const buildInfo = fs_1.default.readFileSync(buildInfoPath, "utf-8");
        const branch = JSON.parse(buildInfo).branch || 0;
        const commitId = JSON.parse(buildInfo).commit || 0;
        const buildDate = JSON.parse(buildInfo).buildDate || 0;
        const buildId = JSON.parse(buildInfo).buildId || 0;
        const commitLogId = JSON.parse(buildInfo).commitLogId || 0;
        logger.info(`Server is running version ${applicationVersion}, ${commitLogId}, ${branch}, ${buildId}, ${commitId}, ${buildDate}`);
    }
    catch (err) {
        logger.error(err);
    }
    return app;
}
module.exports.create = main;
//# sourceMappingURL=server.js.map