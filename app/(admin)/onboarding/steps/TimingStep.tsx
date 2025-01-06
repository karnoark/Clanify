// This component manages the operating hours setup during the onboarding process.
// It allows mess administrators to set precise service windows for each day,
// handling both regular schedules and special timing rules. The implementation
// focuses on flexibility while maintaining schedule clarity for customers.

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Card,
  List,
  Switch,
  Button,
  Portal,
  Modal,
  useTheme,
  IconButton,
  SegmentedButtons,
  TextInput,
  HelperText,
} from 'react-native-paper';
// import { TimePicker } from 'react-native-paper-dates';

import { Text } from '../../../../src/components/common/Text';
import { useOnboardingStore } from '../../../../src/store/onboardingStore';

// Define the structure for our working hours
interface DaySchedule {
  isOpen: boolean;
  lunch?: {
    start: string;
    end: string;
  };
  dinner?: {
    start: string;
    end: string;
  };
}

// Type for our weekly schedule
type WeeklySchedule = {
  [key in DayOfWeek]: DaySchedule;
};

// Define days of the week
type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

// Validation rules for time input
const validateTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export function TimingStep() {
  const theme = useTheme();
  const { timing, updateTiming, errors, setError, clearError } =
    useOnboardingStore();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [currentEditMode, setCurrentEditMode] = useState<{
    meal: 'lunch' | 'dinner';
    type: 'start' | 'end';
  } | null>(null);

  // Initialize weekly schedule if not present
  // React.useEffect(() => {
  //   if (!timing.weeklySchedule) {
  //     const defaultSchedule = DAYS_OF_WEEK.reduce((acc, day) => {
  //       acc[day] = {
  //         isOpen: day !== 'sunday',
  //         lunch: { start: '12:00', end: '15:00' },
  //         dinner: { start: '19:00', end: '22:00' },
  //       };
  //       return acc;
  //     }, {} as WeeklySchedule);

  //     updateTiming({ weeklySchedule: defaultSchedule });
  //   }
  // }, []);

  // Function to handle day schedule changes
  // const handleDayScheduleChange = (
  //   day: DayOfWeek,
  //   changes: Partial<DaySchedule>,
  // ) => {
  //   if (!timing.weeklySchedule) return;

  //   const updatedSchedule = {
  //     ...timing.weeklySchedule,
  //     [day]: {
  //       ...timing.weeklySchedule[day],
  //       ...changes,
  //     },
  //   };

  //   updateTiming({ weeklySchedule: updatedSchedule });
  // };

  // Function to handle time changes
  // const handleTimeChange = (time: string) => {
  //   if (!selectedDay || !currentEditMode || !timing.weeklySchedule) return;

  //   const { meal, type } = currentEditMode;
  //   const currentSchedule = timing.weeklySchedule[selectedDay];

  //   const updatedSchedule = {
  //     ...currentSchedule,
  //     [meal]: {
  //       ...currentSchedule[meal],
  //       [type]: time,
  //     },
  //   };

  //   handleDayScheduleChange(selectedDay, updatedSchedule);
  //   setTimePickerVisible(false);
  //   setCurrentEditMode(null);
  // };

  // Function to open time picker
  const openTimePicker = (
    day: DayOfWeek,
    meal: 'lunch' | 'dinner',
    type: 'start' | 'end',
  ) => {
    setSelectedDay(day);
    setCurrentEditMode({ meal, type });
    setTimePickerVisible(true);
  };

  // Function to copy schedule to other days
  // const copyScheduleToDay = (fromDay: DayOfWeek, toDay: DayOfWeek) => {
  //   if (!timing.weeklySchedule) return;

  //   handleDayScheduleChange(toDay, timing.weeklySchedule[fromDay]);
  // };

  // Function to render a single day's schedule
  // const renderDaySchedule = (day: DayOfWeek) => {
  //   if (!timing.weeklySchedule) return null;

  //   const schedule = timing.weeklySchedule[day];
  //   const dayName = day.charAt(0).toUpperCase() + day.slice(1);

  //   return (
  //     <Card key={day} style={styles.dayCard}>
  //       <Card.Content>
  //         <View style={styles.dayHeader}>
  //           <Text variant="titleMedium">{dayName}</Text>
  //           <Switch
  //             value={schedule.isOpen}
  //             onValueChange={value =>
  //               handleDayScheduleChange(day, { isOpen: value })
  //             }
  //           />
  //         </View>

  //         {schedule.isOpen && (
  //           <>
  //             {/* Lunch Timing */}
  //             <View style={styles.mealSection}>
  //               <Text variant="bodyMedium" style={styles.mealTitle}>
  //                 Lunch
  //               </Text>
  //               <View style={styles.timeInputsRow}>
  //                 <View style={styles.timeInput}>
  //                   <TextInput
  //                     mode="outlined"
  //                     label="Start"
  //                     value={schedule.lunch?.start || ''}
  //                     onPressIn={() => openTimePicker(day, 'lunch', 'start')}
  //                     editable={false}
  //                     right={<TextInput.Icon icon="clock-outline" />}
  //                   />
  //                 </View>
  //                 <Text variant="bodyMedium" style={styles.timeSeperator}>
  //                   to
  //                 </Text>
  //                 <View style={styles.timeInput}>
  //                   <TextInput
  //                     mode="outlined"
  //                     label="End"
  //                     value={schedule.lunch?.end || ''}
  //                     onPressIn={() => openTimePicker(day, 'lunch', 'end')}
  //                     editable={false}
  //                     right={<TextInput.Icon icon="clock-outline" />}
  //                   />
  //                 </View>
  //               </View>
  //             </View>

  //             {/* Dinner Timing */}
  //             <View style={styles.mealSection}>
  //               <Text variant="bodyMedium" style={styles.mealTitle}>
  //                 Dinner
  //               </Text>
  //               <View style={styles.timeInputsRow}>
  //                 <View style={styles.timeInput}>
  //                   <TextInput
  //                     mode="outlined"
  //                     label="Start"
  //                     value={schedule.dinner?.start || ''}
  //                     onPressIn={() => openTimePicker(day, 'dinner', 'start')}
  //                     editable={false}
  //                     right={<TextInput.Icon icon="clock-outline" />}
  //                   />
  //                 </View>
  //                 <Text variant="bodyMedium" style={styles.timeSeperator}>
  //                   to
  //                 </Text>
  //                 <View style={styles.timeInput}>
  //                   <TextInput
  //                     mode="outlined"
  //                     label="End"
  //                     value={schedule.dinner?.end || ''}
  //                     onPressIn={() => openTimePicker(day, 'dinner', 'end')}
  //                     editable={false}
  //                     right={<TextInput.Icon icon="clock-outline" />}
  //                   />
  //                 </View>
  //               </View>
  //             </View>

  //             {/* Copy Schedule Button */}
  //             <Button
  //               mode="outlined"
  //               onPress={() => {
  //                 // Implement copy schedule modal
  //               }}
  //               style={styles.copyButton}
  //             >
  //               Copy to Other Days
  //             </Button>
  //           </>
  //         )}
  //       </Card.Content>
  //     </Card>
  //   );
  // };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Text variant="titleLarge" style={styles.title}>
        Operating Hours
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Set your service timings for each day of the week
      </Text>

      {/* Schedule Display */}
      {/* <View style={styles.scheduleContainer}>
        {DAYS_OF_WEEK.map(day => renderDaySchedule(day))}
      </View> */}

      {/* Time Picker Modal */}
      <Portal>
        <Modal
          visible={timePickerVisible}
          onDismiss={() => setTimePickerVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {/* {currentEditMode && selectedDay && timing.weeklySchedule && (
            <>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Set {currentEditMode.type === 'start' ? 'Start' : 'End'} Time
              </Text>
              <Text variant="bodyMedium" style={styles.modalSubtitle}>
                {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} -{' '}
                {currentEditMode.meal.charAt(0).toUpperCase() +
                  currentEditMode.meal.slice(1)}
              </Text>
              <TimePicker
                hours={12}
                minutes={0}
                onChange={({ hours, minutes }) => {
                  const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                  handleTimeChange(time);
                }}
              />
              <Button
                mode="contained"
                onPress={() => setTimePickerVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
            </>
          )} */}
          <Text>Uncomment the code once you install proper packages</Text>
        </Modal>
      </Portal>

      {/* Help Text */}
      <Card style={styles.helpCard}>
        <Card.Content>
          <Text variant="bodySmall" style={styles.helpText}>
            Set clear operating hours to help customers plan their visits. You
            can always update these timings later from your profile settings.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  scheduleContainer: {
    gap: 16,
  },
  dayCard: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealSection: {
    marginBottom: 16,
  },
  mealTitle: {
    marginBottom: 8,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
  },
  timeSeperator: {
    marginHorizontal: 8,
  },
  copyButton: {
    marginTop: 8,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 8,
  },
  modalSubtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  modalButton: {
    marginTop: 16,
  },
  helpCard: {
    marginTop: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  helpText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
