// components/meal/MealPassCard.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text, useTheme } from 'react-native-paper';

import type { MealPass } from '@/src/types/member/mealPass';
import {
  MealPassIneligibilityReason,
  ineligibilityMessages,
} from '@/src/types/member/mealPass';

import { MealPassModal } from './MealPassModal';

export const MealPassCard = () => {
  // This will come from your store later
  const currentPass: MealPass = {
    id: '1',
    date: new Date().toISOString(),
    mealType: 'lunch',
    memberName: 'Mayuresh Kshirsagar',
    messName: 'Anna purna Mess',
    validFrom: new Date(new Date().setHours(12, 0)).toISOString(),
    validUntil: new Date(new Date().setHours(14, 0)).toISOString(),
    is_eligible: true,
    // reason: MealPassIneligibilityReason.NOT_YET_AVAILABLE,
  };
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useTheme();

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  // Helper function to get the appropriate icon name based on reason
  const getIconName = (reason: string) => {
    switch (reason) {
      case 'planned_absence':
        return 'calendar-outline';
      case 'holiday':
        return 'alert-circle-outline';
      case 'regular_off':
        return 'time-outline';
      case 'not_yet_available':
        return 'time-outline';
      default:
        return 'information-circle-outline';
    }
  };

  // Helper function to get the subtitle based on reason
  const getSubtitle = (reason: string) => {
    switch (reason) {
      case 'planned_absence':
        return 'You have marked absence for Feb 15, 2024';
      case 'holiday':
        return 'Mess will be closed for maintenance';
      case 'regular_off':
        return 'Service resumes tomorrow';
      case 'not_yet_available':
        return 'Available 30 minutes before meal time';
      default:
        return '';
    }
  };

  // return (
  //   <Card style={styles.card}>
  //     <Card.Content>
  //       <View style={styles.container}>
  //         {currentPass.is_eligible ? (
  //           // Eligible - Show View Pass button
  //           <View style={styles.eligibleContainer}>
  //             <Text variant="titleMedium" style={styles.title}>
  //               Your meal pass is ready!
  //             </Text>
  //             {/* <Button
  //               mode="contained"
  //               onPress={showModal}
  //               style={[
  //                 styles.button,
  //                 { backgroundColor: theme.colors.primary },
  //               ]}
  //             >
  //               View Pass
  //             </Button> */}
  //             <IconButton
  //               icon="qr-code"
  //               mode="contained"
  //               size={24}
  //               onPress={showModal}
  //               style={styles.button}
  //             />
  //           </View>
  //         ) : (
  //           // Not eligible state - Show reason with custom styling
  //           <View style={styles.ineligibleContainer}>
  //             {currentPass.reason && (
  //               <Card
  //                 style={[
  //                   styles.ineligibleCard,
  //                   { backgroundColor: 'rgba(30, 30, 33, 0.9)' },
  //                 ]}
  //               >
  //                 <View style={styles.ineligibleContent}>
  //                   <View style={styles.iconContainer}>
  //                     <Ionicons
  //                       name={getIconName(currentPass.reason)}
  //                       size={24}
  //                       color="#FFFFFF"
  //                     />
  //                   </View>
  //                   <View style={styles.textContainer}>
  //                     <Text
  //                       variant="titleMedium"
  //                       style={styles.ineligibleTitle}
  //                     >
  //                       {ineligibilityMessages[currentPass.reason]}
  //                     </Text>
  //                     <Text
  //                       variant="bodyMedium"
  //                       style={styles.ineligibleSubtitle}
  //                     >
  //                       {getSubtitle(currentPass.reason)}
  //                     </Text>
  //                   </View>
  //                 </View>
  //               </Card>
  //             )}
  //           </View>
  //         )}
  //       </View>
  //     </Card.Content>

  //     {/* Modal for displaying the meal pass */}
  //     <MealPassModal
  //       pass={currentPass}
  //       visible={modalVisible}
  //       onDismiss={hideModal}
  //     />
  //   </Card>
  // );

  return (
    <View style={styles.container}>
      {currentPass.is_eligible ? (
        // Eligible state - Show View Pass button
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.title}>
              Your meal pass is ready!
            </Text>
            <IconButton
              icon="qrcode"
              mode="contained"
              size={24}
              onPress={showModal}
              style={styles.button}
            />
          </Card.Content>
        </Card>
      ) : (
        // Not eligible state - Show reason with custom styling
        <View style={styles.ineligibleContainer}>
          {currentPass.reason && (
            <Card
              style={[
                styles.ineligibleCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={styles.ineligibleContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={getIconName(currentPass.reason)}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text variant="titleMedium" style={styles.ineligibleTitle}>
                    {ineligibilityMessages[currentPass.reason]}
                  </Text>
                  <Text variant="bodyMedium" style={styles.ineligibleSubtitle}>
                    {getSubtitle(currentPass.reason)}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </View>
      )}

      {/* Modal for displaying the meal pass */}
      <MealPassModal
        pass={currentPass}
        visible={modalVisible}
        onDismiss={hideModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontWeight: '500',
  },
  button: {
    margin: 0,
  },
  ineligibleContainer: {
    gap: 8,
  },
  ineligibleCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ineligibleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  ineligibleTitle: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  ineligibleSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
