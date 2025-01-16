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
import { ActivityIndicator, Text, View } from 'react-native';
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

  // Initialize auth when the app starts
  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    // console.log("React native paper theme: ", theme);
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // if (!loaded) {
  //   return null;
  // }

  // Show loading screen while checking auth
  console.log('RootLayout:-> isLoading: ', isLoading);
  if (isLoading || !loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
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
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="(member)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="help" />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
