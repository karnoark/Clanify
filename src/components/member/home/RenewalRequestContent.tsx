import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { CARD_MARGIN, CARD_WIDTH } from '@/src/constants/member/home';
import type { CustomTheme } from '@/src/types/theme';

interface RenewalRequestContentProps {
  request: RenewalRequest;
  onNewRequest?: () => void;
}

const getStatusIcon = (status: RenewalRequestResult) => {
  switch (status) {
    case 'pending':
      return 'time';
    case 'approved':
      return 'checkmark-circle';
    case 'rejected':
      return 'close-circle';
    default:
      return 'help-circle';
  }
};

const getStatusColor = (theme: CustomTheme, status: RenewalRequestResult) => {
  switch (status) {
    case 'pending':
      return theme.colors.primary;
    case 'approved':
      return theme.colors.pr40;
    case 'rejected':
      return theme.colors.error;
    default:
      return theme.colors.onSurfaceVariant;
  }
};

const getStatusText = (status: RenewalRequestResult) => {
  switch (status) {
    case 'pending':
      return 'Request Pending';
    case 'approved':
      return 'Request Approved';
    case 'rejected':
      return 'Request Rejected';
    default:
      return 'Unknown Status';
  }
};

const RenewalRequestContent: React.FC<RenewalRequestContentProps> = ({
  request,
  onNewRequest,
}) => {
  const theme = useTheme<CustomTheme>();
  const statusColor = getStatusColor(theme, request.result);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      {/* Status Header */}
      <View style={styles.header}>
        <Ionicons
          name={getStatusIcon(request.result)}
          size={32}
          color={statusColor}
          style={styles.icon}
        />
        <Text
          variant="titleMedium"
          style={[styles.statusText, { color: statusColor }]}
        >
          {getStatusText(request.result)}
        </Text>
      </View>

      {/* Request Details */}
      <View style={styles.detailsContainer}>
        {request.requestDate && (
          <Text
            style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}
          >
            Requested on:{' '}
            <Text style={styles.value}>
              {format(request.requestDate, 'MMMM d, yyyy')}
            </Text>
          </Text>
        )}

        {request.startDate && (
          <Text
            style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}
          >
            Start date:{' '}
            <Text style={styles.value}>
              {format(request.startDate, 'MMMM d, yyyy')}
            </Text>
          </Text>
        )}

        {/* Message from admin */}
        <Text
          style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
        >
          {request.message}
        </Text>
      </View>

      {/* Action Buttons */}
      {request.result === 'rejected' && onNewRequest && (
        <Button
          mode="contained"
          onPress={onNewRequest}
          style={styles.button}
          icon="refresh"
        >
          Submit New Request
        </Button>
      )}

      {request.result === 'pending' && (
        <Text style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
          Your request is being reviewed by the mess operator. We'll notify you
          once it's processed.
        </Text>
      )}

      {request.result === 'approved' && (
        <Text style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
          Your membership has been renewed successfully!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    padding: 20,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 20,
    // textAlign: 'center',
  },
  detailsContainer: {
    marginVertical: 16,
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
  },
  value: {
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    marginTop: 16,
    lineHeight: 24,
  },
  button: {
    marginTop: 24,
  },
  note: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});

export default RenewalRequestContent;
