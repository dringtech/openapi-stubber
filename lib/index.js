const startStub = require('./stub');

const runningStubs = [];

async function loadStub(options) {
  try {
    runningStubs.push(await startStub(options));
  } catch (error) {
    throw error;
  }
};

async function tearDown() {
  while (runningStubs.length > 0) {
    const stub = runningStubs.pop();
    await stub.stop();
  }
};

module.exports = {
  loadStub,
  tearDown,
};
