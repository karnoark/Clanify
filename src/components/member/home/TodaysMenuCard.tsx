// src/components/member/home/TodaysMenuCard.tsx
import { isToday } from 'date-fns';
import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, useTheme } from 'react-native-paper';

import { Card } from '@/src/components/common/Card';
import { Text } from '@/src/components/common/Text';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
import type { MealDetails } from '@/src/types/member/meal';

// A separate component for each meal to enable better performance optimization
const MealItem = memo(({ meal }: { meal: MealDetails }) => {
  const theme = useTheme();
  const formattedType =
    meal.type?.charAt(0).toUpperCase() + meal.type?.slice(1) || 'Unknown';

  const timeDisplay =
    meal.timing?.start && meal.timing?.end
      ? `${meal.timing.start} - ${meal.timing.end}`
      : 'Time not specified';

  const itemsDisplay = Array.isArray(meal.items)
    ? meal.items.join(' • ')
    : 'No items specified';

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
          {timeDisplay}
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
        {itemsDisplay}
      </Text>

      {!meal.isActive && (
        <Text
          variant="bodySmall"
          style={[styles.inactiveNote, { color: theme.colors.error }]}
        >
          No more active
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

  // Filter meals for today using useMemo to optimize performance
  const todaysMealsFiltered = useMemo(() => {
    return todaysMeals.filter(meal => {
      try {
        const mealDate =
          meal.date instanceof Date ? meal.date : new Date(meal.date);
        return isToday(mealDate);
      } catch (error) {
        console.error(`Invalid date format for meal ${meal.id}:`, error);
        return false;
      }
    });
  }, [todaysMeals]);

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
  if (isMealsLoading && todaysMealsFiltered.length === 0) {
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
  if (todaysMealsFiltered.length === 0) {
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

      {todaysMealsFiltered.map((meal, index) => (
        <React.Fragment key={meal.id}>
          <MealItem meal={meal} />
          {index < todaysMealsFiltered.length - 1 && (
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
