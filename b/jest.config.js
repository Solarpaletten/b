module.exports = {
  setupFiles: ['<rootDir>/tests/setup.js'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage'
};