module.exports = {
  'lines': 90,
  'statements': 90,
  'functions': 90,
  'branches': 90,
  'exclude': [
    'reports/',
    'node_modules/',
    'test/',
    '.*.js',
    'nyc.config.js',
    '.stryker-tmp/',
  ],
  'reporter': [
    'lcov',
    'cobertura',
    'text-summary',
  ],
  'report-dir': 'reports',
};
