import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Create storage instance
const storage = new MMKV({
  id: 'home-storage',
});

// Create Zustand storage adapter for MMKV
const zustandStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

// Types

interface HomeState {
  // Membership component
  membershipExpiry: Date | null;
  membershipPeriod: number | null;

  // Points component
  points: number;

  // Today's Menu component
  todaysMeals: MealDetails[];

  // Rate the meal component
  rateableMeals: RateableMeal[];

  // Absences
  plannedAbsences: AbsencePlan[];

  isLoading: boolean;
  error: string | null;

  // Membership Renewal
  renewalRequest: RenewalRequest | null;

  // Derived state
  isMembershipExpired: boolean;

  // Actions
  loadInitialData: () => Promise<void>;
  getMembershipPeriod: () => Promise<void>;
  updateMembershipExpiry: () => void;
  updatePoints: () => void;
  updateTodaysMeals: () => void;
  updateRateableMeals: () => void;
  getPlannedAbsences: () => void;
  setPlannedAbsences: (newAbsences: AbsencePlan[]) => void;
  deletePlannedAbsence: (absenceId: string) => Promise<void>;
  setRenewalRequest: () => void;

  // New actions for renewal
  // setSelectedRenewalDate: (date: Date) => void;
  // renewMembership: () => Promise<void>;
  // clearRenewalError: () => void;
  sendRequestToRenewMembership: (renewalDate: Date) => void;

  //todo action for rating a meal
}

// Helper function to check if a date is expired
const isDateExpired = (date: Date | null): boolean => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const expiryDate = new Date(date);
  expiryDate.setHours(0, 0, 0, 0);
  return expiryDate < today;
};

// Create store with persistence
//todo I don't want this to persist as user should get latest updates from database
export const useHomeStore = create<HomeState>()((set, get) => ({
  // Initial state
  membershipExpiry: null,
  membershipPeriod: null,

  points: 0,
  todaysMeals: [],
  rateableMeals: [],
  plannedAbsences: [],
  isLoading: false,
  error: null,

  // Membership Renewal
  renewalRequest: null,

  // Computed property for membership expiration status
  get isMembershipExpired() {
    return isDateExpired(get().membershipExpiry);
  },

  // Actions

  // Load all initial data
  loadInitialData: async () => {
    try {
      set({ isLoading: true, error: null });

      // Execute all updates concurrently for better performance
      await Promise.all([
        get().getMembershipPeriod(),
        get().updateMembershipExpiry(),
        get().updatePoints(),
        get().updateTodaysMeals(),
        get().updateRateableMeals(),
        get().getPlannedAbsences(),
        get().setRenewalRequest(),
      ]);

      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false,
      });
    }
  },

  getMembershipPeriod: async () => {
    try {
      //todo fetch membership period from database

      // inserting dummy value for now
      set({ membershipPeriod: 30 });
    } catch (error) {}
  },

  updateMembershipExpiry: async () => {
    try {
      //todo fetch member expiry date from database
      // const date = await membershipService.getExpiryDate();
      // set({ membershipExpiry: date })

      // inserting dummy values for now
      const someDate: Date = new Date('2025-01-30');
      set({ membershipExpiry: someDate });
    } catch (error) {
      console.error('Failed to update membership expiry:', error);
      throw error;
    }
  },
  updatePoints: async () => {
    try {
      //todo fetch member points from database
      // const points = await membershipService.getPoints();
      // set({ points })

      // inserting dummy values for now
      set({ points: 69 });
    } catch (error) {
      console.error('Failed to update points:', error);
      throw error;
    }
  },
  updateTodaysMeals: async () => {
    try {
      //todo fetch today's meals from database
      // set({ todaysMeals: meals })

      // inserting dummy values for now
      const somedaysMeals: MealDetails[] = [
        {
          id: 'meal-001',
          type: 'lunch',
          items: ['Chicken Biryani', 'Raita', 'Salad'],
          timing: {
            start: '12:00 PM',
            end: '2:00 PM',
          },
          isActive: true,
        },
        {
          id: 'meal-002',
          type: 'dinner',
          items: ['Paneer Butter Masala', 'Naan', 'Gulab Jamun'],
          timing: {
            start: '7:00 PM',
            end: '9:00 PM',
          },
          isActive: true,
        },
      ];

      set({ todaysMeals: somedaysMeals });
    } catch (error) {
      console.error('Failed to update meal details:', error);
      throw error;
    }
  },
  updateRateableMeals: async () => {
    try {
      //todo fetch recent meals to be rated from database
      // set({ rateableMeals: meals })

      // inserting dummy values for now
      const someRateableMeals: RateableMeal[] = [
        {
          id: 'meal-001',
          type: 'lunch',
          time: '12:00 PM',
          hasRated: false,
        },
        {
          id: 'meal-002',
          type: 'dinner',
          time: '7:00 PM',
          hasRated: true,
        },
      ];

      set({ rateableMeals: someRateableMeals });
    } catch (error) {
      console.error('Failed to update meals:', error);
      throw error;
    }
  },
  getPlannedAbsences: async () => {
    //todo fetch user planned abasences from database
    // set({ plannedAbsences: plans })

    // inserting dummy values for now
    const absencePlans: AbsencePlan[] = [
      {
        id: 'absence-1',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-05'),
        startMeal: 'lunch',
        endMeal: 'dinner',
      },
      {
        id: 'absence-2',
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-03-12'),
        startMeal: 'dinner',
        endMeal: 'lunch',
      },
      {
        id: 'absence-3',
        startDate: new Date('2025-04-15'),
        endDate: new Date('2025-04-20'),
        startMeal: 'lunch',
        endMeal: 'lunch',
      },
      {
        id: 'absence-4',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-03'),
        startMeal: 'dinner',
        endMeal: 'dinner',
      },
    ];

    set({ plannedAbsences: absencePlans });
  },
  setPlannedAbsences: async (newAbsences: AbsencePlan[]) => {
    try {
      //todo update user planned abasences from database
      const plannedAbsences = get().plannedAbsences;
      const updatedPlannedAbsences = [...plannedAbsences, ...newAbsences];
      set({ plannedAbsences: updatedPlannedAbsences });
    } catch (error) {
      console.error('Failed to update planned absence:', error);
      throw error;
    }
  },
  deletePlannedAbsence: async (absenceId: string) => {
    try {
      //todo delete absence from database
      const currentAbsences = get().plannedAbsences;
      const updatedAbsences = currentAbsences.filter(
        absence => absence.id !== absenceId,
      );
      set({ plannedAbsences: updatedAbsences });
    } catch (error) {
      console.error('Failed to delete planned absence:', error);
      throw error;
    }
  },
  // setSelectedRenewalDate: (date: Date) => {
  //   // Validate the date is not in the past
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   if (date < today) {
  //     set({ renewalError: 'Renewal date cannot be in the past' });
  //     return;
  //   }

  //   set({ selectedRenewalDate: date, renewalError: null });
  // },

  sendRequestToRenewMembership: async (renewalDate: Date) => {
    try {
      // send request to the admin for membership
      console.log('sent request to admin to renew the membership');
      // you will get a response of type RenewalRequest, then update the renewalRequest property
    } catch (error) {
      console.error(
        'Failed to send request to admin to renew the membership:',
        error,
      );
      throw error;
    }
  },
  setRenewalRequest: () => {
    try {
      //fetch renewal request from backend

      // for now we are using dummy data
      const dummyRenewalRequest: RenewalRequest = {
        id: 'someid',
        result: 'pending',
        message: 'wait man, give me some time',
      };
      set({ renewalRequest: dummyRenewalRequest });
    } catch (error) {}
  },
}));
