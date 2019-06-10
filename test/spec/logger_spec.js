const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const clearModule = require('clear-module');

const { expect } = chai;

describe('lib/logger', () => {
  let setupLogger, getLogger, fakeChild, fakeCreateLogger, fakeTransportFile, fakeExpressLogger, fakeExpressErrorLogger;

  beforeEach(async () => {
    clearModule('../../lib/logger');
    fakeChild = sinon.fake.returns('CHILD LOGGER');
    fakeCreateLogger = sinon.fake.returns({ child: fakeChild });
    fakeTransportFile = sinon.fake();
    fakeExpressLogger = sinon.fake();
    fakeExpressErrorLogger = sinon.fake();
    const logger = proxyquire('../../lib/logger', {
      'winston': {
        createLogger: fakeCreateLogger,
        transports: { File: fakeTransportFile },
        format: { json: () => 'JSON_FORMAT' },
        '@noCallThru': true,
      },
      'express-winston': {
        logger: fakeExpressLogger,
        errorLogger: fakeExpressErrorLogger,
        '@noCallThru': true,
      },
    }
    );
    ({ setupLogger, getLogger } = logger);
  });

  describe('#setupLogger', () => {
    it('should setup a logger instance', () => {
      expect(() => setupLogger({ filename: 'LOG_FILENAME' })).to.not.throw();
      expect(fakeTransportFile).to.have.been.calledWithMatch({
        level: 'info',
        filename: 'LOG_FILENAME',
        format: 'JSON_FORMAT',
        options: { flags: 'w' },
      });

      return expect(fakeCreateLogger).to.have.been.calledWith(sinon.match.hasOwn('transports', sinon.match.array));
    });

    it('should fail if filename not provided', () => {
      expect(() => setupLogger()).to.throw('Logger filename not set');
    });
  });

  describe('#getLogger', () => {
    it('should return a logger instance', () => {
      setupLogger({ filename: 'LOG_FILENAME' });

      let testLogger;
      expect(() => { testLogger = getLogger('testLogger'); }).to.not.throw();
      expect(fakeChild).to.have.been.calledWithMatch({ name: 'testLogger' });
      return expect(testLogger).to.have.ownProperty('logger');
    });

    it('should return an Express request logger', () => {
      setupLogger({ filename: 'LOG_FILENAME' });

      let testLogger;
      testLogger = getLogger('testLogger');
      expect(fakeExpressLogger).to.have.been.calledWithMatch({
        winstonInstance: 'CHILD LOGGER',
        meta: true,
        msg: 'HTTP {{req.method}} {{req.url}}',
        expressFormat: true,
        colorize: false,
      });
      return expect(testLogger).to.have.ownProperty('requestLogger');
    });

    it('should return an Express error logger', () => {
      setupLogger({ filename: 'LOG_FILENAME' });

      let testLogger;
      testLogger = getLogger('testLogger');
      expect(fakeExpressErrorLogger).to.have.been.calledWith(sinon.match({ winstonInstance: 'CHILD LOGGER' }));
      expect(fakeExpressErrorLogger).to.have.been.calledWith(sinon.match.hasOwn('exceptionToMeta', sinon.match.func));
      return expect(testLogger).to.have.ownProperty('errorLogger');
    });

    it('should fail if logger not already set up', () => {
      return expect(() => getLogger('myLogger')).to.throw('Logger not inialised - call setupLogger');
    });
  });
});
