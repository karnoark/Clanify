// src/store/memberStores/mealStore.ts
import { create } from 'zustand';

import type {
  MealState,
  MealActions,
  MealDetails,
  RateableMeal,
} from '@/src/types/member/meal';

export const useMealStore = create<MealState & MealActions>()((set, get) => ({
  // Initial state
  todaysMeals: [],
  rateableMeals: [],
  isLoading: false,
  error: null,

  // Data loading actions
  loadMealData: async () => {
    try {
      set({ isLoading: true, error: null });

      // Load both meal lists concurrently
      await Promise.all([
        get().updateTodaysMeals(),
        get().updateRateableMeals(),
      ]);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load meal data',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTodaysMeals: async () => {
    try {
      // TODO: Replace with actual API call
      // const meals = await api.getTodaysMeals();

      const meals: MealDetails[] = [
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

      set({ todaysMeals: meals });
    } catch (error) {
      throw error;
    }
  },

  updateRateableMeals: async () => {
    try {
      // TODO: Replace with actual API call
      // const meals = await api.getRateableMeals();

      const meals: RateableMeal[] = [
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

      set({ rateableMeals: meals });
    } catch (error) {
      throw error;
    }
  },

  rateMeal: async (mealId: string, rating: number) => {
    try {
      set({ isLoading: true, error: null });

      // TODO: Replace with actual API call
      // await api.submitMealRating(mealId, rating);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update the local state to reflect the rating
      set(state => ({
        rateableMeals: state.rateableMeals.map(meal =>
          meal.id === mealId ? { ...meal, hasRated: true } : meal,
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to submit meal rating',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
