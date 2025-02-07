import { LoadingScreen } from '@/src/components/core/LoadingScreen';
import { AppLoadingError } from '@/src/components/errors/AppLoadingError';
import { storeManager } from '@/src/services/stores';

interface StoreInitGuardProps {
  children: React.ReactNode;
  storeName: string;
  loadingMessage?: string;
}

export function StoreInitializationGuard({
  children,
  storeName,
  loadingMessage = 'Loading...',
}: StoreInitGuardProps) {
  const storeState = storeManager.getStoreState(storeName);

  if (storeState.status === 'initializing') {
    return <LoadingScreen message={loadingMessage} />;
  }

  if (storeState.status === 'error') {
    return (
      <AppLoadingError
        error={storeState.error!}
        onRetry={() => storeManager.initializeStore(storeName)}
      />
    );
  }

  return children;
}
