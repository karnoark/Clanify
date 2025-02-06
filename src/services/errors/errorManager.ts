import type { AppError } from '@/src/services/errors/types';
import { ErrorSeverity, ErrorType } from '@/src/services/errors/types';

import { eventManager, StoreEvent } from '../events';

/**
 * The ErrorManager class handles error processing, logging, and recovery
 * throughout the application.
 */
class ErrorManager {
  private static readonly ERROR_THROTTLE = 1000; // ms
  private lastError: { timestamp: number; type: ErrorType } | null = null;

  /**
   * Process an error and determine how it should be handled.
   * Returns an AppError with appropriate recovery actions.
   */
  public processError(error: unknown): AppError {
    // Don't process the same error type too frequently
    if (this.shouldThrottleError(error)) {
      throw new Error('Error processing throttled');
    }

    const appError = this.createAppError(error);
    this.logError(appError);
    this.emitErrorEvent(appError);

    return appError;
  }

  /**
   * Creates a standardized AppError object from any error type.
   */
  private createAppError(error: unknown): AppError {
    const baseError: AppError = {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      message: 'An unexpected error occurred',
      timestamp: new Date(),
      recoveryActions: [
        {
          label: 'Try Again',
          action: async () => {
            await eventManager.emit(StoreEvent.STORE_RESET, undefined);
          },
        },
      ],
    };

    if (error instanceof Error) {
      // Network errors
      if ('isAxiosError' in error || error.name === 'NetworkError') {
        return {
          ...baseError,
          type: ErrorType.NETWORK,
          message: 'Network connection problem',
          technical: error.message,
          recoveryActions: [
            {
              label: 'Check Connection',
              action: async () => {
                // Trigger network check
                await eventManager.emit(StoreEvent.NETWORK_CHECK, undefined);
              },
            },
          ],
        };
      }

      // Authentication errors
      if (
        error.name === 'AuthenticationError' ||
        error.message.includes('auth')
      ) {
        return {
          ...baseError,
          type: ErrorType.AUTH,
          severity: ErrorSeverity.ERROR,
          message: 'Authentication problem',
          technical: error.message,
          recoveryActions: [
            {
              label: 'Sign In Again',
              action: async () => {
                await eventManager.emit(StoreEvent.AUTH_SIGNOUT, undefined);
              },
            },
          ],
        };
      }

      // Store initialization errors
      if (error.message.includes('store')) {
        return {
          ...baseError,
          type: ErrorType.STORE_INITIALIZATION,
          message: 'Problem loading application data',
          technical: error.message,
          recoveryActions: [
            {
              label: 'Retry Loading',
              action: async () => {
                await eventManager.emit(StoreEvent.STORE_RESET, undefined);
              },
            },
          ],
        };
      }
    }

    return {
      ...baseError,
      technical: error instanceof Error ? error.message : String(error),
    };
  }

  /**
   * Prevent the same error type from being processed too frequently.
   */
  private shouldThrottleError(error: unknown): boolean {
    const now = Date.now();
    const errorType = this.getErrorType(error);

    if (
      this.lastError &&
      this.lastError.type === errorType &&
      now - this.lastError.timestamp < ErrorManager.ERROR_THROTTLE
    ) {
      return true;
    }

    this.lastError = { timestamp: now, type: errorType };
    return false;
  }

  /**
   * Determine the error type from an unknown error.
   */
  private getErrorType(error: unknown): ErrorType {
    if (error instanceof Error) {
      if ('isAxiosError' in error) return ErrorType.NETWORK;
      if (error.name === 'AuthenticationError') return ErrorType.AUTH;
      if (error.message.includes('store'))
        return ErrorType.STORE_INITIALIZATION;
    }
    return ErrorType.UNKNOWN;
  }

  /**
   * Log the error for debugging and monitoring.
   */
  private logError(error: AppError): void {
    console.error('[ErrorManager]', {
      type: error.type,
      severity: error.severity,
      message: error.message,
      technical: error.technical,
      timestamp: error.timestamp,
      context: error.context,
    });

    // Here you could add additional logging services
    // like Firebase Crashlytics, Sentry, etc.
  }

  /**
   * Emit an error event for the event system.
   */
  private emitErrorEvent(error: AppError): void {
    eventManager.emit(StoreEvent.STORE_ERROR, {
      storeName: 'any',
      error: new Error(error.message),
    });
  }
}

export const errorManager = new ErrorManager();
