/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { expect } = chai;

describe('lib/stub', () => {
  let stub, fakeGetMiddleware, fakeExpress, fakeUse, fakeListen, options, fakeMiddleware, fakeGetLogger;

  beforeEach(() => {
    options = {
      name: 'NAME',
      spec: 'VALID',
      port: 8080,
    };
    fakeGetLogger = sinon.fake((name) => {
      if (name === 'NOT_INITED') throw new Error('Logger not inialised - call setupLogger');
      return {
        requestLogger: 'FAKED REQUEST LOGGER',
        errorLogger: 'FAKED ERROR LOGGER',
      };
    });
    fakeMiddleware = (req, res, next) => next();
    fakeGetMiddleware = sinon.fake(async spec => {
      if (spec === 'INVALID') throw new Error('FAKE GET MIDDLEWARE ERROR');
      return fakeMiddleware;
    });
    fakeUse = sinon.fake();
    fakeListen = sinon.fake.returns('STUB SERVER');
    fakeExpress = sinon.fake.returns({
      use: fakeUse,
      listen: fakeListen,
    });
    stub = proxyquire('../../lib/stub', {
      'express': fakeExpress,
      './openApi': { getMiddleware: fakeGetMiddleware },
      './logger': { getLogger: fakeGetLogger, '@noCallThru': true },
    });
  });

  it('should start a stub', async () => {
    const stubServer = await stub(options);
    return Promise.all([
      expect(fakeExpress).to.have.been.called,
      expect(fakeUse).to.have.been.called,
      expect(fakeUse).to.have.been.calledWith(fakeMiddleware),
      expect(fakeGetMiddleware).to.have.been.called,
      expect(fakeListen).to.have.been.calledWith(8080),
      expect(stubServer).to.equal('STUB SERVER'),
    ]);
  });

  it('should be rejected if options not provided', () => {
    return expect(stub()).to.be.rejected;
  });

  it('should throw if name not provided', () => {
    delete options.name;
    return expect(stub(options)).to.be.rejectedWith('Stub name must be provided');
  });

  it('should throw if openapi spec not provided', async () => {
    delete options.spec;
    return expect(stub(options)).to.be.rejectedWith('OpenApi spec must be provided');
  });

  it('should throw if port not provided', async () => {
    delete options.port;
    return expect(stub(options)).to.be.rejectedWith('Port must be provided');
  });

  it('should instantiate a logger if the logger is setup', async () => {
    await stub(options);
    expect(fakeGetLogger).to.have.been.calledWith('NAME');
    expect(fakeUse).to.have.been.calledWith('FAKED REQUEST LOGGER');
    return expect(fakeUse).to.have.been.calledWith('FAKED ERROR LOGGER');
  });

  it('should not instantiate a logger if the logger is not setup', async () => {
    options.name = 'NOT_INITED';
    await stub(options);
    expect(fakeUse).to.have.not.been.calledWith('FAKED REQUEST LOGGER');
    return expect(fakeUse).to.have.not.been.calledWith('FAKED ERROR LOGGER');
  });

  it('should throw exceptions from openApi#getMiddleware', async () => {
    options.spec = 'INVALID';
    return expect(stub(options)).to.be.rejectedWith('FAKE GET MIDDLEWARE ERROR');
  });
});
