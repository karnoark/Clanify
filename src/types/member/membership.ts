// src/types/member/membership.ts

// We'll use a discriminated union for our error types to handle different scenarios
// Define a simple enum for error types
export enum MembershipErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  BUSINESS = 'BUSINESS',
  UNKNOWN = 'UNKNOWN',
}

// Define a single MembershipError interface
export interface MembershipError extends Error {
  type: MembershipErrorType;
  message: string;
  field?: string;
  code?: string;
  retry?: () => Promise<void>;
}

// Membership Plan type
export type MembershipPlan = {
  id: string;
  name: string;
  description: string;
  membership_period: number;
  price: number;
  mess_id: string;
  is_active: boolean;
};

// Add a view model type for the UI
// export type MembershipPlanViewModel = {
//   id: string;
//   name: string;
//   description: string;
//   membership_period: number;
//   price: number;
//   isPopular?: boolean;
//   features?: string[];
// };

// Add a transformation function
// export const transformMembershipPlan = (
//   plan: MembershipPlan,
// ): MembershipPlanViewModel => ({
//   id: plan.id,
//   name: plan.name,
//   description: plan.description || '',
//   membership_period: plan.membership_period,
//   price: Number(plan.price),
//   // Add any UI-specific transformations here
// });

// Renewal request status type
export type RenewalRequestStatus = 'pending' | 'approved' | 'rejected';

// Enhanced renewal request type
export interface RenewalRequest {
  id: string;
  startDate: Date;
  requestDate: Date;
  result: RenewalRequestStatus;
  message: string;
  pointsUsed: number;
  extraDays: number;
  plan?: MembershipPlan; // Using our internal model
  processedAt?: Date;
  processedBy?: string;
}

// The base state interface remains mostly the same but with added fields
export interface MembershipState {
  // Core membership data
  messId: string | null; // ID of the mess the member belongs to
  membershipContext: {
    currentMembership: MembershipDetails | null;
    lastExpiredMembership: MembershipDetails | null;
  } | null;
  membershipExpiry: Date | null; // When current membership expires
  // membershipPeriod: number | null; // Duration of current membership
  points: number; // Current point balance

  // Renewal-specific state
  renewalRequest: RenewalRequest | null; // Current renewal request if any
  availablePlans: MembershipPlan[]; // List of available plans
  selectedPlanId: string | null; // Currently selected plan
  pointsCalculation: PointsCalculation | null; // Points usage calculation

  // UI state
  isLoading: boolean; // Loading state indicator
  error: MembershipError | null; // Current error state
  initialized: boolean;

  // Cleanup function for subscriptions
  cleanup?: () => void;
}

// Let's organize our actions into logical groups
export interface MembershipDataActions {
  loadMembershipData: () => Promise<void>;
  // getMembershipPeriod: () => Promise<void>;
  getMembershipExpiry: () => Promise<void>;
  getPoints: () => Promise<void>;
}

export interface MembershipPlanActions {
  getAvailablePlans: () => Promise<void>;
  selectPlan: (planId: string) => Promise<void>;
  calculatePointsBenefit: (points: number) => Promise<void>;
}

export interface RenewalActions {
  validateRenewalEligibility: () => Promise<{
    isEligible: boolean;
    reason?: string;
    code?: string;
  }>;
  sendRequestToRenewMembership: (startDate: Date) => Promise<void>;
  clearRenewalRequest: () => Promise<void>;
  checkExistingRequest: () => Promise<void>;
}

// Combine all action groups
export interface MembershipActions {
  loadMembershipData: () => Promise<void>;
  selectPlan: (planId: string) => Promise<void>;
  validateRenewalEligibility: () => Promise<{
    isEligible: boolean;
    reason?: string;
    code?: string;
  }>;
  sendRequestToRenewMembership: (startDate: Date) => Promise<void>;
  clearRenewalRequest: () => Promise<void>;
  isMembershipExpired: () => boolean;
}

// Helper type for validation results
export type ValidationResult = {
  isValid: boolean;
  error?: MembershipError;
};

// Helper type for points transactions
export type PointsTransaction = {
  id: string;
  amount: number;
  type: 'EARNED' | 'USED';
  reason: string;
  timestamp: Date;
  referenceId?: string;
  referenceType?: 'RENEWAL' | 'ABSENCE' | 'CLOSURE' | 'ADMIN';
};

export type MembershipStatus = 'active' | 'expired' | 'cancelled';

export interface MembershipDetails {
  id: string;
  status: MembershipStatus;
  startDate: Date;
  expiryDate: Date;
  points: number;
  messId: string;
  memberId: string;
}

// Input parameters for create_renewal_request procedure
export interface CreateRenewalRequestParams {
  userId: string;
  messId: string;
  planId: string;
  requestedStartDate: Date;
  pointsToUse: number;
}

// Extended RenewalRequest type that includes procedure results
export interface RenewalRequestWithBenefits extends RenewalRequest {
  pointsBenefit: {
    usablePoints: number;
    extraDays: number;
    remainingPoints: number;
  };
  finalPrice: number;
}

// Points calculation from stored procedure
export interface PointsBenefitResult {
  usable_points: number;
  extra_days: number;
  remaining_points: number;
}

// Our internal model
export interface PointsCalculation {
  usedPoints: number;
  extraDays: number;
  remainingPoints: number;
}

// Procedure result type
export interface RenewalRequestProcedureResult {
  request_id: string;
  points_benefit: PointsBenefitResult;
  final_price: number;
}
