import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Text } from 'react-native';
import {
  MD3DarkTheme,
  adaptNavigationTheme,
  MD3LightTheme,
  PaperProvider,
  useTheme,
} from 'react-native-paper';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import merge from 'deepmerge';

import { initializeAuth, useAuthStore } from '@/utils/auth';

const customLightTheme = { ...MD3DarkTheme, colors: Colors.light };
const customDarkTheme = { ...MD3LightTheme, colors: Colors.dark };

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(LightTheme, customLightTheme);
const CombinedDarkTheme = merge(DarkTheme, customDarkTheme);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // const theme = useTheme();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    PlayRegular: require('@/assets/fonts/PlayfairDisplay-Regular.ttf'),
  });

  useEffect(() => {
    // console.log("React native paper theme: ", theme);
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  const paperTheme =
    colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={paperTheme}>
        <Stack>
          <Stack.Screen
            name="(authenticated)/(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="verify" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="forgotPassword"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="resetPassword" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
