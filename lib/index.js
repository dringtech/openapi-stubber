const startStub = require('./stub');

function loadStub(options) {
  startStub(options);
};

function tearDown() {};

module.exports = {
  loadStub,
  tearDown,
};
