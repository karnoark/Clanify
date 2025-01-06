// src/components/onboarding/StepNavigation.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

interface StepNavigationProps {
  onNext?: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
  canProgress?: boolean;
  loading?: boolean;
}

export function StepNavigation({
  onNext,
  onBack,
  isLastStep = false,
  canProgress = true,
  loading = false,
}: StepNavigationProps) {
  return (
    <View style={styles.container}>
      {onBack && (
        <Button
          mode="outlined"
          onPress={onBack}
          style={styles.button}
          disabled={loading}
        >
          Back
        </Button>
      )}
      {onNext && (
        <Button
          mode="contained"
          onPress={onNext}
          style={styles.button}
          disabled={!canProgress || loading}
          loading={loading}
        >
          {isLastStep ? 'Finish' : 'Next'}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  button: {
    flex: 1,
  },
});
