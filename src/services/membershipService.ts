// src/services/membershipService.ts
import { supabase } from '@/src/lib/supabase';
import { errorManager } from '@/src/services/errors';
import { eventManager, StoreEvent } from '@/src/services/events';
// Import types properly using 'import type'
import type {
  DatabaseMembership,
  DatabaseMembershipRequest,
  DatabaseMembershipPlan,
} from '@/src/types/database';
import type {
  MembershipDetails,
  MembershipPlan,
  RenewalRequest,
  PointsCalculation,
  PointsTransaction,
  // MembershipPlanViewModel,
  RenewalRequestProcedureResult,
  CreateRenewalRequestParams,
  RenewalRequestWithBenefits,
  // transformMembershipPlan,
  PointsBenefitResult,
} from '@/src/types/member/membership';

// import { ErrorType } from '@/src/services/errors/types';

interface GetCurrentRequestOptions {
  memberId: string;
  messId: string;
  includeExpired?: boolean;
  timeout?: number;
}

interface SubscriptionPayload {
  id: string;
  requested_start_date: string;
  created_at: string;
  status: string;
  points_to_use: number | null;
  points_days_added: number | null;
  processed_at: string | null;
  processed_by: string | null;
  membership_plans?: DatabaseMembershipPlan;
}

/**
 * MembershipService handles all interactions with the membership-related
 * data in our application. It serves as the single source of truth for
 * membership operations and ensures data consistency.
 */
export class MembershipService {
  // Constants for retry logic
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // milliseconds
  private static readonly MAX_POINTS_PER_REQUEST = 500;

