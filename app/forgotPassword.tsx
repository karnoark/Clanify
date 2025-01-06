import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import {
  useTheme,
  TextInput,
  HelperText,
  Button,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/src/components/common/Text';
import { Pdstyles } from '@/src/constants/Styles';
import { hasErrorsInEmail } from '@/src/utils/InputValidation';
import { useAuthStore } from '@/src/store/auth';

const { width } = Dimensions.get('window');

// Define our possible states for the reset process
type ResetStatus = 'idle' | 'sending' | 'success' | 'error';

const Page = () => {
  const { top } = useSafeAreaInsets();
  const theme = useTheme();
  const resetPassword = useAuthStore(state => state.resetPassword);

  // State management for the form
  const [email, setEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<ResetStatus>('idle');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Platform-specific keyboard behavior
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';

  // Function to simulate sending reset email
  // In production, this would connect to your backend API
  const sendResetEmail = async (emailInput: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (emailInput.includes('@')) {
          resolve(true);
        } else {
          reject(new Error('Invalid email format'));
        }
      }, 1500);
    });
  };

  // Handle reset password request
  const handleResetPassword = async () => {
    try {
      setResetStatus('sending');
      // await sendResetEmail(email);
      await resetPassword(email);
      setResetStatus('success');
      setShowResetDialog(true);
    } catch (error) {
      setResetStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to send reset email',
      );
    }
  };

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
          styles.bottomAccent,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          {/* Header section */}
          <View style={styles.headerSection}>
            <Text variant="displaySmall" style={styles.title}>
              Reset Password
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.subtitle, { color: theme.colors.primary }]}
            >
              Enter your email to receive reset instructions
            </Text>
          </View>

          {/* Form section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" />}
                error={hasErrorsInEmail(email)}
                disabled={resetStatus === 'sending'}
              />
              <HelperText type="error" visible={hasErrorsInEmail(email)}>
                Please enter a valid email address
              </HelperText>
            </View>

            {/* Reset button */}
            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={resetStatus === 'sending'}
              disabled={hasErrorsInEmail(email) || resetStatus === 'sending'}
              style={styles.button}
              labelStyle={Pdstyles.buttonLabelStyle}
            >
              Send Reset Link
            </Button>

            {/* Error message */}
            {resetStatus === 'error' && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errorMessage}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Success Dialog */}
      <Portal>
        <Dialog
          visible={showResetDialog}
          onDismiss={() => setShowResetDialog(false)}
        >
          <Dialog.Title>Check Your Email</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              We've sent password reset instructions to {email}. Please check
              your inbox and follow the link to reset your password.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowResetDialog(false);
                console.log('Navigating to verify page with:', {
                  email,
                  emailOtpType: 'recovery',
                });
                router.push({
                  pathname: '/verify',
                  params: { email, emailOtpType: 'recovery' },
                });
              }}
            >
              Got it
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  bottomAccent: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    bottom: -width * 0.4,
    left: -width * 0.2,
    opacity: 0.06,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginHorizontal: 20,
  },
  formSection: {
    gap: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default Page;
