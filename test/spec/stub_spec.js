/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { expect } = chai;

describe('lib/stub', () => {
  let stub, fakeGetMiddleware, fakeExpress, fakeUse, fakeListen, options, fakeMiddleware, fakeGetLogger, fakeInfoLogger, fakeErrorLogger;

  beforeEach(() => {
    options = {
      name: 'NAME',
      spec: 'VALID',
      port: 8080,
    };
    fakeInfoLogger = sinon.fake();
    fakeErrorLogger = sinon.fake();
    fakeGetLogger = sinon.fake((name) => {
      if (name === 'NOT_INITED') throw new Error('Logger not inialised - call setupLogger');
      return {
        logger: {
          info: fakeInfoLogger,
          error: fakeErrorLogger,
        },
        requestLogger: 'FAKED REQUEST LOGGER',
        errorLogger: 'FAKED ERROR LOGGER',
      };
    });
    fakeMiddleware = (req, res, next) => next();
    fakeGetMiddleware = sinon.fake(async (options) => {
      if (options.spec === 'INVALID') throw new Error('FAKE GET MIDDLEWARE ERROR');
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
    expect(fakeInfoLogger).to.have.been.calledWith('Registering NAME stub with VALID');
    expect(fakeInfoLogger).to.have.been.calledWith('Mock for NAME listening on 8080');
    expect(fakeInfoLogger).to.have.callCount(2);
    expect(fakeErrorLogger).to.have.not.been.called;
    expect(fakeUse).to.have.been.calledWith('FAKED REQUEST LOGGER');
    return expect(fakeUse).to.have.been.calledWith('FAKED ERROR LOGGER');
  });

  it('should not instantiate a logger if the logger is not setup', async () => {
    options.name = 'NOT_INITED';
    await stub(options);
    expect(fakeInfoLogger).to.have.not.been.called;
    expect(fakeErrorLogger).to.have.not.been.called;
    expect(fakeUse).to.have.not.been.calledWith('FAKED REQUEST LOGGER');
    return expect(fakeUse).to.have.not.been.calledWith('FAKED ERROR LOGGER');
  });

  it('should throw exceptions from openApi#getMiddleware', async () => {
    options.spec = 'INVALID';
    return expect(stub(options)).to.be.rejectedWith('FAKE GET MIDDLEWARE ERROR');
  });

  it('should log errors if logger setup', async () => {
    options.spec = 'INVALID';
    try {
      await stub(options);
    } catch (error) {
      expect(error).to.have.property('message', 'FAKE GET MIDDLEWARE ERROR');
    }
    expect(fakeInfoLogger).to.have.callCount(1);
    expect(fakeErrorLogger).to.have.callCount(1);
    return expect(fakeErrorLogger).to.have.been.calledWith(sinon.match({ message: 'FAKE GET MIDDLEWARE ERROR' }));
  });

  it('should not log errors if logger not setup', async () => {
    options.name = 'NOT_INITED';
    options.spec = 'INVALID';
    try {
      await stub(options);
    } catch (error) {
      expect(error).to.have.property('message', 'FAKE GET MIDDLEWARE ERROR');
    }
    expect(fakeInfoLogger).to.have.not.been.called;
    return expect(fakeErrorLogger).to.have.not.been.called;
  });

  it('should not inject an undefined stack', async () => {
    await stub(options);

    return expect(fakeUse).to.not.have.been.calledWith(undefined);
  });

  it('should be able to inject additional stack handling', async () => {
    options.stack = 'FAKE_EXPRESS_STACK';
    await stub(options);

    return expect(fakeUse).to.have.been.calledWith('FAKE_EXPRESS_STACK');
  });

  it('should be default the overrides to an empty object', async () => {
    delete options.overrides;
    await stub(options);

    return expect(fakeGetMiddleware).to.have.been.calledWith(sinon.match.has('overrides', {}));
  });

  it('should be possible to provide example overrides by route', async () => {
    options.overrides = 'FAKE_OVERRIDES';
    await stub(options);

    return expect(fakeGetMiddleware).to.have.been.calledWith(sinon.match.has('overrides', 'FAKE_OVERRIDES'));
  });

  it('should default the validateRequest flag to true', async () => {
    delete options.validateRequests;
    await stub(options);

    return expect(fakeGetMiddleware).to.have.been.calledWith(sinon.match.has('validateRequests', true));
  });

  it('should be possible to set the validateRequest flag', async () => {
    options.validateRequests = false;
    await stub(options);

    return expect(fakeGetMiddleware).to.have.been.calledWith(sinon.match.has('validateRequests', false));
  });
});
