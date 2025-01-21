export interface MealDetails {
  id: string;
  type: 'lunch' | 'dinner';
  items: string[];
  timing: {
    start: string;
    end: string;
  };
  isActive: boolean;
}

export interface RateableMeal {
  id: string;
  type: 'lunch' | 'dinner';
  time: string;
  hasRated: boolean;
}

export interface AbsencePlan {
  id: string;
  startDate: Date;
  endDate: Date;
  meals: ('lunch' | 'dinner')[];
}
