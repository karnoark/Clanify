import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { Text } from '@/src/components/common/Text';
import type { ClosureItemProps } from '@/src/types/member/messClosures';
import type { CustomTheme } from '@/src/types/theme';

/**
 * A component that displays a single mess closure entry.
 * Shows the date, meal type, and reason for closure.
 * Uses memo for performance optimization as this will be rendered in a list.
 */
export const ClosureItem = memo(
  ({ date, mealType, reason }: ClosureItemProps) => {
    const theme = useTheme<CustomTheme>();

    // Format the date to display as "Tomorrow" or "Oct 15" style
    const displayDate = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // If the closure is tomorrow, show "Tomorrow" instead of the date
      if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
        return 'Tomorrow';
      }
      return format(date, 'MMM dd'); // Format as "Oct 15"
    };

    // Capitalize the first letter of meal type for display
    // const formattedMealType =
    //   mealType.charAt(0).toUpperCase() + mealType.slice(1);

    return (
      <View style={styles.container}>
        {/* Header section with date and meal type */}
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={22} color={theme.colors.pr70} />
            <Text
              variant="titleMedium"
              style={[styles.dateText, { color: theme.colors.pr70 }]}
            >
              {displayDate()}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              // width: 80,
              flex: 0.22,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: 16,
              backgroundColor: theme.colors.background,
              padding: 8,
            }}
          >
            <Text style={{ color: theme.colors.pr90 }}>{mealType}</Text>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={16}
              color={theme.colors.pr90}
            />
          </View>
        </View>

        {/* Closure reason */}
        <Text
          variant="bodyMedium"
          style={[styles.reason, { color: theme.colors.onSurfaceVariant }]}
        >
          {reason}
        </Text>
      </View>
    );
  },
);

// Add display name for debugging purposes
ClosureItem.displayName = 'ClosureItem';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 0.78,
  },
  dateText: {
    fontWeight: 'bold',
  },
  mealIcon: {
    fontSize: 18,
  },
  reason: {
    marginTop: 8,
    paddingLeft: 16,
  },
});
