// src/store/memberStores/homeStore.ts
import { create } from 'zustand';

import { useAbsenceStore } from './absenceStore';
import { useMealStore } from './mealStore';
import { useMembershipStore } from './membershipStore';

// Type representing all the data loading states
interface LoadingStates {
  isMembershipLoading: boolean;
  isMealsLoading: boolean;
  isAbsencesLoading: boolean;
  isLoading: boolean; // Combined loading state
}

// Type representing all error states
interface ErrorStates {
  membershipError: string | null;
  mealsError: string | null;
  absencesError: string | null;
  error: string | null; // Combined error state
}

// Create a separate store for loading state
interface HomeLoadingState {
  isInitialLoading: boolean;
  setInitialLoading: (loading: boolean) => void;
}

const useHomeLoadingStore = create<HomeLoadingState>(set => ({
  isInitialLoading: false,
  setInitialLoading: loading => set({ isInitialLoading: loading }),
}));

export const useHomeStore = () => {
  // Initialize individual stores
  const membership = useMembershipStore();
  const meals = useMealStore();
  const absences = useAbsenceStore();
  const { isInitialLoading, setInitialLoading } = useHomeLoadingStore();

  // Load all initial data with proper error handling
  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([
        membership.loadMembershipData(),
        meals.loadMealData(),
        absences.loadAbsenceData(),
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Compute combined loading and error states
  const loadingStates: LoadingStates = {
    isMembershipLoading: membership.isLoading,
    isMealsLoading: meals.isLoading,
    isAbsencesLoading: absences.isLoading,
    isLoading: membership.isLoading || meals.isLoading || absences.isLoading,
  };

  const errorStates: ErrorStates = {
    membershipError: membership.error,
    mealsError: meals.error,
    absencesError: absences.error,
    error: membership.error || meals.error || absences.error,
  };

  return {
    // Membership-related properties and actions
    membershipExpiry: membership.membershipExpiry,
    membershipPeriod: membership.membershipPeriod,
    points: membership.points,
    renewalRequest: membership.renewalRequest,
    isMembershipExpired: membership.isMembershipExpired,
    sendRequestToRenewMembership: membership.sendRequestToRenewMembership,
    validateRenewalEligibility: membership.validateRenewalEligibility,
    clearRenewalRequest: membership.clearRenewalRequest,

    // Meal-related properties and actions
    todaysMeals: meals.todaysMeals,
    rateableMeals: meals.rateableMeals,
    rateMeal: meals.rateMeal,
    updateTodaysMeals: meals.updateTodaysMeals,
    updateRateableMeals: meals.updateRateableMeals,

    // Absence-related properties and actions
    plannedAbsences: absences.plannedAbsences,
    setPlannedAbsences: absences.setPlannedAbsences,
    deletePlannedAbsence: absences.deletePlannedAbsence,

    // Combined states
    ...loadingStates,
    ...errorStates,

    // Combined actions
    loadInitialData,
  };
};
