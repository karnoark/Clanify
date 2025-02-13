module.exports = {
  // Use the Expo preset, which sets up the testing environment for React Native
  preset: 'jest-expo',

  // The root directory where Jest should scan for tests
  rootDir: '../../',

  // Setup files that run before each test
  setupFilesAfterEnv: ['./__tests__/setup/jest.setup.ts'],

  // Which files to test
  testMatch: ['<rootDir>/**/*.unit.test.ts'],

  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: ['babel-preset-expo'],
    }],
  },

  // Critical: This tells Jest which node_modules to transform
  // The pattern includes @react-native and other necessary packages
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-native-community|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@?react-native-paper/.*)/)'],

  // Handle module name mapping for @ imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../$1',
  },

  // File extensions Jest should look for
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Test environment
  testEnvironment: 'node',

  // Additional settings to ensure proper React Native testing
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },

  // Handle specific file types
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Coverage settings (optional but recommended)
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};