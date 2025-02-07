import { Redirect, Stack } from 'expo-router';

import { RouteGuard } from '@/src/guards/RouteGuard';

export default function AdminLayout() {
  return (
    <RouteGuard
      requireAuth
      allowedRoles={['admin', 'admin_verification_pending']}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding/index"
          options={{ headerShown: false }}
        />
      </Stack>
    </RouteGuard>
  );
}
