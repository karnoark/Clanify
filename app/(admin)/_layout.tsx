import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

import { useAuthStore } from '@/src/store/auth';

export default function AdminLayout() {
  const user = useAuthStore(state => state.user);
  const getAdminRegistrationStatus = useAuthStore(
    state => state.getAdminRegistrationStatus,
  );

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
    </Stack>
  );
}
