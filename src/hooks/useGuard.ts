import { useEffect, useState } from 'react';

import { useAuthStatus } from '@/src/store/auth';
import { useMembershipStatus } from '@/src/store/memberStores/membershipStore';
import type { GuardOptions, GuardState } from '@/src/types/guards';

export function useGuard(options: GuardOptions): GuardState {
  const {
    requireAuth = true,
    requireMembership = false,
    allowedRoles = [],
  } = options;
  const [state, setState] = useState<GuardState>({
    isChecking: true,
    error: null,
    hasAccess: false,
  });

  const {
    isAuthenticated,
    user,
    initialized: authInitialized,
  } = useAuthStatus();
  const { isActive: hasMembership, isInitialized: membershipInitialized } =
    useMembershipStatus();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Wait for required stores to initialize
        if (!authInitialized || (requireMembership && !membershipInitialized)) {
          return;
        }

        let hasAccess = true;

        // Check authentication
        if (requireAuth && !isAuthenticated) {
          hasAccess = false;
        }

        // Check roles
        if (hasAccess && allowedRoles.length > 0) {
          hasAccess = user ? allowedRoles.includes(user.role) : false;
        }

        // Check membership
        if (hasAccess && requireMembership && !hasMembership) {
          hasAccess = false;
        }

        setState({
          isChecking: false,
          error: null,
          hasAccess,
        });
      } catch (error) {
        setState({
          isChecking: false,
          error: error as Error,
          hasAccess: false,
        });
      }
    };

    checkAccess();
  }, [
    requireAuth,
    requireMembership,
    allowedRoles,
    isAuthenticated,
    user,
    hasMembership,
    authInitialized,
    membershipInitialized,
  ]);

  return state;
}
