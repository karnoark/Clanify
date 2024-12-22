/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  console.log(" -------------------- Entered useThemeColor component --------------------")
  console.log("useColorScheme(): ", useColorScheme())
  const theme = useColorScheme() ?? 'light';
  console.log("Inferred device theme: ", theme)
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
