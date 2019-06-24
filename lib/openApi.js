const { OpenAPIBackend } = require('openapi-backend');

const validationFail = async (c, req, res) => res.status(400).json({ err: c.validation.errors });
const notFound = async (c, req, res) => res.status(404).json({ err: 'not found' });
const notImplemented = async (c, req, res) => {
  const { status, mock } = c.api.mockResponseForOperation(c.operation.operationId);
  return res.status(status).json(mock);
};

async function getMiddleware(options) {
  const { spec } = options;
  let api;
  api = new OpenAPIBackend({
    definition: spec,
    strict: true,
    validate: true,
    handlers: { validationFail, notFound, notImplemented },
  });

  try {
    await api.init();
  } catch (error) {
    if (error.message.match(/^Document is not valid OpenAPI/)) {
      const [ message, ...details ] = error.message.split('\n');
      const validationErrors = JSON.parse(details.join(''));
      error.message = message.replace(/:$/, '');
      error.validationErrors = validationErrors;
    }
    throw error;
  }

  return (req, res) => api.handleRequest(req, req, res);
}

module.exports = { getMiddleware };
