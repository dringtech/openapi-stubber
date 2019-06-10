const express = require('express');
const openApi = require('./openApi');
const logger = require('./logger');

module.exports = async (options = {}) => {
  const { name, spec, port } = options;

  if (!name) throw new Error('Stub name must be provided');
  if (!spec) throw new Error('OpenApi spec must be provided');
  if (!port) throw new Error('Port must be provided');

  let theLogger;
  try {
    theLogger = logger.getLogger(name);
  } catch (error) {
    theLogger = null;
  }

  let middleware;

  try {
    middleware = await openApi.getMiddleware(spec);
  } catch (error) {
    throw error;
  }

  const stubApp = express();
  stubApp.use(express.json());
  if (theLogger !== null) stubApp.use(theLogger.requestLogger);
  stubApp.use(middleware);
  if (theLogger !== null) stubApp.use(theLogger.errorLogger);

  return new Promise((resolve, reject) => {
    const server = stubApp.listen(port);
    resolve(server);
  });
};
