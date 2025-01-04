// Phase 1: Initial Development (.eslintrc.mts)
// Focus: Catch critical bugs while maintaining development speed
// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  root: true,
  extends: [
    'expo',
    'universe',
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'react-hooks', 'jest'],
  env: {
    'jest/globals': true,
  },
  rules: {
    // Critical rules only
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',

    // Disabled rules for faster development
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react/jsx-props-no-spreading': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/require-default-props': 'off',

    //god known what this ban types is, disabling it for time being
    '@typescript-eslint/ban-types': 'off',

    // Disabled rules for development speed
    '@typescript-eslint/func-call-spacing': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    // 'no-unused-vars': 'off',
    'prettier/prettier': 0,

    //Ahh... Why these rules are still here
    'react/react-in-jsx-scope': 'off',

    // require() is recommended for images and fonts import
    '@typescript-eslint/no-require-imports': [
      'error',
      {
        allow: ['./assets/*'],
      },
    ],
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    {
      // Lint non-TypeScript files without "parserOptions.project"
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // Example: Allow 'require' in JavaScript files
      },
    },
  ],
};

/*
// Phase 2: Mid Development (.eslintrc.mts)
// Focus: Add structure and best practices


module.exports = {
  root: true,
  extends: [
    'expo',
    'universe',
    'universe/shared/typescript-analysis',
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: [
    '@typescript-eslint',
    'react-hooks',
    'react-native'
  ],
  env: {
    'jest/globals': true,
  },
  rules: {
    // Previous rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error', // Upgraded to error
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error', // Upgraded to error

    // New rules for better code structure
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/split-platform-components': 'error',
    '@typescript-eslint/consistent-type-imports': 'warn',
    'react/jsx-no-bind': ['warn', {
      allowArrowFunctions: true,
      allowBind: false,
      ignoreRefs: true
    }],
    
    // Still disabled for flexibility
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/require-default-props': 'off'

    //god known what this ban types is, disabling it for time being
    '@typescript-eslint/ban-types': 'off',
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
};


// Phase 3: Production Preparation (.eslintrc.mts)
// Focus: Strict rules for production-ready code


module.exports = {
  root: true,
  extends: [
    'expo',
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'universe',
    'universe/shared/typescript-analysis',
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: [
    '@typescript-eslint',
    'react-hooks',
    'react-native'
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  ],
  env: {
    'jest/globals': true,
  },
  rules: {
    // Previous rules with stricter enforcement
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',

    // Style and optimization rules enforced
    'react-native/no-inline-styles': 'error',
    'react-native/no-color-literals': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-single-element-style-arrays': 'error',
    'react-native/no-raw-text': ['error', {
      skip: ['CustomText']
    }],

    // TypeScript strictness increased
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',

    // Performance rules
    'react/jsx-no-bind': ['error', {
      allowArrowFunctions: true,
      allowBind: false,
      ignoreRefs: true
    }],
    'react/jsx-no-constructed-context-values': 'error',
    'react/no-array-index-key': 'error',

    // Airbnb customization for React Native
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'import/extensions': ['error', 'never'],
    'react/require-default-props': 'error',
    'react/style-prop-object': 'off'

    
    //god known what this ban types is, disabling it for time being
    '@typescript-eslint/ban-types': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true
      }
    }
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
};

*/
