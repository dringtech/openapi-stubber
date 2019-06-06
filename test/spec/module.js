const chai = require('chai');
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
});
