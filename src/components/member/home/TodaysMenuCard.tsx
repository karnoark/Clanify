// src/components/member/home/TodaysMenuCard.tsx
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, useTheme } from 'react-native-paper';

import { Card } from '@/src/components/common/Card';
import { Text } from '@/src/components/common/Text';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
import type { MealDetails } from '@/src/types/member/meal';

// A separate component for each meal to enable better performance optimization
const MealItem = memo(({ meal }: { meal: MealDetails }) => {
  const theme = useTheme();
  const formattedType = meal.type.charAt(0).toUpperCase() + meal.type.slice(1);

  return (
    <View style={styles.mealContainer}>
      <View style={styles.mealHeader}>
        <Text
          variant="titleMedium"
          style={[styles.mealType, { color: theme.colors.onSurface }]}
        >
          {formattedType}
        </Text>
        <Text
          variant="bodySmall"
          style={[styles.timing, { color: theme.colors.onSurfaceVariant }]}
        >
          {meal.timing.start} - {meal.timing.end}
        </Text>
      </View>

      <Text
        variant="bodyMedium"
        style={[
          styles.items,
          {
            color: meal.isActive
              ? theme.colors.onSurface
              : theme.colors.onSurfaceVariant,
          },
        ]}
      >
        {meal.items.join(' • ')}
      </Text>

      {!meal.isActive && (
        <Text
          variant="bodySmall"
          style={[styles.inactiveNote, { color: theme.colors.error }]}
        >
          Not available today
        </Text>
      )}
    </View>
  );
});

MealItem.displayName = 'MealItem';

const TodaysMenuCard = memo(() => {
  const theme = useTheme();

  // Use specific selectors to prevent unnecessary rerenders
  const { todaysMeals, isMealsLoading, mealsError } = useHomeStore();

  // Show error state if there's an error
  if (mealsError) {
    return (
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Today's Menu
        </Text>
        <View style={styles.messageContainer}>
          <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
            {mealsError}
          </Text>
        </View>
      </Card>
    );
  }

  // Show loading state
  if (isMealsLoading && todaysMeals.length === 0) {
    return (
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Today's Menu
        </Text>
        <View style={styles.messageContainer}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Loading menu...
          </Text>
        </View>
      </Card>
    );
  }

  // Show empty state
  if (todaysMeals.length === 0) {
    return (
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Today's Menu
        </Text>
        <View style={styles.messageContainer}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            No meals available for today
          </Text>
        </View>
      </Card>
    );
  }

  // Show meals list
  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      <Text
        variant="titleLarge"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Today's Menu
      </Text>

      {todaysMeals.map((meal, index) => (
        <React.Fragment key={meal.id}>
          <MealItem meal={meal} />
          {index < todaysMeals.length - 1 && (
            <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
          )}
        </React.Fragment>
      ))}
    </Card>
  );
});

TodaysMenuCard.displayName = 'TodaysMenuCard';

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
    fontFamily: 'System',
    fontWeight: '600',
  },
  mealContainer: {
    paddingVertical: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealType: {
    fontWeight: 'bold',
  },
  timing: {
    marginTop: 4,
  },
  items: {
    marginTop: 8,
  },
  inactiveNote: {
    marginTop: 4,
  },
  messageContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TodaysMenuCard;
