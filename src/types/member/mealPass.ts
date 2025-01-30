/**
 * Enum representing different reasons why a meal pass might be ineligible
 */
export enum MealPassIneligibilityReason {
  PLANNED_ABSENCE = 'planned_absence',
  HOLIDAY = 'holiday',
  REGULAR_OFF = 'regular_off',
  NOT_YET_AVAILABLE = 'not_yet_available',
}

/**
 * Interface for the message to display for each ineligibility reason
 */
export const ineligibilityMessages: Record<
  MealPassIneligibilityReason,
  string
> = {
  [MealPassIneligibilityReason.PLANNED_ABSENCE]:
    'You have planned absence for this meal',
  [MealPassIneligibilityReason.HOLIDAY]: 'Mess is closed for holiday',
  [MealPassIneligibilityReason.REGULAR_OFF]: 'Regular off',
  [MealPassIneligibilityReason.NOT_YET_AVAILABLE]:
    'Meal pass will be available 30 minutes before meal time',
};

/**
 * Interface representing a meal pass
 */
export interface MealPass {
  id: string;
  date: string;
  mealType: MealType;
  memberName: string;
  messName: string;
  validFrom: string;
  validUntil: string;
  is_eligible: boolean;
  reason?: MealPassIneligibilityReason;
}

/**
 * Props for the MealPassModal component
 */
export interface MealPassModalProps {
  pass: MealPass;
  visible: boolean;
  onDismiss: () => void;
}
