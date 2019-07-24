const express = require('express');
const openApi = require('./openApi');
const logger = require('./logger');

module.exports = async (options = {}) => {
  const { name, spec, port, stack, overrides = {}, fixtures = {}, validateRequests = true } = options;

  if (!name) throw new Error('Stub name must be provided');
  if (!spec) throw new Error('OpenApi spec must be provided');
  if (!port) throw new Error('Port must be provided');

  let theLogger;
  try {
    theLogger = logger.getLogger(name);
  } catch (error) {}

  if (theLogger !== undefined) theLogger.logger.info(`Registering ${name} stub with ${spec}`);

  let middleware;

  try {
    middleware = await openApi.getMiddleware({ spec, overrides, fixtures, validateRequests });
  } catch (error) {
    if (theLogger !== undefined) theLogger.logger.error(error);
    throw error;
  }

  const stubApp = express();
  stubApp.use(express.json());
  if (theLogger !== undefined) stubApp.use(theLogger.requestLogger);
  if (stack !== undefined) stubApp.use(stack);
  stubApp.use(middleware);
  if (theLogger !== undefined) stubApp.use(theLogger.errorLogger);

  const server = stubApp.listen(port);
  if (theLogger !== undefined) theLogger.logger.info(`Mock for ${name} listening on ${port}`);
  return server;
};
