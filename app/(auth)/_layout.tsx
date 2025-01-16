import { Stack } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="forgotPassword" options={{ headerShown: false }} />
      <Stack.Screen name="resetPassword" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;
