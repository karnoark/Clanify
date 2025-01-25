type MealType = 'lunch' | 'dinner';

interface MealDetails {
  id: string;
  type: MealType;
  items: string[];
  timing: {
    start: string;
    end: string;
  };
  isActive: boolean;
}

interface RateableMeal {
  id: string;
  type: MealType;
  time: string;
  hasRated: boolean;
}

type AbsencePlan = {
  id: string;
  startDate: Date;
  endDate: Date;
  startMeal: MealType;
  endMeal: MealType;
};

// Define possible renewal request states
type RenewalRequestResult = 'pending' | 'approved' | 'rejected';

interface RenewalRequest {
  id: string;
  result: RenewalRequestResult;
  message: string;
  requestDate: Date;
  startDate: Date;
}
