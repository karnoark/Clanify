// src/screens/HomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/src/components/common/ErrorBoundary';
import { Text } from '@/src/components/common/Text';
import AbsencePlannerCard from '@/src/components/member/home/AbsencePlannerCard';
import MembershipStatusCard from '@/src/components/member/home/MembershipStatusCard';
import RatingCard from '@/src/components/member/home/RatingCard';
import TodaysMenuCard from '@/src/components/member/home/TodaysMenuCard';
import { useHomeStore } from '@/src/store/memberStores/homeStore';

// Fallback component for error boundary
const ErrorFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => {
  const theme = useTheme();

  return (
    <View style={styles.errorContainer}>
      <Text
        variant="titleMedium"
        style={[styles.errorText, { color: theme.colors.error }]}
      >
        Something went wrong!
      </Text>
      <Text
        variant="bodyMedium"
        style={[
          styles.errorDescription,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        {error.message}
      </Text>
      <Button mode="contained" onPress={resetError}>
        Try Again
      </Button>
    </View>
  );
};

// Main home screen component
const HomeScreen = () => {
  // Get state and actions from store
  const {
    isLoading,
    error,
    loadInitialData,
    membershipExpiry,
    points,
    todaysMeals,
    rateableMeals,
    plannedAbsences,
  } = useHomeStore();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const theme = useTheme();

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  // Show loading spinner while initially loading
  if (isLoading && !membershipExpiry) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              Clanify
            </Text>
            <View
              style={[
                styles.points,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Ionicons name="leaf" size={24} color="#2ECC71" />
              <Text style={[styles.pointsText]}>{points} pts</Text>
            </View>
          </View>

          {/* Card components */}
          <MembershipStatusCard />
          <TodaysMenuCard />
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <RatingCard />
          </ErrorBoundary>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AbsencePlannerCard />
          </ErrorBoundary>
        </ScrollView>
      </ErrorBoundary>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    // fontWeight: 'bold',
  },
  points: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsText: {
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginBottom: 8,
  },
  errorDescription: {
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default HomeScreen;
