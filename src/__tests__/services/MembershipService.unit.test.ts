import { supabase } from '@/src/lib/supabase';
import { MembershipService } from '@/src/services/membershipService';


// Mock Supabase client
jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

describe('MembershipService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMembershipContext', () => {
    it('should transform valid membership data correctly', async () => {
      // Mock database response
      const mockMembership = {
        id: 'test-id',
        member_id: 'user-123',
        mess_id: 'mess-123',
        start_date: '2024-02-01',
        expiry_date: '2024-03-01',
        points: 100,
        status: 'active',
      };

      // Set up mock response
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [mockMembership],
          error: null,
        }),
      });

      // Call service method
      const result = await MembershipService.getMembershipContext('user-123');

      // Verify data transformation
      expect(result.currentMembership).toEqual({
        id: mockMembership.id,
        memberId: mockMembership.member_id,
        messId: mockMembership.mess_id,
        startDate: new Date(mockMembership.start_date),
        expiryDate: new Date(mockMembership.expiry_date),
        points: mockMembership.points,
        status: mockMembership.status,
      });
    });

    it('should handle invalid membership data gracefully', async () => {
      // Mock invalid database response
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [{ id: 'test-id' }], // Missing required fields
          error: null,
        }),
      });

      const result = await MembershipService.getMembershipContext('user-123');
      expect(result.currentMembership).toBeNull();
    });

    it('should handle database errors with retry logic', async () => {
      let attempts = 0;
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockImplementation(() => {
          attempts++;
          if (attempts < 3) {
            return Promise.reject(new Error('Database error'));
          }
          return Promise.resolve({ data: [], error: null });
        }),
      });

      await MembershipService.getMembershipContext('user-123');
      expect(attempts).toBe(3); // Verify retry behavior
    });
  });
  describe('getPointsHistory', () => {
    const mockTransactions = [
      {
        id: 'tx1',
        points: 100,
        transaction_type: 'EARNED_ABSENCE',
        reason: 'Planned absence',
        created_at: '2024-02-01T10:00:00Z',
        reference_id: 'ref1',
      },
    ];
  
    it('should retrieve points history with pagination', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockTransactions,
          count: 1,
          error: null,
        }),
      });
  
      const result = await MembershipService.getPointsHistory('user123', {
        page: 1,
        perPage: 10,
      });
  
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0]).toEqual({
        id: 'tx1',
        amount: 100,
        type: 'EARNED',
        reason: 'Planned absence',
        timestamp: new Date('2024-02-01T10:00:00Z'),
        referenceId: 'ref1',
      });
    });
  
    it('should handle database errors with retry logic', async () => {
      let attempts = 0;
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockImplementation(() => {
          attempts++;
          if (attempts < 3) {
            return Promise.reject(new Error('Database error'));
          }
          return Promise.resolve({ data: [], count: 0, error: null });
        }),
      });
  
      await MembershipService.getPointsHistory('user123');
      expect(attempts).toBe(3);
    });
  });
  
  describe('checkRenewalEligibility', () => {
    it('should return false when user has active membership', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'membership1', status: 'active' },
          error: null,
        }),
      });
  
      const result = await MembershipService.checkRenewalEligibility(
        'user123',
        'mess123'
      );
  
      expect(result.isEligible).toBe(false);
      expect(result.code).toBe('ACTIVE_MEMBERSHIP_EXISTS');
    });
  
    it('should return false when user has pending request', async () => {
      // Mock no active membership
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        })
        // Mock pending request exists
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'request1' },
            error: null,
          }),
        });
  
      const result = await MembershipService.checkRenewalEligibility(
        'user123',
        'mess123'
      );
  
      expect(result.isEligible).toBe(false);
      expect(result.code).toBe('PENDING_REQUEST_EXISTS');
    });
  
    it('should return true when user is eligible', async () => {
      // Mock no active membership
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        })
        // Mock no pending request
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        });
  
      const result = await MembershipService.checkRenewalEligibility(
        'user123',
        'mess123'
      );
  
      expect(result.isEligible).toBe(true);
    });
  });
  
  describe('subscribeToRequestUpdates', () => {
    it('should set up subscription and handle updates', () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };
  
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
  
      const onUpdate = jest.fn();
      const cleanup = MembershipService.subscribeToRequestUpdates(
        'request123',
        onUpdate
      );
  
      expect(supabase.channel).toHaveBeenCalledWith('renewal_request:request123');
      expect(mockChannel.on).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();
  
      // Test cleanup
      cleanup();
      expect(supabase.removeChannel).toHaveBeenCalled();
    });
  });
  
  describe('getCurrentRequest', () => {
    const mockRequest = {
      id: 'request1',
      member_id: 'user123',
      mess_id: 'mess123',
      requested_start_date: '2024-02-01',
      created_at: '2024-01-31',
      status: 'pending',
      message: null,
      points_to_use: 100,
      points_days_added: 1,
      processed_at: null,
      processed_by: null,
      membership_plans: {
        id: 'plan1',
        name: 'Basic',
        description: 'Basic plan',
        membership_period: 30,
        price: 1000,
        mess_id: 'mess123',
        is_active: true,
      },
    };
  
    it('should retrieve current request with plan details', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockRequest,
          error: null,
        }),
      });
  
      const result = await MembershipService.getCurrentRequest({
        memberId: 'user123',
        messId: 'mess123',
      });
  
      expect(result).toMatchObject({
        id: 'request1',
        startDate: new Date('2024-02-01'),
        requestDate: new Date('2024-01-31'),
        result: 'pending',
        pointsUsed: 100,
        extraDays: 1,
      });
      expect(result?.plan).toBeDefined();
    });
  
    it('should return null for non-existent request', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      });
  
      const result = await MembershipService.getCurrentRequest({
        memberId: 'user123',
        messId: 'mess123',
      });
  
      expect(result).toBeNull();
    });
  });
  
  describe('calculatePointsBenefit', () => {
    it('should calculate benefits from points correctly', async () => {
      const mockBenefit = {
        usable_points: 100,
        extra_days: 1,
        remaining_points: 0,
      };
  
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockBenefit,
        error: null,
      });
  
      const result = await MembershipService.calculatePointsBenefit(100);
  
      expect(result).toEqual({
        usedPoints: 100,
        extraDays: 1,
        remainingPoints: 0,
      });
      expect(supabase.rpc).toHaveBeenCalledWith('calculate_points_benefit', {
        p_points: 100,
      });
    });
  });

  describe('cancelRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should cancel an existing request', async () => {
      // Mock the chain properly with mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: { id: 'request123', status: 'cancelled' },
        error: null 
      });
      const mockEq = jest.fn().mockReturnThis();
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      
      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate
      });
  
      mockEq.mockReturnValue({ single: mockSingle });
  
      const result = await MembershipService.cancelRequest('request123');
  
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('membership_requests');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled' });
      expect(mockEq).toHaveBeenCalledWith('id', 'request123');
      expect(mockEq).toHaveBeenCalledWith('status', 'pending');
    });
  
    it('should throw error if request cannot be cancelled', async () => {
      const error = { message: 'Request not found or not in pending status' };
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: null,
        error 
      });
      const mockEq = jest.fn().mockReturnThis();
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      
      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate
      });
  
      mockEq.mockReturnValue({ single: mockSingle });
  
      try {
        await MembershipService.cancelRequest('request123');
        fail('Expected an error to be thrown');
      } catch (err: any) {
        expect(err).toHaveProperty('type', 'unknown');
        expect(err).toHaveProperty('message', 'An unexpected error occurred');
        expect(err.technical).toMatch(/Request not found or not in pending status/);
      }
    });
  });
  
  describe('getAvailablePlans', () => {
    const mockPlans = [
      {
        id: 'plan1',
        name: 'Basic',
        description: 'Basic plan',
        membership_period: 30,
        price: 1000,
        mess_id: 'mess123',
        is_active: true,
      },
      {
        id: 'plan2',
        name: 'Premium',
        description: 'Premium plan',
        membership_period: 90,
        price: 2500,
        mess_id: 'mess123',
        is_active: true,
      },
    ];
  
    it('should retrieve and transform available plans', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPlans,
          error: null,
        }),
      });
  
      const result = await MembershipService.getAvailablePlans('mess123');
  
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'plan1',
        name: 'Basic',
        membership_period: 30,
        price: 1000,
      });
      expect(result[1]).toMatchObject({
        id: 'plan2',
        name: 'Premium',
        membership_period: 90,
        price: 2500,
      });
    });
  
    it('should handle empty or invalid response', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });
  
      const result = await MembershipService.getAvailablePlans('mess123');
      expect(result).toEqual([]);
    });
  });
  
  describe('createRenewalRequest', () => {
    const mockPlan = {
      id: 'plan1',
      name: 'Basic',
      description: 'Basic plan',
      membership_period: 30,
      price: 1000,
      mess_id: 'mess123',
      is_active: true,
    };
  
    const mockRenewalParams = {
      userId: 'user123',
      messId: 'mess123',
      planId: 'plan1',
      requestedStartDate: new Date('2024-02-01'),
      pointsToUse: 100,
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should handle insufficient points error from database', async () => {
      // Mock plan retrieval success
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPlan,
          error: null,
        }),
      });
  
      // Mock RPC error
      const error = {
        message: 'Insufficient points. Available: 50, Requested: 100',
        details: 'points_validation_failed'
      };
  
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error
      });
  
      try {
        await MembershipService.createRenewalRequest({
          ...mockRenewalParams,
          pointsToUse: 100,
        });
        fail('Expected an error to be thrown');
      } catch (err: any) {
        expect(err).toHaveProperty('type', 'unknown');
        expect(err).toHaveProperty('message', 'An unexpected error occurred');
        expect(err.technical).toMatch(/You don't have enough points for this renewal/);
      }
    });
  
    it('should handle database errors with retry logic', async () => {
      let attempts = 0;
      
      // Mock successful plan retrieval
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPlan,
          error: null,
        }),
      });
  
      // Mock RPC with retries
      (supabase.rpc as jest.Mock).mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Database connection error'));
        }
        return Promise.resolve({
          data: {
            request_id: 'request1',
            points_benefit: {
              usable_points: 100,
              extra_days: 1,
              remaining_points: 0,
            },
            final_price: 1000,
          },
          error: null,
        });
      });
  
      await MembershipService.createRenewalRequest(mockRenewalParams);
      expect(attempts).toBe(3);
    });
  
    it('should handle invalid procedure result format', async () => {
      // Mock successful plan retrieval
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPlan,
          error: null,
        }),
      });
  
      // Mock invalid procedure result
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          request_id: 'request1',
          final_price: 1000,
        },
        error: null,
      });
  
      try {
        await MembershipService.createRenewalRequest(mockRenewalParams);
        fail('Expected an error to be thrown');
      } catch (err: any) {
        expect(err).toHaveProperty('type', 'unknown');
        expect(err).toHaveProperty('message', 'An unexpected error occurred');
        expect(err.technical).toMatch(/Invalid response from renewal request procedure/);
      }
    });
  });
});
