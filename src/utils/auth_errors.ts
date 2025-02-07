import { AuthApiError, AuthError } from '@supabase/supabase-js';
// import * as Sentry from '@sentry/react-native';

export interface HandleError extends Error {
  category: string;
  code: string;
  message: string;
  original: Error;
  shouldRetry: boolean;
}

export class AuthErrorHandler {
  // Define error categories for better organization and handling
  static readonly ERROR_CATEGORIES = {
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    RATE_LIMIT: 'rate_limit',
    MFA: 'mfa',
    NETWORK: 'network',
    UNEXPECTED: 'unexpected',
  } as const;

  // Comprehensive mapping of Supabase error codes to user-friendly messages
  static readonly ERROR_MESSAGES: Record<string, string> = {
    // Validation Errors
    validation_failed: 'Please check your input and try again.',
    email_exists: 'This email address is already registered.',
    phone_exists: 'This phone number is already registered.',
    weak_password: 'Password is too weak. Please use a stronger password.',
    bad_json: 'Invalid request format.',
    email_address_invalid: 'Please enter a valid email address.',

    // Authentication Errors
    invalid_credentials: 'Invalid email or password.',
    user_not_found: 'No account found with this email address.',
    session_expired: 'Your session has expired. Please sign in again.',
    session_not_found: 'Please sign in to continue.',
    user_banned: 'This account has been suspended.',
    email_not_confirmed: 'Please verify your email address before continuing.',
    phone_not_confirmed: 'Please verify your phone number before continuing.',
    provider_disabled: 'This sign-in method is currently unavailable.',
    signup_disabled: 'New registrations are currently disabled.',
    same_password: 'New password must be different from your current password.',

    // Authorization Errors
    no_authorization: "You don't have permission to perform this action.",
    insufficient_aal: 'Additional authentication required.',
    reauthentication_needed: 'Please sign in again to continue.',

    // Rate Limit Errors
    over_request_rate_limit: 'Too many attempts. Please try again later.',
    over_email_send_rate_limit:
      'Too many email requests. Please try again later.',
    over_sms_send_rate_limit: 'Too many SMS requests. Please try again later.',

    // MFA Errors
    mfa_verification_failed: 'Invalid verification code.',
    mfa_challenge_expired:
      'Verification code expired. Please request a new one.',
    mfa_factor_not_found: 'Multi-factor authentication not set up.',

    // Network Errors
    request_timeout: 'Request timed out. Please check your connection.',
    hook_timeout: 'Service temporarily unavailable. Please try again.',

    // Default Error
    default: 'Something went wrong. Please try again.',
  } as const;

  static handleError(error: Error): HandleError {
    console.error('Auth Error: ', {
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Track error in Sentry
    // if (error instanceof Error) {
    //   Sentry.captureException(error, {
    //     tags: {
    //       errorType: 'auth_error',
    //       environment: process.env.NODE_ENV
    //     }
    //   });
    // };

    // Handle Supabase API errors
    if (error instanceof AuthApiError) {
      console.log('error is instance of AuthApiError');
      const code = error.message.includes('rate limit')
        ? 'over_request_rate_limit'
        : error.message;
      return this.createErrorResponse(error.status, code, error);
    }

    // Handle network errors
    if (error instanceof Error && this.isNetworkError(error)) {
      console.log('error is instance of NetworkError');
      return {
        name: 'NetworkError',
        category: this.ERROR_CATEGORIES.NETWORK,
        code: 'network_error',
        message:
          'Network connection failed. Please check your internet connection.',
        original: error,
        shouldRetry: true,
      };
    }

    if (error instanceof AuthError) {
      console.log('error is instance of AuthError');
      const code = (error as AuthError).code ?? 'unknown';
      console.log('AuthErrorHandler:-> code: ', code);
      const message =
        this.ERROR_MESSAGES[code] ??
        error.message ??
        this.ERROR_MESSAGES.default;

      return {
        name: 'AuthenticationError',
        category: this.ERROR_CATEGORIES.AUTHENTICATION,
        code,
        message,
        original: error,
        shouldRetry: false,
      };
    }
    // Handle unexpected errors
    console.log(
      'error is instance of neither NetworkError or AuthApiError or AuthError',
    );
    return {
      name: 'UnexpectedError',
      category: this.ERROR_CATEGORIES.UNEXPECTED,
      code: 'unexpected_failure',
      message: error.message ?? this.ERROR_MESSAGES.default,
      original: error instanceof Error ? error : new Error(String(error)),
      shouldRetry: false,
    };
  }

  private static createErrorResponse(
    status: number,
    code: string,
    originalError: Error,
  ) {
    let category;
    let shouldRetry = false;
    let name: string;

    // Determine error category and retry strategy based on status code
    if (status >= 400 && status < 500) {
      if (status === 429) {
        category = this.ERROR_CATEGORIES.RATE_LIMIT;
        name = 'RateLimitError';
        shouldRetry = true;
      } else if (status === 401) {
        category = this.ERROR_CATEGORIES.AUTHENTICATION;
        name = 'AuthenticationError';
        shouldRetry = false;
      } else if (status === 403) {
        category = this.ERROR_CATEGORIES.AUTHORIZATION;
        name = 'AuthorizationError';
        shouldRetry = false;
      } else {
        category = this.ERROR_CATEGORIES.VALIDATION;
        name = 'ValidationError';
        shouldRetry = false;
      }
    } else if (status >= 500) {
      category = this.ERROR_CATEGORIES.UNEXPECTED;
      name = 'ServerError';
      shouldRetry = true;
    } else {
      category = this.ERROR_CATEGORIES.UNEXPECTED;
      name = 'UnexpectedError';
    }

    return {
      name,
      category,
      code,
      message:
        this.ERROR_MESSAGES[code] ??
        originalError.message ??
        this.ERROR_MESSAGES.default,
      original: originalError,
      shouldRetry,
    };
  }

  private static isNetworkError(error: Error): boolean {
    const networkErrorPatterns = [
      'network',
      'connection',
      'offline',
      'failed to fetch',
      'timeout',
      'abort',
      'unreachable',
    ];

    return networkErrorPatterns.some(pattern =>
      error.message.toLowerCase().includes(pattern),
    );
  }

  // Helper method to determine if an error is retryable
  static isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      'timeout',
      'rate limit',
      'connection',
      '5xx',
      'network',
    ];

    return retryablePatterns.some(pattern =>
      error.message.toLowerCase().includes(pattern),
    );
  }
}

//todo uncomment the following if you find it's useful, currently it's not of paramount importance
// Utility for retry logic with exponential backoff
/*
export const retryWithBackoff = async (
  operation: () => Promise<any>,
  retries: number,
  delay = 1000,
  factor = 2
) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= factor;
    }
  }
};
*/
