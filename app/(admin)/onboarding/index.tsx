// This is the main onboarding screen that guides new mess administrators through the setup process.
// It implements a step-by-step interface with smooth animations and clear progress indicators.
// The screen follows Material Design principles and provides immediate feedback on user actions.

import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContactStep } from './steps/ContactStep';
import { LocationStep } from './steps/LocationStep';
import { MediaStep } from './steps/MediaStep';
import { MessDetailsStep } from './steps/MessDetailsStep';
import { TimingStep } from './steps/TimingStep';
import { useOnboardingStore } from './store/onboardingStore';

// Get the screen width for animations
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define step information for our onboarding flow
const ONBOARDING_STEPS = [
  {
    id: 'details',
    title: 'Basic Information',
    description: 'Tell us about your mess business',
    component: MessDetailsStep,
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Help customers find you easily',
    component: LocationStep,
  },
  {
    id: 'contact',
    title: 'Contact Details',
    description: 'How customers can reach you',
    component: ContactStep,
  },
  {
    id: 'timing',
    title: 'Operating Hours',
    description: 'Set your serving schedule',
    component: TimingStep,
  },
  {
    id: 'media',
    title: 'Photos & Documents',
    description: 'Show your mess to potential customers',
    component: MediaStep,
  },
] as const;

export default function OnboardingScreen() {
  const theme = useTheme();
  const currentStep = useOnboardingStore(state => state.currentStep);
  const completedSteps = useOnboardingStore(state => state.completedSteps);

  // Calculate progress for the progress bar
  const progress = completedSteps.length / ONBOARDING_STEPS.length;

  // Create animated style for the progress bar
  const progressBarStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100}%`, {
      damping: 20,
      stiffness: 90,
    }),
  }));

  // Create animated style for the step container
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(-currentStep * SCREEN_WIDTH, {
          damping: 20,
          stiffness: 90,
        }),
      },
    ],
  }));

  // Create opacity and scale animations for each step
  const createStepStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const isActive = index === currentStep;

      const opacity = interpolate(
        currentStep,
        [index - 1, index, index + 1],
        [0.5, 1, 0.5],
      );

      const scale = interpolate(
        currentStep,
        [index - 1, index, index + 1],
        [0.8, 1, 0.8],
      );

      return {
        opacity: withSpring(opacity),
        transform: [{ scale: withSpring(scale) }],
        zIndex: isActive ? 1 : 0,
      };
    });
  };

  return (
    <Surface style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBackground,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                progressBarStyle,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          </View>
        </View>

        {/* Step content */}
        <Animated.View style={[styles.stepsContainer, containerStyle]}>
          {ONBOARDING_STEPS.map((step, index) => (
            <Animated.View
              key={step.id}
              style={[styles.stepContent, createStepStyle(index)]}
            >
              <step.component />
            </Animated.View>
          ))}
        </Animated.View>
      </SafeAreaView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  progressBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepsContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * ONBOARDING_STEPS.length,
  },
  stepContent: {
    width: SCREEN_WIDTH,
    padding: 16,
  },
});
