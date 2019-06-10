const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const { expect } = chai;

describe('lib', () => {
  [ 'loadStub', 'tearDown', 'setupLogging' ].forEach((functionName) => {
    it(`should provide a ${functionName} function`, () => {
      const lib = require('../../lib');
      expect(lib).to.have.property(functionName).which.is.a('function');
    });
  });

  describe('#setupLogging', () => {
    let fakeLoggerSetup, setupLogging;

    beforeEach(() => {
      fakeLoggerSetup = sinon.fake();
      const lib = proxyquire('../../lib', { './logger': { setupLogger: fakeLoggerSetup } });
      ({ setupLogging } = lib);
    });

    it('should setup the logger if a logFile is set', () => {
      setupLogging({ logFile: 'LOGFILE_NAME' });
      expect(fakeLoggerSetup).to.have.been.calledWithMatch({ filename: 'LOGFILE_NAME' });
    });

    it('should not setup the logger if logFile not set', () => {
      setupLogging();
      // eslint-disable-next-line no-unused-expressions
      expect(fakeLoggerSetup).to.not.have.been.called;
    });
  });

  describe('#loadStub', () => {
    let fakeStartStub, loadStub, fakeOptions;

    const fakeError = new Error('FAKE ERROR');

    beforeEach(() => {
      fakeOptions = { fail: false };
      fakeStartStub = sinon.fake(async (options) => {
        const { fail = false } = options;
        if (fail) throw fakeError;
      });
      const lib = proxyquire('../../lib', { './stub': fakeStartStub });
      ({ loadStub } = lib);
    });

    it('should start a stub', async () => {
      await loadStub(fakeOptions);
      return expect(fakeStartStub).to.have.been.calledWith(fakeOptions);
    });

    it('should rethrow errors', () => {
      fakeOptions.fail = true;
      return expect(loadStub(fakeOptions)).to.be.rejectedWith(fakeError);
    });
  });

  describe('#tearDown', () => {
    it('should remove the running stubs', async () => {
      const fakeClose = sinon.fake.resolves();
      const fakeStartStub = async () => ({ close: fakeClose });
      const lib = proxyquire('../../lib', { './stub': fakeStartStub });
      await lib.loadStub({});
      await lib.loadStub({});
      await lib.tearDown();
      return expect(fakeClose).to.have.been.called.and.to.have.callCount(2);
    });
  });
});
