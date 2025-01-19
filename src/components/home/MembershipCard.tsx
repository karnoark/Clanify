import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

interface MembershipCardProps {
  expiryDate: Date | null;
  onRequestMembership: () => void;
  onOpenPaymentModal: () => void;
}

// Helper function to calculate days remaining and status
const useMembershipStatus = (expiryDate: Date | null) => {
  return useMemo(() => {
    if (!expiryDate) {
      return { daysLeft: 0, status: 'inactive' as const };
    }

    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return { daysLeft: diffDays, status: 'active' as const };
    } else if (diffDays > 0) {
      return { daysLeft: diffDays, status: 'warning' as const };
    } else {
      return { daysLeft: 0, status: 'expired' as const };
    }
  }, [expiryDate]);
};

const MembershipCard: React.FC<MembershipCardProps> = ({
  expiryDate,
  onRequestMembership,
  onOpenPaymentModal,
}) => {
  const theme = useTheme();
  const { daysLeft, status } = useMembershipStatus(expiryDate);

  // Determine card styling based on status
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return theme.colors.primary;
      case 'warning':
        return theme.colors.tertiary;
      case 'expired':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  // Get appropriate icon and text based on status
  const getStatusContent = () => {
    switch (status) {
      case 'active':
        return {
          icon: 'check-circle' as const,
          text: `${daysLeft} days remaining`,
        };
      case 'warning':
        return {
          icon: 'alert' as const,
          text: `Expires in ${daysLeft} days`,
        };
      case 'expired':
        return {
          icon: 'close-circle' as const,
          text: 'Membership expired',
        };
      default:
        return {
          icon: 'help-circle' as const,
          text: 'No active membership',
        };
    }
  };

  const statusContent = getStatusContent();
  const statusColor = getStatusColor();

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">Membership Status</Text>
          <MaterialCommunityIcons
            name={statusContent.icon}
            size={24}
            color={statusColor}
          />
        </View>

        <Animated.View
          entering={FadeIn}
          style={[styles.statusContainer, { borderLeftColor: statusColor }]}
        >
          <Text
            variant="bodyLarge"
            style={[styles.statusText, { color: statusColor }]}
          >
            {statusContent.text}
          </Text>
        </Animated.View>

        {status === 'expired' && (
          <View style={styles.actionContainer}>
            <Button
              mode="contained"
              onPress={onOpenPaymentModal}
              style={styles.button}
            >
              Make Payment
            </Button>
            <Button
              mode="outlined"
              onPress={onRequestMembership}
              style={styles.button}
            >
              Request Membership
            </Button>
          </View>
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
  statusContainer: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginVertical: 8,
  },
  statusText: {
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 16,
    gap: 8,
  },
  button: {
    borderRadius: 8,
  },
});

export default React.memo(MembershipCard);
