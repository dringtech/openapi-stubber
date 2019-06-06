const sinon = require('sinon');
const proxyquire = require('proxyquire');
const chai = require('chai');

const { expect } = chai;

describe('lib.loadStub', () => {
  let fakeStartStub, loadStub;

  const fakeSpec = {};

  beforeEach(() => {
    fakeStartStub = sinon.fake();
    const lib = proxyquire('../../lib', { './stub': fakeStartStub });
    ({ loadStub } = lib);
  });

  it('should start a stub', () => {
    loadStub('NAME', fakeSpec);
    return expect(fakeStartStub).to.have.been.calledWith('NAME', fakeSpec);
  });
});
