// First, let's define our events as a union of string literals
// This gives us more precise type control than an enum
export const StoreEvent = {
  // Authentication events
  AUTH_INITIALIZED: 'auth/initialized',
  AUTH_COMPLETED: 'auth/completed',
  AUTH_ERROR: 'auth/error',
  AUTH_SIGNOUT: 'auth/signout',

  CONNECTIVITY_CHECK: 'CONNECTIVITY_CHECK',

  // Membership events
  MEMBERSHIP_LOADED: 'membership/loaded',
  MEMBERSHIP_ERROR: 'membership/error',
  MEMBERSHIP_EXPIRED: 'membership/expired',
  MEMBERSHIP_UPDATED: 'membership/updated',

  // Store lifecycle events
  STORE_INITIALIZED: 'store/initialized',
  STORE_ERROR: 'store/error',
  STORE_RESET: 'store/reset',
} as const;

// Create a type from our const object
export type StoreEventType = (typeof StoreEvent)[keyof typeof StoreEvent];

// Now define the payload types with our string literal types
export type EventPayloads = {
  [StoreEvent.AUTH_INITIALIZED]: undefined;
  [StoreEvent.AUTH_COMPLETED]: { userId: string };
  [StoreEvent.AUTH_ERROR]: { error: Error };
  [StoreEvent.AUTH_SIGNOUT]: undefined;

  [StoreEvent.CONNECTIVITY_CHECK]: undefined;

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
};

// Define our event listener type
export type EventListener<T extends StoreEventType> = (
  payload: EventPayloads[T],
) => void | Promise<void>;
