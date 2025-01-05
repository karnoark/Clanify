import { AuthError } from '@supabase/supabase-js';

// Type guard to check if an error has a message
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: string }).message === 'string'
  );
}

export function getErrorMessage(error: unknown): string {
  // Case 1: Supabase Auth Error
  if (error instanceof AuthError) {
    return 'AuthError' + error.message;
  }

  // Case 2: Error with message property
  if (isErrorWithMessage(error)) {
    return error.message;
  }

  // Case 3: String error
  if (typeof error === 'string') {
    return error;
  }

  // Default case
  return 'An unexpected error occurred';
}
