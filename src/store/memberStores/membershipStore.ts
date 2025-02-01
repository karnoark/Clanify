// src/store/memberStores/membershipStore.ts
import { differenceInDays } from 'date-fns';
import { create } from 'zustand';

import type {
  MembershipState,
  MembershipActions,
  RenewalRequest,
} from '@/src/types/member/membership';

// Helper function to check if a date is expired
const isDateExpired = (date: Date | null): boolean => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(date);
  expiryDate.setHours(0, 0, 0, 0);
  return differenceInDays(today, expiryDate) >= 0;
};

// Create the store with combined state and actions
export const useMembershipStore = create<MembershipState & MembershipActions>()(
  (set, get) => ({
    // Initial state
    membershipExpiry: null,
    membershipPeriod: null,
    points: 0,
    renewalRequest: null,
    isLoading: false,
    error: null,

    // Data loading actions
    loadMembershipData: async () => {
      try {
        set({ isLoading: true, error: null });

        // Execute all membership-related updates concurrently
        await Promise.all([
          get().getMembershipPeriod(),
          get().updateMembershipExpiry(),
          get().updatePoints(),
        ]);
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to load membership data',
        });
      } finally {
        set({ isLoading: false });
      }
    },

    getMembershipPeriod: async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await api.getMembershipPeriod();
        // set({ membershipPeriod: response.period });

        set({ membershipPeriod: 30 });
      } catch (error) {
        throw error;
      }
    },

    updateMembershipExpiry: async () => {
      try {
        // TODO: Replace with actual API call
        // const date = await api.getMembershipExpiry();
        // set({ membershipExpiry: date });

        const someDate = new Date('2025-02-27');
        set({ membershipExpiry: someDate });
      } catch (error) {
        throw error;
      }
    },

    updatePoints: async () => {
      try {
        // TODO: Replace with actual API call
        // const points = await api.getMemberPoints();
        // set({ points });

        set({ points: 69 });
      } catch (error) {
        throw error;
      }
    },

    // Renewal flow actions
    sendRequestToRenewMembership: async (startDate: Date) => {
      try {
        set({ isLoading: true, error: null });

        // TODO: Replace with actual API call
        // const response = await api.requestMembershipRenewal(startDate);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const request: RenewalRequest = {
          id: 'temp-' + Date.now(),
          startDate,
          requestDate: new Date(),
          result: 'pending',
          message: 'Your request is being reviewed by the mess operator.',
        };

        set({ renewalRequest: request });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to send renewal request',
        });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    clearRenewalRequest: async () => {
      try {
        set({ isLoading: true, error: null });

        // TODO: Replace with actual API call
        // await api.clearRenewalRequest();
        await new Promise(resolve => setTimeout(resolve, 500));

        set({ renewalRequest: null });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to clear renewal request',
        });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    validateRenewalEligibility: async () => {
      const { renewalRequest } = get();

      // Check for existing pending request
      if (renewalRequest?.result === 'pending') {
        return {
          isEligible: false,
          reason: 'You already have a pending renewal request',
        };
      }

      // TODO: Add additional validations
      // - Check for outstanding dues
      // - Validate time since last rejection
      // - Other business rules

      return { isEligible: true };
    },

    // Computed values
    isMembershipExpired: () => {
      // return isDateExpired(get().membershipExpiry);
      return true;
    },
  }),
);
