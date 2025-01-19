//todo user should be able to delete the absence. user shouldn't allowed to delte or create absence after 1 hour remaining of the supposed planned absence.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button, Chip, useTheme } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

interface AbsencePlannerCardProps {
  onRegisterAbsence: (dates: AbsencePlan) => Promise<void>;
  existingPlans?: AbsencePlan[];
}

interface AbsencePlan {
  id?: string;
  startDate: Date;
  endDate: Date;
  meals: ('lunch' | 'dinner')[];
}

const AbsencePlannerCard: React.FC<AbsencePlannerCardProps> = ({
  onRegisterAbsence,
  existingPlans = [],
}) => {
  const theme = useTheme();
  const [isRegistering, setIsRegistering] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedMeals, setSelectedMeals] = useState<('lunch' | 'dinner')[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Toggle meal selection
  const toggleMeal = (meal: 'lunch' | 'dinner') => {
    setSelectedMeals(prev =>
      prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal],
    );
  };

  // Handle absence registration
  const handleRegister = async () => {
    if (!startDate || !endDate || selectedMeals.length === 0) return;

    setIsSubmitting(true);
    try {
      await onRegisterAbsence({
        startDate,
        endDate,
        meals: selectedMeals,
      });
      // Reset form after successful submission
      setIsRegistering(false);
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedMeals([]);
    } catch (error) {
      console.error('Failed to register absence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate dates
  const isValidDateRange = useCallback(() => {
    if (!startDate || !endDate) return false;
    return startDate <= endDate;
  }, [startDate, endDate]);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">Meal Skip Planner</Text>
          <MaterialCommunityIcons
            name="calendar-check"
            size={24}
            color={theme.colors.primary}
          />
        </View>

        {/* Existing Plans Section */}
        {existingPlans.length > 0 && (
          <View style={styles.existingPlans}>
            <Text variant="bodyMedium" style={styles.sectionTitle}>
              Planned Absences
            </Text>
            {existingPlans.map(plan => (
              <Animated.View
                key={plan.id}
                entering={FadeIn}
                layout={Layout.springify()}
                style={styles.planItem}
              >
                <View style={styles.planDateRange}>
                  <Text variant="bodyMedium" style={styles.dateText}>
                    {formatDate(plan.startDate)}
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text variant="bodyMedium" style={styles.dateText}>
                    {formatDate(plan.endDate)}
                  </Text>
                </View>
                <View style={styles.mealChips}>
                  {plan.meals.map(meal => (
                    <Chip
                      key={meal}
                      compact
                      mode="flat"
                      style={[
                        styles.mealChip,
                        { backgroundColor: theme.colors.primaryContainer },
                      ]}
                    >
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </Chip>
                  ))}
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Registration Form */}
        {isRegistering ? (
          <Animated.View entering={FadeIn} style={styles.registrationForm}>
            <Text variant="bodyMedium" style={styles.sectionTitle}>
              Select Dates
            </Text>

            <View style={styles.dateInputs}>
              <View style={styles.dateInput}>
                <DatePickerInput
                  locale="en"
                  label="Start Date"
                  value={startDate}
                  onChange={date => setStartDate(date)}
                  inputMode="start"
                  mode="outlined"
                  style={styles.input}
                />
              </View>
              <View style={styles.dateInput}>
                <DatePickerInput
                  locale="en"
                  label="End Date"
                  value={endDate}
                  onChange={date => setEndDate(date)}
                  inputMode="end"
                  mode="outlined"
                  style={styles.input}
                />
              </View>
            </View>

            <Text variant="bodyMedium" style={styles.sectionTitle}>
              Select Meals
            </Text>

            <View style={styles.mealSelection}>
              <Chip
                selected={selectedMeals.includes('lunch')}
                onPress={() => toggleMeal('lunch')}
                style={styles.mealSelectChip}
                showSelectedCheck
              >
                Lunch
              </Chip>
              <Chip
                selected={selectedMeals.includes('dinner')}
                onPress={() => toggleMeal('dinner')}
                style={styles.mealSelectChip}
                showSelectedCheck
              >
                Dinner
              </Chip>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => {
                  setIsRegistering(false);
                  setStartDate(undefined);
                  setEndDate(undefined);
                  setSelectedMeals([]);
                }}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleRegister}
                disabled={
                  !isValidDateRange() ||
                  selectedMeals.length === 0 ||
                  isSubmitting
                }
                loading={isSubmitting}
                style={styles.button}
              >
                Register
              </Button>
            </View>
          </Animated.View>
        ) : (
          <Button
            mode="contained-tonal"
            onPress={() => setIsRegistering(true)}
            style={styles.registerButton}
          >
            Plan New Absence
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  existingPlans: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    opacity: 0.7,
  },
  planItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  planDateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    flex: 1,
  },
  mealChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealChip: {
    borderRadius: 16,
  },
  registrationForm: {
    paddingTop: 8,
  },
  dateInputs: {
    marginBottom: 16,
  },
  dateInput: {
    marginVertical: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  mealSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 8,
  },
  mealSelectChip: {
    borderRadius: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    borderRadius: 8,
    minWidth: 100,
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 8,
  },
});

export default React.memo(AbsencePlannerCard);
