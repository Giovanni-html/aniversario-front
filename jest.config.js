export default {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {},
  moduleFileExtensions: ['js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'assets/**/*.{js,jsx}',
    '!**/node_modules/**'
  ]
};
