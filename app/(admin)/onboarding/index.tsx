// This is the main onboarding screen that guides new mess administrators through the setup process.
// It implements a step-by-step interface with smooth animations and clear progress indicators.
// The screen follows Material Design principles and provides immediate feedback on user actions.

import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Alert } from 'react-native';
import { ActivityIndicator, Surface, useTheme } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ValidationErrors } from '@/src/components/admin/onboarding/ValidationErrors';
import { Pdstyles } from '@/src/constants/Styles';
import { useAuthStore } from '@/src/store/auth';

import { ContactStep } from './steps/ContactStep';
import { LocationStep } from './steps/LocationStep';
import { MediaStep } from './steps/MediaStep';
import { MessDetailsStep } from './steps/MessDetailsStep';
import { TimingStep, validateTimeRange } from './steps/TimingStep';
import { StepNavigation } from '../../../src/components/admin/onboarding/StepNavigation';
import type {
  MessContact,
  MessDetails,
  MessLocation,
  MessMedia,
  MessTiming,
  OnboardingStepId} from '../../../src/store/onboardingStore';
import {
  initializeOnboarding,
  useOnboardingStore,
} from '../../../src/store/onboardingStore';

// Get the screen width for animations
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper type for validation functions
type ValidationFunction<T> = (data: Partial<T>) => string[];

// First, let's define the base props that all step components will receive
interface BaseStepProps {
  onDataChange?: (data: any) => void;
  // Add any other common props here
}

// Create a union type of all possible step data types
type StepData =
  | MessDetails
  | MessLocation
  | MessContact
  | MessTiming
  | MessMedia;

// Define a type for each onboarding step
type OnboardingStep<T extends StepData> = {
  id: OnboardingStepId;
  title: string;
  description: string;
  component: React.ComponentType<BaseStepProps & { data?: T }>; // Adjust based on your component typing
  validate: ValidationFunction<T>;
};

// Define step information for our onboarding flow
const ONBOARDING_STEPS: readonly [
  OnboardingStep<MessDetails>,
  OnboardingStep<MessLocation>,
  OnboardingStep<MessContact>,
  OnboardingStep<MessTiming>,
  OnboardingStep<MessMedia>,
] = [
  {
    id: 'mess_details',
    title: 'Basic Information',
    description: 'Tell us about your mess business',
    component: MessDetailsStep,
    validate: (data: Partial<MessDetails>) => {
      const errors: string[] = [];
      if (!data.name) errors.push('Name is required');
      if (!data.description) errors.push('Description is required');
      if (!data.type) errors.push('Type selection is required');
      if (!data.capacity) errors.push('Capacity is required');
      if (!data.monthlyRate) errors.push('Monthly rate is required');
      return errors;
    },
  },
  {
    id: 'location_details',
    title: 'Location',
    description: 'Help customers find you easily',
    component: LocationStep,
    validate: (data: Partial<MessLocation>) => {
      const errors: string[] = [];
      if (!data.coordinates?.latitude)
        errors.push('Location coordinates are required');
      if (!data.address?.street) errors.push('Street address is required');
      if (!data.address?.city) errors.push('City is required');
      return errors;
    },
  },
  {
    id: 'contact_details',
    title: 'Contact Details',
    description: 'How customers can reach you',
    component: ContactStep,
    validate: (data: Partial<MessContact>) => {
      const errors: string[] = [];
      if (!data.phone) errors.push('Phone number is required');
      if (!data.email) errors.push('Email is required');
      return errors;
    },
  },
  {
    id: 'timing_details',
    title: 'Operating Hours',
    description: 'Set your serving schedule',
    component: TimingStep,
    validate: (data: Partial<MessTiming>) => {
      const errors: string[] = [];

      // If weeklySchedule is missing entirely, that's an error
      if (!data.weeklySchedule) {
        errors.push('Operating hours schedule is required');
        return errors;
      }

      // Validate each day's timings
      Object.entries(data.weeklySchedule).forEach(([day, schedule]) => {
        // Validate lunch if it's open
        if (!schedule.lunch.isClosed) {
          if (!schedule.lunch.start || !schedule.lunch.end) {
            errors.push(
              `${day.charAt(0).toUpperCase() + day.slice(1)}: Lunch timings are required when service is open`,
            );
          } else {
            // Validate time range
            const validation = validateTimeRange(
              schedule.lunch.start,
              schedule.lunch.end,
            );
            if (!validation.isValid) {
              errors.push(
                `${day.charAt(0).toUpperCase() + day.slice(1)} lunch: ${validation.error}`,
              );
            }
          }
        }

        // Validate dinner if it's open
        if (!schedule.dinner.isClosed) {
          if (!schedule.dinner.start || !schedule.dinner.end) {
            errors.push(
              `${day.charAt(0).toUpperCase() + day.slice(1)}: Dinner timings are required when service is open`,
            );
          } else {
            // Validate time range
            const validation = validateTimeRange(
              schedule.dinner.start,
              schedule.dinner.end,
            );
            if (!validation.isValid) {
              errors.push(
                `${day.charAt(0).toUpperCase() + day.slice(1)} dinner: ${validation.error}`,
              );
            }
          }
        }
      });
      return errors;
    },
  },
  {
    id: 'media_files',
    title: 'Photos & Documents',
    description: 'Show your mess to potential customers',
    component: MediaStep,
    validate: (data: Partial<MessMedia>) => {
      const errors: string[] = [];
      // Media validation is optional
      return errors;
    },
  },
] as const;

