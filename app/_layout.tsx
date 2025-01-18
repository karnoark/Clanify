import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import 'react-native-reanimated';
import merge from 'deepmerge';
import { useFonts } from 'expo-font';
import { Redirect, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
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

function AuthStateManager({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { user, session, isLoading } = useAuthStore();
  const getAdminRegistrationStatus = useAuthStore(
    state => state.getAdminRegistrationStatus,
  );
  const refreshSession = useAuthStore(state => state.refreshSession);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inMemberGroup = segments[0] === '(member)';

    // Function to check admin status and handle routing
    const checkAdminStatusAndRoute = async () => {
      if (!user?.email) return;

      const registration = await getAdminRegistrationStatus(user.email);
      console.log('registration status is: ', registration?.status);

      if (registration) {
        switch (registration.status) {
          case 'pending_onboarding':
          case 'onboarding_in_progress':
            if (!segments.includes('onboarding')) {
              router.replace('/(admin)/onboarding/');
            }
            break;
          case 'verification_pending':
          case 'rejected':
            if (!segments.includes('verificationStatus')) {
              router.replace('/(admin)/onboarding/verificationStatus');
            }
            break;
          case 'approved':
            await refreshSession();
            break;
        }
      }
    };

    const protectRoutes = async () => {
      // Case 1: No authenticated session
      if (!session || !user) {
        // Allow access only to auth group, redirect others to signin
        if (!inAuthGroup) {
          router.replace('/(auth)/signin');
        }
        return;
      }

      // Case 2: User is authenticated but on auth screens
      if (inAuthGroup) {
        // Redirect based on role
        if (user.role === 'member') {
          router.replace('/(member)/(tabs)/home');
        } else if (user.role === 'admin') {
          router.replace('/(admin)/(tabs)/dashboard');
        }
        return;
      }

      // Case 3: Handle admin verification pending
      if (user.role === 'admin_verification_pending') {
        if (
          inAuthGroup ||
          inMemberGroup ||
          (inAdminGroup && !segments.includes('onboarding'))
        ) {
          await checkAdminStatusAndRoute();
        }
        return;
      }

      // Case 4: Regular role-based access control
      if (user.role === 'member' && inAdminGroup) {
        router.replace('/(member)/(tabs)/home');
      } else if (user.role === 'admin' && inMemberGroup) {
        router.replace('/(admin)/(tabs)/dashboard');
      }
    };

    protectRoutes();
  }, [
    isLoading,
    segments,
    session,
    user,
    getAdminRegistrationStatus,
    router,
    refreshSession,
  ]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  // const theme = useTheme();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    PlayRegular: require('@/src/assets/fonts/PlayfairDisplay-Regular.ttf'),
  });
  const { isLoading } = useAuthStore();

  // Initialize auth when the app starts
  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Show loading screen while checking auth
  console.log('RootLayout:-> isLoading: ', isLoading);
  if (isLoading || !loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const paperTheme =
    colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={paperTheme}>
        <AuthStateManager>
          <Stack>
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="(member)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="help" />
          </Stack>
        </AuthStateManager>
      </ThemeProvider>
    </PaperProvider>
  );
}
