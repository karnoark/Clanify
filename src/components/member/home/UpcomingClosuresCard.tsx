// src/components/member/home/UpcomingClosuresCard.tsx

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, useTheme } from 'react-native-paper';

import { Card } from '@/src/components/common/Card';
import { Text } from '@/src/components/common/Text';
import { ClosureItem } from '@/src/components/member/home/ClosureItem';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
import type { MessClosure } from '@/src/types/member/messClosures';

/**
 * A card component that displays upcoming mess closures.
 * Shows at most 5 upcoming closures with their dates, meal types, and reasons.
 * If there are no upcoming closures, the card is not rendered.
 */
const UpcomingClosuresCard = memo(() => {
  const theme = useTheme();
  // const { upcomingClosures, isClosuresLoading, closuresError } = useHomeStore();

  const upcomingClosures: MessClosure[] = [
    {
      date: new Date('2023-10-25'), // October 25, 2023
      meal_type: 'lunch', // Lunch is affected
      closure_reason: 'Kitchen maintenance', // Reason for closure
    },
    {
      date: new Date('2023-10-26'), // October 26, 2023
      meal_type: 'dinner', // Dinner is affected
      closure_reason: 'Staff training', // Reason for closure
    },
    {
      date: new Date('2023-10-27'), // October 27, 2023
      meal_type: 'lunch', // Lunch is affected
      closure_reason: 'Holiday - Diwali', // Reason for closure
    },
    {
      date: new Date('2023-10-28'), // October 28, 2023
      meal_type: 'dinner', // Dinner is affected
      closure_reason: 'Deep cleaning', // Reason for closure
    },
  ];
  const isClosuresLoading = null;
  const closuresError = null;

  // Don't render anything if there are no closures and no loading/error state
  if (upcomingClosures.length === 0 && !isClosuresLoading && !closuresError) {
    return null;
  }

  // Show loading state
  // if (true) {
  if (isClosuresLoading && upcomingClosures.length === 0) {
    return (
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Upcoming Mess Closures
        </Text>
        <View style={styles.messageContainer}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Loading closures...
          </Text>
        </View>
      </Card>
    );
  }

  // Show error state
  if (closuresError) {
    return (
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Upcoming Mess Closures
        </Text>
        <View style={styles.messageContainer}>
          <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
            {closuresError ?? 'some error occurred'}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      {/* Card Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="silverware-variant"
          size={24}
          color={theme.colors.primary}
        />
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Upcoming Mess Closures
        </Text>
      </View>

      {/* Closure Items */}
      {upcomingClosures.map((closure: MessClosure, index: number) => (
        <React.Fragment key={`${closure.date}-${closure.meal_type}`}>
          <ClosureItem
            date={closure.date}
            mealType={closure.meal_type}
            reason={closure.closure_reason}
          />
          {/* Add divider except after the last item */}
          {index < upcomingClosures.length - 1 && (
            <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
          )}
        </React.Fragment>
      ))}
    </Card>
  );
});

// Add display name for debugging purposes
UpcomingClosuresCard.displayName = 'UpcomingClosuresCard';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
  },
  messageContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UpcomingClosuresCard;
