module.exports = {
  spec: 'test/**/*.js',
  reporter: 'mocha-multi-reporters',
  'reporter-options.configFile': 'test/reporter-config.json',
  bail: true,
  exit: true,
}
