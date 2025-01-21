import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Portal, Dialog, useTheme, Button } from 'react-native-paper';

interface ValidationErrorsProps {
  errors: { [key: string]: string };
  visible: boolean;
  onDismiss: () => void;
  title?: string;
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  errors,
  visible,
  onDismiss,
  title = 'Please Fix These Issues',
}) => {
  const theme = useTheme();
  const hasErrors = Object.values(errors).some(
    stepErrors => stepErrors.length > 0,
  );

  if (!hasErrors) return null;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <View style={styles.errorContainer}>
            {Object.entries(errors).map(
              ([stepId, stepError]) =>
                stepError.length > 0 && (
                  <View key={stepId} style={styles.stepError}>
                    <Text
                      variant="titleMedium"
                      style={{ color: theme.colors.error }}
                    >
                      {stepId.charAt(0).toUpperCase() + stepId.slice(1)}
                    </Text>
                    {/* {stepErrors.map((error, index) => ( */}
                    <Text
                      // key={index}
                      style={[styles.errorText, { color: theme.colors.error }]}
                    >
                      • {stepError}
                    </Text>
                    {/* ))} */}
                  </View>
                ),
            )}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Got it</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    gap: 16,
  },
  stepError: {
    gap: 8,
  },
  errorText: {
    marginLeft: 8,
  },
});
