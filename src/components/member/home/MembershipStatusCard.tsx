// src/components/member/home/MembershipStatusCard.tsx
import { Ionicons } from '@expo/vector-icons';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  Group,
} from '@shopify/react-native-skia';
import { format, differenceInDays } from 'date-fns';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import {
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import ExpiredMembershipContent from '@/src/components/member/home/ExpiredMembershipContent';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
import type { RenewalRequest } from '@/src/types/member/membership';
import type { CustomTheme } from '@/src/types/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;
const CARD_HEIGHT = 140;
const EXPIRED_CARD_HEIGHT = 320;
const PROGRESS_HEIGHT = 6;

// Progress bar for active membership display
const ProgressBar = memo(({ progress }: { progress: number }) => {
  // Animation logic for smooth progress updates
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 8,
      stiffness: 30,
      mass: 3,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    });
  }, [progress, animatedProgress]);

  const progressWidth = useDerivedValue(
    () => CARD_WIDTH * animatedProgress.value,
    [animatedProgress],
  );

  return (
    <Group>
      <RoundedRect
        x={0}
        y={0}
        width={CARD_WIDTH - 32}
        height={PROGRESS_HEIGHT}
        r={PROGRESS_HEIGHT / 2}
        color="rgba(255, 255, 255, 0.2)"
      />
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
});

ProgressBar.displayName = 'ProgressBar';

// Component to display renewal request status
const RenewalRequestStatus = memo(
  ({
    request,
    onNewRequest,
  }: {
    request: RenewalRequest;
    onNewRequest?: () => void;
  }) => {
    const theme = useTheme<CustomTheme>();

    // Determine status display information
    const statusInfo = useMemo(() => {
      switch (request.result) {
        case 'pending':
          return {
            icon: 'time' as const,
            color: theme.colors.primary,
            text: 'Request Pending',
            description: 'Your request is being reviewed',
          };
        case 'approved':
          return {
            icon: 'checkmark-circle' as const,
            color: theme.colors.pr40,
            text: 'Request Approved',
            description: 'Your membership has been renewed',
          };
        case 'rejected':
          return {
            icon: 'close-circle' as const,
            color: theme.colors.error,
            text: 'Request Rejected',
            description: request.message,
          };
        default:
          return {
            icon: 'help-circle' as const,
            color: theme.colors.onSurfaceVariant,
            text: 'Unknown Status',
            description: 'Please contact support',
          };
      }
    }, [request.result, request.message, theme.colors]);

    return (
      <View style={styles.renewalStatus}>
        <View style={styles.statusHeader}>
          <Ionicons
            name={statusInfo.icon}
            size={32}
            color={statusInfo.color}
            style={styles.statusIcon}
          />
          <Text
            variant="titleMedium"
            style={[styles.statusText, { color: statusInfo.color }]}
          >
            {statusInfo.text}
          </Text>
        </View>

        <View style={styles.statusDetails}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            {statusInfo.description}
          </Text>
          {request.startDate && (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Start Date: {format(request.startDate, 'MMMM d, yyyy')}
            </Text>
          )}
        </View>

        {request.result === 'rejected' && onNewRequest && (
          <Button
            mode="contained"
            onPress={onNewRequest}
            style={styles.newRequestButton}
            icon="refresh"
          >
            Submit New Request
          </Button>
        )}
      </View>
    );
  },
);

RenewalRequestStatus.displayName = 'RenewalRequestStatus';

// Component for active membership state
const ActiveMembershipContent = memo(
  ({
    progress,
    daysRemaining,
  }: {
    progress: number;
    daysRemaining: number;
  }) => {
    return (
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Active Membership
        </Text>

        <View style={styles.progressContainer}>
          <Canvas style={styles.progressCanvas}>
            <ProgressBar progress={progress} />
          </Canvas>
        </View>

        <Text style={styles.daysText}>{daysRemaining} days remaining</Text>
      </View>
    );
  },
);

ActiveMembershipContent.displayName = 'ActiveMembershipContent';

// Main MembershipStatusCard component
const MembershipStatusCard = memo(() => {
  const theme = useTheme<CustomTheme>();

  const {
    membershipExpiry,
    membershipPeriod,
    isMembershipExpired,
    isMembershipLoading: isLoading,
  } = useHomeStore();

  const IsTheMembershipExpired = isMembershipExpired();

  // Calculate membership progress and remaining days
  const { daysRemaining, progress } = useMemo(() => {
    if (!membershipExpiry || !membershipPeriod || membershipPeriod === 0) {
      return { daysRemaining: 0, progress: 0 };
    }

    const days = differenceInDays(membershipExpiry, new Date());
    return {
      daysRemaining: Math.max(0, days),
      progress: Math.min(1, Math.max(0, days / membershipPeriod)),
    };
  }, [membershipExpiry, membershipPeriod]);

  // Show loading state
  if (isLoading && !membershipExpiry) {
    return (
      <View style={[styles.container, { height: CARD_HEIGHT }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Loading membership details...
          </Text>
        </View>
      </View>
    );
  }

  // Determine card height based on membership status
  const cardHeight = IsTheMembershipExpired ? EXPIRED_CARD_HEIGHT : CARD_HEIGHT;

  if (IsTheMembershipExpired) {
    return <ExpiredMembershipContent />;
  }

  return (
    <View style={[styles.container, { height: cardHeight }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <RoundedRect x={0} y={0} width={CARD_WIDTH} height={cardHeight} r={16}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(CARD_WIDTH, 0)}
            colors={[theme.colors.pr60, theme.colors.pr40, theme.colors.pr30]}
            positions={[0, 0.7, 1]}
          />
        </RoundedRect>
      </Canvas>
      <ActiveMembershipContent
        progress={progress}
        daysRemaining={daysRemaining}
      />
    </View>
  );
});

export default MembershipStatusCard;

MembershipStatusCard.displayName = 'MembershipStatusCard';

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'System',
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
    width: CARD_WIDTH - 32,
  },
  daysText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.9,
  },
  expiredContent: {
    padding: 16,
  },
  expiredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  expiredTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  expiryInfo: {
    marginBottom: 20,
    textAlign: 'center',
  },
  expiryDate: {
    fontWeight: '600',
    fontSize: 24,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerLabel: {
    marginBottom: 8,
  },
  datePicker: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
  },
  renewButton: {
    marginVertical: 8,
  },
  buttonContent: {
    height: 48,
  },
  periodInfo: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 4,
  },
  renewalStatus: {
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 20,
  },
  statusDetails: {
    marginVertical: 16,
    gap: 8,
  },
  newRequestButton: {
    marginTop: 24,
  },
});
