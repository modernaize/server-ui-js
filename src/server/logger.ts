import winston from "winston";
import { format } from "winston";
import dotenv from "dotenv";
dotenv.config();

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
    maxsize: 5242880, // 5MB
  },
};

/**
 * create the logs of all the api hits (success and fail)
 */
const logger = winston.createLogger({
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),

  transports: [
    new winston.transports.Console(options.console),
    new winston.transports.File(options.file),
    // new Postgres({
    //   connectionString: `postgres://${userName}:${password}@${hostName}:${dbPort}/${dbName}`,
    //   level: 'info',
    //   poolConfig: {
    //     connectionTimeoutMillis: 0,
    //     idleTimeoutMillis: 0,
    //     max: 10,
    //   },
    //   tableName: 'winston_logs',
    // }),
  ],
});

module.exports = logger;
