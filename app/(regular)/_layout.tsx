import { Stack } from 'expo-router';

import { RouteGuard } from '@/src/guards/RouteGuard';

export default function RegularLayout() {
  return (
    <RouteGuard requireAuth allowedRoles={['regular']}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </RouteGuard>
  );
}
