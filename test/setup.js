const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const chaiFs = require('chai-fs');

process.env.NODE_ENV = 'test';

before(() => {
  chai.use(sinonChai);
  chai.use(chaiAsPromised);
  chai.use(chaiFs);
});
