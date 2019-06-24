/* eslint-disable no-unused-expressions */
const path = require('path');
const chai = require('chai');
const { expect } = chai;

const fixturePath = (f) => path.resolve(__dirname, '../fixtures/', f);

const validSpec = fixturePath('petstore_v3.yaml');
const invalidSpec = fixturePath('petstore_v2.json');
const notFoundSpec = 'NOT_A_FILE';

describe('lib/openApi', () => {
  it('should export a getMiddleware function', () => {
    const openApi = require('../../lib/openApi');
    expect(openApi).to.have.property('getMiddleware').which.is.a('function');
  });

  describe('#getMiddleware', () => {
    let getMiddleware;

    beforeEach(() => {
      const openApi = require('../../lib/openApi');
      ({ getMiddleware } = openApi);
    });

    it('should return a middleware function', async () => {
      const result = await getMiddleware({ spec: validSpec });
      return Promise.all([
        expect(result).to.be.a('function'),
      ]);
    });

    it('should be rejected if the document cannot be found', () => {
      return expect(getMiddleware({ spec: notFoundSpec }))
        .to.be.rejectedWith('ENOENT: no such file or directory, open');
    });

    it('should be rejected if the document is not valid OpenAPI v3', () => {
      return expect(getMiddleware({ spec: invalidSpec }))
        .to.be.rejectedWith(/^Document is not valid OpenAPI. \d+ validation errors$/);
    });
  });
});
