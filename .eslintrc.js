module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 10
  },
  extends: 'standard',
  rules: {
    'semi': [ 'error', 'always' ],
    'comma-dangle': [ 'error', 'always-multiline' ],
    'no-console': 'warn',
    'space-before-function-paren': [ 'error', { 'anonymous': 'always', 'named': 'never', 'asyncArrow': 'always' } ],
    'object-curly-newline': [ 'error', { 'multiline': true } ],
  },
};
