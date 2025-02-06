// src/components/errors/ErrorBoundary.tsx

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

import { errorManager } from '@/src/services/errors/errorManager';
import type {
  AppError,
  ErrorRecoveryAction,
} from '@/src/services/errors/types';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: AppError }>;
}

interface ErrorBoundaryState {
  error: AppError | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    // Convert the caught error to our AppError type
    const appError = errorManager.processError(error);
    return { error: appError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      const { fallback: FallbackComponent } = this.props;

      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} />;
      }

      return <DefaultErrorDisplay error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Default error display component
function DefaultErrorDisplay({ error }: { error: AppError }) {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          {error.message}
        </Text>

        {error.technical && (
          <Text style={{ color: '#666', marginBottom: 20 }}>
            {error.technical}
          </Text>
        )}

        {error.recoveryActions?.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: '#007AFF',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 5,
              marginVertical: 5,
            }}
            onPress={action.action}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
