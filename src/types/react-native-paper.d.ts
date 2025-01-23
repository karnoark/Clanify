import { MD3Colors, MD3Theme } from 'react-native-paper';

declare module 'react-native-paper' {
  // Extending the MD3Colors interface to include our custom colors
  export interface MD3Colors extends CustomColorTypes {}
}

// Define our custom color types
export interface CustomColorTypes {
  pr10: string;
  pr20: string;
  pr30: string;
  pr40: string;
  pr50: string;
  pr60: string;
  pr70: string;
  pr80: string;
  pr90: string;
  pr100: string;
}
