import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useTheme, Button, Snackbar } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';

import { Text } from '@/src/components/common/Text';
import RenewalRequestContent from '@/src/components/member/home/RenewalRequestContent';
import { CARD_MARGIN, CARD_WIDTH } from '@/src/constants/member/home';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
import { CustomTheme } from '@/src/types/theme';

// Helper function to show renewal confirmation dialog
const showRenewalConfirmation = async (params: {
  startDate: Date;
  period: number;
}): Promise<boolean> => {
  // We can use react-native-paper's Portal and Dialog components
  return new Promise(resolve => {
    Alert.alert(
      'Confirm Membership Renewal',
      `Are you sure you want to request membership renewal starting from ${format(params.startDate, 'MMMM d, yyyy')}?\n\nMembership period: ${params.period} days`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Confirm',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: false },
    );
  });
};

const ExpiredMembershipContent = () => {
  const theme = useTheme<CustomTheme>();
  const {
    membershipExpiry,
    sendRequestToRenewMembership,
    renewalRequest,
    clearRenewalRequest,
    validateRenewalEligibility,
    membershipPeriod,
  } = useHomeStore();

  const [selectedRenewalDate, setSelectedRenewalDate] = useState<Date | null>();

  const [isRenewing, setIsRenewing] = useState<boolean>(false);

  const [renewalError, setRenewalError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
  }>({
    visible: false,
    message: '',
  });

  // Helper function to show messages
  const showMessage = ({
    message,
    type = 'info',
  }: {
    message: string;
    type?: 'success' | 'error' | 'info';
  }) => {
    setSnackbar({
      visible: true,
      message,
      type,
    });
  };

  // Helper function to hide snackbar
  const hideMessage = () => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  };

  // Get the appropriate background color based on message type
  const getSnackbarColor = (type?: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return theme.colors.pr40;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  // Calculate the default renewal date (day after expiry)
  const getDefaultRenewalDate = useCallback(() => {
    if (!membershipExpiry) return new Date();
    const nextDay = new Date(membershipExpiry);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }, [membershipExpiry]);

  // Initialize date picker with default date when component mounts
  React.useEffect(() => {
    if (!selectedRenewalDate) {
      setSelectedRenewalDate(getDefaultRenewalDate());
    }
  }, [getDefaultRenewalDate, selectedRenewalDate]);

  // Handle renewal request
  const handleRenewal = async () => {
    if (!selectedRenewalDate) return;

    try {
      // First, check if we can create a request
      const canCreateRequest = await validateRenewalEligibility();
      if (!canCreateRequest.isEligible) {
        setRenewalError(canCreateRequest.reason ?? null);
        return;
      }

      // Show confirmation dialog
      const confirmed = await showRenewalConfirmation({
        startDate: selectedRenewalDate,
        period: membershipPeriod ?? 30, // Default to 30 days if not set
      });

      if (!confirmed) return;

      // Proceed with creating the request
      setIsRenewing(true);
      setRenewalError(null);

      await sendRequestToRenewMembership(selectedRenewalDate);

      // Show success message
      // Note: You might want to use a toast or snackbar component for this
      // For example, react-native-paper's Snackbar
      showMessage({
        type: 'success',
        message:
          "Request sent successfully. We'll notify you once it's processed.",
      });
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

  // Handle new request after rejection
  const handleNewRequest = useCallback(async () => {
    try {
      // Clear the existing renewal request first
      await clearRenewalRequest(); // We need to add this to our store

      // Reset all local states
      setSelectedRenewalDate(getDefaultRenewalDate());
      setRenewalError(null);
      setIsRenewing(false);

      // Optional: Scroll form into view or add animation
      // You might want to add a smooth transition here
    } catch (error) {
      console.error('Failed to start new request:', error);
      // Handle any errors that might occur during state reset
    }
  }, [getDefaultRenewalDate, clearRenewalRequest]);

  // If there's an existing renewal request, show its status
  if (renewalRequest) {
    return (
      <RenewalRequestContent
        request={renewalRequest}
        onNewRequest={
          renewalRequest.result === 'rejected' ? handleNewRequest : undefined
        }
      />
    );
  }

  return (
    <View
      style={[
        styles.expiredContainer,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      {/* Expired status header */}
      <View style={styles.expiredHeader}>
        <Ionicons name="alert-circle" size={32} color={theme.colors.primary} />
        <Text
          variant="titleMedium"
          style={[
            styles.expiredTitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Membership Expired
        </Text>
      </View>

      {/* Expiry date information */}
      <Text
        style={[styles.expiryInfo, { color: theme.colors.onSurfaceVariant }]}
      >
        Your membership expired on{'\n'}
        <Text style={styles.expiryDate}>
          {membershipExpiry
            ? format(membershipExpiry, 'MMMM d, yyyy')
            : 'unknown date'}
        </Text>
      </Text>

      {/* Date picker section */}
      <View style={styles.datePickerContainer}>
        <Text
          style={[
            styles.datePickerLabel,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Resume membership from:
        </Text>
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
          // startYear={2024}
          // endYear={2025}
          style={[
            styles.datePicker,
            {
              borderColor: theme.colors.onBackground,
              backgroundColor: theme.colors.surface,
            },
          ]}
          outlineStyle={{
            borderColor: theme.colors.outlineVariant,
          }}
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
      <Text
        style={[
          styles.periodInfo,
          {
            color: theme.colors.onSurfaceVariant,
          },
        ]}
      >
        Membership Period is 30 days
      </Text>

      {/* Renewal button */}
      <Button
        mode="contained"
        onPress={handleRenewal}
        loading={isRenewing}
        disabled={isRenewing || !selectedRenewalDate}
        style={styles.renewButton}
        contentStyle={styles.buttonContent}
      >
        Request Membership Renewal
      </Button>
      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideMessage}
        duration={3000}
        style={{
          backgroundColor: getSnackbarColor(snackbar.type),
        }}
        action={{
          label: 'Dismiss',
          onPress: hideMessage,
        }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

export default ExpiredMembershipContent;

const styles = StyleSheet.create({
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    fontWeight: '600',
    fontSize: 24,
  },
  expiryInfo: {
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
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
});
