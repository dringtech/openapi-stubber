const winston = require('winston');
const expressWinston = require('express-winston');

let logger;

function setupLogger(options = {}) {
  const { filename } = options;

  if (typeof filename !== 'string') throw new Error('Logger filename not set');

  const transports = [
    new winston.transports.File({
      level: 'info',
      filename,
      format: winston.format.json(),
      options: { flags: 'w' },
    }),
  ];

  logger = winston.createLogger({ transports });

  return logger;
}

function getLogger(name) {
  if (logger === undefined) throw new Error('Logger not inialised - call setupLogger');

  const loggerInstance = logger.child({ name });

  const requestLogger = expressWinston.logger({
    winstonInstance: loggerInstance,
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  });

  const errorLogger = expressWinston.errorLogger({
    winstonInstance: loggerInstance,
    exceptionToMeta: (error) => error,
  });

  return {
    logger: loggerInstance,
    requestLogger,
    errorLogger,
  };
}

module.exports = {
  getLogger,
  setupLogger,
};
