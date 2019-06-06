const startStub = require('./stub');

function loadStub(name, spec) {
  startStub(name, spec);
};

function tearDown() {};

module.exports = {
  loadStub,
  tearDown,
};
