module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  resetMocks: true,
  setupFiles: ['<rootDir>/jest.setup.js'],
};
