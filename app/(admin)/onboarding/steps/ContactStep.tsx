// This component manages the collection of contact information during onboarding.
// It ensures that mess administrators provide valid and accessible communication channels.
// The implementation includes sophisticated validation and formatting to maintain
// data quality while providing a smooth user experience.

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  HelperText,
  useTheme,
  Portal,
  Modal,
  List,
  Divider,
} from 'react-native-paper';

import { Text } from '../../../../src/components/common/Text';
import { useOnboardingStore } from '../../../../src/store/onboardingStore';

// We define strict validation rules for contact information to ensure quality
const CONTACT_VALIDATION = {
  phone: {
    required: true,
    pattern: /^[6-9]\d{9}$/,
    message: {
      required: 'Primary phone number is required',
      pattern: 'Enter a valid 10-digit Indian mobile number',
    },
  },
  alternatePhone: {
    pattern: /^[6-9]\d{9}$/,
    message: {
      pattern: 'Enter a valid 10-digit Indian mobile number',
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: {
      required: 'Email address is required',
      pattern: 'Enter a valid email address',
    },
  },
  website: {
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    message: {
      pattern: 'Enter a valid website URL',
    },
  },
};

// This interface defines the structure of our working hours
interface WorkingHours {
  day: string;
  isOpen: boolean;
  hours?: {
    open: string;
    close: string;
  };
}

export function ContactStep() {
  const theme = useTheme();
  const { contact, updateContact, errors, setError, clearError } =
    useOnboardingStore();
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState({
    title: '',
    content: '',
  });

  // Function to format phone numbers as they're typed
  const formatPhoneNumber = (value: string) => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');
    return cleaned;
  };

  // Function to validate contact fields
  const validateField = (field: string, value: string): string | null => {
    const rules = CONTACT_VALIDATION[field as keyof typeof CONTACT_VALIDATION];
    if (!rules) return null;

    if ('required' in rules && rules.required && !value.trim()) {
      return rules.message.required;
    }

    if (rules.pattern && value.trim() && !rules.pattern.test(value)) {
      return rules.message.pattern;
    }

    return null;
  };

  // Handle field changes with validation
  const handleFieldChange = (field: string, value: string) => {
    let processedValue = value;

    // Apply special formatting for phone numbers
    if (field === 'phone' || field === 'alternatePhone') {
      processedValue = formatPhoneNumber(value);
    }

    // Update the store with the new value
    updateContact({ [field]: processedValue });

    // Validate and update errors
    const error = validateField(field, processedValue);
    if (error) {
      setError(field, error);
    } else {
      clearError(field);
    }
  };

  // Show information dialog with helpful tips
  const showInfo = (type: 'phone' | 'email' | 'website') => {
    const content = {
      phone: {
        title: 'Phone Number Guidelines',
        content:
          'Your primary phone number should be readily accessible during business hours. This number will be used for important communications and customer inquiries.',
      },
      email: {
        title: 'Email Guidelines',
        content:
          'Use a business email address that you check regularly. This email will be used for account notifications and customer communications.',
      },
      website: {
        title: 'Website Guidelines',
        content:
          "If you have a website, ensure it's up-to-date with your current menu and services. This is optional but can help attract more customers.",
      },
    };

    setInfoDialogContent(content[type]);
    setShowInfoDialog(true);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Text variant="titleLarge" style={styles.title}>
        Contact Information
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Let's set up how customers can reach you
      </Text>

      {/* Phone Numbers Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">Phone Numbers</Text>
            <Button
              compact
              mode="text"
              onPress={() => showInfo('phone')}
              icon="information"
            >
              Info
            </Button>
          </View>

          <TextInput
            mode="outlined"
            label="Primary Phone Number"
            value={contact.phone || ''}
            onChangeText={text => handleFieldChange('phone', text)}
            keyboardType="phone-pad"
            maxLength={10}
            error={!!errors.phone}
            style={styles.input}
          />
          {errors.phone && (
            <HelperText type="error" visible={true}>
              {errors.phone}
            </HelperText>
          )}

          <TextInput
            mode="outlined"
            label="Alternate Phone Number (Optional)"
            value={contact.alternatePhone || ''}
            onChangeText={text => handleFieldChange('alternatePhone', text)}
            keyboardType="phone-pad"
            maxLength={10}
            error={!!errors.alternatePhone}
            style={styles.input}
          />
          {errors.alternatePhone && (
            <HelperText type="error" visible={true}>
              {errors.alternatePhone}
            </HelperText>
          )}
        </Card.Content>
      </Card>

      {/* Email Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">Email Address</Text>
            <Button
              compact
              mode="text"
              onPress={() => showInfo('email')}
              icon="information"
            >
              Info
            </Button>
          </View>

          <TextInput
            mode="outlined"
            label="Business Email"
            value={contact.email || ''}
            onChangeText={text => handleFieldChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            style={styles.input}
          />
          {errors.email && (
            <HelperText type="error" visible={true}>
              {errors.email}
            </HelperText>
          )}
        </Card.Content>
      </Card>

      {/* Website Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">Online Presence (Optional)</Text>
            <Button
              compact
              mode="text"
              onPress={() => showInfo('website')}
              icon="information"
            >
              Info
            </Button>
          </View>

          <TextInput
            mode="outlined"
            label="Website"
            value={contact.website || ''}
            onChangeText={text => handleFieldChange('website', text)}
            keyboardType="url"
            autoCapitalize="none"
            error={!!errors.website}
            style={styles.input}
          />
          {errors.website && (
            <HelperText type="error" visible={true}>
              {errors.website}
            </HelperText>
          )}
        </Card.Content>
      </Card>

      {/* Verification Note */}
      <Card style={styles.verificationCard}>
        <Card.Content>
          <Text variant="bodySmall" style={styles.verificationText}>
            Your contact information will be verified to ensure secure and
            reliable communication with your customers. Make sure all details
            are accurate and actively monitored.
          </Text>
        </Card.Content>
      </Card>

      {/* Information Dialog */}
      <Portal>
        <Modal
          visible={showInfoDialog}
          onDismiss={() => setShowInfoDialog(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            {infoDialogContent.title}
          </Text>
          <Text variant="bodyMedium" style={styles.modalContent}>
            {infoDialogContent.content}
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowInfoDialog(false)}
            style={styles.modalButton}
          >
            Got it
          </Button>
        </Modal>
      </Portal>
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
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  verificationCard: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  verificationText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalContent: {
    marginBottom: 24,
  },
  modalButton: {
    marginTop: 8,
  },
});
