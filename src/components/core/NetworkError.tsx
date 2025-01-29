// src/components/network/NetworkError.tsx
import React from 'react';

import { useNetworkStore } from '@/src/store/networkStore';

import { ErrorView } from '../core/ErrorView';

interface NetworkErrorProps {
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  fullScreen = true,
}) => {
  const { isConnected, isInternetReachable } = useNetworkStore();

  if (isConnected && isInternetReachable) {
    return null;
  }

  // const onRetry = async () => {
  //   // You can trigger a manual network check here if needed
  //   const netInfo = await NetInfo.fetch();
  //   useNetworkStore.setState({
  //     isConnected: netInfo.isConnected,
  //     isInternetReachable: netInfo.isInternetReachable,
  //   });
  // }

  const message = !isConnected
    ? 'No Internet Connection'
    : 'Network Connection Issue';

  const details = !isConnected
    ? 'Please check your internet connection and try again.'
    : 'Unable to reach our servers. Please check your connection and try again.';

  return (
    <ErrorView
      message={message}
      details={details}
      onRetry={onRetry}
      fullScreen={fullScreen}
    />
  );
};