export default function OnboardingScreen() {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const {
    isInitialized,
    currentStep,
    completedSteps,
    messDetails,
    location,
    contact,
    timing,
    media,
    errors,
    setCurrentStep,
    markStepComplete,
    setError,
    clearError,
    saveStepData,
    completeOnboarding,
  } = useOnboardingStore();

  const [validationDialogVisible, setValidationDialogVisible] = useState(false);

  const { user, session } = useAuthStore();

  useEffect(() => {
    // Only initialize onboarding if we have an authenticated user
    if (user?.email) {
      initializeOnboarding();
    }
  }, [user?.email]);

  // Get current step data based on step index
  const getCurrentStepData = useCallback(() => {
    switch (currentStep) {
      case 0:
        return messDetails;
      case 1:
        return location;
      case 2:
        return contact;
      case 3:
        return timing;
      case 4:
        return media;
      default:
        return {};
    }
  }, [currentStep, messDetails, location, contact, timing, media]);

  // Handle next step navigation
  const validationErrorsRef = useRef<string[] | null>(null);

  const handleNext = useCallback(async () => {
    setLoading(true);
    try {
      const currentStepConfig = ONBOARDING_STEPS[currentStep];
      const stepData = getCurrentStepData();

      // Validate current step & Store the validation errors in the reference
      validationErrorsRef.current = currentStepConfig.validate(stepData) ?? [];

      if (
        validationErrorsRef.current &&
        validationErrorsRef.current.length > 0
      ) {
        validationErrorsRef.current.forEach(error =>
          setError(currentStepConfig.id, error),
        );
        // Alert.alert('You have left something incomplete or inaccurate');
        setValidationDialogVisible(true);
        return;
      }

      // Clear any existing errors
      clearError(currentStepConfig.id);

      // Save step data to Supabase
      await saveStepData(currentStepConfig.id);

      // Mark current step as complete
      markStepComplete(currentStep);

      // If this is the last step, finish onboarding
      if (currentStep === ONBOARDING_STEPS.length - 1) {
        try {
          await completeOnboarding();
          // Navigate to verification status screen
          router.replace('/(admin)/onboarding/verificationStatus');
          return;
        } catch (error) {
          console.error('Error completing onboarding:', error);
          Alert.alert(
            'Error',
            'Failed to complete onboarding. Please try again.',
          );
          return;
        }
      }

      // Move to next step
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error processing step:', error);
      Alert.alert('Error', 'Failed to save your progress. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    currentStep,
    getCurrentStepData,
    setError,
    clearError,
    markStepComplete,
    setCurrentStep,
    saveStepData,
    completeOnboarding,
  ]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, setCurrentStep]);

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

  if (!isInitialized) {
    return (
      <View style={Pdstyles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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

        {/* Steps content */}
        <View style={styles.content}>
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
        </View>

        {/* Navigation */}
        <StepNavigation
          onNext={handleNext}
          onBack={currentStep > 0 ? handleBack : undefined}
          isLastStep={currentStep === ONBOARDING_STEPS.length - 1}
          loading={loading}
        />

        {/* Add ValidationErrors component */}
        <ValidationErrors
          errors={errors}
          visible={validationDialogVisible}
          onDismiss={() => setValidationDialogVisible(false)}
          title="Please Complete These Items"
        />
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
  content: {
    flex: 1,
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
