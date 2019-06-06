const startStub = require('./stub');

async function loadStub(options) {
  try {
    await startStub(options);
  } catch (error) {
    throw error;
  }
};

async function tearDown() {};

module.exports = {
  loadStub,
  tearDown,
};
