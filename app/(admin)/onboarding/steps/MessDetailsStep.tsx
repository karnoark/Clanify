// This component handles the collection of basic mess business information.
// It serves as the first step in the onboarding process, gathering essential
// details that form the foundation of the mess profile. The component implements
// real-time validation and provides immediate feedback to ensure data quality.

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  TextInput,
  SegmentedButtons,
  Button,
  useTheme,
  HelperText,
  Chip,
} from 'react-native-paper';

import { Text } from '../../../../src/components/common/Text';
import {
  MessDetails,
  useOnboardingStore,
} from '../../../../src/store/onboardingStore';

// Let's create a validation helper that explains the rules for each field
const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-&]+$/,
    message: {
      required: 'Mess name is required',
      minLength: 'Name must be at least 3 characters',
      maxLength: 'Name cannot exceed 50 characters',
      pattern: 'Name can only contain letters, numbers, spaces, hyphens, and &',
    },
  },
  description: {
    required: true,
    minLength: 20,
    maxLength: 500,
    message: {
      required: 'Description is required',
      minLength: 'Description must be at least 20 characters',
      maxLength: 'Description cannot exceed 500 characters',
    },
  },
  capacity: {
    required: true,
    min: 5,
    max: 1000,
    message: {
      required: 'Capacity is required',
      min: 'Minimum capacity should be 5',
      max: 'Maximum capacity cannot exceed 1000',
    },
  },
  monthlyRate: {
    required: true,
    min: 500,
    max: 50000,
    message: {
      required: 'Monthly rate is required',
      min: 'Monthly rate should be at least ₹500',
      max: 'Monthly rate cannot exceed ₹50,000',
    },
  },
};

