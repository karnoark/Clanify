/**
 * Defines the different categories of errors we handle in the application.
 * This helps us provide appropriate error messages and recovery actions.
 */
export enum ErrorType {
  // Network related errors
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  OFFLINE = 'offline',

  // Authentication errors
  AUTH = 'auth',
  SESSION_EXPIRED = 'session_expired',
  UNAUTHORIZED = 'unauthorized',

  // Data errors
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',

  // Store errors
  STORE_INITIALIZATION = 'store_initialization',
  STORE_UPDATE = 'store_update',

  // General errors
  UNKNOWN = 'unknown',
}

/**
 * Defines the severity level of errors.
 * This helps determine how errors should be displayed and handled.
 */
export enum ErrorSeverity {
  INFO = 'info', // User should be informed but can continue
  WARNING = 'warning', // User should be warned but can continue
  ERROR = 'error', // User needs to take action to continue
  FATAL = 'fatal', // Application cannot continue, needs restart
}

/**
 * Represents a recoverable action that can be taken to resolve an error.
 */
export interface ErrorRecoveryAction {
  label: string;
  action: () => Promise<void>;
  requiresAuth?: boolean;
}

/**
 * Comprehensive error object that includes all necessary information
 * for handling and displaying errors.
 */
export interface AppError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  technical?: string;
  code?: string;
  recoveryActions?: ErrorRecoveryAction[];
  timestamp: Date;
  context?: Record<string, unknown>;
}
