import type { MD3Theme } from 'react-native-paper';

import type { CustomColorTypes } from './react-native-paper';

// We extend the base MD3Theme type
export interface CustomTheme extends MD3Theme {
  colors: MD3Theme['colors'] & CustomColorTypes;
}

// Theme mode types
export interface AppTheme {
  light: CustomTheme['colors'];
  dark: CustomTheme['colors'];
}
