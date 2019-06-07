const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const { expect } = chai;

describe('lib', () => {
  it('should provide a loadStub function', () => {
    const lib = require('../../lib');
    expect(lib).to.have.property('loadStub').which.is.a('function');
  });

  it('should provide a tearDown function', () => {
    const lib = require('../../lib');
    expect(lib).to.have.property('tearDown').which.is.a('function');
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
      const fakeStop = sinon.fake.resolves();
      const fakeStartStub = async () => ({ stop: fakeStop });
      const lib = proxyquire('../../lib', { './stub': fakeStartStub });
      await lib.loadStub({});
      await lib.loadStub({});
      await lib.tearDown();
      return expect(fakeStop).to.have.been.called.and.to.have.callCount(2);
    });
  });
});
