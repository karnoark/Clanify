import { Redirect, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { LoadingScreen } from '@/src/components/core/LoadingScreen';
import { storeManager } from '@/src/services/stores';
import { useAuthStatus } from '@/src/store/auth';
import { useMembershipStatus } from '@/src/store/memberStores/membershipStore';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireMembership?: boolean;
  allowedRoles?: string[];
}

export function RouteGuard({
  children,
  requireAuth = true,
  requireMembership = false,
  allowedRoles = [],
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    user,
    isLoading: authLoading,
    initialized: authInitialized,
  } = useAuthStatus();
  const { isActive: hasMembership, isInitialized: membershipInitialized } =
    useMembershipStatus();

  useEffect(() => {
    // Log navigation attempts for debugging
    console.log(`Route Guard Check - Path: ${pathname}`, {
      requireAuth,
      requireMembership,
      allowedRoles,
      isAuthenticated,
      userRole: user?.role,
      hasMembership,
    });
  }, [
    pathname,
    requireAuth,
    requireMembership,
    allowedRoles,
    isAuthenticated,
    user?.role,
    hasMembership,
  ]);

  // Show loading screen while initializing
  if (
    authLoading ||
    !authInitialized ||
    (requireMembership && !membershipInitialized)
  ) {
    return <LoadingScreen message="Checking access..." />;
  }

  // Authentication check
  if (requireAuth && !isAuthenticated) {
    return <Redirect href="/(auth)/signin" />;
  }

  // Role check
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    // Redirect based on user's role
    if (user?.role === 'member') {
      return <Redirect href="/(member)/(tabs)/home" />;
    } else if (user?.role === 'admin') {
      return <Redirect href="/(admin)/(tabs)/dashboard" />;
    } else if (user?.role === 'regular') {
      return <Redirect href="/(regular)/(tabs)/home" />;
    }
    // Default fallback
    return <Redirect href="/" />;
  }

  // Membership check
  if (requireMembership && !hasMembership) {
    return <Redirect href="/(member)/renewal" />;
  }

  return children;
}
