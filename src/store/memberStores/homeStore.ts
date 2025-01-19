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
interface MealDetails {
  id: string;
  type: 'lunch' | 'dinner';
  items: string[];
  timing: {
    start: string;
    end: string;
  };
  isActive: boolean;
}

interface RateableMeal {
  id: string;
  type: 'lunch' | 'dinner';
  time: string;
  hasRated: boolean;
}

interface AbsencePlan {
  id: string;
  startDate: Date;
  endDate: Date;
  meals: ('lunch' | 'dinner')[];
}

interface HomeState {
  // Membership
  membershipExpiry: Date | null;
  points: number;

  // Meals
  todaysMeals: MealDetails[];
  rateableMeals: RateableMeal[];

  // Absences
  plannedAbsences: AbsencePlan[];

  isLoading: boolean;
  error: string | null;

  // Actions
  loadInitialData: () => Promise<void>;
  updateMembershipExpiry: () => void;
  updatePoints: () => void;
  updateTodaysMeals: () => void;
  updateRateableMeals: () => void;
  setPlannedAbsences: () => void;
  //todo action for registering the absence if the above action doesn't include it
  //todo action for rating a meal
}

// Create store with persistence
//todo I don't want this to persist as user should get latest updates from database
export const useHomeStore = create<HomeState>()((set, get) => ({
  // Initial state
  membershipExpiry: null,
  points: 0,
  todaysMeals: [],
  rateableMeals: [],
  plannedAbsences: [],
  isLoading: false,
  error: null,

  // Actions

  // Load all initial data
  loadInitialData: async () => {
    try {
      set({ isLoading: true, error: null });

      // Execute all updates concurrently for better performance
      await Promise.all([
        get().updateMembershipExpiry(),
        get().updatePoints(),
        get().updateTodaysMeals(),
        get().updateRateableMeals(),
        get().setPlannedAbsences(),
      ]);

      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false,
      });
    }
  },

  updateMembershipExpiry: async () => {
    try {
      //todo fetch member expiry date from database
      // const date = await membershipService.getExpiryDate();
      // set({ membershipExpiry: date })

      // inserting dummy values for now
      const someDate: Date = new Date('2025-01-19');
      set({ membershipExpiry: someDate });
    } catch (error) {
      console.error('Failed to update membership expiry:', error);
      throw error;
    }
  },
  updatePoints: async () => {
    try {
      //todo fetch member member from database
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
      //todo fetch today's meals from database
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
  setPlannedAbsences: async () => {
    try {
      //todo fetch today's meals from database
      // set({ plannedAbsences: plans })

      // inserting dummy values for now
      const absencePlans: AbsencePlan[] = [
        {
          id: 'absence-001',
          startDate: new Date('2025-02-01T00:00:00Z'),
          endDate: new Date('2025-02-05T00:00:00Z'),
          meals: ['lunch', 'dinner'],
        },
        {
          id: 'absence-002',
          startDate: new Date('2025-03-10T00:00:00Z'),
          endDate: new Date('2025-03-12T00:00:00Z'),
          meals: ['lunch'],
        },
        {
          id: 'absence-003',
          startDate: new Date('2025-04-15T00:00:00Z'),
          endDate: new Date('2025-04-18T00:00:00Z'),
          meals: ['dinner'],
        },
        {
          id: 'absence-004',
          startDate: new Date('2025-05-20T00:00:00Z'),
          endDate: new Date('2025-05-22T00:00:00Z'),
          meals: ['lunch', 'dinner'],
        },
      ];

      set({ plannedAbsences: absencePlans });
    } catch (error) {
      console.error('Failed to update planned absence:', error);
      throw error;
    }
  },
}));
