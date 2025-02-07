import NetInfo from '@react-native-community/netinfo';
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
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  MD3DarkTheme,
  adaptNavigationTheme,
  MD3LightTheme,
  PaperProvider,
  useTheme,
} from 'react-native-paper';
import { en, registerTranslation } from 'react-native-paper-dates';

import { LoadingScreen } from '@/src/components/core/LoadingScreen';
import { NetworkError } from '@/src/components/core/NetworkError';
import { AppLoadingError } from '@/src/components/errors/AppLoadingError';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { eventManager, StoreEvent } from '@/src/services/events';
import { storeManager } from '@/src/services/stores';
import { initializeAuth, useAuthStatus, useAuthStore } from '@/src/store/auth';
import {
  initializeNetworkMonitoring,
  useNetworkStore,
} from '@/src/store/networkStore';

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

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);
  const { isConnected, isInternetReachable } = useNetworkStore();
  const { isAuthenticated, initialized: authInitialized } = useAuthStatus();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize network monitoring first
        const unsubscribeNetwork = await NetInfo.addEventListener(state => {
          useNetworkStore.setState({
            isConnected: state.isConnected,
            isInternetReachable: state.isInternetReachable,
          });
        });

        // Handle application initialization based on auth state
        const handleAuthCompleted = async ({ userId }: { userId: string }) => {
          try {
            await storeManager.initializeDependentStores('auth');
          } catch (error) {
            console.error('Error initializing auth dependent  stores:', error);
            setInitError(error as Error);
          }
        };

        // Handle auth errors during initialization
        const handleAuthError = ({ error }: { error: Error }) => {
          console.error('Auth error during initialization:', error);
          setInitError(error);
        };

        // Listen for auth events
        const cleanupAuthCompleted = eventManager.on(
          StoreEvent.AUTH_COMPLETED,
          handleAuthCompleted,
        );
        const cleanupAuthError = eventManager.on(
          StoreEvent.AUTH_ERROR,
          handleAuthError,
        );

        return () => {
          unsubscribeNetwork();
          cleanupAuthCompleted();
          cleanupAuthError();
        };
      } catch (error) {
        console.error('Error in app initialization:', error);
        setInitError(error as Error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // Show network error if there's no connection
  if (!isConnected || !isInternetReachable) {
    return (
      <NetworkError
        onRetry={async () => {
          const netInfo = await NetInfo.fetch();
          useNetworkStore.setState({
            isConnected: netInfo.isConnected,
            isInternetReachable: netInfo.isInternetReachable,
          });
        }}
      />
    );
  }

  // Show general error if initialization failed
  if (initError) {
    return (
      <AppLoadingError
        error={initError}
        onRetry={() => {
          setInitError(null);
          setIsInitializing(true);
        }}
      />
    );
  }

  // Show loading screen while initializing
  if (isInitializing || !authInitialized) {
    return <LoadingScreen message="Starting up..." />;
  }

  return children;
}

function AuthStateManager({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  // const { user, session, isLoading } = useAuthStore();
  const { isAuthenticated, user, isLoading, initialized } = useAuthStatus();
  const getAdminRegistrationStatus = useAuthStore(
    state => state.getAdminRegistrationStatus,
  );
  const refreshSession = useAuthStore(state => state.refreshSession);

  useEffect(() => {
    if (!initialized || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inMemberGroup = segments[0] === '(member)';
    const inRegularGroup = segments[0] === '(regular)';
    const isIndexPage = segments.length === 0 || segments[0] === 'index';

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
      if (!isAuthenticated) {
        // Allow access only to auth group, redirect others to signin
        if (!inAuthGroup) {
          router.replace('/(auth)/signin');
        }
        if (isIndexPage || !inAuthGroup) {
          // Modified this condition
          router.replace('/(auth)/signin');
        }
        return;
      }

      // Case 2: User is authenticated but on auth screens
      if (isIndexPage || inAuthGroup) {
        // Redirect based on role
        if (user?.role === 'member') {
          router.replace('/(member)/(tabs)/home');
        } else if (user?.role === 'admin') {
          router.replace('/(admin)/(tabs)/dashboard');
        } else if (user?.role === 'regular') {
          router.replace('(regular)/(tabs)/home');
        }
        return;
      }

      // Case 3: Handle admin verification pending
      if (user?.role === 'admin_verification_pending') {
        if (
          inAuthGroup ||
          inMemberGroup ||
          inRegularGroup ||
          (inAdminGroup && !segments.includes('onboarding'))
        ) {
          await checkAdminStatusAndRoute();
        }
        return;
      }

      // Case 4: Regular role-based access control
      if (user?.role === 'member' && (inAdminGroup || inRegularGroup)) {
        router.replace('/(member)/(tabs)/home');
      } else if (user?.role === 'admin' && (inMemberGroup || inRegularGroup)) {
        router.replace('/(admin)/(tabs)/dashboard');
      } else if (user?.role === 'regular' && (inAdminGroup || inMemberGroup)) {
        router.replace('/(regular)/(tabs)/home');
      }
    };

    protectRoutes();
  }, [
    isLoading,
    segments,
    initialized,
    isAuthenticated,
    user,
    getAdminRegistrationStatus,
    router,
    refreshSession,
  ]);

  // Show loading state while checking auth
  if (isLoading || !initialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  // const theme = useTheme();
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    PlayRegular: require('@/src/assets/fonts/PlayfairDisplay-Regular.ttf'),
  });
  const { isLoading: authLoading } = useAuthStore();
  const { isConnected, isInternetReachable } = useNetworkStore();

  // useEffect(() => {
  //   const unsubscribe = initializeNetworkMonitoring();
  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  useEffect(() => {
    // Only initialize auth if we have network connectivity
    if (isConnected && isInternetReachable) {
      initializeAuth();
    }
  }, [isConnected, isInternetReachable]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // First, check network connectivity
  // if (!isConnected || !isInternetReachable) {
  //   return (
  //     <View style={{ flex: 1, backgroundColor: 'white' }}>
  //       <NetworkError
  //         onRetry={async () => {
  //           // You can trigger a manual network check here if needed
  //           const netInfo = await NetInfo.fetch();
  //           useNetworkStore.setState({
  //             isConnected: netInfo.isConnected,
  //             isInternetReachable: netInfo.isInternetReachable,
  //           });
  //         }}
  //       />
  //     </View>
  //   );
  // }

  // Show loading screen while checking auth
  // console.log('RootLayout:-> authLoading: ', authLoading);
  // if (authLoading || !fontsLoaded) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  if (!fontsLoaded) {
    return <LoadingScreen message="Loading resources..." />;
  }

  const paperTheme =
    colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={paperTheme}>
          <AppInitializer>
            <AuthStateManager>
              <Stack>
                <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(member)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(regular)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
                <Stack.Screen name="help" />
              </Stack>
            </AuthStateManager>
          </AppInitializer>
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
