/**
 * This enum defines all possible events that can be emitted in our store system.
 * Each event represents a significant state change or action in the application.
 */
export enum StoreEvent {
  // Authentication events
  AUTH_INITIALIZED = 'auth/initialized',
  AUTH_COMPLETED = 'auth/completed',
  AUTH_ERROR = 'auth/error',
  AUTH_SIGNOUT = 'auth/signout',

  // Membership events
  MEMBERSHIP_LOADED = 'membership/loaded',
  MEMBERSHIP_ERROR = 'membership/error',
  MEMBERSHIP_EXPIRED = 'membership/expired',
  MEMBERSHIP_UPDATED = 'membership/updated',

  // Store lifecycle events
  STORE_INITIALIZED = 'store/initialized',
  STORE_ERROR = 'store/error',
  STORE_RESET = 'store/reset',
}

/**
 * Type definitions for event payloads. This ensures type safety when
 * emitting and handling events.
 */
export interface EventPayloads {
  [StoreEvent.AUTH_INITIALIZED]: undefined;
  [StoreEvent.AUTH_COMPLETED]: { userId: string };
  [StoreEvent.AUTH_ERROR]: { error: Error };
  [StoreEvent.AUTH_SIGNOUT]: undefined;

  [StoreEvent.MEMBERSHIP_LOADED]: {
    status: 'active' | 'expired' | 'cancelled';
    messId?: string;
  };
  [StoreEvent.MEMBERSHIP_ERROR]: { error: Error };
  [StoreEvent.MEMBERSHIP_EXPIRED]: {
    memberId: string;
    expiryDate: Date;
  };
  [StoreEvent.MEMBERSHIP_UPDATED]: {
    status: 'active' | 'expired' | 'cancelled';
    messId: string;
  };

  [StoreEvent.STORE_INITIALIZED]: undefined;
  [StoreEvent.STORE_ERROR]: {
    storeName: string;
    error: Error;
  };
  [StoreEvent.STORE_RESET]: undefined;
}

/**
 * Type for event listeners that ensures correct payload types for each event
 */
export type EventListener<T extends StoreEvent> = (
  payload: EventPayloads[T],
) => void | Promise<void>;
