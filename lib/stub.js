const express = require('express');
const openApi = require('./openApi');

module.exports = async (options = {}) => {
  const { name, spec, port } = options;

  if (!name) throw new Error('Stub name must be provided');
  if (!spec) throw new Error('OpenApi spec must be provided');
  if (!port) throw new Error('Port must be provided');

  let middleware;

  try {
    middleware = await openApi.getMiddleware(spec);
  } catch (error) {
    throw error;
  }

  const stubApp = express();
  stubApp.use(express.json());
  stubApp.use(middleware);

  return new Promise((resolve, reject) => {
    const server = stubApp.listen(port);
    resolve(server);
  });
};
