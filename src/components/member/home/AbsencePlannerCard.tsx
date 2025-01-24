// src/components/home/AbsencePlannerCard.tsx
import { format, isAfter, isBefore, addDays } from 'date-fns';
import React, { memo, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Text,
  Button,
  IconButton,
  SegmentedButtons,
  useTheme,
} from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';

import { Card } from '@/src/components/common/Card';
import { useHomeStore } from '@/src/store/memberStores/homeStore';
import { AbsencePlan } from '@/src/types/member/home';
import { CustomTheme } from '@/src/types/theme';

// Helper component for displaying individual absence items
const AbsenceItem = memo(
  ({
    absence,
    onDelete,
  }: {
    absence: AbsencePlan;
    onDelete: (id: string) => void;
  }) => {
    const theme = useTheme<CustomTheme>();
    // Format the date range for display
    const dateRange = useMemo(() => {
      const start = format(new Date(absence.startDate), 'd MMM');
      const end = format(new Date(absence.endDate), 'd MMM');
      const meals = absence.meals
        .map(m => m.charAt(0).toUpperCase() + m.slice(1))
        .join(' & ');
      return `${start} - ${end} (${meals})`;
    }, [absence]);

    return (
      <View style={styles.absenceItem}>
        <Text
          style={[
            styles.absenceText,
            {
              color: theme.colors.onSurface,
            },
          ]}
        >
          {dateRange}
        </Text>
        <IconButton
          icon="close-circle"
          size={20}
          iconColor={theme.colors.error}
          onPress={() => onDelete(absence.id)}
        />
      </View>
    );
  },
);

AbsenceItem.displayName = 'AbsenceItem';

const AbsencePlannerCard = memo(() => {
  const theme = useTheme<CustomTheme>();

  // Get absences data and actions from store
  const { plannedAbsences, isLoading, setPlannedAbsences } = useHomeStore(
    state => ({
      plannedAbsences: state.plannedAbsences,
      isLoading: state.isLoading,
      setPlannedAbsences: state.setPlannedAbsences,
    }),
  );

  // Local state for form
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedMeals, setSelectedMeals] = useState<string[]>([
    'lunch',
    'dinner',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sort absences by start date
  const sortedAbsences = useMemo(() => {
    return [...plannedAbsences].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }, [plannedAbsences]);

  // Validate dates and check for overlaps
  const validateDates = useCallback(() => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return false;
    }

    if (isBefore(endDate, startDate)) {
      setError('End date cannot be before start date');
      return false;
    }

    if (isBefore(startDate, new Date())) {
      setError('Cannot set absence for past dates');
      return false;
    }

    // Check for overlapping absences
    const hasOverlap = plannedAbsences.some(absence => {
      const absenceStart = new Date(absence.startDate);
      const absenceEnd = new Date(absence.endDate);
      return (
        (isAfter(startDate, absenceStart) && isBefore(startDate, absenceEnd)) ||
        (isAfter(endDate, absenceStart) && isBefore(endDate, absenceEnd)) ||
        (isBefore(startDate, absenceStart) && isAfter(endDate, absenceEnd))
      );
    });

    if (hasOverlap) {
      setError('Selected dates overlap with existing absences');
      return false;
    }

    setError(null);
    return true;
  }, [startDate, endDate, plannedAbsences]);

  // Handle absence submission
  const handleSubmit = useCallback(async () => {
    if (!validateDates()) return;

    setIsSubmitting(true);
    try {
      // Create new absence plan
      const newAbsence: AbsencePlan = {
        id: Date.now().toString(), // Temporary ID, should be replaced by backend
        startDate: startDate!,
        endDate: endDate!,
        meals: selectedMeals as ('lunch' | 'dinner')[],
      };

      // TODO: Send to backend
      // await api.createAbsence(newAbsence);

      // Optimistic update
      await setPlannedAbsences([...plannedAbsences, newAbsence]);

      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedMeals(['lunch', 'dinner']);
    } catch (e) {
      setError('Failed to set absence. Please try again.');
      console.error('Failed to set absence:', e);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    startDate,
    endDate,
    selectedMeals,
    plannedAbsences,
    setPlannedAbsences,
    validateDates,
  ]);

  // Handle absence deletion
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        // TODO: Send to backend
        // await api.deleteAbsence(id);

        // Optimistic update
        const updatedAbsences = plannedAbsences.filter(
          absence => absence.id !== id,
        );
        await setPlannedAbsences(updatedAbsences);
      } catch (e) {
        console.error('Failed to delete absence:', e);
        // You might want to show an error message here
      }
    },
    [plannedAbsences, setPlannedAbsences],
  );

  return (
    <Card>
      <Text
        variant="titleLarge"
        style={[
          styles.title,
          {
            color: theme.colors.onSurface,
          },
        ]}
      >
        Meal Absence Planner
      </Text>

      {/* Upcoming absences section */}
      {sortedAbsences.length > 0 && (
        <View style={styles.absenceList}>
          <Text
            variant="titleMedium"
            style={[
              styles.subtitle,
              {
                color: theme.colors.onSurfaceVariant,
              },
            ]}
          >
            Upcoming Absences
          </Text>
          {sortedAbsences.map(absence => (
            <AbsenceItem
              key={absence.id}
              absence={absence}
              onDelete={handleDelete}
            />
          ))}
        </View>
      )}

      {/* Date selection section */}
      <View
        style={[
          styles.dateInputs,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <DatePickerInput
          locale="en"
          label="From"
          value={startDate}
          onChange={date => {
            setStartDate(date);
            setError(null);
          }}
          inputMode="start"
          style={styles.dateInput}
          contentStyle={{
            backgroundColor: theme.colors.surface,
          }}
          validRange={{ startDate: addDays(new Date(), 1) }}
          mode="outlined"
        />
        <DatePickerInput
          locale="en"
          label="To"
          value={endDate}
          onChange={date => {
            setEndDate(date);
            setError(null);
          }}
          inputMode="end"
          style={styles.dateInput}
          contentStyle={{
            backgroundColor: theme.colors.surface,
          }}
          validRange={{
            startDate: startDate || addDays(new Date(), 1),
          }}
          mode="outlined"
        />
      </View>

      {/* Meal selection */}
      <SegmentedButtons
        value={selectedMeals.join(',')}
        onValueChange={value => {
          const meals = value.split(',');
          setSelectedMeals(meals.length ? meals : ['lunch']);
        }}
        buttons={[
          { value: 'lunch', label: 'Lunch' },
          { value: 'dinner', label: 'Dinner' },
          { value: 'lunch,dinner', label: 'Both' },
        ]}
        style={styles.mealSelector}
      />

      {/* Error message */}
      {error && (
        <Text
          style={[
            styles.errorText,
            {
              color: theme.colors.error,
            },
          ]}
        >
          {error}
        </Text>
      )}

      {/* Submit button */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={isSubmitting || !startDate || !endDate}
        style={styles.button}
        buttonColor={theme.colors.primary}
      >
        Set Absence
      </Button>
    </Card>
  );
});

export default AbsencePlannerCard;

AbsencePlannerCard.displayName = 'AbsencePlannerCard';

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 8,
  },
  absenceList: {
    marginBottom: 16,
  },
  absenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  absenceText: {
    flex: 1,
  },
  dateInputs: {
    marginBottom: 16,
  },
  dateInput: {
    marginBottom: 8,
  },

  mealSelector: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 12,
  },
  button: {
    marginTop: 8,
  },
});
