module.exports = (config) => {
  config.set({
    mutator: 'javascript',
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress', 'dashboard'],
    testRunner: 'mocha',
    transpilers: [],
    testFramework: 'mocha',
  });
};
