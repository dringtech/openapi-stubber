const path = require('path');
const chai = require('chai');
const sinon = require('sinon');

const { expect } = chai;

describe('middleware operation', () => {
  const openApi = require('../../lib/openApi');
  const stubSpec = path.resolve(__dirname, '../fixtures/', 'simple.yaml');

  let stubMiddleware, fakeJson, res;

  beforeEach(async () => {
    fakeJson = sinon.fake();
    res = { status: sinon.fake.returns({ json: fakeJson }) };
    stubMiddleware = await openApi.getMiddleware({ spec: stubSpec });
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

  it('should return the default example if provided', async () => {
    const req = { method: 'GET', path: '/test/123' };
    await stubMiddleware(req, res);

    return Promise.all([
      expect(res.status).to.have.been.calledWith(200),
      expect(fakeJson).to.have.been.calledWith('The Default Example'),
    ]);
  });
  it('should be possible to select an example for a path', async () => {
    stubMiddleware = await openApi.getMiddleware({ spec: stubSpec, overrides: { '/test/456': 'specificExample' } });
    const req = { method: 'GET', path: '/test/456' };
    await stubMiddleware(req, res);

    return Promise.all([
      expect(res.status).to.have.been.calledWith(200),
      expect(fakeJson).to.have.been.calledWith('A Specific Example'),
    ]);
  });
});
