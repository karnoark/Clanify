// Create a hook for easy event handling in components
import { useEffect } from 'react';

import { eventManager } from './eventManager';
import type { StoreEvent, EventListener, StoreEventType } from './types';

export * from './types';
export { eventManager } from './eventManager';

export function useStoreEvent<T extends StoreEventType>(
  event: T,
  listener: EventListener<T>,
): void {
  useEffect(() => {
    const cleanup = eventManager.on(event, listener);
    return cleanup;
  }, [event, listener]);
}
