import { Link, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  useTheme,
  TextInput,
  HelperText,
  Checkbox,
  Button,
  Portal,
  Dialog,
  SegmentedButtons,
  RadioButton,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmailOtpParams } from '@/app/(auth)/verify';
import { Text } from '@/src/components/common/Text';
import { Pdstyles } from '@/src/constants/Styles';
import { useAuthStore, UserRole } from '@/src/store/auth';
import {
  hasErrorsInEmail,
  hasErrorsInName,
  hasErrorsInPassword,
} from '@/src/utils/InputValidation';

const { width } = Dimensions.get('window');

// We'll use this type to manage different states of the verification process
type VerificationStatus = 'idle' | 'sending' | 'success' | 'error';

interface ValidationErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

interface SignupFormState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
  role: UserRole;
  touched: {
    email: boolean;
    password: boolean;
    firstName: boolean;
    lastName: boolean;
  };
  isSubmitting: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

const Page = () => {
  const { top } = useSafeAreaInsets();
  const signUp = useAuthStore(state => state.signUp);

  const [showEmailVerificationDialog, setShowEmailVerificationDialog] =
    useState(false);
  const theme = useTheme();

  // Determine platform-specific keyboard behavior
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';

  // Verification process state
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Validate a single field

  // Reference to ScrollView for programmatic scrolling
  const scrollViewRef = useRef(null);

  const initialFormState = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    termsAccepted: false,
    role: 'member' as const,
    touched: {
      email: false,
      password: false,
      firstName: false,
      lastName: false,
    },
    isSubmitting: false,
  };
  const [formState, setFormState] = useState<SignupFormState>(initialFormState);

  // Dedicated error state
  const [errors, setErrors] = useState<FormErrors>({});

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  //input handler that provides real-time validation feedback
  const handleInputChange =
    (
      field: keyof Omit<
        SignupFormState,
        'touched' | 'isSubmitting' | 'termsAccepted'
      >,
    ) =>
    (value: string) => {
      setFormState(prev => ({
        ...prev,
        [field]: value,
        touched: {
          ...prev.touched,
          [field]: true,
        },
      }));

      // Clear error when user starts typing
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    };

  const emptyTheForm = () => {
    setFormState(initialFormState);
  };

  const handleVerify = async () => {
    try {
      // Validate all fields before submission
      const formErrors: FormErrors = {};

      if (hasErrorsInEmail(formState.email)) {
        formErrors.email = 'Please enter a valid email address';
      }
      if (hasErrorsInPassword(formState.password)) {
        formErrors.password = "Password doesn't meet requirements";
      }
      if (hasErrorsInName(formState.firstName)) {
        formErrors.firstName = 'First name should be 2-15 characters';
      }
      if (hasErrorsInName(formState.lastName)) {
        formErrors.lastName = 'Last name should be 2-15 characters';
      }

      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
      }

      setFormState(prev => ({ ...prev, isSubmitting: true }));

      await signUp({
        email: formState.email,
        password: formState.password,
        firstName: formState.firstName,
        lastName: formState.lastName,
        role: formState.role,
      });

      setShowEmailVerificationDialog(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Registration failed',
      );
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Add real-time validation
  useEffect(() => {
    if (formState.touched.email) {
      setErrors(prev => ({
        ...prev,
        email: hasErrorsInEmail(formState.email)
          ? 'Please enter a valid email address'
          : undefined,
      }));
    }
    if (formState.touched.password) {
      setErrors(prev => ({
        ...prev,
        password: hasErrorsInPassword(formState.password)
          ? 'Password must meet requirements'
          : undefined,
      }));
    }
    if (formState.touched.firstName) {
      setErrors(prev => ({
        ...prev,
        firstName: hasErrorsInName(formState.firstName)
          ? 'FirstfirstName must meet requirements'
          : undefined,
      }));
    }
    if (formState.touched.lastName) {
      setErrors(prev => ({
        ...prev,
        lastName: hasErrorsInName(formState.lastName)
          ? 'LastlastName must meet requirements'
          : undefined,
      }));
    }
  }, [
    formState.email,
    formState.password,
    formState.firstName,
    formState.lastName,
    formState.touched,
  ]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: top }]}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {/* Background elements for visual depth */}
      <View
        style={[
          styles.mainGlow,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />
      <View
        style={[
          styles.topAccent,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />
      <View
        style={[
          styles.bottomAccent,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          {/* Engaging header section */}
          <View style={styles.headerSection}>
            <Text variant="displaySmall" style={{}}>
              Join Our Community
            </Text>
            <Text
              variant="bodyLarge"
              style={{
                textAlign: 'center',
                color: theme.colors.primary,
                margin: 2,
              }}
            >
              Where every meal tells a story
            </Text>
          </View>

          {/* Form section with enhanced visual hierarchy */}
          <View style={styles.formSection}>
            <View style={{ width: '100%', margin: 3 }}>
              <TextInput
                label="Email"
                value={formState.email}
                onChangeText={handleInputChange('email')}
                error={!!errors.email}
                disabled={formState.isSubmitting}
                left={<TextInput.Icon icon="email" />}
              />
              <HelperText type="error" visible={errors.email !== undefined}>
                Email address is invalid!
              </HelperText>
            </View>

            <View style={{ width: '100%', margin: 3 }}>
              <TextInput
                label={'password'}
                value={formState.password}
                onChangeText={handleInputChange('password')}
                secureTextEntry={!passwordVisible}
                error={!!errors.password}
                disabled={formState.isSubmitting}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off' : 'eye'}
                    onPress={() => {
                      setPasswordVisible(prev => !prev);
                    }}
                  />
                }
              />
              <HelperText type="error" visible={errors.password !== undefined}>
                Password must be at least 8 characters and contain uppercase,
                lowercase, number and special character
              </HelperText>
            </View>

            <View style={styles.nameInputContainer}>
              <View style={{ flex: 1 }}>
                <TextInput
                  label={'First Name'}
                  value={formState.firstName}
                  onChangeText={handleInputChange('firstName')}
                  error={!!errors.firstName}
                  disabled={formState.isSubmitting}
                />
                <HelperText
                  type="error"
                  visible={errors.firstName !== undefined}
                >
                  Name should be between 2 to 15 characters
                </HelperText>
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  label={'Last Name'}
                  value={formState.lastName}
                  onChangeText={handleInputChange('lastName')}
                  error={!!errors.lastName}
                  disabled={formState.isSubmitting}
                />
                <HelperText
                  type="error"
                  visible={errors.lastName !== undefined}
                >
                  Name should be between 2 to 15 characters
                </HelperText>
              </View>
            </View>

            <View>
              <RadioButton.Group
                onValueChange={(value: string) =>
                  setFormState(prev => ({ ...prev, role: value as UserRole }))
                }
                value={formState.role}
              >
                <RadioButton.Item label="Are you a Member?" value={'member'} />
                <RadioButton.Item
                  label="Are you the Owner? "
                  value={'admin_verification_pending'}
                />
              </RadioButton.Group>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox
                status={termsAccepted ? 'checked' : 'unchecked'}
                onPress={() => {
                  setTermsAccepted(!termsAccepted);
                }}
              />
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                I agree to the Terms of Service and Privacy Policy
              </Text>
            </View>

            {/* Verify button */}
            <View
              style={{
                width: '100%',
                margin: 2,
              }}
            >
              <Button
                labelStyle={Pdstyles.buttonLabelStyle}
                mode="contained"
                loading={formState.isSubmitting}
                onPress={handleVerify}
                disabled={
                  formState.isSubmitting ||
                  errors.password !== undefined ||
                  errors.email !== undefined ||
                  errors.firstName !== undefined ||
                  errors.lastName !== undefined ||
                  !termsAccepted
                }
              >
                {formState.isSubmitting ? 'Verifying...' : 'Verify'}
              </Button>
            </View>

            <Portal>
              <Dialog
                visible={showEmailVerificationDialog}
                onDismiss={() => {
                  setShowEmailVerificationDialog(false);
                  emptyTheForm();
                }}
              >
                <Dialog.Title>
                  {/* {formState.role === 'member'
                    ? 'OTP Sent'
                    : 'Registration Initiated'} */}
                  {'OTP Sent'}
                </Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">
                    {/* {formState.role === 'member'
                      ? `We've sent an OTP to ${formState.email}. Please check your inbox.`
                      : 'Please complete the onboarding process to verify your mess details.'} */}
                    {`We've sent an OTP to ${formState.email}. Please check your inbox.`}
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    onPress={() => {
                      setShowEmailVerificationDialog(false);
                      emptyTheForm();

                      const params: EmailOtpParams = {
                        email: formState.email,
                        emailOtpType: 'email',
                      };
                      router.push({
                        pathname: '/verify',
                        params,
                      });
                    }}
                  >
                    {'Enter OTP'}
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            {/* Sign in prompt */}
            <View style={{ margin: 2 }}>
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant, // Slightly muted white for the main text
                  fontSize: 16,
                  textAlign: 'center',
                }}
              >
                Already have an account?{'  '}
                <Link href={'/signin'}>
                  <Text
                    style={{
                      color: theme.colors.onBackground, // Your accent color
                    }}
                  >
                    Sign In
                  </Text>
                </Link>{' '}
              </Text>
            </View>

            {/* Divider */}
            {/* <View style={styles.dividerContainer}>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
              <Text
                style={[styles.dividerText, { color: theme.colors.primary }]}
              >
                or
              </Text>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            </View> */}

            {/* Google OAuth Flow */}

            {/* <View
              style={{
                // marginTop: 20,
                width: '100%',
              }}
            >
              <Button
                labelStyle={Pdstyles.buttonLabelStyle}
                icon={'google'}
                mode="contained"
                onPress={() => {}}
              >
                Continue with Google
              </Button>
            </View> */}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  mainGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    top: -width * 0.5,
    left: -width * 0.25,
    opacity: 0.08,
  },
  topAccent: {
    position: 'absolute',
    width,
    height: width,
    transform: [{ rotate: '-45deg' }],
    top: -width * 0.7,
    right: -width * 0.5,
    opacity: 0.05,
  },
  bottomAccent: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    bottom: -width * 0.4,
    left: -width * 0.2,
    opacity: 0.06,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 40, // Add padding at bottom for keyboard
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    gap: 24,
  },
  nameInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 20,
  },
});

export default Page;
