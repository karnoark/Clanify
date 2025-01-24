import { BlurMask, Canvas, Path, Skia } from '@shopify/react-native-skia';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions, TextInput } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Card } from '@/src/components/common/Card';
import { CustomTheme } from '@/src/types/theme';

const startColors = [
  'rgba(230, 72, 10, 0.4)', // Red
  'rgba(34,193,195,0.4)', // Teal
  'rgba(34, 37, 195, 0.4)', // Blue
  'rgba(228, 232, 10, 0.4)', // Yellow
  'rgba(31, 255, 1, 0.4)', // Green
];

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedCanvas = Animated.createAnimatedComponent(Canvas);

// Get window dimensions for responsive sizing
const { width: WINDOW_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const BASE_CANVAS_WIDTH = WINDOW_WIDTH - CARD_PADDING * 4; // Account for card and screen padding
const COMPACT_WIDTH_FACTOR = 0.7; // Slider will be 70% of full width when not interacted
const BASE_CANVAS_HEIGHT = 120;
const COMPACT_HEIGHT = 80; // Smaller height when not interacted
const BASE_KNOB_RADIUS = 15;
const COMPACT_KNOB_RADIUS = 10; // Smaller knob when not interacted

const RatingSliderComponent = () => {
  const theme = useTheme<CustomTheme>();

  // Animated values for dimensions
  const progress = useSharedValue(0.5);
  const hasInteracted = useSharedValue(false);

  // Animate canvas width based on interaction
  const canvasWidth = useDerivedValue(() => {
    return withTiming(
      hasInteracted.value
        ? BASE_CANVAS_WIDTH
        : BASE_CANVAS_WIDTH * COMPACT_WIDTH_FACTOR,
      { duration: 300 },
    );
  });

  // Animate canvas height based on interaction
  const canvasHeight = useDerivedValue(() => {
    return withTiming(
      hasInteracted.value ? BASE_CANVAS_HEIGHT : COMPACT_HEIGHT,
      { duration: 300 },
    );
  });

  // Animate knob dimensions based on interaction
  const knobRadius = useDerivedValue(() => {
    return withTiming(
      hasInteracted.value ? BASE_KNOB_RADIUS : COMPACT_KNOB_RADIUS,
      { duration: 300 },
    );
  });

  // Derived values for path calculations
  const pathStartX = useDerivedValue(() => knobRadius.value);
  const pathEndX = useDerivedValue(() => canvasWidth.value - knobRadius.value);
  const pathLength = useDerivedValue(() => pathEndX.value - pathStartX.value);

  // Create animated path
  const animatedPath = useDerivedValue(() => {
    const skPath = Skia.Path.Make();
    const centerY = canvasHeight.value / 2;
    skPath.moveTo(pathStartX.value, centerY);
    skPath.lineTo(pathEndX.value, centerY);
    return skPath;
  });

  // Pan gesture handler
  const gesture = Gesture.Pan()
    .onChange(e => {
      const progressChange = e.changeX / pathLength.value;
      const newProgress = progress.value + progressChange;
      progress.value = Math.min(Math.max(newProgress, 0), 1);

      if (!hasInteracted.value) {
        hasInteracted.value = true;
      }
    })
    .onEnd(e => {
      const velocityProgress = e.velocityX / pathLength.value;
      progress.value = withDecay({
        velocity: velocityProgress,
        clamp: [0, 1],
      });
    });

  // Color interpolation based on progress and interaction state
  const sliderColor = useDerivedValue(() => {
    // When not interacted, use primary color
    if (!hasInteracted.value) {
      return theme.colors.primary;
    }

    // After interaction, interpolate between rating colors
    return interpolateColor(
      progress.value,
      [0, 0.25, 0.5, 0.75, 1],
      startColors,
    );
  });

  const animatedTextFont = useDerivedValue(() => {
    if (hasInteracted.value) {
      return 20;
    } else {
      return 15;
    }
  });

  const animatedTextBackground = useDerivedValue(() => {
    if (hasInteracted.value) {
      return theme.colors.background;
    } else {
      return 'transparent';
    }
  });

  // Animated styles for the Canvas
  const canvasStyle = useAnimatedStyle(() => ({
    width: canvasWidth.value,
    height: canvasHeight.value,
  }));

  // Animated position and size for the knob
  const knobStyle = useAnimatedStyle(() => {
    const xPosition = pathStartX.value + progress.value * pathLength.value;
    return {
      position: 'absolute',
      left: xPosition - knobRadius.value,
      top: canvasHeight.value / 2 - knobRadius.value,
      width: knobRadius.value * 2,
      height: knobRadius.value * 2,
      borderRadius: knobRadius.value,
      backgroundColor: sliderColor.value,
      transform: [
        {
          scale: withTiming(hasInteracted.value ? 1 : 0.8, { duration: 300 }),
        },
      ],
    };
  });

  const strokeWidth = useDerivedValue(() => {
    return withTiming(hasInteracted.value ? 10 : 6, {
      duration: 300, // Match the duration of other animations for consistency
    });
  });

  const displayText = useDerivedValue(() => {
    if (!hasInteracted.value) {
      return "How was yesterday's dinner?";
    }

    // Return the appropriate review text based on progress
    if (progress.value < 0.2) return 'Awful';
    if (progress.value < 0.4) return 'Bad';
    if (progress.value < 0.6) return 'Ok';
    if (progress.value < 0.8) return 'Good';
    return 'Great';
  });

  const textOpacity = useSharedValue(1); // Start visible

  // Watch for text changes to animate opacity
  useAnimatedReaction(
    () => displayText.value,
    (current, previous) => {
      if (current !== previous) {
        textOpacity.value = withSequence(
          withTiming(0.3, { duration: 150 }), // Fade out faster
          withTiming(1, { duration: 150 }), // Fade in faster
        );
      }
    },
  );

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      {
        scale: withTiming(hasInteracted.value ? 1 : 0.95, { duration: 200 }),
      },
    ],
    width: hasInteracted.value ? 80 : 300,
  }));

  // Update the animated props to use our new display text
  const animatedText = useAnimatedProps(() => ({
    text: displayText.value,
    defaultValue: "How was yesterday's dinner?",
  }));

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <AnimatedCanvas style={canvasStyle}>
        <Path
          path={animatedPath}
          style={'stroke'}
          strokeWidth={strokeWidth}
          color={sliderColor}
          strokeCap={'round'}
        />
        <BlurMask blur={4} style={'solid'} />
      </AnimatedCanvas>
      <GestureDetector gesture={gesture}>
        <Animated.View style={knobStyle} />
      </GestureDetector>
      <Animated.View style={styles.textRating}>
        <AnimatedTextInput
          editable={false}
          underlineColorAndroid={'transparent'}
          style={[
            {
              fontSize: animatedTextFont,
              color: hasInteracted.value
                ? theme.colors.onSurface
                : theme.colors.onSurfaceVariant,
              textAlign: 'center',
              borderRadius: 30,
              backgroundColor: animatedTextBackground,
              padding: 10,
            },
            textAnimatedStyle,
          ]}
          animatedProps={animatedText}
        />
      </Animated.View>
    </View>
  );
};

export default RatingSliderComponent;

const styles = StyleSheet.create({
  textRating: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -30, // Adjust this value to position the text above the slider
    alignItems: 'center',
    justifyContent: 'center',
  },
});
