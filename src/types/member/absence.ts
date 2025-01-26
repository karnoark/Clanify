// src/types/absence.ts
import type { BaseState } from '@/src/types/base';

import type { MealType } from './meal';

export interface AbsencePlan {
  id: string;
  startDate: Date;
  endDate: Date;
  startMeal: MealType;
  endMeal: MealType;
}

export interface AbsenceState extends BaseState {
  plannedAbsences: AbsencePlan[];
}

export interface AbsenceActions {
  loadAbsenceData: () => Promise<void>;
  getPlannedAbsences: () => Promise<void>;
  setPlannedAbsences: (newAbsences: AbsencePlan[]) => Promise<void>;
  deletePlannedAbsence: (absenceId: string) => Promise<void>;
}
