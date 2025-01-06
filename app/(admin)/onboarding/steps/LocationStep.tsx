// This component handles location and address collection during the onboarding process.
// It provides both manual address input and automatic location detection using GPS.
// The component prioritizes accuracy while maintaining a user-friendly interface,
// as correct location information is crucial for customers to find the mess.

import * as Location from 'expo-location';
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  HelperText,
  useTheme,
  IconButton,
  Portal,
  Modal,
} from 'react-native-paper';

import { Text } from '../../../../src/components/common/Text';
import { useOnboardingStore } from '../../../../src/store/onboardingStore';

// Define validation rules for address fields
const ADDRESS_VALIDATION = {
  street: {
    required: true,
    minLength: 5,
    maxLength: 100,
    message: {
      required: 'Street address is required',
      minLength: 'Address is too short',
      maxLength: 'Address is too long',
    },
  },
  area: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: {
      required: 'Area/Locality is required',
      minLength: 'Area name is too short',
      maxLength: 'Area name is too long',
    },
  },
  city: {
    required: true,
    pattern: /^[a-zA-Z\s]+$/,
    message: {
      required: 'City is required',
      pattern: 'City name should only contain letters',
    },
  },
  state: {
    required: true,
    pattern: /^[a-zA-Z\s]+$/,
    message: {
      required: 'State is required',
      pattern: 'State name should only contain letters',
    },
  },
  pincode: {
    required: true,
    pattern: /^[1-9][0-9]{5}$/,
    message: {
      required: 'PIN code is required',
      pattern: 'Enter a valid 6-digit PIN code',
    },
  },
};

export function LocationStep() {
  const theme = useTheme();
  const { location, updateLocation, errors, setError, clearError } =
    useOnboardingStore();
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Function to validate a single address field
  const validateField = (field: string, value: string): string | null => {
    const rules = ADDRESS_VALIDATION[field as keyof typeof ADDRESS_VALIDATION];
    if (!rules) return null;

    if (rules.required && !value.trim()) {
      return rules.message.required;
    }

    if (rules.minLength && value.length < rules.minLength) {
      return rules.message.minLength;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.message.maxLength;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message.pattern;
    }

    return null;
  };

  // Handle address field changes with validation
  const handleFieldChange = (field: string, value: string) => {
    // Update the nested address object in location state
    updateLocation({
      address: {
        ...location.address,
        [field]: value,
      },
    });

    // Validate and update errors
    const error = validateField(field, value);
    if (error) {
      setError(`address.${field}`, error);
    } else {
      clearError(`address.${field}`);
    }
  };

  // Function to detect current location
  const handleLocationDetection = async () => {
    try {
      setIsLocating(true);
      setLocationError(null);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      // Get current location with high accuracy
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Use reverse geocoding to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address) {
        // Update location in store
        updateLocation({
          coordinates: {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          },
          address: {
            street: address.street || '',
            area: address.district || '',
            city: address.city || '',
            state: address.region || '',
            pincode: address.postalCode || '',
          },
        });
      }
    } catch (error) {
      setLocationError(
        'Failed to detect location. Please try again or enter manually.',
      );
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Text variant="titleLarge" style={styles.title}>
        Location Details
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Help customers find your mess easily
      </Text>

      {/* Location Detection Card */}
      <Card style={styles.detectionCard}>
        <Card.Content>
          <View style={styles.detectionContent}>
            <View style={styles.flex1}>
              <Text variant="titleMedium">Detect Location</Text>
              <Text variant="bodySmall" style={styles.detectionDescription}>
                Use your current location to automatically fill the address
              </Text>
            </View>
            <Button
              mode="contained-tonal"
              onPress={handleLocationDetection}
              loading={isLocating}
              icon="crosshairs-gps"
            >
              {isLocating ? 'Detecting...' : 'Detect'}
            </Button>
          </View>
          {locationError && (
            <HelperText type="error" visible={true}>
              {locationError}
            </HelperText>
          )}
        </Card.Content>
      </Card>

      {/* Manual Address Input */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Address Details
      </Text>

      <TextInput
        mode="outlined"
        label="Street Address"
        value={location.address?.street || ''}
        onChangeText={text => handleFieldChange('street', text)}
        multiline
        numberOfLines={2}
        error={!!errors['address.street']}
        style={styles.input}
      />
      {errors['address.street'] && (
        <HelperText type="error" visible={true}>
          {errors['address.street']}
        </HelperText>
      )}

      <TextInput
        mode="outlined"
        label="Area/Locality"
        value={location.address?.area || ''}
        onChangeText={text => handleFieldChange('area', text)}
        error={!!errors['address.area']}
        style={styles.input}
      />
      {errors['address.area'] && (
        <HelperText type="error" visible={true}>
          {errors['address.area']}
        </HelperText>
      )}

      {/* City and PIN Code row */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <TextInput
            mode="outlined"
            label="City"
            value={location.address?.city || ''}
            onChangeText={text => handleFieldChange('city', text)}
            error={!!errors['address.city']}
            style={styles.input}
          />
          {errors['address.city'] && (
            <HelperText type="error" visible={true}>
              {errors['address.city']}
            </HelperText>
          )}
        </View>

        <View style={[styles.flex1, styles.marginLeft]}>
          <TextInput
            mode="outlined"
            label="PIN Code"
            value={location.address?.pincode || ''}
            onChangeText={text => handleFieldChange('pincode', text)}
            keyboardType="numeric"
            maxLength={6}
            error={!!errors['address.pincode']}
            style={styles.input}
          />
          {errors['address.pincode'] && (
            <HelperText type="error" visible={true}>
              {errors['address.pincode']}
            </HelperText>
          )}
        </View>
      </View>

      <TextInput
        mode="outlined"
        label="State"
        value={location.address?.state || ''}
        onChangeText={text => handleFieldChange('state', text)}
        error={!!errors['address.state']}
        style={styles.input}
      />
      {errors['address.state'] && (
        <HelperText type="error" visible={true}>
          {errors['address.state']}
        </HelperText>
      )}

      {/* Location Verification Note */}
      <Card style={styles.verificationCard}>
        <Card.Content>
          <Text variant="bodySmall" style={styles.verificationText}>
            Your address will be verified to ensure accurate delivery and
            customer visits. Please make sure all details are correct.
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
  detectionCard: {
    marginBottom: 24,
  },
  detectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detectionDescription: {
    marginTop: 4,
    opacity: 0.7,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 8,
  },
  verificationCard: {
    marginTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  verificationText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
