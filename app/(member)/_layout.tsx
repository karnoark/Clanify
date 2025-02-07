import { Stack } from 'expo-router';

import { RouteGuard } from '@/src/guards/RouteGuard';
import { StoreInitializationGuard } from '@/src/guards/StoreInitializationGuard';

export default function MemberLayout() {
  return (
    <RouteGuard requireAuth requireMembership allowedRoles={['member']}>
      <StoreInitializationGuard
        storeName="membership"
        loadingMessage="Loading membership data..."
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </StoreInitializationGuard>
    </RouteGuard>
  );
}
