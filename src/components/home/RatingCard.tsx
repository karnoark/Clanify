import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// We define meal types that can be rated
interface RateableMeal {
  id: string;
  type: 'lunch' | 'dinner';
  time: string;
  hasRated: boolean;
}

interface RatingCardProps {
  meals: RateableMeal[];
  onSubmitRating: (mealId: string, rating: number) => Promise<void>;
}

// This component shows emojis and text based on rating value
const RatingIndicator: React.FC<{ rating: number }> = ({ rating }) => {
  const theme = useTheme();

  // Helper function to determine rating category and content
  const getRatingContent = useCallback(
    (value: number) => {
      switch (true) {
        case value >= 8:
          return {
            icon: '😋',
            text: 'Excellent!',
            color: theme.colors.primary,
          };
        case value >= 6:
          return {
            icon: '😊',
            text: 'Good',
            color: theme.colors.secondary,
          };
        case value >= 4:
          return {
            icon: '😐',
            text: 'Okay-ish',
            color: theme.colors.tertiary,
          };
        case value >= 2:
          return {
            icon: '😕',
            text: "Didn't like it",
            color: theme.colors.error,
          };
        default:
          return {
            icon: '😫',
            text: 'Worst',
            color: theme.colors.error,
          };
      }
    },
    [theme],
  );

  const content = getRatingContent(rating);

  return (
    <Animated.View
      entering={FadeIn}
      style={[styles.ratingIndicator, { borderColor: content.color }]}
    >
      <Text style={styles.emoji}>{content.icon}</Text>
      <Text
        variant="bodyMedium"
        style={[styles.ratingText, { color: content.color }]}
      >
        {content.text}
      </Text>
    </Animated.View>
  );
};

// Custom slider component for better control and animations
const RatingSlider: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
}> = ({ value, onValueChange }) => {
  const theme = useTheme();
  const sliderWidth = useRef(280).current; // Fixed width for consistency
  const progress = useSharedValue(0);

  // Calculate positions and styles
  const position = useSharedValue(value * (sliderWidth / 10));

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: withSpring(position.value + 15),
  }));

  // Handle slider interaction
  const onSliderPress = useCallback(
    (event: any) => {
      const { locationX } = event.nativeEvent;
      const newValue = Math.max(
        0,
        Math.min(10, Math.round(locationX / (sliderWidth / 10))),
      );
      position.value = withSpring(newValue * (sliderWidth / 10));
      onValueChange(newValue);
    },
    [sliderWidth, position, onValueChange],
  );

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderTrack}>
        <Animated.View
          style={[
            styles.sliderProgress,
            progressStyle,
            { backgroundColor: theme.colors.primary },
          ]}
        />
      </View>
      <Pressable
        onPress={onSliderPress}
        style={[styles.sliderPressable, { width: sliderWidth }]}
      >
        <Animated.View
          style={[
            styles.sliderThumb,
            sliderStyle,
            { backgroundColor: theme.colors.primary },
          ]}
        />
      </Pressable>
      <View style={styles.sliderLabels}>
        <Text variant="bodySmall">0</Text>
        <Text variant="bodySmall">10</Text>
      </View>
    </View>
  );
};

const RatingCard: React.FC<RatingCardProps> = ({ meals, onSubmitRating }) => {
  const theme = useTheme();
  const [selectedMeal, setSelectedMeal] = useState<RateableMeal | null>(null);
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle rating submission
  const handleSubmit = async () => {
    if (!selectedMeal) return;

    setIsSubmitting(true);
    try {
      await onSubmitRating(selectedMeal.id, rating);
      // Reset state after successful submission
      setSelectedMeal(null);
      setRating(5);
    } catch (error) {
      // Handle error
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no meals to rate, don't render anything
  if (!meals.length || meals.every(meal => meal.hasRated)) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">Rate Your Meal</Text>
          <MaterialCommunityIcons
            name="star-outline"
            size={24}
            color={theme.colors.primary}
          />
        </View>

        {!selectedMeal ? (
          <View style={styles.mealSelection}>
            <Text variant="bodyMedium" style={styles.promptText}>
              Which meal would you like to rate?
            </Text>
            {meals
              .filter(meal => !meal.hasRated)
              .map(meal => (
                <Button
                  key={meal.id}
                  mode="outlined"
                  onPress={() => setSelectedMeal(meal)}
                  style={styles.mealButton}
                >
                  {`${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} - ${
                    meal.time
                  }`}
                </Button>
              ))}
          </View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.ratingContainer}>
            <Text variant="bodyLarge" style={styles.mealTitle}>
              {selectedMeal.type.charAt(0).toUpperCase() +
                selectedMeal.type.slice(1)}{' '}
              - {selectedMeal.time}
            </Text>

            <RatingIndicator rating={rating} />
            <RatingSlider value={rating} onValueChange={setRating} />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setSelectedMeal(null)}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.button}
              >
                Submit Rating
              </Button>
            </View>
          </Animated.View>
        )}
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
  mealSelection: {
    alignItems: 'stretch',
  },
  promptText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  mealButton: {
    marginVertical: 4,
    borderRadius: 8,
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  mealTitle: {
    marginBottom: 16,
    fontWeight: '500',
  },
  ratingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 24,
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  ratingText: {
    fontWeight: '500',
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
  },
  sliderTrack: {
    width: 280,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderProgress: {
    height: '100%',
    borderRadius: 2,
  },
  sliderPressable: {
    height: 44,
    justifyContent: 'center',
    marginTop: -22,
  },
  sliderThumb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    elevation: 4,
  },
  sliderLabels: {
    width: 280,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  button: {
    borderRadius: 8,
    minWidth: 120,
  },
});

export default React.memo(RatingCard);
