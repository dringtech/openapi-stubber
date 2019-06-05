const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

process.env.NODE_ENV = 'test';

before(() => {
  chai.use(sinonChai);
  chai.use(chaiAsPromised);
});
