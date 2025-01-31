/**
 * Interface representing a single mess closure
 * Maps directly to the database table structure
 */
export interface MessClosure {
  date: Date; // The date of the closure
  meal_type: MealType; // Which meal is affected
  closure_reason: string; // Why the mess is closed
}

/**
 * The shape of data returned from the Supabase function
 * Note: We keep the field names as they come from the database
 * for consistency and to avoid unnecessary transformations
 */
export type GetUpcomingClosuresResponse = MessClosure[];

/**
 * Props for the closure item component
 * We use this interface for the individual items in the list
 */
export interface ClosureItemProps {
  date: Date;
  mealType: MealType;
  reason: string;
}

/**
 * Additional properties to be added to the homeStore state
 * Following the pattern of other data in the store
 */
export interface MessClosuresState {
  upcomingClosures: MessClosure[];
  isClosuresLoading: boolean;
  closuresError: string | null;
}
