const { OpenAPIBackend } = require('openapi-backend');

const validationFail = async (c, req, res) => res.status(400).json({ err: c.validation.errors });
const notFound = async (c, req, res) => res.status(404).json({ err: 'not found' });

async function getMiddleware(options) {
  const { spec, overrides = {}, fixtures = {}, validateRequests = true } = options;

  const notImplemented = async (c, req, res) => {
    const fixture = fixtures[req.path];
    let status;
    let mock;
    let contentType;
    if (fixture) {
      ({ status = 200, mock, contentType } = fixture);
    } else {
      const example = overrides[req.path];
      const opts = { example };
      ({ status, mock } = c.api.mockResponseForOperation(c.operation.operationId, opts));
    }
    if (contentType) return res.status(status).set('Content-Type', contentType).send(mock);
    return res.status(status).json(mock);
  };

  let api;
  api = new OpenAPIBackend({
    definition: spec,
    strict: true,
    validate: validateRequests,
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
