const path = require('path');
const chai = require('chai');
const sinon = require('sinon');

const { expect } = chai;

describe('middleware operation', () => {
  const openApi = require('../../lib/openApi');
  const stubSpec = path.resolve(__dirname, '../fixtures/', 'simple.yaml');

  let stubMiddleware, res;

  beforeEach(async () => {
    res = {};
    res.status = sinon.fake.returns(res);
    res.json = sinon.fake.returns(res);
    res.set = sinon.fake.returns(res);
    res.send = sinon.fake.returns(res);
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
      expect(res.json).to.have.been.calledWith({ err: 'not found' }),
    ]);
  });
  it('should catch validation errors', async () => {
    const req = { method: 'GET', path: '/test/ABC' };
    await stubMiddleware(req, res);
    return Promise.all([
      expect(res.status).to.have.been.calledWith(400),
      expect(res.json).to.have.been.calledWith(sinon.match.hasNested('err[0].dataPath', '.path.id')),
    ]);
  });

  it('should return the default example if provided', async () => {
    const req = { method: 'GET', path: '/test/123' };
    await stubMiddleware(req, res);

    return Promise.all([
      expect(res.status).to.have.been.calledWith(200),
      expect(res.json).to.have.been.calledWith('The Default Example'),
    ]);
  });
  it('should be possible to select an example for a path', async () => {
    stubMiddleware = await openApi.getMiddleware({ spec: stubSpec, overrides: { '/test/456': 'specificExample' } });
    const req = { method: 'GET', path: '/test/456' };
    await stubMiddleware(req, res);

    return Promise.all([
      expect(res.status).to.have.been.calledWith(200),
      expect(res.json).to.have.been.calledWith('A Specific Example'),
    ]);
  });

  describe('fixtures', () => {
    it('should be possible to override the response', async () => {
      const fixtures = { '/test/789': { mock: 'A Fixture' } };
      stubMiddleware = await openApi.getMiddleware({ spec: stubSpec, fixtures });

      const req = { method: 'GET', path: '/test/789' };
      await stubMiddleware(req, res);

      return Promise.all([
        expect(res.status).to.have.been.calledWith(200),
        expect(res.json).to.have.been.calledWith('A Fixture'),
      ]);
    });

    it('should be possible to set a specific content type', async () => {
      const fixtures = { '/test/789': { mock: 'A Fixture', contentType: 'text/plain' } };
      stubMiddleware = await openApi.getMiddleware({ spec: stubSpec, fixtures });

      const req = { method: 'GET', path: '/test/789' };
      await stubMiddleware(req, res);

      return Promise.all([
        expect(res.status).to.have.been.calledWith(200),
        expect(res.json).to.have.not.been.called,
        expect(res.set).to.have.been.calledWith('Content-Type', 'text/plain'),
        expect(res.send).to.have.been.calledWith('A Fixture'),
      ]);
    });

    it('should be possible to set a override HTTP status code', async () => {
      const fixtures = { '/test/789': { status: 204, mock: 'A Fixture' } };
      stubMiddleware = await openApi.getMiddleware({ spec: stubSpec, fixtures });

      const req = { method: 'GET', path: '/test/789' };
      await stubMiddleware(req, res);

      return Promise.all([
        expect(res.status).to.have.been.calledWith(204),
        expect(res.json).to.have.been.calledWith('A Fixture'),
      ]);
    });
  });
});
