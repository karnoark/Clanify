// src/components/home/RatingCard.tsx
import {
  Canvas,
  Circle,
  Group,
  Path,
  vec,
  Skia,
  Text as SkiaText,
  matchFont,
  FontSlant,
  FontStyle,
} from '@shopify/react-native-skia';
import React, { memo, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  Text as RNText,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Text, Button, useTheme } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useDerivedValue,
  withTiming,
  runOnJS,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { Card } from '@/src/components/common/Card';
import RatingSliderComponent from '@/src/components/member/home/RatingSliderComponent';

const RatingCard = memo(() => {
  const theme = useTheme();
  const [rating, setRating] = React.useState(3);
  console.log('1');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement rating submission
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <Card style={{ backgroundColor: theme.colors.inverseOnSurface }}>
      {/* <Text
        variant="titleLarge"
        style={[
          styles.title,
          {
            color: theme.colors.onSurface,
          },
        ]}
      >
        Rate The Meal
      </Text> */}
      {/* <Text
        variant="titleMedium"
        style={[
          styles.subtitle,
          {
            color: theme.colors.onSurfaceVariant,
          },
        ]}
      >
        Yesterday's Dinner
      </Text> */}

      <View style={styles.sliderContainer}>
        {/* <RatingSlider value={rating} onChange={setRating} /> */}
        <RatingSliderComponent />
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
    </Card>
  );
});

export default RatingCard;

RatingCard.displayName = 'RatingCard';

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  sliderContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },

  button: {
    marginTop: 16,
  },
});
