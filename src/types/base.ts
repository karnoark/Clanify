export interface BaseState {
  isLoading: boolean;
  error: string | null;
}

export type LoadingState = 'idle' | 'loading' | 'error' | 'success';
