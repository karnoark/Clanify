// src/store/memberStores/homeStore.ts
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

export const useHomeStore = () => {
  // Initialize individual stores
  const membership = useMembershipStore();
  const meals = useMealStore();
  const absences = useAbsenceStore();

  // Load all initial data with proper error handling
  const loadInitialData = async () => {
    try {
      // Load data from all stores concurrently
      await Promise.all([
        membership.loadMembershipData(),
        meals.loadMealData(),
        absences.loadAbsenceData(),
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Individual stores will handle their own error states
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
