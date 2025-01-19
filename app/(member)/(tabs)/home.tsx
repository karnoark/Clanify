//todo only caches non-dynamic states and leave out other states to fetched real time using supabase. for this use partialize option in persists() in zustandstore.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { Appbar, useTheme, Text, ActivityIndicator } from 'react-native-paper';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorView } from '@/src/components/core/ErrorView';
import { useHomeStore } from '@/src/store/memberStores/homeStore';

// Types for our components
interface HomeScreenProps {
  // Add navigation prop if needed
}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  // Theme and insets
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { loadInitialData, isLoading, error, points } = useHomeStore();

  // State for refresh control
  const [refreshing, setRefreshing] = useState(false);
  // const [points, setPoints] = useState(100); // This will come from Zustand later

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Add refresh logic here
    loadInitialData();
    setTimeout(() => setRefreshing(false), 2000); // Temporary timeout
  }, [loadInitialData]);

  // Load data when component mounts
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Optionally refresh data when the screen comes into focus
  //todo not sure about performance implication of this hook
  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [loadInitialData]),
  );

  // Show loading state while checking auth
  if (isLoading) {
    if (error) console.log('error loading the data from homeStore: ', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <ErrorView
        message={error ?? 'Unable to Load Data'}
        details="Please check your internet connection and try again."
        onRetry={loadInitialData}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* AppBar with Points Display */}
      <Appbar.Header
        style={[
          styles.appBar,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <Appbar.Content title="Home" />
        <Animated.View
          entering={FadeIn}
          // layout={Layout.springify()}
          style={styles.pointsContainer}
        >
          <MaterialCommunityIcons
            name="star-circle"
            size={24}
            color={theme.colors.primary}
          />
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.primary, marginLeft: 4 }}
          >
            {points}
          </Text>
        </Animated.View>
      </Appbar.Header>

      {/* Main Content ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Placeholder for MembershipCard */}
        <Animated.View
          entering={FadeIn.delay(150)}
          // layout={Layout.springify()}
          style={styles.cardContainer}
        >
          {/* MembershipCard component will go here */}
          <View
            style={[
              styles.placeholderCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="titleMedium">Membership Status</Text>
          </View>
        </Animated.View>

        {/* Placeholder for TodaysMealCard */}
        <Animated.View
          entering={FadeIn.delay(300)}
          // layout={Layout.springify()}
          style={styles.cardContainer}
        >
          {/* TodaysMealCard component will go here */}
          <View
            style={[
              styles.placeholderCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="titleMedium">Today's Meals</Text>
          </View>
        </Animated.View>

        {/* Placeholder for RatingCard (conditional) */}
        <Animated.View
          entering={FadeIn.delay(450)}
          // layout={Layout.springify()}
          style={styles.cardContainer}
        >
          {/* RatingCard component will go here */}
          <View
            style={[
              styles.placeholderCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="titleMedium">Rate Your Meal</Text>
          </View>
        </Animated.View>

        {/* Placeholder for AbsencePlannerCard */}
        <Animated.View
          entering={FadeIn.delay(600)}
          // layout={Layout.springify()}
          style={styles.cardContainer}
        >
          {/* AbsencePlannerCard component will go here */}
          <View
            style={[
              styles.placeholderCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="titleMedium">Plan Your Absence</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* QR Scanner Button - Fixed at bottom */}
      <Animated.View
        entering={FadeIn.delay(750)}
        // layout={Layout.springify()}
        style={[styles.qrButtonContainer, { bottom: insets.bottom + 16 }]}
      >
        {/* QRScannerButton component will go here */}
        <View
          style={[
            styles.placeholderQRButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={24}
            color={theme.colors.onPrimary}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    elevation: 0,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  placeholderCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrButtonContainer: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
  },
  placeholderQRButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});

export default HomeScreen;
