// src/components/member/home/AbsencePlannerCard.tsx
import { format } from 'date-fns';
import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Menu,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';

import { useHomeStore } from '@/src/store/memberStores/homeStore';
import type { AbsencePlan } from '@/src/types/member/absence';
import type { CustomTheme } from '@/src/types/theme';

// Define interface for date-meal selection to improve type safety
interface DateMealSelection {
  date: Date | undefined;
  meal: MealType | undefined;
}

// Component to display a meal selection menu
const MealSelectionMenu = memo(
  ({
    visible,
    onDismiss,
    onSelect,
    selectedMeal,
    onOpen,
    theme,
  }: {
    visible: boolean;
    onDismiss: () => void;
    onSelect: (meal: MealType) => void;
    selectedMeal: MealType | undefined;
    onOpen: () => void;
    theme: CustomTheme;
  }) => (
    <View style={styles.menuContainer}>
      <Menu
        visible={visible}
        onDismiss={onDismiss}
        anchor={
          <Button
            mode="contained"
            onPress={onOpen}
            style={[styles.menuButton, { backgroundColor: theme.colors.pr70 }]}
            icon="menu-down"
            contentStyle={{ flexDirection: 'row-reverse' }}
          >
            {selectedMeal
              ? selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)
              : 'Select Meal'}
          </Button>
        }
      >
        <Menu.Item
          onPress={() => onSelect('lunch')}
          title="Lunch"
          leadingIcon="white-balance-sunny"
          style={[
            styles.menuItem,
            {
              backgroundColor: theme.colors.pr70,
              borderTopStartRadius: 10,
              borderTopEndRadius: 10,
              borderBottomColor: theme.colors.pr100,
              borderBottomWidth: 2,
            },
          ]}
          titleStyle={[styles.menuItemTitle, { color: theme.colors.onSurface }]}
        />
        <Menu.Item
          onPress={() => onSelect('dinner')}
          title="Dinner"
          leadingIcon="moon-waning-crescent"
          style={[
            styles.menuItem,
            {
              backgroundColor: theme.colors.pr70,
              borderBottomStartRadius: 10,
              borderBottomEndRadius: 10,
            },
          ]}
          titleStyle={[styles.menuItemTitle, { color: theme.colors.onSurface }]}
        />
      </Menu>
    </View>
  ),
);

MealSelectionMenu.displayName = 'MealSelectionMenu';

