// components/meal/MealPassModal.tsx

import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Text, useTheme } from 'react-native-paper';

import type { MealPassModalProps } from '@/src/types/member/mealPass';

export const MealPassModal: React.FC<MealPassModalProps> = ({
  pass,
  visible,
  onDismiss,
}) => {
  const theme = useTheme();

  // Format the date and time
  const formattedDate = format(new Date(pass.date), 'dd MMM yyyy');
  const validFrom = format(new Date(pass.validFrom), 'hh:mm a');
  const validUntil = format(new Date(pass.validUntil), 'hh:mm a');

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        {/* Pass Header */}
        <View
          style={[styles.header, { backgroundColor: theme.colors.primary }]}
        >
          <Text
            variant="titleLarge"
            style={[styles.headerText, { color: theme.colors.onPrimary }]}
          >
            Meal Pass
          </Text>
        </View>

        {/* Pass Content */}
        <View style={styles.content}>
          <View style={styles.row}>
            <Text variant="labelMedium">Date:</Text>
            <Text variant="bodyMedium">{formattedDate}</Text>
          </View>

          <View style={styles.row}>
            <Text variant="labelMedium">Meal:</Text>
            <Text variant="bodyMedium" style={{ textTransform: 'capitalize' }}>
              {pass.mealType}
            </Text>
          </View>

          <View style={styles.row}>
            <Text variant="labelMedium">Member:</Text>
            <Text variant="bodyMedium">{pass.memberName}</Text>
          </View>

          <View style={styles.row}>
            <Text variant="labelMedium">Mess:</Text>
            <Text variant="bodyMedium">{pass.messName}</Text>
          </View>

          <View
            style={[
              styles.validityContainer,
              { borderColor: theme.colors.outline },
            ]}
          >
            <Text variant="labelMedium" style={styles.validityTitle}>
              Valid Between
            </Text>
            <View style={styles.validityTimes}>
              <Text variant="bodyMedium">{validFrom}</Text>
              <Text variant="bodyMedium"> - </Text>
              <Text variant="bodyMedium">{validUntil}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: '85%',
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validityContainer: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  validityTitle: {
    marginBottom: 8,
  },
  validityTimes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
