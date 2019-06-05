module.exports = {
  'lines': 90,
  'statements': 90,
  'functions': 90,
  'branches': 90,
  'exclude': [
    'report/',
    'node_modules/',
    'test/',
    '.*.js',
    'nyc.config.js',
  ],
  'reporter': [
    'lcov',
    'cobertura',
    'text-summary',
  ],
  'report-dir': 'report/coverage',
};
