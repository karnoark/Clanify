// src/stores/networkStore.ts
import type { NetInfoState } from '@react-native-community/netinfo';
import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';

interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  // Actions
  setNetworkState: (state: Partial<NetworkState>) => void;
  initialize: () => () => void;
}

export const useNetworkStore = create<NetworkState>(set => ({
  isConnected: null,
  isInternetReachable: null,

  setNetworkState: networkState => set(networkState),

  initialize: () => {
    // Initial network state check
    NetInfo.fetch().then(state => {
      set({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      set({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Return unsubscribe function for cleanup
    return unsubscribe;
  },
}));

// Initialize network monitoring in your app root
export function initializeNetworkMonitoring() {
  const unsubscribe = useNetworkStore.getState().initialize();
  return unsubscribe;
}
