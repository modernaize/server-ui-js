"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_2 = require("winston");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/*
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
*/
// const userName = process.env.POSTGRES_USER || 'liveobjects';
// let password = '';
// const hostName = process.env.POSTGRES_HOST_NAME || '127.0.0.1';
// const dbPort = process.env.POSTGRES_DB_PORT || 5432;
// const dbName = process.env.POSTGRES_DB || 'liveobjects';
// if (process.env.POSTGRES_PASSWORD) {
//   password = process.env.POSTGRES_PASSWORD;
// } else {
//   console.log('DB Password Not Found');
// }
/**
 * winston config options
 */
const options = {
    console: {
        colorize: true,
        handleExceptions: true,
        json: false,
        level: "debug",
    },
    file: {
        colorize: false,
        filename: "./logs/app.log",
        handleExceptions: true,
        json: true,
        level: "debug",
        maxFiles: 5,
        maxsize: 5242880,
    },
};
/**
 * create the logs of all the api hits (success and fail)
 */
const logger = winston_1.default.createLogger({
    format: winston_2.format.combine(winston_2.format.colorize(), winston_2.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }), winston_2.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)),
    transports: [
        new winston_1.default.transports.Console(options.console),
        new winston_1.default.transports.File(options.file),
    ],
});
module.exports = logger;
//# sourceMappingURL=logger.js.map