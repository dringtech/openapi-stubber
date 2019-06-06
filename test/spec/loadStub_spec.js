const sinon = require('sinon');
const proxyquire = require('proxyquire');
const chai = require('chai');

const { expect } = chai;

describe('lib.loadStub', () => {
  let fakeStartStub, loadStub;

  const fakeOptions = { fake: 'Options' };

  beforeEach(() => {
    fakeStartStub = sinon.fake();
    const lib = proxyquire('../../lib', { './stub': fakeStartStub });
    ({ loadStub } = lib);
  });

  it('should start a stub', () => {
    loadStub(fakeOptions);
    return expect(fakeStartStub).to.have.been.calledWith(fakeOptions);
  });
});
