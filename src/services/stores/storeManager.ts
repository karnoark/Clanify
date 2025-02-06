import { eventManager, StoreEvent } from '../events';
import type { StoreConfig, StoreState, StoreInitializer } from './types';
import { StoreStatus } from './types';

class StoreManager {
  private storeStates: Map<string, StoreState> = new Map();
  private storeConfigs: Map<string, StoreConfig> = new Map();
  private initializers: Map<string, StoreInitializer> = new Map();

  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000; // Base delay in milliseconds

  constructor() {
    // Listen for auth signout to reset stores
    eventManager.on(StoreEvent.AUTH_SIGNOUT, () => this.resetAllStores());
  }

  /**
   * Registers a store with the manager. This must be done before
   * the store can be initialized.
   */
  registerStore(config: StoreConfig, initializer: StoreInitializer): void {
    this.validateStoreConfig(config);

    this.storeConfigs.set(config.name, config);
    this.initializers.set(config.name, initializer);
    this.storeStates.set(config.name, {
      status: StoreStatus.UNINITIALIZED,
      retryCount: 0,
    });
  }

  /**
   * Initializes all registered stores in the correct order,
   * respecting dependencies.
   */
  async initializeAllStores(): Promise<void> {
    const storeNames = Array.from(this.storeConfigs.keys());
    const initOrder = this.calculateInitializationOrder(storeNames);

    try {
      // Initialize stores in the correct order
      for (const storeName of initOrder) {
        await this.initializeStore(storeName);
      }

      eventManager.emit(StoreEvent.STORE_INITIALIZED, undefined);
    } catch (error) {
      // If any critical store fails, emit error
      eventManager.emit(StoreEvent.STORE_ERROR, {
        storeName: 'all',
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * Initializes a specific store and its dependencies.
   */
  async initializeStore(storeName: string): Promise<void> {
    const config = this.storeConfigs.get(storeName);
    if (!config) throw new Error(`Store ${storeName} not registered`);

    // First initialize dependencies
    if (config.dependencies?.length) {
      await Promise.all(
        config.dependencies.map(dep => this.initializeStore(dep)),
      );
    }

    const state = this.getStoreState(storeName);
    if (state.status === StoreStatus.INITIALIZED) return;

    try {
      this.updateStoreState(storeName, { status: StoreStatus.INITIALIZING });

      const initializer = this.initializers.get(storeName);
      if (!initializer) throw new Error(`No initializer for ${storeName}`);

      await initializer();

      this.updateStoreState(storeName, {
        status: StoreStatus.INITIALIZED,
        lastInitialized: new Date(),
      });
    } catch (error) {
      const newState = {
        status: StoreStatus.ERROR,
        error: error as Error,
        retryCount: state.retryCount + 1,
      };
      this.updateStoreState(storeName, newState);

      // Handle retry logic
      if (this.shouldRetry(storeName)) {
        await this.retryInitialization(storeName);
      } else if (config.critical) {
        throw error; // Rethrow for critical stores
      }
    }
  }

  /**
   * Gets the current state of a store.
   */
  getStoreState(storeName: string): StoreState {
    return (
      this.storeStates.get(storeName) || {
        status: StoreStatus.UNINITIALIZED,
        retryCount: 0,
      }
    );
  }

  /**
   * Checks if all critical stores are initialized.
   */
  areCriticalStoresInitialized(): boolean {
    for (const [name, config] of this.storeConfigs) {
      if (config.critical) {
        const state = this.getStoreState(name);
        if (state.status !== StoreStatus.INITIALIZED) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Updates the state of a store and emits relevant events.
   */
  private updateStoreState(
    storeName: string,
    update: Partial<StoreState>,
  ): void {
    const currentState = this.getStoreState(storeName);
    const newState = { ...currentState, ...update };
    this.storeStates.set(storeName, newState);

    if (update.status === StoreStatus.ERROR) {
      eventManager.emit(StoreEvent.STORE_ERROR, {
        storeName,
        error: update.error as Error,
      });
    }
  }

  /**
   * Determines whether to retry store initialization.
   */
  private shouldRetry(storeName: string): boolean {
    const state = this.getStoreState(storeName);
    const config = this.storeConfigs.get(storeName);

    return state.retryCount < this.MAX_RETRIES && (config?.critical || false);
  }

  /**
   * Attempts to retry store initialization with exponential backoff.
   */
  private async retryInitialization(storeName: string): Promise<void> {
    const state = this.getStoreState(storeName);
    const delay = Math.min(
      this.RETRY_DELAY_BASE * Math.pow(2, state.retryCount),
      10000,
    );

    await new Promise(resolve => setTimeout(resolve, delay));
    return this.initializeStore(storeName);
  }

  /**
   * Calculates the correct order to initialize stores based on dependencies.
   */
  private calculateInitializationOrder(storeNames: string[]): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);

      const config = this.storeConfigs.get(name);
      if (config?.dependencies) {
        for (const dep of config.dependencies) {
          visit(dep);
        }
      }
      order.push(name);
    };

    for (const name of storeNames) {
      visit(name);
    }

    return order;
  }

  /**
   * Validates store configuration for circular dependencies and other issues.
   */
  private validateStoreConfig(config: StoreConfig): void {
    // Check for existing registration
    if (this.storeConfigs.has(config.name)) {
      throw new Error(`Store ${config.name} is already registered`);
    }

    // Check for circular dependencies
    if (config.dependencies?.length) {
      const visited = new Set<string>();
      const checkCircular = (name: string, path: string[]) => {
        if (path.includes(name)) {
          throw new Error(
            `Circular dependency detected: ${path.join(' -> ')} -> ${name}`,
          );
        }
        visited.add(name);

        const depConfig = this.storeConfigs.get(name);
        if (depConfig?.dependencies) {
          for (const dep of depConfig.dependencies) {
            checkCircular(dep, [...path, name]);
          }
        }
      };

      for (const dep of config.dependencies) {
        checkCircular(dep, [config.name]);
      }
    }
  }

  /**
   * Resets all stores to their uninitialized state.
   */
  private async resetAllStores(): Promise<void> {
    for (const [name] of this.storeStates) {
      this.storeStates.set(name, {
        status: StoreStatus.UNINITIALIZED,
        retryCount: 0,
      });
    }
    eventManager.emit(StoreEvent.STORE_RESET, undefined);
  }
}

// Export a singleton instance
export const storeManager = new StoreManager();