  /**
   * Helper function to implement retry logic for database operations.
   * This provides consistent retry behavior across all service methods.
   */
  private static async withRetry<T>(
    operation: () => Promise<T>,
    context: {
      // Added context for better error handling
      operationType: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Log retry attempts
        console.warn(`Retry attempt ${attempt + 1}/${this.MAX_RETRIES}`, {
          operationType: context.operationType,
          entityId: context.entityId,
          error: lastError.message,
        });

        if (attempt < this.MAX_RETRIES - 1) {
          await new Promise(resolve =>
            setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, attempt)),
          );
        }
      }
    }

    // Process the error through our error manager
    const appError = errorManager.processError({
      ...lastError,
      context: {
        operationType: context.operationType,
        entityId: context.entityId,
        ...context.metadata,
      },
    });

    // Emit error event
    await eventManager.emit(StoreEvent.MEMBERSHIP_ERROR, { error: appError });

    throw appError;
  }

  /**
   * Gets comprehensive membership context including both active and expired memberships.
   * This is typically called when initializing the membership store.
   */
  static async getMembershipContext(memberId: string): Promise<{
    currentMembership: MembershipDetails | null;
    lastExpiredMembership: MembershipDetails | null;
  }> {
    return this.withRetry(
      async () => {
        const { data, error } = await supabase
          .from('memberships')
          .select(
            `
          id,
          member_id,
          mess_id,
          start_date,
          expiry_date,
          points,
          status
        `,
          )
          .eq('member_id', memberId)
          .in('status', ['active', 'expired'])
          .order('status', { ascending: true }) // 'active' comes before 'expired'
          .order('expiry_date', { ascending: false })
          .limit(2); // We only need at most 2 records

        if (error) throw error;

        // Process results
        const activeMembership = data?.find(m => m.status === 'active');
        const expiredMembership = data?.find(m => m.status === 'expired');

        const result = {
          currentMembership: this.transformMembership(activeMembership),
          lastExpiredMembership: this.transformMembership(expiredMembership),
        };

        return result;
      },
      {
        operationType: 'GET_MEMBERSHIP_CONTEXT',
        entityId: memberId,
      },
    );
  }

  private static transformMembership(
    data: DatabaseMembership | null | undefined,
  ): MembershipDetails | null {
    if (!data) return null;

    // Validate required fields
    if (!this.isValidMembershipData(data)) {
      console.warn('Invalid membership data structure:', data);
      return null;
    }

    return {
      id: data.id,
      memberId: data.member_id,
      messId: data.mess_id,
      startDate: new Date(data.start_date),
      expiryDate: new Date(data.expiry_date),
      points: data.points ?? 0, // Provide default for null points
      status: data.status,
    };
  }

  private static isValidMembershipData(data: any): data is DatabaseMembership {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.id === 'string' &&
      typeof data.member_id === 'string' &&
      typeof data.mess_id === 'string' &&
      typeof data.start_date === 'string' &&
      typeof data.expiry_date === 'string' &&
      (typeof data.points === 'number' || data.points === null) &&
      ['active', 'expired', 'cancelled'].includes(data.status)
    );
  }

  /**
   * Retrieves points transaction history for a membership with pagination support.
   * This helps members track how they earned and used their points.
   */
  static async getPointsHistory(
    memberId: string,
    options: {
      page?: number;
      perPage?: number;
      transactionType?: string;
    } = {},
  ): Promise<{ transactions: PointsTransaction[]; total: number }> {
    const { page = 1, perPage = 10, transactionType } = options;

    return this.withRetry(
      async () => {
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        let query = supabase
          .from('points_transactions')
          .select('*', { count: 'exact' })
          .eq('member_id', memberId)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (transactionType) {
          query = query.eq('transaction_type', transactionType);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return {
          transactions: data.map(transaction => ({
            id: transaction.id,
            amount: transaction.points,
            type: transaction.transaction_type.startsWith('EARNED')
              ? 'EARNED'
              : 'USED',
            reason: transaction.reason,
            timestamp: new Date(transaction.created_at),
            referenceId: transaction.reference_id,
          })),
          total: count || 0,
        };
      },
      {
        operationType: 'GET_POINTS_HISTORY',
        entityId: memberId,
        metadata: { page, perPage },
      },
    );
  }

  /**
   * Validates if a member is eligible for renewal.
   * Checks multiple conditions including previous request history.
   */
  static async checkRenewalEligibility(
    memberId: string,
    messId: string,
  ): Promise<{
    isEligible: boolean;
    reason?: string;
    code?: string;
  }> {
    return this.withRetry(
      async () => {
        // Check if user has any active membership
        const { data, error } = await supabase
          .from('memberships')
          .select('id, status')
          .eq('member_id', memberId)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        // If they have an active membership, they're not eligible
        if (data) {
          return {
            isEligible: false,
            reason: 'You already have an active membership',
            code: 'ACTIVE_MEMBERSHIP_EXISTS',
          };
        }

        // Check for pending renewal requests
        //The membership_requests table has a unique constraint defined on the combination of user_id and mess_id when the status is 'pending'. This ensures that a user cannot have multiple pending requests for the same mess.
        const { data: pendingRequest, error: requestError } = await supabase
          .from('membership_requests')
          .select('id')
          .eq('member_id', memberId)
          .eq('status', 'pending')
          .single();

        if (requestError && requestError.code !== 'PGRST116')
          throw requestError;

        if (pendingRequest) {
          return {
            isEligible: false,
            reason: 'You have a pending renewal request',
            code: 'PENDING_REQUEST_EXISTS',
          };
        }

        return { isEligible: true };
      },
      {
        operationType: 'CHECK_RENEWAL_ELIGIBILITY',
        entityId: memberId,
        metadata: { messId },
      },
    );
  }

  static subscribeToRequestUpdates(
    requestId: string,
    onUpdate: (request: RenewalRequest) => void,
  ): () => void {
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const subscription = supabase
      .channel(`renewal_request:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'membership_requests',
          filter: `id=eq.${requestId}`,
        },
        async () => {
          try {
            // Fetch fresh data after change notification
            const { data, error } = await supabase
              .from('membership_requests')
              .select(
                `
                id,
                requested_start_date,
                created_at,
                status,
                message,
                points_to_use,
                points_days_added,
                processed_at,
                processed_by,
                membership_plans (
                  id,
                  name,
                  description,
                  membership_period,
                  price,
                  mess_id,
                  is_active,
                  created_at
                )
              `,
              )
              .eq('id', requestId)
              .single();

            if (error) throw error;

            // Type guard to ensure data matches our expected shape
            if (!this.isDatabaseMembershipRequest(data)) {
              throw new Error(
                'Invalid data structure received from subscription',
              );
            }

            // Transform and notify
            const transformedRequest = this.transformRenewalRequest(data);
            onUpdate(transformedRequest);

            // Reset retry count on successful update
            retryCount = 0;
          } catch (error) {
            console.error('Error fetching updated request:', error);
            retryCount++;

            if (retryCount < MAX_RETRIES) {
              // Exponential backoff for retries
              const delay = this.RETRY_DELAY * Math.pow(2, retryCount - 1);
              setTimeout(() => {
                subscription.subscribe();
              }, delay);
            }
          }
        },
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(subscription);
    };
  }

  /**
   * Gets the current renewal request if any
   */
  static async getCurrentRequest({
    memberId,
    messId,
    includeExpired = false,
    timeout = 5000,
  }: GetCurrentRequestOptions): Promise<RenewalRequest | null> {
    return this.withRetry(
      async () => {
        // Create query with proper type annotations
        let query = supabase
          .from('membership_requests')
          .select(
            `
            id,
            member_id,
            mess_id,
            requested_start_date,
            created_at,
            status,
            message,
            points_to_use,
            points_days_added,
            processed_at,
            processed_by,
            membership_plans (
              id,
              name,
              description,
              membership_period,
              price,
              mess_id,
              is_active,
              created_at
            )
          `,
          )
          .eq('mess_id', messId)
          .eq('member_id', memberId);

        // Add status filter based on includeExpired flag
        if (!includeExpired) {
          query = query.eq('status', 'pending');
        } else {
          query = query.in('status', ['pending', 'approved', 'rejected']);
        }

        // Add ordering to ensure consistent results
        query = query.order('created_at', { ascending: false });

        // Execute query with timeout
        const { data, error } = await Promise.race([
          query.single(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout),
          ),
        ]);

        // Enhanced error handling
        if (error) {
          switch (error.code) {
            case 'PGRST116':
              return null; // No request found
            case 'PGRST109':
              throw this.createError('VALIDATION', 'Invalid ID format');
            case '23503':
              throw this.createError(
                'FOREIGN_KEY',
                'Referenced record not found',
              );
            default:
              // Log unexpected errors
              console.error('Unexpected error in getCurrentRequest:', error);
              throw this.createError(
                'UNKNOWN',
                'Failed to fetch renewal request',
              );
          }
        }

        // Validate response data
        if (!this.isDatabaseMembershipRequest(data)) {
          // Log validation failure
          console.error('Invalid data structure:', data);
          return null;
        }

        // Transform with proper error handling
        try {
          return this.transformCurrentRequest(data);
        } catch (e) {
          console.error('Transform error:', e);
          throw this.createError(
            'TRANSFORM',
            'Failed to process renewal request data',
          );
        }
      },
      {
        operationType: 'GET_CURRENT_REQUEST',
        entityId: messId,
        metadata: { memberId, includeExpired },
      },
    );
  }

  // Add helper method for creating consistent errors
  private static createError(
    type: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    return new Error(`[${type}] ${message}`);
  }

  private static transformCurrentRequest(
    data: DatabaseMembershipRequest,
  ): RenewalRequest {
    return {
      id: data.id,
      startDate: new Date(data.requested_start_date),
      requestDate: new Date(data.created_at),
      result: data.status,
      message: data.message || '',
      pointsUsed: data.points_to_use || 0,
      extraDays: data.points_days_added || 0,
      plan: data.membership_plans
        ? this.transformDatabaseToMembershipPlan(data.membership_plans)
        : undefined,
      processedAt: data.processed_at ? new Date(data.processed_at) : undefined,
      processedBy: data.processed_by || undefined,
    };
  }

  /**
   * Calculate benefits from using points
   */
  static async calculatePointsBenefit(
    points: number,
  ): Promise<PointsCalculation> {
    return this.withRetry(
      async () => {
        const { data, error } = await supabase.rpc('calculate_points_benefit', {
          p_points: points,
        });

        if (error) throw error;

        return {
          usedPoints: data.usable_points,
          extraDays: data.extra_days,
          remainingPoints: data.remaining_points,
        };
      },
      {
        operationType: 'CALCULATE_POINTS_BENEFIT',
        metadata: { points },
      },
    );
  }

  /**
   * Cancel an existing renewal request
   */
  static async cancelRequest(requestId: string): Promise<boolean> {
    return this.withRetry(
      async () => {
        const { data, error } = await supabase
          .from('membership_requests')
          .update({ status: 'cancelled' })
          .eq('id', requestId)
          .eq('status', 'pending')
          .single();

        if (error) throw error;

      // If no rows were affected, return false (e.g., request already cancelled)
      return !!data;
      },
      {
        operationType: 'CANCEL_REQUEST',
        entityId: requestId,
      },
    );
  }
  

  /**
   * Gets a single membership plan by ID.
   * This is a type-safe way to fetch a single plan.
   */
  static async getMembershipPlan(
    planId: string,
  ): Promise<MembershipPlan | null> {
    return this.withRetry(
      async () => {
        const { data, error } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('id', planId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null; // Not found
          throw error;
        }

        if (!this.isDatabaseMembershipPlan(data)) {
          return null;
        }

        return this.transformMembershipPlan(data);
      },
      {
        operationType: 'GET_MEMBERSHIP_PLAN',
        entityId: planId,
      },
    );
  }

  /**
   * Type guard for database membership plan
   */
  private static isDatabaseMembershipPlan(
    obj: unknown,
  ): obj is DatabaseMembershipPlan {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'id' in obj &&
      'mess_id' in obj &&
      'name' in obj &&
      'membership_period' in obj &&
      'price' in obj &&
      'is_active' in obj
    );
  }

  /**
   * Type guard for database membership request
   */
  private static isDatabaseMembershipRequest(
    obj: unknown,
  ): obj is DatabaseMembershipRequest {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'id' in obj &&
      'member_id' in obj &&
      'mess_id' in obj &&
      'requested_start_date' in obj &&
      'status' in obj
    );
  }

  /**
   * Transforms a membership plan from database format to application format.
   */
  private static transformMembershipPlan(
    dbPlan: DatabaseMembershipPlan,
  ): MembershipPlan {
    return {
      id: dbPlan.id,
      name: dbPlan.name,
      description: dbPlan.description || '',
      membership_period: Number(dbPlan.membership_period),
      price: Number(dbPlan.price),
      mess_id: dbPlan.mess_id,
      is_active: dbPlan.is_active,
    };
  }

  /**
   * Transforms a database renewal request to application format
   */
  private static transformRenewalRequest(
    dbRequest: DatabaseMembershipRequest,
  ): RenewalRequest {
    return {
      id: dbRequest.id,
      startDate: new Date(dbRequest.requested_start_date),
      requestDate: new Date(dbRequest.created_at),
      result: dbRequest.status,
      message: dbRequest.message || '',
      pointsUsed: dbRequest.points_to_use || 0,
      extraDays: dbRequest.points_days_added || 0,
      plan: dbRequest.membership_plans
        ? this.transformMembershipPlan(dbRequest.membership_plans)
        : undefined,
      processedAt: dbRequest.processed_at
        ? new Date(dbRequest.processed_at)
        : undefined,
      processedBy: dbRequest.processed_by || undefined,
    };
  }

  /**
   * Handles Supabase response for membership plans
   */
  private static handlePlanResponse(data: unknown): DatabaseMembershipPlan[] {
    if (!Array.isArray(data)) {
      return this.isDatabaseMembershipPlan(data) ? [data] : [];
    }
    return data.filter((item): item is DatabaseMembershipPlan =>
      this.isDatabaseMembershipPlan(item),
    );
  }

  private static transformDatabaseToMembershipPlan(
    dbPlan: DatabaseMembershipPlan,
  ): MembershipPlan {
    return {
      id: dbPlan.id,
      name: dbPlan.name,
      description: dbPlan.description || '',
      membership_period: Number(dbPlan.membership_period),
      price:
        typeof dbPlan.price === 'string' ? Number(dbPlan.price) : dbPlan.price,
      mess_id: dbPlan.mess_id,
      is_active: dbPlan.is_active,
    };
  }

  static async getAvailablePlans(messId: string): Promise<MembershipPlan[]> {
    return this.withRetry(
      async () => {
        const { data, error } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('mess_id', messId)
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;

        // Transform database response to our app model
        const plans = this.handlePlanResponse(data);
        return plans.map(this.transformDatabaseToMembershipPlan);
        // .map(this.transformMembershipPlanToViewModel);
      },
      {
        operationType: 'GET_AVAILABLE_PLANS',
        entityId: messId,
      },
    );
  }

  /**
   * Creates a renewal request using the database procedure.
   * This method ensures type safety and proper error handling.
   */
  static async createRenewalRequest(
    params: CreateRenewalRequestParams,
  ): Promise<RenewalRequestWithBenefits> {
    return this.withRetry(
      async () => {
        // First, validate that the plan exists
        const plan = await this.getMembershipPlan(params.planId);
        if (!plan) {
          throw new Error('Invalid membership plan selected');
        }

        // Call the stored procedure
        const { data: procedureResult, error: procedureError } =
          await supabase.rpc('create_renewal_request', {
            p_user_id: params.userId,
            p_mess_id: params.messId,
            p_plan_id: params.planId,
            p_requested_start_date: params.requestedStartDate
              .toISOString()
              .split('T')[0],
            p_points_to_use: params.pointsToUse,
          });

        if (procedureError) {
          if (procedureError.message.includes('Insufficient points')) {
            throw new Error("You don't have enough points for this renewal");
          }
          throw procedureError;
        }

        // Type guard for procedure result
        if (!this.isRenewalRequestProcedureResult(procedureResult)) {
          throw new Error('Invalid response from renewal request procedure');
        }

        // Fetch the created request details
        const { data: requestData, error: requestError } = await supabase
          .from('membership_requests')
          .select(
            `
          id,
          member_id,
          mess_id,
          plan_id,
          requested_start_date,
          created_at,
          status,
          message,
          points_used,
          points_days_added,
          processed_at,
          processed_by
        `,
          )
          .eq('id', procedureResult.request_id)
          .single();

        if (requestError) throw requestError;

        // Validate request data
        if (!this.isDatabaseMembershipRequest(requestData)) {
          throw new Error('Invalid membership request data received');
        }

        // Transform the request and combine with procedure results
        return {
          ...this.transformRenewalRequest(requestData),
          plan,
          pointsBenefit: {
            usablePoints: procedureResult.points_benefit.usable_points,
            extraDays: procedureResult.points_benefit.extra_days,
            remainingPoints: procedureResult.points_benefit.remaining_points,
          },
          finalPrice: procedureResult.final_price,
        };
      },
      {
        operationType: 'CREATE_RENEWAL_REQUEST',
        entityId: params.userId,
        metadata: {
          messId: params.messId,
          planId: params.planId,
        },
      },
    );
  }

  /**
   * Transforms points benefit response from the database to our application model
   */
  private static transformPointsBenefit(
    dbBenefit: PointsBenefitResult,
  ): PointsCalculation {
    return {
      usedPoints: dbBenefit.usable_points,
      extraDays: dbBenefit.extra_days,
      remainingPoints: dbBenefit.remaining_points,
    };
  }

  /**
   * Type guard for points benefit result
   */
  private static isPointsBenefitResult(
    obj: unknown,
  ): obj is PointsBenefitResult {
    const typedData = obj as Partial<PointsBenefitResult>;
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof typedData.usable_points === 'number' &&
      typeof typedData.extra_days === 'number' &&
      typeof typedData.remaining_points === 'number'
    );
  }

  /**
   * Type guard for renewal request procedure result
   */
  private static isRenewalRequestProcedureResult(
    data: unknown,
  ): data is RenewalRequestProcedureResult {
    const typedData = data as Partial<RenewalRequestProcedureResult>;
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof typedData.request_id === 'string' &&
      this.isPointsBenefitResult(typedData.points_benefit) &&
      typeof typedData.final_price === 'number'
    );
  }
}
