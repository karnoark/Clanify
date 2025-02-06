// Add a React hook for easier store state access
import { useState, useEffect } from 'react';

import { eventManager, StoreEvent } from '@/src/services/events';
import { storeManager } from '@/src/services/stores/storeManager';

import type { StoreState } from './types';

export * from './types';

export { storeManager } from './storeManager';

export function useStoreState(storeName: string): StoreState {
  const [state, setState] = useState<StoreState>(() =>
    storeManager.getStoreState(storeName),
  );

  useEffect(() => {
    const handleStoreChange = () => {
      setState(storeManager.getStoreState(storeName));
    };

    // Set up listeners for relevant store events
    const cleanups = [
      eventManager.on(StoreEvent.STORE_INITIALIZED, handleStoreChange),
      eventManager.on(StoreEvent.STORE_ERROR, handleStoreChange),
      eventManager.on(StoreEvent.STORE_RESET, handleStoreChange),
    ];

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [storeName]);

  return state;
}
