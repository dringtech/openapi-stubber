const startStub = require('./stub');
const logger = require('./logger');

const runningStubs = [];

function setupLogging(options = {}) {
  const { logFile } = options;
  if (typeof logFile === 'string') logger.setupLogger({ filename: logFile });
}

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
    await stub.close();
  }
};

module.exports = {
  setupLogging,
  loadStub,
  tearDown,
};
