// src/components/home/TodaysMenuCard.tsx
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text as RNText, Divider, useTheme } from 'react-native-paper';

import { Card } from '@/src/components/common/Card';
import { Text } from '@/src/components/common/Text';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
// import { MealDetails } from '@/src/types/member/home';

// A separate component for each meal to enable better performance optimization
const MealItem = memo(({ meal }: { meal: MealDetails }) => {
  const theme = useTheme();
  // Format the meal type to be capitalized (e.g., "Lunch" instead of "lunch")
  const formattedType = meal.type.charAt(0).toUpperCase() + meal.type.slice(1);

  return (
    <View style={styles.mealContainer}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          variant="titleMedium"
          style={[
            styles.mealType,
            {
              color: theme.colors.onSurface,
            },
          ]}
        >
          {formattedType}
        </Text>
        <Text
          variant="bodySmall"
          style={[
            styles.timing,
            {
              color: theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {meal.timing.start} - {meal.timing.end}
        </Text>
      </View>
      {/* Join menu items with bullet points for better readability */}
      <Text
        variant="bodyMedium"
        style={[
          styles.items,
          {
            color: theme.colors.onSurface,
          },
          !meal.isActive && {
            color: theme.colors.onSurfaceVariant,
          },
        ]}
      >
        {meal.items.join(' • ')}
      </Text>
      {!meal.isActive && (
        <Text
          variant="bodySmall"
          style={[
            styles.inactiveNote,
            {
              color: theme.colors.error,
            },
          ]}
        >
          Not available today
        </Text>
      )}
    </View>
  );
});

// Set display name for debugging
MealItem.displayName = 'MealItem';

const TodaysMenuCard = memo(() => {
  const theme = useTheme();
  // Get meals data from store with selector to prevent unnecessary rerenders
  const todaysMeals = useHomeStore(state => state.todaysMeals);
  const isLoading = useHomeStore(state => state.isLoading);
  // Custom equality function
  //   (prev, next) =>
  //     prev.isLoading === next.isLoading &&
  //     prev.todaysMeals.length === next.todaysMeals.length &&
  //     prev.todaysMeals.every((meal, index) => meal.id === next.todaysMeals[index]?.id)
  // );

  // Show loading state if no meals data is available yet
  if (isLoading && todaysMeals.length === 0) {
    return (
      <Card>
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Today's Menu
        </Text>
        <View style={styles.loadingContainer}>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
            }}
          >
            Loading menu...
          </Text>
        </View>
      </Card>
    );
  }

  // Show message if no meals are available
  if (todaysMeals.length === 0) {
    return (
      <Card>
        <Text variant="titleLarge" style={styles.title}>
          Today's Menu
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            color: theme.colors.onSurfaceVariant,
          }}
        >
          No meals available for today
        </Text>
      </Card>
    );
  }

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
          {/* Add divider between meals, but not after the last one */}
          {index < todaysMeals.length - 1 && (
            <Divider
              style={{
                backgroundColor: theme.colors.surfaceVariant,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Card>
  );
});

export default TodaysMenuCard;

// Set display name for debugging
TodaysMenuCard.displayName = 'TodaysMenuCard';

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
    fontFamily: 'System', // Using system font for better performance
    fontWeight: '600',
  },
  mealContainer: {
    paddingVertical: 12,
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
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {},
  noMealsText: {
    textAlign: 'center',
    marginVertical: 24,
  },
});
