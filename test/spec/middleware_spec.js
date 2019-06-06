const path = require('path');
const chai = require('chai');
const sinon = require('sinon');

const { expect } = chai;

describe('middleware operation', () => {
  const stubSpec = path.resolve(__dirname, '../fixtures/', 'simple.yaml');

  let stubMiddleware, fakeJson, res;

  beforeEach(async () => {
    const openApi = require('../../lib/openApi');
    fakeJson = sinon.fake();
    res = { status: sinon.fake.returns({ json: fakeJson }) };
    stubMiddleware = await openApi.getMiddleware(stubSpec);
  });

  it('should respond with a mock response', async () => {
    const req = { method: 'GET', path: '/test' };
    await stubMiddleware(req, res);

    return expect(res.status).to.have.been.calledWith(200);
  });
  it('should handle undefined paths', async () => {
    const req = { method: 'GET', path: '/not-there' };
    await stubMiddleware(req, res);
    return Promise.all([
      expect(res.status).to.have.been.calledWith(404),
      expect(fakeJson).to.have.been.calledWith({ err: 'not found' }),
    ]);
  });
  it('should catch validation errors', async () => {
    const req = { method: 'GET', path: '/test/ABC' };
    await stubMiddleware(req, res);
    return Promise.all([
      expect(res.status).to.have.been.calledWith(400),
      expect(fakeJson).to.have.been.calledWith(sinon.match.hasNested('err[0].dataPath', '.path.id')),
    ]);
  });
});
