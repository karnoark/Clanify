// TimingStep.tsx
import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Card,
  List,
  Switch,
  Button,
  Portal,
  Modal,
  useTheme,
  TextInput,
  HelperText,
} from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';

import { Text } from '../../../../src/components/common/Text';
import {
  TimeSlot,
  useOnboardingStore,
  WeeklySchedule,
} from '../../../../src/store/onboardingStore';

// Define types
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

// Time formatting and validation utilities
const formatTime = (hours: number, minutes: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const parseTime = (
  timeString: string,
): { hours: number; minutes: number } | null => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

const getTimeInMinutes = (time: string): number => {
  const parsed = parseTime(time);
  if (!parsed) return 0;
  return parsed.hours * 60 + parsed.minutes;
};

export const validateTimeRange = (
  startTime: string,
  endTime: string,
): { isValid: boolean; error?: string } => {
  const startMinutes = getTimeInMinutes(startTime);
  const endMinutes = getTimeInMinutes(endTime);

  if (startMinutes >= endMinutes) {
    return { isValid: false, error: 'End time must be after start time' };
  }

  return { isValid: true };
};

// Component to render a single meal section (lunch or dinner)
const MealSection = ({
  day,
  mealType,
  timeSlot,
  onTimeChange,
  onToggleClosed,
  errors,
  onOpenTimePicker,
}: {
  day: DayOfWeek;
  mealType: 'lunch' | 'dinner';
  timeSlot: TimeSlot;
  onTimeChange: (type: 'start' | 'end', time: string) => void;
  onToggleClosed: () => void;
  errors: { [key: string]: string };
  onOpenTimePicker: (type: 'start' | 'end') => void;
}) => {
  const theme = useTheme();

  return (
    <View style={styles.mealSection}>
      <View style={styles.mealHeader}>
        <Text variant="bodyMedium" style={styles.mealTitle}>
          {mealType === 'lunch' ? 'Lunch Service' : 'Dinner Service'}
        </Text>
        <View style={styles.mealControls}>
          <Text
            variant="bodySmall"
            style={[
              styles.closedText,
              timeSlot.isClosed && styles.closedTextActive,
            ]}
          >
            {timeSlot.isClosed ? 'Closed' : 'Open'}
          </Text>
          <Switch value={!timeSlot.isClosed} onValueChange={onToggleClosed} />
        </View>
      </View>

      {!timeSlot.isClosed && (
        <View style={styles.timeInputsRow}>
          <TimeInput
            label="Start Time"
            value={timeSlot.start}
            onPress={() => onOpenTimePicker('start')}
            error={errors[`${day}.${mealType}.start`]}
          />
          <Text variant="bodyMedium" style={styles.timeSeperator}>
            to
          </Text>
          <TimeInput
            label="End Time"
            value={timeSlot.end}
            onPress={() => onOpenTimePicker('end')}
            error={errors[`${day}.${mealType}.end`]}
          />
        </View>
      )}
    </View>
  );
};

// Time input component
const TimeInput = ({
  label,
  value,
  onPress,
  error,
}: {
  label: string;
  value: string;
  onPress: () => void;
  error?: string;
}) => (
  <View style={styles.timeInputContainer}>
    <Button
      mode="outlined"
      icon="clock"
      onPress={onPress}
      style={[styles.timeButton, !!error && styles.timeButtonError]}
    >
      {value || 'Select time'}
    </Button>
    {error ? (
      <HelperText type="error" visible={true}>
        {error}
      </HelperText>
    ) : null}
  </View>
);

export function TimingStep() {
  const theme = useTheme();
  const { timing, updateTiming, errors, setError, clearError } =
    useOnboardingStore();

  // State for time picker
  const [selectedTime, setSelectedTime] = useState<{
    day: DayOfWeek;
    meal: 'lunch' | 'dinner';
    type: 'start' | 'end';
  } | null>(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  // State for copy functionality
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [copyFromDay, setCopyFromDay] = useState<DayOfWeek | null>(null);
  const [copiedDays, setCopiedDays] = useState<Set<DayOfWeek>>(new Set());

  // Initialize schedule if not present
  React.useEffect(() => {
    if (!timing.weeklySchedule) {
      const defaultSchedule = DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = {
          lunch: {
            start: '11:00',
            end: '14:00',
            isClosed: day === 'sunday',
          },
          dinner: {
            start: '19:00',
            end: '22:00',
            isClosed: day === 'sunday',
          },
        };
        return acc;
      }, {} as WeeklySchedule);

      updateTiming({ weeklySchedule: defaultSchedule });
    }
  }, [timing.weeklySchedule, updateTiming]);

  // Handle time changes
  const handleTimeChange = useCallback(
    (
      day: DayOfWeek,
      meal: 'lunch' | 'dinner',
      type: 'start' | 'end',
      time: string,
    ) => {
      if (!timing.weeklySchedule) return;

      const currentMeal = timing.weeklySchedule[day][meal];
      const updatedTimes = {
        ...currentMeal,
        [type]: time,
      };

      // Validate time range
      if (updatedTimes.start && updatedTimes.end) {
        const validation = validateTimeRange(
          updatedTimes.start,
          updatedTimes.end,
        );
        if (!validation.isValid) {
          setError(`${day}.${meal}.${type}`, validation.error || '');
          return;
        }
      }

      clearError(`${day}.${meal}.${type}`);

      const updatedSchedule = {
        ...timing.weeklySchedule,
        [day]: {
          ...timing.weeklySchedule[day],
          [meal]: updatedTimes,
        },
      };

      updateTiming({ weeklySchedule: updatedSchedule });
    },
    [timing.weeklySchedule, updateTiming, setError, clearError],
  );

  // Handle toggling meal service
  const handleToggleMeal = useCallback(
    (day: DayOfWeek, meal: 'lunch' | 'dinner') => {
      if (!timing.weeklySchedule) return;

      const updatedSchedule = {
        ...timing.weeklySchedule,
        [day]: {
          ...timing.weeklySchedule[day],
          [meal]: {
            ...timing.weeklySchedule[day][meal],
            isClosed: !timing.weeklySchedule[day][meal].isClosed,
          },
        },
      };

      updateTiming({ weeklySchedule: updatedSchedule });
    },
    [timing.weeklySchedule, updateTiming],
  );

  // Time picker handlers
  const openTimePicker = useCallback(
    (day: DayOfWeek, meal: 'lunch' | 'dinner', type: 'start' | 'end') => {
      setSelectedTime({ day, meal, type });
      setTimePickerVisible(true);
    },
    [],
  );

  const handleTimeConfirm = useCallback(
    ({ hours, minutes }: { hours: number; minutes: number }) => {
      if (!selectedTime || !timing.weeklySchedule) return;

      const { day, meal, type } = selectedTime;
      handleTimeChange(day, meal, type, formatTime(hours, minutes));
      setTimePickerVisible(false);
      setSelectedTime(null);
    },
    [selectedTime, timing.weeklySchedule, handleTimeChange],
  );

  // Copy schedule functionality
  const handleCopySchedule = useCallback(
    (fromDay: DayOfWeek, toDay: DayOfWeek) => {
      if (!timing.weeklySchedule) return;

      const updatedSchedule = {
        ...timing.weeklySchedule,
        [toDay]: { ...timing.weeklySchedule[fromDay] },
      };

      updateTiming({ weeklySchedule: updatedSchedule });
      setCopiedDays(prev => new Set([...prev, toDay]));
    },
    [timing.weeklySchedule, updateTiming],
  );

  // Render functions
  const renderDaySchedule = (day: DayOfWeek) => {
    if (!timing.weeklySchedule) return null;

    const schedule = timing.weeklySchedule[day];
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);

    return (
      <Card key={day} style={styles.dayCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.dayTitle}>
            {dayName}
          </Text>

          <MealSection
            day={day}
            mealType="lunch"
            timeSlot={schedule.lunch}
            onTimeChange={(type, time) =>
              handleTimeChange(day, 'lunch', type, time)
            }
            onToggleClosed={() => handleToggleMeal(day, 'lunch')}
            errors={errors}
            onOpenTimePicker={type => openTimePicker(day, 'lunch', type)}
          />

          <MealSection
            day={day}
            mealType="dinner"
            timeSlot={schedule.dinner}
            onTimeChange={(type, time) =>
              handleTimeChange(day, 'dinner', type, time)
            }
            onToggleClosed={() => handleToggleMeal(day, 'dinner')}
            errors={errors}
            onOpenTimePicker={type => openTimePicker(day, 'dinner', type)}
          />

          <Button
            mode="contained"
            onPress={() => {
              setCopyFromDay(day);
              setCopyModalVisible(true);
            }}
            style={styles.copyButton}
          >
            Copy to Other Days
          </Button>
        </Card.Content>
      </Card>
    );
  };

  const renderCopyScheduleModal = () => (
    <Portal>
      <Modal
        visible={copyModalVisible}
        onDismiss={() => {
          setCopyModalVisible(false);
          setCopiedDays(new Set());
        }}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text variant="titleLarge" style={styles.modalTitle}>
          Copy Schedule
        </Text>
        <Text variant="bodyMedium" style={styles.modalSubtitle}>
          Select the days to copy this schedule to
        </Text>

        <List.Section>
          {DAYS_OF_WEEK.map(day => {
            if (day === copyFromDay) return null;

            const isCopied = copiedDays.has(day);
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);

            return (
              <List.Item
                key={day}
                title={dayName}
                onPress={() => {
                  if (copyFromDay && !isCopied) {
                    handleCopySchedule(copyFromDay, day);
                  }
                }}
                right={props => (
                  <List.Icon
                    {...props}
                    icon={isCopied ? 'check-circle' : 'content-copy'}
                    color={isCopied ? theme.colors.primary : props.color}
                  />
                )}
                style={[
                  styles.copyListItem,
                  isCopied && { backgroundColor: `${theme.colors.primary}10` },
                ]}
                titleStyle={[
                  { color: theme.colors.onSurface },
                  isCopied && { color: theme.colors.primary },
                ]}
                disabled={isCopied}
                rippleColor={isCopied ? 'transparent' : undefined}
              />
            );
          })}
        </List.Section>

        <Button
          mode="contained"
          onPress={() => {
            setCopyModalVisible(false);
            setCopiedDays(new Set());
          }}
          style={styles.modalButton}
        >
          Done
        </Button>
      </Modal>
    </Portal>
  );

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
      <View style={styles.scheduleContainer}>
        {DAYS_OF_WEEK.map(day => renderDaySchedule(day))}
      </View>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePickerVisible}
        onDismiss={() => {
          setTimePickerVisible(false);
          setSelectedTime(null);
        }}
        onConfirm={handleTimeConfirm}
        hours={
          selectedTime && timing.weeklySchedule
            ? parseInt(
                timing.weeklySchedule[selectedTime.day][selectedTime.meal][
                  selectedTime.type
                ].split(':')[0],
              )
            : 12
        }
        minutes={
          selectedTime && timing.weeklySchedule
            ? parseInt(
                timing.weeklySchedule[selectedTime.day][selectedTime.meal][
                  selectedTime.type
                ].split(':')[1],
              )
            : 0
        }
        use24HourClock
        locale="en"
      />

      {/* Copy Schedule Modal */}
      {renderCopyScheduleModal()}

      {/* Help Text */}
      <Card style={styles.helpCard}>
        <Card.Content>
          <Text variant="bodySmall" style={styles.helpText}>
            Set clear operating hours to help customers plan their visits. You
            can control lunch and dinner services independently for each day.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
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
    marginBottom: 16,
  },
  dayTitle: {
    marginBottom: 16,
  },
  mealSection: {
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTitle: {
    marginBottom: 0,
  },
  closedText: {
    opacity: 0.7,
  },
  closedTextActive: {
    color: 'red',
    opacity: 1,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeButton: {
    width: '100%',
  },
  timeButtonError: {
    borderColor: 'red',
  },
  timeSeperator: {
    marginHorizontal: 8,
  },
  copyButton: {
    marginTop: 16,
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
  copyListItem: {
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
});
