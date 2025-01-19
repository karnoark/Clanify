// src/components/core/ErrorView.tsx
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';

interface ErrorViewProps {
  message: string;
  details?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message,
  details,
  onRetry,
  fullScreen = true,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: fullScreen ? 1 : undefined,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      margin: fullScreen ? 0 : 16,
      ...(fullScreen
        ? {}
        : {
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }),
    },
    iconContainer: {
      backgroundColor: theme.colors.errorContainer,
      padding: 16,
      borderRadius: 50,
      marginBottom: 20,
    },
    messageText: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      color: theme.colors.onSurface,
      marginBottom: details ? 8 : 20,
    },
    detailsText: {
      fontSize: 14,
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      marginBottom: 20,
      maxWidth: '80%',
    },
    retryButton: {
      borderRadius: 8,
      marginTop: 8,
    },
    buttonContent: {
      paddingHorizontal: 24,
      paddingVertical: 8,
    },
  });

  return (
    <Animated.View
      entering={fullScreen ? SlideInDown : FadeIn}
      exiting={FadeOut}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={40}
          color={theme.colors.error}
        />
      </View>

      <Text style={styles.messageText}>{message}</Text>

      {details && <Text style={styles.detailsText}>{details}</Text>}

      {onRetry && (
        <Button
          mode="contained"
          onPress={onRetry}
          style={styles.retryButton}
          contentStyle={styles.buttonContent}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
        >
          Try Again
        </Button>
      )}
    </Animated.View>
  );
};
