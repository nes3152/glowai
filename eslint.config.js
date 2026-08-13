const expoConfig = require('eslint-config-expo/flat');

const jestGlobals = {
  afterAll: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  beforeEach: 'readonly',
  describe: 'readonly',
  expect: 'readonly',
  it: 'readonly',
  jest: 'readonly',
  test: 'readonly',
};

module.exports = [
  ...expoConfig,
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'web-build/**', 'coverage/**'],
  },
  {
    files: ['__tests__/**/*.js'],
    languageOptions: { globals: jestGlobals },
  },
];