// Component to display existing absences
const ExistingAbsences = memo(
  ({
    absences,
    onDelete,
    theme,
  }: {
    absences: AbsencePlan[];
    onDelete: (id: string) => void;
    theme: CustomTheme;
  }) => (
    <View style={styles.upcomingAbsences}>
      {absences.map(absence => (
        <View
          key={absence.id}
          style={[
            styles.absenceItem,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            {format(new Date(absence.startDate), 'd MMM')} {absence.startMeal}
            {' - '}
            {format(new Date(absence.endDate), 'd MMM')} {absence.endMeal}
          </Text>
          <IconButton
            icon="close"
            size={20}
            onPress={() => onDelete(absence.id)}
            iconColor={theme.colors.error}
          />
        </View>
      ))}
    </View>
  ),
);

ExistingAbsences.displayName = 'ExistingAbsences';

// Main AbsencePlannerCard component
const AbsencePlannerCard = memo(() => {
  const theme = useTheme<CustomTheme>();

  // Get state and actions from store
  const {
    plannedAbsences,
    setPlannedAbsences,
    deletePlannedAbsence,
    isAbsencesLoading,
    absencesError,
  } = useHomeStore();

  // Local state for form management
  const [fromSelection, setFromSelection] = useState<DateMealSelection>({
    date: undefined,
    meal: undefined,
  });
  const [toSelection, setToSelection] = useState<DateMealSelection>({
    date: undefined,
    meal: undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);

  // State for menu visibility
  const [fromMenuVisible, setFromMenuVisible] = useState(false);
  const [toMenuVisible, setToMenuVisible] = useState(false);

  // State for delete confirmation
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [absenceToDelete, setAbsenceToDelete] = useState<string | null>(null);

  // Menu handling functions
  const openFromMenu = useCallback(() => setFromMenuVisible(true), []);
  const closeFromMenu = useCallback(() => setFromMenuVisible(false), []);
  const openToMenu = useCallback(() => setToMenuVisible(true), []);
  const closeToMenu = useCallback(() => setToMenuVisible(false), []);

  // Handle meal selection
  const handleFromMealSelect = useCallback(
    (meal: MealType) => {
      setFromSelection(prev => ({ ...prev, meal }));
      closeFromMenu();
    },
    [closeFromMenu],
  );

  const handleToMealSelect = useCallback(
    (meal: MealType) => {
      setToSelection(prev => ({ ...prev, meal }));
      closeToMenu();
    },
    [closeToMenu],
  );

  // Handle date selection
  const handleFromDateSelect = useCallback((date: Date | undefined) => {
    setFromSelection(prev => ({ ...prev, date }));
    setFormError(null);
  }, []);

  const handleToDateSelect = useCallback((date: Date | undefined) => {
    setToSelection(prev => ({ ...prev, date }));
    setFormError(null);
  }, []);

  // Validate absence request
  const validateAbsenceRequest = useCallback(() => {
    if (
      !fromSelection.date ||
      !toSelection.date ||
      !fromSelection.meal ||
      !toSelection.meal
    ) {
      setFormError('Please select both dates and meals');
      return false;
    }

    if (fromSelection.date > toSelection.date) {
      setFormError('Start date must be before end date');
      return false;
    }

    if (
      fromSelection.date.getTime() === toSelection.date.getTime() &&
      fromSelection.meal === 'dinner' &&
      toSelection.meal === 'lunch'
    ) {
      setFormError('Invalid meal selection for same day');
      return false;
    }

    return true;
  }, [fromSelection, toSelection]);

  // Handle setting absence
  const handleSetAbsence = useCallback(async () => {
    if (!validateAbsenceRequest()) return;

    try {
      const newAbsence: AbsencePlan = {
        id: `absence-${Date.now()}`,
        startDate: fromSelection.date!,
        endDate: toSelection.date!,
        startMeal: fromSelection.meal!,
        endMeal: toSelection.meal!,
      };

      await setPlannedAbsences([newAbsence]);

      // Reset form on success
      setFromSelection({ date: undefined, meal: undefined });
      setToSelection({ date: undefined, meal: undefined });
      setFormError(null);
    } catch (error) {
      // Store handles the error state
      console.error('Failed to set absence:', error);
    }
  }, [fromSelection, toSelection, setPlannedAbsences, validateAbsenceRequest]);

  // Handle delete request
  const handleDeleteClick = useCallback((id: string) => {
    setAbsenceToDelete(id);
    setConfirmationVisible(true);
  }, []);

  // Handle delete confirmation
  const handleConfirmDelete = useCallback(async () => {
    if (absenceToDelete) {
      try {
        await deletePlannedAbsence(absenceToDelete);
      } catch (error) {
        console.error('Failed to delete absence:', error);
      } finally {
        setAbsenceToDelete(null);
        setConfirmationVisible(false);
      }
    }
  }, [absenceToDelete, deletePlannedAbsence]);

  // Get yesterday's date for date picker validation
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    <>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {/* Show error message if there's an error from the store */}
        {absencesError && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {absencesError}
          </Text>
        )}

        {/* Display existing absences */}
        <ExistingAbsences
          absences={plannedAbsences}
          onDelete={handleDeleteClick}
          theme={theme}
        />

        <Card.Content style={styles.content}>
          {/* From Date Selection */}
          <View style={styles.dateSection}>
            <DatePickerInput
              locale="en"
              label="From"
              value={fromSelection.date}
              onChange={handleFromDateSelect}
              inputMode="start"
              validRange={{ startDate: yesterday }}
              iconColor={theme.colors.pr70}
              style={styles.dateInput}
              mode="flat"
              disabled={isAbsencesLoading}
            />
            <MealSelectionMenu
              visible={fromMenuVisible}
              onDismiss={closeFromMenu}
              onSelect={handleFromMealSelect}
              selectedMeal={fromSelection.meal}
              onOpen={openFromMenu}
              theme={theme}
            />
          </View>

          {/* To Date Selection */}
          <View style={styles.dateSection}>
            <DatePickerInput
              locale="en"
              label="To"
              value={toSelection.date}
              onChange={handleToDateSelect}
              inputMode="end"
              validRange={{ startDate: yesterday }}
              iconColor={theme.colors.pr70}
              style={styles.dateInput}
              mode="flat"
              disabled={isAbsencesLoading}
            />
            <MealSelectionMenu
              visible={toMenuVisible}
              onDismiss={closeToMenu}
              onSelect={handleToMealSelect}
              selectedMeal={toSelection.meal}
              onOpen={openToMenu}
              theme={theme}
            />
          </View>

          {/* Form Error Message */}
          {formError && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {formError}
            </Text>
          )}

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSetAbsence}
            style={styles.button}
            loading={isAbsencesLoading}
            disabled={isAbsencesLoading}
          >
            Set Absence
          </Button>
        </Card.Content>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={confirmationVisible}
          onDismiss={() => setConfirmationVisible(false)}
          style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
        >
          <Dialog.Title>Delete Absence</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this absence?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmationVisible(false)}>
              Cancel
            </Button>
            <Button
              onPress={handleConfirmDelete}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
});

AbsencePlannerCard.displayName = 'AbsencePlannerCard';

const styles = StyleSheet.create({
  card: {
    margin: 16,
    overflow: 'hidden',
  },
  content: {
    gap: 16,
    padding: 16,
  },
  dateSection: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    backgroundColor: 'transparent',
    flex: 0.3,
  },
  button: {
    marginTop: 16,
  },
  upcomingAbsences: {
    padding: 16,
    gap: 8,
  },
  absenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    borderRadius: 8,
  },
  errorText: {
    marginTop: 4,
  },
  menuContainer: {
    position: 'relative',
    flex: 0.7,
  },
  menuButton: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 24,
  },
  menuItem: {
    height: 48,
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
  },
  dialog: {
    borderRadius: 12,
    marginHorizontal: 16,
  },
});

export default AbsencePlannerCard;
