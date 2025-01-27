// src/types/meal.ts

import type { BaseState } from '@/src/types/base';

export type MealType = 'lunch' | 'dinner';

export interface MealTiming {
  start: string;
  end: string;
}

export interface MealDetails {
  id: string;
  type: MealType;
  items: string[];
  timing: MealTiming;
  isActive: boolean;
}

export interface RateableMeal {
  id: string;
  date: Date;
  type: MealType;
  hasRated: boolean;
}

export interface MealState extends BaseState {
  todaysMeals: MealDetails[];
  rateableMeals: RateableMeal[];
}

export interface MealActions {
  loadMealData: () => Promise<void>;
  updateTodaysMeals: () => Promise<void>;
  updateRateableMeals: () => Promise<void>;
  rateMeal: (mealId: string, rating: number) => Promise<void>;
}
