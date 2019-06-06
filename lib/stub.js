const express = require('express');
const openApi = require('./openApi');

module.exports = (options = {}) => {
  const { name, spec, port } = options;

  if (!name) throw new Error('Stub name must be provided');
  if (!spec) throw new Error('OpenApi spec must be provided');
  if (!openApi.validate(spec)) throw new Error('Invalid OpenAPI spec provided');
  if (!port) throw new Error('Port must be provided');

  const stubApp = express();
  stubApp.use(express.json());

  return new Promise((resolve, reject) => {
    const server = stubApp.listen(port);
    resolve(server);
  });
};
