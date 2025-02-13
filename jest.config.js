module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [],  // This tells Jest to transform everything, including node_modules
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/jest.setup.ts'],
};