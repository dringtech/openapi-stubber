const sinon = require('sinon');
const proxyquire = require('proxyquire');
const chai = require('chai');

const { expect } = chai;

describe('lib.loadStub', () => {
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
