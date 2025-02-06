/**
 * Represents the current state of a store's initialization process.
 * This helps us track where each store is in its lifecycle.
 */
export enum StoreStatus {
  UNINITIALIZED = 'uninitialized', // Store hasn't started initialization
  INITIALIZING = 'initializing', // Store is currently initializing
  INITIALIZED = 'initialized', // Store has successfully initialized
  ERROR = 'error', // Store failed to initialize
}

/**
 * Configuration for a store, including its initialization requirements
 * and dependencies on other stores.
 */
export interface StoreConfig {
  name: string; // Unique identifier for the store
  critical: boolean; // Whether the store is required for app function
  dependencies?: string[]; // Names of stores that must initialize first
  persistState?: boolean; // Whether to persist state across sessions
}

/**
 * Tracks the current state of a store, including any errors
 * and the number of initialization attempts.
 */
export interface StoreState {
  status: StoreStatus;
  error?: Error;
  retryCount: number;
  lastInitialized?: Date;
}

/**
 * Function signature for store initialization methods.
 * Each store will provide this function to the manager.
 */
export type StoreInitializer = () => Promise<void>;
