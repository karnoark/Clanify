import type {
  StoreEvent,
  EventListener,
  EventPayloads,
  StoreEventType,
} from './types';

/**
 * The EventManager class handles the pub/sub system for store events.
 * It provides type-safe event emission and subscription with proper cleanup.
 */
class EventManager {
  private listeners: Map<
    StoreEventType,
    // claude suggested that any type would be okay here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Set<(payload: any) => void | Promise<void>>
  > = new Map();
  private debugMode: boolean = process.env.NODE_ENV === 'development';

  /**
   * Subscribe to an event
   * @param event - The event to listen for
   * @param listener - The callback to execute when the event occurs
   * @returns Cleanup function to remove the listener
   */
  on<T extends StoreEventType>(
    event: T,
    listener: EventListener<T>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    eventListeners.add(listener);

    // Return cleanup function
    return () => {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Remove a specific listener for an event
   */
  off<T extends StoreEventType>(event: T, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event with its payload
   * @param event - The event to emit
   * @param payload - The event payload
   */
  async emit<T extends keyof EventPayloads>(
    event: T,
    payload: EventPayloads[T],
  ): Promise<void> {
    const eventListeners = this.listeners.get(event);

    if (this.debugMode) {
      console.log(`[EventManager] Emitting ${event}`, payload);
    }

    if (eventListeners) {
      // Execute all listeners in parallel but catch their errors
      const promises = Array.from(eventListeners).map(listener =>
        Promise.resolve(listener(payload)).catch(error => {
          console.error(
            `[EventManager] Error in listener for ${event}:`,
            error,
          );
        }),
      );

      await Promise.all(promises);
    }
  }

  /**
   * Remove all listeners for an event
   */
  clearEvent(event: StoreEventType): void {
    this.listeners.delete(event);
  }

  /**
   * Remove all event listeners
   */
  clearAll(): void {
    this.listeners.clear();
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: StoreEventType): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
}

// Export a singleton instance
export const eventManager = new EventManager();
