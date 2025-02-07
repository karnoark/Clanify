interface ErrorWithCode {
  code: string;
}

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    // Check for fetch network errors
    if (error instanceof TypeError && error.message.includes('network')) {
      return true;
    }

    // Check for Supabase network errors
    if (
      'code' in error &&
      [
        'PGRST301', // Connection error
        'PGRST399', // Network error
        '20137', // Network request failed
      ].includes((error as ErrorWithCode).code)
    ) {
      return true;
    }
  }
  return false;
};
