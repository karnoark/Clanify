import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Divider, useTheme } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '@/src/components/common/Text';

// Types for meal data
interface MealType {
  type: 'lunch' | 'dinner';
  items: string[];
  timing: {
    start: string;
    end: string;
  };
  isActive: boolean;
}

interface TodaysMealCardProps {
  meals: MealType[];
}

// Component to display individual meal details
const MealSection: React.FC<{ meal: MealType }> = ({ meal }) => {
  const theme = useTheme();

  // Get icon based on meal type
  const getMealIcon = (type: 'lunch' | 'dinner') => {
    return type === 'lunch'
      ? ('weather-sunny' as const)
      : ('moon-waning-crescent' as const);
  };

  return (
    <Animated.View
      entering={FadeIn}
      style={[
        styles.mealSection,
        {
          backgroundColor: meal.isActive
            ? theme.colors.primaryContainer
            : theme.colors.surfaceVariant,
        },
      ]}
    >
      <View style={styles.mealHeader}>
        <View style={styles.mealTypeContainer}>
          <MaterialCommunityIcons
            name={getMealIcon(meal.type)}
            size={24}
            color={theme.colors.primary}
          />
          <Text variant="titleMedium" style={styles.mealType}>
            {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
          </Text>
        </View>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {meal.timing.start} - {meal.timing.end}
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {meal.items.map((item, index) => (
          <View key={index} style={styles.menuItem}>
            <MaterialCommunityIcons
              name="circle-small"
              size={20}
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium">{item}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const TodaysMealCard: React.FC<TodaysMealCardProps> = ({ meals }) => {
  const theme = useTheme();

  // If no meals are available, show a message
  if (!meals || meals.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.noMealContainer}>
            <MaterialCommunityIcons
              name="food-off"
              size={32}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              No meals planned for today
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">Today's Menu</Text>
          <MaterialCommunityIcons
            name="food-variant"
            size={24}
            color={theme.colors.primary}
          />
        </View>

        {meals.map((meal, index) => (
          <React.Fragment key={meal.type}>
            <MealSection meal={meal} />
            {index < meals.length - 1 && <Divider style={styles.divider} />}
          </React.Fragment>
        ))}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealSection: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealType: {
    marginLeft: 8,
    fontWeight: '500',
  },
  menuContainer: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  divider: {
    marginVertical: 12,
  },
  noMealContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
});

export default React.memo(TodaysMealCard);
