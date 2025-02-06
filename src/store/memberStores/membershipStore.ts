// src/store/memberStores/membershipStore.ts

import { differenceInDays } from 'date-fns';
import { useEffect } from 'react';
import { create } from 'zustand';

import { eventManager, StoreEvent } from '@/src/services/events';
import { MembershipService } from '@/src/services/membershipService';
import { storeManager } from '@/src/services/stores';
import { useAuthStore } from '@/src/store/auth';
import type {
  MembershipState,
  MembershipActions,
  MembershipError,
  MembershipPlan,
  // MembershipContext,
  RenewalRequest,
} from '@/src/types/member/membership';
import {
  PointsCalculation,
  MembershipErrorType,
} from '@/src/types/member/membership';

const createError = (
  type: MembershipErrorType,
  message: string,
  extra?: Partial<Omit<MembershipError, 'type' | 'message' | 'name'>>,
): MembershipError => ({
  type,
  message,
  name: `MembershipError.${type}`, // Add name property
  ...extra,
});

export const useMembershipStore = create<MembershipState & MembershipActions>()(
  (set, get) => {
    // Register with store manager
    storeManager.registerStore(
      {
        name: 'membership',
        critical: true,
        dependencies: ['auth'],
      },
      async () => {
        // This is our store initialization logic
        await get().loadMembershipData();
      },
    );

    return {
      // State
      membershipContext: null,
      messId: null,
      points: 0,
      membershipExpiry: null,
      renewalRequest: null,
      availablePlans: [],
      selectedPlanId: null,
      pointsCalculation: null,
      isLoading: false,
      error: null,
      initialized: false,
      cleanup: undefined,

      // Actions
      loadMembershipData: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          throw createError(
            MembershipErrorType.VALIDATION,
            'User ID is required to load membership data',
          );
        }

        try {
          set({ isLoading: true, error: null });

          // First get membership context
          const membershipContext =
            await MembershipService.getMembershipContext(userId);

          // Get messId from context or current store state
          const effectiveMessId =
            membershipContext.currentMembership?.messId ||
            membershipContext.lastExpiredMembership?.messId ||
            get().messId;

          // Only fetch plans and requests if we have a messId
          let plans: MembershipPlan[] = [];
          let currentRequest: RenewalRequest | null = null;
          let cleanup: (() => void) | undefined;

          if (effectiveMessId) {
            // Fetch other data in parallel
            [plans, currentRequest] = await Promise.all([
              MembershipService.getAvailablePlans(effectiveMessId),
              MembershipService.getCurrentRequest({
                memberId: userId,
                messId: effectiveMessId,
              }),
            ]);

            // Set up subscription if there's a request
            if (currentRequest) {
              cleanup = MembershipService.subscribeToRequestUpdates(
                currentRequest.id,
                updatedRequest => {
                  set({ renewalRequest: updatedRequest });
                },
              );
            }
          }

          // Update store state
          set({
            membershipContext,
            messId: effectiveMessId,
            points:
              membershipContext.currentMembership?.points ||
              membershipContext.lastExpiredMembership?.points ||
              0,
            membershipExpiry:
              membershipContext.currentMembership?.expiryDate || null,
            availablePlans: plans,
            renewalRequest: currentRequest,
            cleanup,
            initialized: true,
            isLoading: false,
          });

          // Emit appropriate events based on membership status
          if (membershipContext.currentMembership) {
            await eventManager.emit(StoreEvent.MEMBERSHIP_LOADED, {
              status: 'active',
              messId: membershipContext.currentMembership.messId,
            });
          } else if (membershipContext.lastExpiredMembership) {
            await eventManager.emit(StoreEvent.MEMBERSHIP_EXPIRED, {
              memberId: membershipContext.lastExpiredMembership.id,
              expiryDate: membershipContext.lastExpiredMembership.expiryDate,
            });
          }
        } catch (error) {
          const membershipError = createError(
            MembershipErrorType.NETWORK,
            'Failed to load membership data',
            { retry: () => get().loadMembershipData() },
          );
          set({ error: membershipError, isLoading: false });
          await eventManager.emit(StoreEvent.MEMBERSHIP_ERROR, {
            error: membershipError,
          });
          throw error;
        }
      },

      selectPlan: async (planId: string) => {
        try {
          set({ isLoading: true, error: null });

          const plan = get().availablePlans.find(p => p.id === planId);
          if (!plan) {
            throw createError(
              MembershipErrorType.VALIDATION,
              'Invalid plan selected',
            );
          }

          const points = get().points;
          const pointsCalculation =
            await MembershipService.calculatePointsBenefit(points);

          set({
            selectedPlanId: planId,
            pointsCalculation,
            isLoading: false,
          });
        } catch (error) {
          const membershipError = createError(
            MembershipErrorType.UNKNOWN,
            'Failed to process plan selection',
          );
          set({
            error: membershipError,
            isLoading: false,
          });
          await eventManager.emit(StoreEvent.MEMBERSHIP_ERROR, {
            error: membershipError,
          });
        }
      },

      validateRenewalEligibility: async () => {
        const { renewalRequest, selectedPlanId, messId } = get();
        const userId = useAuthStore.getState().user?.id;

        if (!selectedPlanId) {
          return {
            isEligible: false,
            reason: 'Please select a membership plan',
            code: 'NO_PLAN_SELECTED',
          };
        }

        if (renewalRequest?.result === 'pending') {
          return {
            isEligible: false,
            reason: 'You already have a pending renewal request',
            code: 'PENDING_REQUEST_EXISTS',
          };
        }

        if (!messId) {
          throw new Error('messId is missing');
        }

        try {
          if (!userId) {
            throw new Error('User ID is missing');
          }

          return await MembershipService.checkRenewalEligibility(
            userId,
            messId,
          );
        } catch (error) {
          const membershipError = createError(
            MembershipErrorType.NETWORK,
            'Failed to check renewal eligibility',
          );
          await eventManager.emit(StoreEvent.MEMBERSHIP_ERROR, {
            error: membershipError,
          });
          throw membershipError;
        }
      },

      sendRequestToRenewMembership: async (startDate: Date) => {
        const { messId, selectedPlanId, pointsCalculation } = get();
        const userId = useAuthStore.getState().user?.id;

        if (!messId || !selectedPlanId) {
          throw createError(
            MembershipErrorType.VALIDATION,
            'Missing required information for renewal',
          );
        }

        try {
          set({ isLoading: true, error: null });

          const eligibility = await get().validateRenewalEligibility();
          if (!eligibility.isEligible) {
            throw createError(
              MembershipErrorType.BUSINESS,
              eligibility.reason || 'Not eligible for renewal',
              { code: eligibility.code || 'INELIGIBLE' },
            );
          }

          // Get current user ID from auth store
          if (!userId) {
            throw new Error('User ID is missing');
          }

          const result = await MembershipService.createRenewalRequest({
            userId,
            messId,
            planId: selectedPlanId,
            requestedStartDate: startDate,
            pointsToUse: pointsCalculation?.usedPoints || 0,
          });

          const cleanup = MembershipService.subscribeToRequestUpdates(
            result.id,
            updatedRequest => {
              set({ renewalRequest: updatedRequest });
            },
          );

          set({
            renewalRequest: result,
            cleanup,
            isLoading: false,
          });
        } catch (error) {
          const membershipError = createError(
            MembershipErrorType.UNKNOWN,
            'Failed to send renewal request',
          );
          set({
            error: membershipError,
            isLoading: false,
          });
          await eventManager.emit(StoreEvent.MEMBERSHIP_ERROR, {
            error: membershipError,
          });
          throw error;
        }
      },

      clearRenewalRequest: async () => {
        try {
          set({ isLoading: true, error: null });

          const { renewalRequest, cleanup } = get();
          if (renewalRequest?.id) {
            await MembershipService.cancelRequest(renewalRequest.id);
            if (cleanup) cleanup();
          }

          set({
            renewalRequest: null,
            selectedPlanId: null,
            pointsCalculation: null,
            cleanup: undefined,
            isLoading: false,
          });
        } catch (error) {
          const membershipError = createError(
            MembershipErrorType.UNKNOWN,
            'Failed to clear renewal request',
          );
          set({
            error: membershipError,
            isLoading: false,
          });
          await eventManager.emit(StoreEvent.MEMBERSHIP_ERROR, {
            error: membershipError,
          });
          throw error;
        }
      },

      // Helper methods
      isMembershipExpired: () => {
        const { membershipContext } = get();
        return !membershipContext?.currentMembership;
      },

      isInitialized: () => {
        return get().initialized;
      },
    };
  },
);

// Cleanup hook remains the same
export function useCleanupMembershipStore() {
  const cleanup = useMembershipStore(state => state.cleanup);

  useEffect(() => {
    return () => {
      if (cleanup) cleanup();
    };
  }, [cleanup]);
}

// Add new hooks for common membership checks
export function useMembershipStatus() {
  const membershipContext = useMembershipStore(
    state => state.membershipContext,
  );
  const isInitialized = useMembershipStore(state => state.initialized);
  const error = useMembershipStore(state => state.error);

  return {
    isActive: !!membershipContext?.currentMembership,
    isExpired:
      !membershipContext?.currentMembership &&
      !!membershipContext?.lastExpiredMembership,
    isInitialized,
    error,
    membership:
      membershipContext?.currentMembership ||
      membershipContext?.lastExpiredMembership,
  };
}
