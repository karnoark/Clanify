import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import 'react-native-reanimated';
import merge from 'deepmerge';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text } from 'react-native';
import {
  MD3DarkTheme,
  adaptNavigationTheme,
  MD3LightTheme,
  PaperProvider,
  useTheme,
} from 'react-native-paper';
import { en, registerTranslation } from 'react-native-paper-dates';

import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { initializeAuth, useAuthStore } from '@/src/store/auth';

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

// Register the English translation for react-native-paper-dates
registerTranslation('en', en);

export default function RootLayout() {
  // const theme = useTheme();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    PlayRegular: require('@/src/assets/fonts/PlayfairDisplay-Regular.ttf'),
  });
  const { user, session, isLoading } = useAuthStore();

  useEffect(() => {
    // console.log("React native paper theme: ", theme);
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Initial loading state
  //todo following code isn't working properly due to not handling isLoading property approriately in authStore
  // if (isLoading) {
  //   console.log('Zustnad Authstore isLoading is still true so returning null');
  //   return null; // Or a loading screen component
  // }

  // Not authenticated - redirect to auth
  // if (!session || !user) {
  //   return <Redirect href="/signin" />;
  // }

  const paperTheme =
    colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={paperTheme}>
        <Stack>
          {user && user.role === 'admin' ? (
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="(member)" options={{ headerShown: false }} />
          )}
          <Stack.Screen
            name="(authenticated)/(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="verify" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          {/* <Stack.Screen name="(member)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} /> */}
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
