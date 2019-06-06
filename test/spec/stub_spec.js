/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { expect } = chai;

describe('lib/stub', () => {
  let stub, fakeValidate, fakeExpress, fakeUse, fakeListen, options;

  beforeEach(() => {
    options = {
      name: 'NAME',
      spec: 'VALID',
      port: 8080,
    };
    fakeValidate = sinon.fake(spec => {
      if (spec === 'VALID') return true;
      return false;
    });
    fakeUse = sinon.fake();
    fakeListen = sinon.fake.returns('STUB SERVER');
    fakeExpress = sinon.fake.returns({
      use: fakeUse,
      listen: fakeListen,
    });
    stub = proxyquire('../../lib/stub', {
      'express': fakeExpress,
      './openApi': { validate: fakeValidate },
    });
  });

  it('should start a stub', async () => {
    const stubServer = await stub(options);
    return Promise.all([
      expect(fakeExpress).to.have.been.called,
      expect(fakeUse).to.have.been.called,
      expect(fakeListen).to.have.been.calledWith(8080),
      expect(stubServer).to.equal('STUB SERVER'),
    ]);
  });

  it('should throw if options not provided', async () => {
    const test = () => stub();
    return expect(test).to.throw();
  })

  it('should throw if name not provided', async () => {
    delete options.name;
    const test = () => stub(options);
    return expect(test).to.throw('Stub name must be provided');
  });

  it('should throw if openapi spec not provided', async () => {
    delete options.spec;
    const test = () => stub(options);
    return expect(test).to.throw('OpenApi spec must be provided');
  });

  it('should throw if port not provided', async () => {
    delete options.port;
    const test = () => stub(options);
    return expect(test).to.throw('Port must be provided');
  });

  it('should throw if openapi spec not valid', async () => {
    options.spec = 'INVALID';
    const test = () => stub(options);
    return expect(test).to.throw('Invalid OpenAPI spec provided');
  });
});
