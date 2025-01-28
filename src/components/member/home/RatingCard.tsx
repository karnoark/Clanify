// src/components/member/home/RatingCard.tsx
//TODO Couldn't debug this issue:  when I submit the rating of the first unrated meal, the component disappears instead of showing me second unrated meal. I think

import { format } from 'date-fns';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View, Animated } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { Card } from '@/src/components/common/Card';
import RatingSliderComponent from '@/src/components/member/home/RatingSliderComponent';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
import type { RateableMeal } from '@/src/types/member/meal';

interface RatingCardContentProps {
  meal: RateableMeal;
  onRatingSubmitted: () => void;
  style?: Animated.WithAnimatedObject<ViewStyle>; // For animated styles
}

const RatingCardContent = memo(
  ({ meal, onRatingSubmitted, style }: RatingCardContentProps) => {
    const theme = useTheme();
    const [rating, setRating] = React.useState(3);
    const { rateMeal, isMealsLoading: isSubmitting } = useHomeStore();
    const [isRetrying, setIsRetrying] = React.useState(false);
    const lastRatingRef = useRef(rating);

    // Store the last successful rating attempt
    React.useEffect(() => {
      if (!isSubmitting) {
        lastRatingRef.current = rating;
      }
    }, [isSubmitting, rating]);

    const handleSubmit = useCallback(async () => {
      try {
        setIsRetrying(false);
        await rateMeal(meal.id, rating);
        console.log(`rating of ${meal.id} is given ${rating}`);
        onRatingSubmitted();
      } catch (error) {
        console.error('Rating submission failed:', error);
        setIsRetrying(true);
      }
    }, [meal.id, rating, rateMeal, onRatingSubmitted]);

    const handleRetry = useCallback(() => {
      // Restore the last attempted rating
      setRating(lastRatingRef.current);
      setIsRetrying(false);
    }, []);

    const formattedMealType =
      meal.type.charAt(0).toUpperCase() + meal.type.slice(1);
    const formattedDate = format(meal.date, 'do MMMM yyyy');
    const ratingTitle = `Rate the ${formattedMealType} on ${formattedDate}`;

    return (
      <Animated.View style={style}>
        <View style={styles.sliderContainer}>
          <RatingSliderComponent
            value={rating}
            onChange={setRating}
            disabled={isSubmitting}
            ratingTitle={ratingTitle}
          />
        </View>

        {isRetrying ? (
          <View style={styles.retryContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              Failed to submit rating. Please try again.
            </Text>
            <Button
              mode="contained"
              onPress={handleRetry}
              style={styles.retryButton}
              buttonColor={theme.colors.primary}
            >
              Retry
            </Button>
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
            buttonColor={theme.colors.primary}
            accessibilityLabel="Submit meal rating"
            accessibilityHint="Double tap to submit your rating for this meal"
          >
            Submit Rating
          </Button>
        )}
      </Animated.View>
    );
  },
);

RatingCardContent.displayName = 'RatingCardContent';

const RatingCard = memo(() => {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [currentMealIndex, setCurrentMealIndex] = React.useState(0);

  const { rateableMeals, isMealsLoading, mealsError, updateRateableMeals } =
    useHomeStore();

  // Get unrated meals with proper memoization
  const unratedMeals = React.useMemo(
    () => rateableMeals.filter(meal => !meal.hasRated),
    [rateableMeals],
  );

  console.log('unratedMeals: ', unratedMeals);

  const handleRatingSubmitted = useCallback(() => {
    // Animate out current meal
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentMealIndex(0);
    });
  }, [fadeAnim]);

  // Show loading state when initially loading meals
  if (isMealsLoading && rateableMeals.length === 0) {
    return (
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <View style={styles.messageContainer}>
          <Text
            style={{ color: theme.colors.onSurfaceVariant }}
            accessibilityLabel="Loading meals"
          >
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
          <Text
            style={{ color: theme.colors.error }}
            accessibilityLabel={`Error: ${mealsError}`}
          >
            {mealsError}
          </Text>
        </View>
      </Card>
    );
  }

  // Don't show the card if there are no unrated meals left
  if (unratedMeals.length === 0 || currentMealIndex >= unratedMeals.length) {
    return null;
  }

  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      <RatingCardContent
        key={unratedMeals[currentMealIndex]?.id}
        meal={unratedMeals[currentMealIndex]}
        onRatingSubmitted={handleRatingSubmitted}
        style={{ opacity: fadeAnim }}
      />
    </Card>
  );
});

RatingCard.displayName = 'RatingCard';

const styles = StyleSheet.create({
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
  retryContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
  },
});

export default RatingCard;
