import { BlurMask, Canvas, Path, Skia } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
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

const startColors = [
  'rgba(230, 72, 10, 0.4)', // Red
  'rgba(34,193,195,0.4)', // Teal
  'rgba(34, 37, 195, 0.4)', // Blue
  'rgba(228, 232, 10, 0.4)', // Yellow
  'rgba(31, 255, 1, 0.4)', // Green
];

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Get window dimensions for responsive sizing
const { width: WINDOW_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const CANVAS_WIDTH = WINDOW_WIDTH - CARD_PADDING * 4; // Account for card and screen padding
const CANVAS_HEIGHT = 120;
const KNOB_RADIUS = 15;

const RatingSliderComponent = () => {
  const theme = useTheme();

  const width = CANVAS_WIDTH;
  const height = CANVAS_HEIGHT;
  const strokeWidth = 10;
  const moverHeight = 30;
  const moverWidth = 30;
  const progress = useSharedValue(0.5);
  const pathStartX = moverWidth / 2;
  const pathStartY = height / 2;
  const pathEndX = width - moverWidth / 2;
  const pathEndY = height / 2;
  const pathLength = pathEndX - pathStartX;
  const moverPositionY = height / 2 - moverHeight / 2;

  const straightPath = useMemo(() => {
    const skPath = Skia.Path.Make();
    skPath.moveTo(pathStartX, pathStartY); // Start at pathStartX
    skPath.lineTo(pathEndX, pathEndY);
    return skPath;
  }, []);

  const gesture = Gesture.Pan()
    .onChange(e => {
      const progressChange = e.changeX / pathLength;
      const newProgress = progress.value + progressChange;
      progress.value = Math.min(Math.max(newProgress, 0), 1);
      console.log('progress value:', progress.value);
    })
    .onEnd(e => {
      const velocityProgress = e.velocityX / pathLength;
      progress.value = withDecay({
        velocity: velocityProgress,
        clamp: [0, 1],
      });
    });

  const dynamicColors = useDerivedValue(() => {
    return interpolateColor(
      progress.value,
      [0, 0.2, 0.5, 0.7, 1], // Match the number of colors
      startColors,
    );
  });

  const review = useDerivedValue(() => {
    if (progress.value < 0.2) return 'Awful';
    if (progress.value < 0.4) return 'Bad';
    if (progress.value < 0.6) return 'Ok';
    if (progress.value < 0.8) return 'Good';
    return 'Great';
  });

  const opacityValue = useSharedValue(1); // Initial opacity

  useAnimatedReaction(
    () => review.value, // Track changes in the review text
    (currentReview, previousReview) => {
      if (currentReview !== previousReview) {
        // Trigger opacity animation when text changes
        opacityValue.value = withSequence(
          withTiming(0.3, { duration: 300 }), // Fade out
          withTiming(1, { duration: 300 }), // Fade in
        );
      }
    },
  );

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
  }));

  const hasInteracted = useSharedValue(false);

  // Detect first interaction (when progress changes from initial 0.5)
  useAnimatedReaction(
    () => progress.value,
    currentProgress => {
      if (!hasInteracted.value && currentProgress !== 0.5) {
        hasInteracted.value = true;
      }
    },
  );

  // Animate text rating container opacity
  const textRatingStyle = useAnimatedStyle(() => ({
    opacity: hasInteracted.value ? withTiming(1) : withTiming(0),
  }));

  const animatedText = useAnimatedProps(() => {
    return {
      text: review.value,
      defaultValue: '',
    };
  });

  const rStyle = useAnimatedStyle(() => {
    const xPosition = pathStartX + progress.value * pathLength;
    return {
      position: 'absolute',
      left: xPosition - moverWidth / 2, // Center the knob on the path
      top: moverPositionY,
      width: moverWidth,
      height: moverHeight,
      borderRadius: moverWidth / 2,
      backgroundColor: '#80bfff',
    };
  });

  return (
    <View
      style={{
        // borderWidth: 3,
        // borderColor: 'pink',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Canvas style={{ width, height }}>
        <Path
          path={straightPath}
          style={'stroke'}
          strokeWidth={strokeWidth}
          color={dynamicColors}
          strokeCap={'round'}
        />
        <BlurMask blur={4} style={'solid'} />
      </Canvas>
      <GestureDetector gesture={gesture}>
        <Animated.View style={rStyle} />
      </GestureDetector>
      <Animated.View style={[styles.textRating, textRatingStyle]}>
        <AnimatedTextInput
          editable={false}
          underlineColorAndroid={'transparent'}
          style={[
            {
              fontSize: 20,
              // fontWeight: 'bold',
              color: '#fff',
              textAlign: 'center',
              borderRadius: 30,
              backgroundColor: theme.colors.background,
              width: 100,
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
    left: CANVAS_WIDTH / 2 - 4 * CARD_PADDING, // Center horizontally
    top: -30, // Place below the slider
    // width: 80, // Fixed width
    // borderWidth: 3,
    borderRadius: 1,
    margin: 10,
    marginBottom: 20,
    // borderColor: 'pink',
    // backgroundColor: 'pink',
  },
});
