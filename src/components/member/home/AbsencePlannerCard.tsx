import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Menu,
  Portal,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';

import { useHomeStore } from '@/src/store/memberStores/homeStore';
import type { CustomTheme } from '@/src/types/theme';

// Create an interface for the date-meal selection pair
interface DateMealSelection {
  date: Date | undefined;
  meal: MealType | undefined;
}

const AbsencePlannerCard = () => {
  // Theme and store
  const theme = useTheme<CustomTheme>();
  const { plannedAbsences, setPlannedAbsences, deletePlannedAbsence } =
    useHomeStore();

  // Add state for the delete confirmation dialog
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [absenceToDelete, setAbsenceToDelete] = useState<string | null>(null);

  // Function to handle delete button click
  const handleDeleteClick = (id: string) => {
    // Store the ID of the absence to delete
    setAbsenceToDelete(id);
    // Show the confirmation dialog
    setConfirmationVisible(true);
  };

  // Function to confirm deletion
  const handleConfirmDelete = async () => {
    if (absenceToDelete) {
      try {
        await deletePlannedAbsence(absenceToDelete);
        // Clear the stored ID and hide the dialog
        setAbsenceToDelete(null);
        setConfirmationVisible(false);
      } catch (e) {
        console.error('Failed to delete absence:', e);
      }
    }
  };

  // Function to cancel deletion
  const handleCancelDelete = () => {
    setAbsenceToDelete(null);
    setConfirmationVisible(false);
  };

  // Find the absence details for the confirmation message
  const getAbsenceDetails = (id: string | null) => {
    if (!id) return '';

    const absence = plannedAbsences.find(a => a.id === id);
    if (!absence) return '';

    return `${format(new Date(absence.startDate), 'd MMM')} ${absence.startMeal} - ${format(new Date(absence.endDate), 'd MMM')} ${absence.endMeal}`;
  };

  // State for selections
  const [fromSelection, setFromSelection] = useState<DateMealSelection>({
    date: undefined,
    meal: undefined,
  });
  const [toSelection, setToSelection] = useState<DateMealSelection>({
    date: undefined,
    meal: undefined,
  });

  // State for menu visibility
  const [fromMenuVisible, setFromMenuVisible] = useState(false);
  const [toMenuVisible, setToMenuVisible] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Menu handling functions
  const openFromMenu = () => setFromMenuVisible(true);
  const closeFromMenu = () => setFromMenuVisible(false);
  const openToMenu = () => setToMenuVisible(true);
  const closeToMenu = () => setToMenuVisible(false);

  // Meal selection handlers
  const handleFromMealSelect = (meal: MealType) => {
    setFromSelection(prev => ({ ...prev, meal }));
    closeFromMenu();
  };

  const handleToMealSelect = (meal: MealType) => {
    setToSelection(prev => ({ ...prev, meal }));
    closeToMenu();
  };

  // Date selection handlers
  const handleFromDateSelect = (date: Date | undefined) => {
    setFromSelection(prev => ({ ...prev, date }));
  };

  const handleToDateSelect = (date: Date | undefined) => {
    setToSelection(prev => ({ ...prev, date }));
  };

  // Function to render a meal selection menu
  const renderMealMenu = (
    visible: boolean,
    onDismiss: () => void,
    onSelect: (meal: MealType) => void,
    selectedMeal: MealType | undefined,
    onOpen: () => void,
  ) => (
    <View style={styles.menuContainer}>
      <Menu
        visible={visible}
        onDismiss={onDismiss}
        anchor={
          <Button
            mode="contained"
            onPress={onOpen}
            style={[
              styles.menuButton,
              {
                backgroundColor: theme.colors.pr70,

                // borderColor: theme.colors.outline,
              },
            ]}
            icon="menu-down"
            contentStyle={[{ flexDirection: 'row-reverse' }]}
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
          titleStyle={[
            styles.menuItemTitle,
            {
              color: theme.colors.onSurface,
            },
          ]}
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
          titleStyle={[
            styles.menuItemTitle,
            {
              color: theme.colors.onSurface,
            },
          ]}
        />
      </Menu>
    </View>
  );

  // Function to handle setting the absence
  const handleSetAbsence = () => {
    // Validate all required fields
    if (
      !fromSelection.date ||
      !toSelection.date ||
      !fromSelection.meal ||
      !toSelection.meal
    ) {
      setError('Please select both dates and meals');
      return;
    }

    if (fromSelection.date > toSelection.date) {
      setError('Start date must be before end date');
      return;
    }

    // If dates are the same, validate meal order
    if (
      fromSelection.date.getTime() === toSelection.date.getTime() &&
      fromSelection.meal === 'dinner' &&
      toSelection.meal === 'lunch'
    ) {
      setError('Invalid meal selection for same day');
      return;
    }

    setError(null);

    // Create new absence plan with detailed meal information
    const newAbsence: AbsencePlan = {
      id: `absence-${Date.now()}`,
      startDate: fromSelection.date,
      endDate: toSelection.date,
      startMeal: fromSelection.meal,
      endMeal: toSelection.meal,
    };

    console.log('Absence is set: ', newAbsence);

    setPlannedAbsences([newAbsence]);

    // Reset form
    setFromSelection({ date: undefined, meal: undefined });
    setToSelection({ date: undefined, meal: undefined });
  };

  // Format the absence period for display
  const formatAbsencePeriod = (absence: AbsencePlan) => {
    const startDate = format(new Date(absence.startDate), 'd MMM');
    const endDate = format(new Date(absence.endDate), 'd MMM');
    return `${startDate} ${absence.startMeal} - ${endDate} ${absence.endMeal}`;
  };

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    <>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.upcomingAbsences}>
          {plannedAbsences.map(absence => (
            <View
              key={absence.id}
              style={[
                styles.absenceItem,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {formatAbsencePeriod(absence)}
              </Text>
              <IconButton
                icon="close"
                size={20}
                onPress={() => handleDeleteClick(absence.id)}
                iconColor={theme.colors.error}
              />
            </View>
          ))}
        </View>

        {/* Date Inputs */}
        <Card.Content style={styles.content}>
          {/* From Date and Meal Selection */}
          <View style={styles.dateSection}>
            <DatePickerInput
              locale="en"
              label="From"
              value={fromSelection.date}
              onChange={handleFromDateSelect}
              inputMode="start"
              validRange={{ startDate: yesterday }}
              iconColor={theme.colors.pr70}
              style={[styles.dateInput]}
              mode="flat"
            />
            {renderMealMenu(
              fromMenuVisible,
              closeFromMenu,
              handleFromMealSelect,
              fromSelection.meal,
              openFromMenu,
            )}
          </View>

          {/* To Date and Meal Selection */}
          <View style={styles.dateSection}>
            <DatePickerInput
              locale="en"
              label="To"
              value={toSelection.date}
              onChange={handleToDateSelect}
              inputMode="end"
              mode="flat"
              validRange={{ startDate: yesterday }}
              iconColor={theme.colors.pr70}
              contentStyle={{ flexDirection: 'row-reverse' }}
              // iconStyle={{ flexBasis: 'flexStart' }}
              style={[
                styles.dateInput,
                {
                  borderColor: theme.colors.surfaceVariant,
                  borderWidth: 1,
                },
              ]}
            />
            {renderMealMenu(
              toMenuVisible,
              closeToMenu,
              handleToMealSelect,
              toSelection.meal,
              openToMenu,
            )}
          </View>

          {/* Error Message */}
          {error && (
            <Text
              style={[styles.errorText, { color: theme.colors.error }]}
              variant="bodySmall"
            >
              {error}
            </Text>
          )}

          {/* Set Absence Button */}
          <Button
            mode="contained"
            onPress={handleSetAbsence}
            style={styles.button}
          >
            Set Absence
          </Button>
        </Card.Content>
      </Card>
      {/* Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={confirmationVisible}
          onDismiss={handleCancelDelete}
          style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
        >
          <Dialog.Title>Delete Absence</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete the absence for:
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.absenceDetail, { color: theme.colors.primary }]}
            >
              {getAbsenceDetails(absenceToDelete)}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelDelete}>Cancel</Button>
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
};

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
    justifyContent: 'center',
  },
  dateInput: {
    backgroundColor: 'transparent',
    flex: 0.3,
  },
  // menuContainer: {
  //   position: 'relative',
  // },
  // menuButton: {
  //   width: '100%',
  // },
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
    // width: '100%',
    position: 'relative',
    flex: 0.7,
    // zIndex: 1, // Ensure menu appears above other elements
  },
  menuButton: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 24,
  },
  menuContent: {
    // Style the menu popup itself
    marginTop: 4, // Space between button and menu
    borderRadius: 8,
    // Add a subtle shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    // Match width with button
    minWidth: '100%',
  },
  menuItem: {
    // Style individual menu items
    height: 48,
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    // Use theme color for consistent look
  },
  dialog: {
    borderRadius: 12,
    marginHorizontal: 16, // Add some margin on the sides
  },
  absenceDetail: {
    marginTop: 8,
    fontWeight: '500',
  },
});

export default AbsencePlannerCard;
