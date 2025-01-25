// src/components/home/MembershipStatusCard.tsx
import { Ionicons } from '@expo/vector-icons';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  Group,
  BackdropFilter,
  Blur,
} from '@shopify/react-native-skia';
import { differenceInDays, format } from 'date-fns';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Text as RNText,
  ProgressBar as PaperProgressBar,
  useTheme,
  Button,
} from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import {
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Card } from '@/src/components/common/Card';
import { Text } from '@/src/components/common/Text';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
import { CustomTheme } from '@/src/types/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;
const CARD_HEIGHT = 140;
const EXPIRED_CARD_HEIGHT = 350;
const PROGRESS_HEIGHT = 6;

/**
 * A custom progress bar that uses Skia for smooth rendering
 */
const ProgressBar = ({ progress }: { progress: number }) => {
  // Animated progress value
  const animatedProgress = useSharedValue(0);

  // Animate progress changes
  React.useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 8, // Controls the bounciness (higher = less bounce)
      stiffness: 30, // Controls the speed of the spring
      mass: 3, // Adjusts the heaviness of the animation
      restDisplacementThreshold: 0.01, // Minimum displacement before stopping
      restSpeedThreshold: 0.01, // Minimum speed before stopping
    });
  }, [progress, animatedProgress]);

  // Compute the width of the progress bar based on animated value
  const progressWidth = useDerivedValue(
    () => CARD_WIDTH * animatedProgress.value,
    [animatedProgress],
  );

  return (
    <Group>
      {/* Background track */}
      <RoundedRect
        x={0}
        y={0}
        width={CARD_WIDTH - 32} // Accounting for card padding
        height={PROGRESS_HEIGHT}
        r={PROGRESS_HEIGHT / 2}
        color="rgba(255, 255, 255, 0.2)"
      />

      {/* Progress fill */}
      <RoundedRect
        x={0}
        y={0}
        width={progressWidth}
        height={PROGRESS_HEIGHT}
        r={PROGRESS_HEIGHT / 2}
        color="rgba(255, 255, 255, 0.9)"
      />
    </Group>
  );
};

// Content component to avoid duplication
const CardContent = ({
  isLoading,
  progress,
  daysRemaining,
}: {
  isLoading: boolean;
  progress: number;
  daysRemaining: number;
}) => {
  console.log('CardContent isLoading: ', isLoading);
  console.log('CardContent progress: ', progress);
  console.log('CardContent daysRemaining: ', daysRemaining);
  return (
    <View style={styles.content}>
      <Text variant="titleLarge" style={styles.title}>
        Active Membership
      </Text>

      <View style={styles.progressContainer}>
        <Canvas style={styles.progressCanvas}>
          <ProgressBar progress={isLoading ? 0 : progress} />
        </Canvas>
      </View>

      <Text style={styles.daysText}>{daysRemaining} days remaining</Text>
    </View>
  );
};

const ExpiredMembershipContent = () => {
  const theme = useTheme<CustomTheme>();
  const { membershipExpiry, sendRequestToRenewMembership, renewalRequest } =
    useHomeStore();

  const [selectedRenewalDate, setSelectedRenewalDate] = useState<Date | null>();

  const [isRenewing, setIsRenewing] = useState<boolean>(false);

  const [renewalError, setRenewalError] = useState<string | null>(null);

  //todo fetch the requestHasBeenSent from backend with more details such as from date.
  const [requestHasBeenSent, setRequestHasBeenSent] = useState<boolean>(false);

  // Calculate the default renewal date (day after expiry)
  const getDefaultRenewalDate = () => {
    if (!membershipExpiry) return new Date();
    const nextDay = new Date(membershipExpiry);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  };

  // Initialize date picker with default date when component mounts
  React.useEffect(() => {
    if (!selectedRenewalDate) {
      setSelectedRenewalDate(getDefaultRenewalDate());
    }
  }, []);

  // Handle renewal request
  const handleRenewal = async () => {
    if (!selectedRenewalDate) return;

    try {
      setIsRenewing(true);
      setRenewalError(null);

      await sendRequestToRenewMembership(selectedRenewalDate);
      //simulate the api response
      // Simulate an API request with a delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // tells user that request has been sent
      setRequestHasBeenSent(true);

      // Clear form state after successful renewal
      // setSelectedRenewalDate(null);
    } catch (error) {
      setRenewalError(
        error instanceof Error ? error.message : 'Failed to renew membership',
      );
    } finally {
      setIsRenewing(false);
    }
  };

  useEffect(() => {
    console.log('isRenewing: ', isRenewing);
  }, [isRenewing]);

  return (
    // <View style={styles.expiredContent}>
    <View
      style={[
        styles.expiredContainer,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      {/* Expired status header */}
      <View style={styles.expiredHeader}>
        <Ionicons name="alert-circle" size={32} color={theme.colors.primary} />
        <Text variant="titleMedium" style={styles.expiredTitle}>
          Membership Expired
        </Text>
      </View>

      {/* Expiry date information */}
      <Text style={styles.expiryInfo}>
        Your membership expired on{'\n'}
        <Text style={styles.expiryDate}>
          {membershipExpiry
            ? format(membershipExpiry, 'MMMM d, yyyy')
            : 'unknown date'}
        </Text>
      </Text>

      {/* Date picker section */}
      <View style={styles.datePickerContainer}>
        <Text style={styles.datePickerLabel}>Resume membership from:</Text>
        <DatePickerInput
          locale="en"
          value={selectedRenewalDate ?? undefined}
          onChange={date => {
            if (date) {
              setSelectedRenewalDate(date);
            }
          }}
          inputMode="start"
          mode="flat"
          startYear={2024}
          endYear={2025}
          style={[
            styles.datePicker,
            {
              borderColor: theme.colors.onBackground,
              backgroundColor: theme.colors.surface,
            },
          ]}
          outlineStyle={styles.datePickerOutline}
          disabled={isRenewing}
        />
      </View>

      {/* Error message */}
      {renewalError && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {renewalError}
        </Text>
      )}

      {/* Period information */}
      <Text style={styles.periodInfo}>Membership Period is 30 days</Text>

      {/* Renewal button */}
      {renewalRequest?.result === 'pending' ? (
        <Text
          style={{ margin: 20, textAlign: 'center', color: theme.colors.pr70 }}
        >
          Request has been sent to Mess Operator for your membership.
        </Text>
      ) : (
        <Button
          mode="contained"
          onPress={handleRenewal}
          loading={isRenewing}
          disabled={isRenewing || !selectedRenewalDate}
          style={styles.renewButton}
          contentStyle={styles.buttonContent}
        >
          Renew Membership
        </Button>
      )}
    </View>
  );
};

const ActiveMembershipContent = ({
  isLoading,
  progress,
  daysRemaining,
}: {
  isLoading: boolean;
  progress: number;
  daysRemaining: number;
}) => {
  const theme = useTheme<CustomTheme>();
  return (
    <View style={[styles.container]}>
      {/* Skia Canvas for gradient background */}
      <Canvas style={StyleSheet.absoluteFill}>
        <RoundedRect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} r={16}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(CARD_WIDTH, 0)}
            colors={[theme.colors.pr40, theme.colors.pr60, theme.colors.pr80]}
            positions={[0, 0.7, 1]}
          />
        </RoundedRect>
      </Canvas>
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Active Membership
        </Text>

        <View style={styles.progressContainer}>
          <Canvas style={styles.progressCanvas}>
            <ProgressBar progress={isLoading ? 0 : progress} />
          </Canvas>
        </View>

        <Text style={styles.daysText}>{daysRemaining} days remaining</Text>
      </View>
    </View>
  );
};