export function MessDetailsStep() {
  const theme = useTheme();
  const { messDetails, updateMessDetails, errors, setError, clearError } =
    useOnboardingStore();

  // Local state for managing specialties input
  const [newSpecialty, setNewSpecialty] = useState('');

  // Function to validate a single field
  const validateField = (
    field: string,
    value: string | number,
  ): string | null => {
    const rules = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES];
    if (!rules) return null;

    if (rules.required && !value) {
      return rules.message.required;
    }

    if (typeof value === 'string') {
      if (
        'minLength' in rules &&
        rules.minLength &&
        value.length < rules.minLength
      ) {
        return rules.message.minLength;
      }
      if (
        'maxLength' in rules &&
        rules.maxLength &&
        value.length > rules.maxLength
      ) {
        return rules.message.maxLength;
      }
      if ('pattern' in rules && rules.pattern && !rules.pattern.test(value)) {
        return rules.message.pattern;
      }
    }

    if (typeof value === 'number') {
      if ('min' in rules && rules.min && value < rules.min) {
        return rules.message.min;
      }
      if ('max' in rules && rules.max && value > rules.max) {
        return rules.message.max;
      }
    }

    return null;
  };

  // Function to handle field changes with validation
  const handleFieldChange = <K extends keyof MessDetails>(
    field: K,
    value: MessDetails[K],
  ) => {
    // Update the store
    updateMessDetails({ [field]: value });

    // Validate and update errors
    let error;
    if (typeof value === 'string' || typeof value === 'number') {
      error = validateField(field, value);
    } else {
      error = 'validation not defined';
    }
    if (error) {
      setError(field, error);
    } else {
      clearError(field);
    }
  };

  // Function to handle adding a specialty
  const handleAddSpecialty = () => {
    if (!newSpecialty.trim()) return;

    const specialties = messDetails.specialties || [];
    if (specialties.length < 10) {
      // Limit to 10 specialties
      updateMessDetails({
        specialties: [...specialties, newSpecialty.trim()],
      });
      setNewSpecialty('');
    }
  };

  // Function to remove a specialty
  const handleRemoveSpecialty = (specialty: string) => {
    const specialties = messDetails.specialties || [];
    updateMessDetails({
      specialties: specialties.filter(s => s !== specialty),
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Text variant="titleLarge" style={styles.title}>
        Basic Information
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Let's start with the essential details about your mess
      </Text>

      {/* Mess Name */}
      <TextInput
        mode="flat"
        label="Mess Name"
        value={messDetails.name || ''}
        onChangeText={text => handleFieldChange('name', text)}
        error={!!errors.name}
        style={styles.input}
      />
      {errors.name && (
        <HelperText type="error" visible={true}>
          {errors.name}
        </HelperText>
      )}

      {/* Mess Description */}
      <TextInput
        mode="flat"
        label="Description"
        value={messDetails.description || ''}
        onChangeText={text => handleFieldChange('description', text)}
        multiline
        numberOfLines={4}
        error={!!errors.description}
        style={styles.input}
      />
      {errors.description && (
        <HelperText type="error" visible={true}>
          {errors.description}
        </HelperText>
      )}

      {/* Mess Type Selection */}
      <Text variant="bodyMedium" style={styles.sectionLabel}>
        Type of Mess
      </Text>
      <SegmentedButtons
        value={messDetails.type || 'both'}
        onValueChange={value =>
          handleFieldChange('type', value as 'veg' | 'non-veg' | 'both')
        }
        buttons={[
          {
            value: 'veg',
            label: 'Veg Only',
            checkedColor: '#4CAF50', // Green for veg
          },
          {
            value: 'non-veg',
            label: 'Non-veg',
            checkedColor: '#F44336', // Red for non-veg
          },
          {
            value: 'both',
            label: 'Both',
            checkedColor: '#2196F3', // Blue for both
          },
        ]}
        style={styles.segmentedButton}
      />

      {/* Specialties Section */}
      <Text variant="bodyMedium" style={styles.sectionLabel}>
        Specialties
      </Text>
      <View style={styles.specialtiesContainer}>
        {(messDetails.specialties || []).map((specialty, index) => (
          <Chip
            key={index}
            onClose={() => handleRemoveSpecialty(specialty)}
            style={styles.chip}
          >
            {specialty}
          </Chip>
        ))}
      </View>
      <View style={styles.specialtyInput}>
        <TextInput
          mode="flat"
          label="Add Specialty"
          value={newSpecialty}
          onChangeText={setNewSpecialty}
          style={styles.flex1}
        />
        <Button
          mode="contained"
          onPress={handleAddSpecialty}
          disabled={
            !newSpecialty.trim() || (messDetails.specialties || []).length >= 10
          }
          style={styles.addButton}
        >
          Add
        </Button>
      </View>
      <HelperText type="info" visible={true}>
        Add up to 10 specialty dishes that make your mess unique
      </HelperText>

      {/* Capacity and Pricing */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <TextInput
            mode="flat"
            label="Capacity"
            value={messDetails.capacity?.toString() || ''}
            onChangeText={text =>
              handleFieldChange('capacity', parseInt(text, 10) ?? 0)
            }
            keyboardType="numeric"
            error={!!errors.capacity}
            style={styles.input}
          />
          {errors.capacity && (
            <HelperText type="error" visible={true}>
              {errors.capacity}
            </HelperText>
          )}
        </View>

        <View style={[styles.flex1, styles.marginLeft]}>
          <TextInput
            mode="flat"
            label="Monthly Rate (₹)"
            value={messDetails.monthlyRate?.toString() || ''}
            onChangeText={text =>
              handleFieldChange('monthlyRate', parseInt(text, 10) ?? 0)
            }
            keyboardType="numeric"
            error={!!errors.monthlyRate}
            style={styles.input}
          />
          {errors.monthlyRate && (
            <HelperText type="error" visible={true}>
              {errors.monthlyRate}
            </HelperText>
          )}
        </View>
      </View>

      <TextInput
        mode="flat"
        label="Security Deposit"
        value={messDetails.securityDeposit?.toString() || ''}
        onChangeText={text =>
          handleFieldChange('securityDeposit', parseInt(text, 10) ?? 0)
        }
        keyboardType="numeric"
        style={styles.input}
      />
      <HelperText type="info" visible={true}>
        This helps build trust with potential customers
      </HelperText>

      {/* Year of Establishment */}
      <TextInput
        mode="flat"
        label="Year of Establishment"
        value={messDetails.establishmentYear || ''}
        onChangeText={text => handleFieldChange('establishmentYear', text)}
        keyboardType="numeric"
        maxLength={4}
        style={styles.input}
      />
      <HelperText type="info" visible={true}>
        This helps build trust with potential customers
      </HelperText>
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
  input: {
    marginBottom: 8,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButton: {
    marginBottom: 16,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  flex1: {
    flex: 1,
  },
  addButton: {
    marginTop: 6, // Align with TextInput
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  marginLeft: {
    marginLeft: 8,
  },
});
