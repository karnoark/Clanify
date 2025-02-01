import type { EmailOtpType } from '@supabase/supabase-js';
import type { RouteParams } from 'expo-router';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import type {
  TextInput as RNTextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme, TextInput, Button } from 'react-native-paper';

import { Text } from '@/src/components/common/Text';
import { Pdstyles } from '@/src/constants/Styles';
import { useAuthStore } from '@/src/store/auth';
import type { CustomTheme } from '@/src/types/theme';
import { getErrorMessage } from '@/src/utils/errorUtils';

const { width } = Dimensions.get('window');

// Constants for retry functionality
const RESEND_TIMER_DURATION = 30;
const MAX_RESEND_ATTEMPTS = 3;

export type EmailOtpParams = RouteParams<{
  email: string;
  emailOtpType: EmailOtpType;
}>;

const Page = () => {
  const { email, emailOtpType } = useLocalSearchParams<EmailOtpParams>();
  console.log('verify screen -> email in params: ', email);
  console.log('verify screen -> emailOtpType in params: ', emailOtpType);

  const verifyOtp = useAuthStore(state => state.verifyOtp);
  const resendOtp = useAuthStore(state => state.resendOtp);

  // We'll store each OTP digit separately for better control
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(RESEND_TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const theme = useTheme<CustomTheme>();

  //References
  const inputRefs = useRef<(RNTextInput | null)[]>([
    ...Array(6).map(() => null),
  ]);
  const timerRef = useRef<NodeJS.Timeout>();

  // Timer logic for resend cooldown
  useEffect(() => {
    // Only start timer if we haven't reached max attempts
    if (resendAttempts < MAX_RESEND_ATTEMPTS) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [resendAttempts, isResending]);

  // Handle input changes and auto-focus behavior
  const handleOtpChange = (text: string, index: number) => {
    // Create a new array to trigger a re-render
    const newOtp = [...otp];
    newOtp[index] = text;

    setOtp(newOtp);

    // Auto-focus next input if current input is filled
    if (text.length === 1 && index < 5) {
      // inputRefs.current[index + 1].focus();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle backspace for better UX
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Reset OTP fields
  const resetOtpFields = () => {
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (!canResend || resendAttempts >= MAX_RESEND_ATTEMPTS) {
      return;
    }

    try {
      setIsResending(true);

      await resendOtp({
        email: email as string,
        type: emailOtpType as EmailOtpType,
      });

      // Reset timer and update state
      setTimer(RESEND_TIMER_DURATION);
      setCanResend(false);
      setResendAttempts(prev => prev + 1);
      resetOtpFields();

      // Show success message
      Alert.alert(
        'Code Resent',
        'A new verification code has been sent to your email.',
        [{ text: 'OK' }],
      );
    } catch (error) {
      Alert.alert(
        'Resend Failed',
        getErrorMessage(error) || 'Failed to resend code. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Initializing verifyOtp');
      setIsSubmitting(true);
      // if (typeof email === "string") {
      await verifyOtp({
        email: email as string,
        token: otp.join(''),
        type: emailOtpType as EmailOtpType,
      });
      console.log('successfully verified the otp....');
      if (emailOtpType === 'recovery') {
        console.log('redirecting to reset password page');
        router.push('/resetPassword');
      } else {
        console.log('redirecting to root');
        //todo try uncommenting this line (010225)
        // router.push('/');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Verification Failed',
        getErrorMessage(error) || 'Invalid OTP. Please try again.',
        [
          {
            text: 'OK',
            onPress: resetOtpFields,
          },
        ],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get resend button text based on state
  const getResendButtonText = () => {
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      return 'Maximum attempts reached';
    }
    if (!canResend) {
      return `Wait ${timer}s`;
    }
    return 'Resend';
  };

  return (
    <View style={styles.container}>
      {/* Background decorative elements */}
      {/* <View
        style={[styles.mainGlow, { backgroundColor: theme.colors.primary }]}
      />
      <View
        style={[styles.accentCircle, { backgroundColor: theme.colors.primary }]}
      /> */}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.contentContainer}>
          {/* Header section with clear instructions */}
          <View style={styles.headerSection}>
            <Text variant="displayMedium" style={{ textAlign: 'center' }}>
              Verify Your Account
            </Text>
            <Text
              variant="bodyLarge"
              style={{
                textAlign: 'center',
                color: theme.colors.primary,
                margin: 10,
              }}
            >
              Enter the 6-digit code sent to your mail
            </Text>
          </View>

          {/* OTP input section */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                theme={{ roundness: 20 }}
                key={index}
                ref={(ref: RNTextInput) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  { backgroundColor: theme.colors.surface },
                  { borderColor: theme.colors.pr90 },
                ]}
                maxLength={1}
                keyboardType="numeric"
                value={digit}
                onChangeText={text => handleOtpChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                underlineColor="transparent"
              />
            ))}
          </View>

          {/* Submit button */}

          <Button
            labelStyle={Pdstyles.buttonLabelStyle}
            // style=
            theme={{ roundness: 10 }}
            mode="contained"
            onPress={handleSubmit}
            disabled={!otp.every(digit => digit.length === 1) || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Submit'}
            {/* Submit */}
          </Button>

          {/* Resend section */}
          <View style={styles.resendContainer}>
            <Text
              style={[
                styles.resendText,
                { color: theme.colors.onBackground, opacity: 0.7 },
              ]}
            >
              Didn't receive the code?{' '}
              {resendAttempts < MAX_RESEND_ATTEMPTS ? (
                <Text
                  style={[
                    styles.resendLink,
                    {
                      color: canResend
                        ? theme.colors.error
                        : theme.colors.error,
                    },
                  ]}
                  onPress={handleResend}
                >
                  {isResending ? 'Sending...' : getResendButtonText()}
                </Text>
              ) : (
                <Text style={{ color: theme.colors.error }}>
                  Maximum attempts reached
                </Text>
              )}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
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
  accentCircle: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    bottom: -width * 0.4,
    right: -width * 0.2,
    opacity: 0.06,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 65,
    height: 65,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 24,
    textAlign: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButton: {
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    lineHeight: 24,
  },
  resendLink: {
    fontWeight: '600',
  },
});

export default Page;