const MembershipStatusCard = memo(() => {
  const theme = useTheme<CustomTheme>();
  // Fetch data from store
  const { membershipExpiry, membershipPeriod, isLoading } = useHomeStore();

  const isMembershipExpired = true;

  // Calculate days remaining and progress
  const { daysRemaining, progress } = useMemo(() => {
    if (!membershipExpiry || !membershipPeriod || membershipPeriod === 0) {
      return { daysRemaining: 0, progress: 0 };
    }

    const days = differenceInDays(membershipExpiry, new Date());
    return {
      daysRemaining: Math.max(0, days), // Ensure non-negative
      progress: Math.min(1, Math.max(0, days / membershipPeriod)), // Clamp between 0 and 1
    };
  }, [membershipExpiry, membershipPeriod]);

  const cardHeight = isMembershipExpired ? EXPIRED_CARD_HEIGHT : CARD_HEIGHT;

  // Show loading state
  // if (isLoading && !membershipExpiry) {
  //   return (
  //     <Card>
  //       <View style={styles.loadingContainer}>
  //         <ProgressBar color={theme.colors.primary} />
  //       </View>
  //     </Card>
  //   );
  // }

  return (
    // <View style={[styles.container, { height: cardHeight }]}>
    <View>
      {/* Card content */}
      {isMembershipExpired ? (
        <ExpiredMembershipContent />
      ) : (
        <ActiveMembershipContent
          isLoading={isLoading}
          progress={progress}
          daysRemaining={daysRemaining}
        />
      )}
    </View>
  );
});

// Display name for debugging purposes
MembershipStatusCard.displayName = 'MembershipStatusCard';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  pointsContainer: {
    padding: 8,
    borderRadius: 8,
  },
  points: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
  },
  progressBarContainer: {
    width: '100%',
    marginVertical: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: CARD_MARGIN,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    // Add elevation and shadow
    elevation: 8,
    borderWidth: 1,
    // borderColor: 'pink',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  expiredContainer: {
    width: CARD_WIDTH,
    // height: CARD_HEIGHT,
    marginHorizontal: CARD_MARGIN,
    padding: 20,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    // Add elevation and shadow
    elevation: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'System', // Using system font for better performance
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressContainer: {
    height: PROGRESS_HEIGHT,
    marginVertical: 8,
  },
  progressCanvas: {
    height: PROGRESS_HEIGHT,
    width: CARD_WIDTH - 32, // Account for container padding
  },
  daysText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.9,
  },
  expiredContent: {
    padding: 16,
    // opacity: 0,
  },
  expiredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  expiredTitle: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 24,
  },
  expiryInfo: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expiryDate: {
    fontWeight: '600',
    opacity: 1,
    fontSize: 24,
  },
  datePickerContainer: {
    marginBottom: 8,
  },
  datePickerLabel: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  datePicker: {
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // backgroundColor: '#f5f5f5', // Light gray background
    borderRadius: 8, // Rounded corners
    paddingHorizontal: 12, // Horizontal padding
    // paddingVertical: 10, // Vertical padding
    // fontSize: 16, // Font size
    borderWidth: 1, // Border width
    // borderColor: '#cccccc', // Border color
  },
  datePickerOutline: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
  },
  renewButton: {
    marginVertical: 40,
  },
  buttonContent: {
    height: 48,
  },
  periodInfo: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default MembershipStatusCard;
