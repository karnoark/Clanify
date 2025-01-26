// src/components/member/home/RatingCard.tsx
import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { Card } from '@/src/components/common/Card';
import RatingSliderComponent from '@/src/components/member/home/RatingSliderComponent';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
import type { RateableMeal } from '@/src/types/member/meal';

interface RatingCardContentProps {
  meal: RateableMeal;
}

// Separate component for the rating content to optimize rerenders
const RatingCardContent = memo(({ meal }: RatingCardContentProps) => {
  const theme = useTheme();
  const [rating, setRating] = React.useState(3);
  const { rateMeal, isMealsLoading: isSubmitting } = useHomeStore();

  // Handle rating submission with proper error handling
  const handleSubmit = useCallback(async () => {
    try {
      await rateMeal(meal.id, rating);
    } catch (error) {
      // Error is handled by the store and displayed through error state
      console.error('Rating submission failed:', error);
    }
  }, [meal.id, rating, rateMeal]);

  const formattedMealType =
    meal.type.charAt(0).toUpperCase() + meal.type.slice(1);
  const ratingTitle = `Rate Yesterday's ${formattedMealType}`;

  return (
    <>
      <Text
        variant="titleLarge"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        {ratingTitle}
        {/* Rate the meal */}
      </Text>

      <View style={styles.sliderContainer}>
        <RatingSliderComponent
          value={rating}
          onChange={setRating}
          disabled={isSubmitting}
          meal={formattedMealType}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.button}
        buttonColor={theme.colors.primary}
      >
        Submit Rating
      </Button>
    </>
  );
});

RatingCardContent.displayName = 'RatingCardContent';

// Main RatingCard component
const RatingCard = memo(() => {
  const theme = useTheme();

  // Get only the data we need using specific selectors
  const { rateableMeals, isMealsLoading, mealsError } = useHomeStore();

  // Find the first unrated meal
  const unratedMeal = rateableMeals.find(meal => !meal.hasRated);

  // Show loading state when initially loading meals
  if (isMealsLoading && rateableMeals.length === 0) {
    return (
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <View style={styles.messageContainer}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Loading...
          </Text>
        </View>
      </Card>
    );
  }

  // Show error state if there's an error
  if (mealsError) {
    return (
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <View style={styles.messageContainer}>
          <Text style={{ color: theme.colors.error }}>{mealsError}</Text>
        </View>
      </Card>
    );
  }

  // Don't show the card if there are no meals to rate
  if (!unratedMeal) {
    return null;
  }

  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      <RatingCardContent meal={unratedMeal} />
    </Card>
  );
});

RatingCard.displayName = 'RatingCard';

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
  sliderContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
  },
  messageContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default RatingCard;
