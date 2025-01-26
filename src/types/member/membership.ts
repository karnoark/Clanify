// src/types/membership.ts

import type { BaseState } from '@/src/types/base';

export type RenewalRequestResult = 'pending' | 'approved' | 'rejected';

export interface RenewalRequest {
  id: string;
  startDate: Date;
  requestDate: Date;
  result: RenewalRequestResult;
  message: string;
}

export interface MembershipState extends BaseState {
  membershipExpiry: Date | null;
  membershipPeriod: number | null;
  points: number;
  renewalRequest: RenewalRequest | null;
}

export interface MembershipActions {
  loadMembershipData: () => Promise<void>;
  getMembershipPeriod: () => Promise<void>;
  updateMembershipExpiry: () => Promise<void>;
  updatePoints: () => Promise<void>;
  sendRequestToRenewMembership: (startDate: Date) => Promise<void>;
  clearRenewalRequest: () => Promise<void>;
  validateRenewalEligibility: () => Promise<{
    isEligible: boolean;
    reason?: string;
  }>;
  isMembershipExpired: () => boolean;
}
