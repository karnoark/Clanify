// src/components/home/MembershipStatusCard.tsx
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  Group,
} from '@shopify/react-native-skia';
import { differenceInDays } from 'date-fns';
import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Dimensions, Alert } from 'react-native';
import {
  Text as RNText,
  ProgressBar as PaperProgressBar,
  useTheme,
} from 'react-native-paper';
import {
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/src/components/common/Text';
import ExpiredMembershipContent from '@/src/components/member/home/ExpiredMembershipContent';
import {
  CARD_HEIGHT,
  CARD_MARGIN,
  CARD_WIDTH,
  PROGRESS_HEIGHT,
} from '@/src/constants/member/home';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
import type { CustomTheme } from '@/src/types/theme';

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
        <Text
          variant="titleLarge"
          style={[
            styles.title,
            {
              color: theme.colors.onSurface,
            },
          ]}
        >
          Active Membership
        </Text>

        <View style={styles.progressContainer}>
          <Canvas style={styles.progressCanvas}>
            <ProgressBar progress={isLoading ? 0 : progress} />
          </Canvas>
        </View>

        <Text
          style={[
            styles.daysText,
            {
              color: theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {daysRemaining} days remaining
        </Text>
      </View>
    </View>
  );
};

const MembershipStatusCard = memo(() => {
  const theme = useTheme<CustomTheme>();
  // Fetch data from store
  const { membershipExpiry, membershipPeriod, isLoading, isMembershipExpired } =
    useHomeStore();

  // const isMembershipExpired = true;

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

  return (
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
    // borderColor: 'pink',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  progressContainer: {
    height: PROGRESS_HEIGHT,
    marginVertical: 8,
  },
  progressCanvas: {
    height: PROGRESS_HEIGHT,
    width: CARD_WIDTH - 32, // Account for container padding
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'System', // Using system font for better performance
    fontWeight: '600',
    marginBottom: 16,
  },
  daysText: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.9,
  },
});

export default MembershipStatusCard;
