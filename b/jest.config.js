module.exports = {
  setupFiles: ['<rootDir>/tests/setup.js'],
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  testTimeout: 30000,
  verbose: true,
  clearMocks: true,
  detectOpenHandles: true,
  forceExit: true
};