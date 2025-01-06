import { EmailOtpType } from '@supabase/supabase-js';
import { RouteParams, router, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  TextInput as RNTextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useTheme, TextInput, Button } from 'react-native-paper';

import { Text } from '@/src/components/common/Text';
import { Pdstyles } from '@/src/constants/Styles';
import { useAuthStore } from '@/src/store/auth';
import { getErrorMessage } from '@/src/utils/errorUtils';

const { width } = Dimensions.get('window');

// We create a resend timer duration constant that we can easily adjust
const RESEND_TIMER_DURATION = 30;

export type EmailOtpParams = RouteParams<{
  email: string;
  emailOtpType: EmailOtpType;
}>;

const Page = () => {
  const { email, emailOtpType } = useLocalSearchParams<EmailOtpParams>();
  console.log('verify screen -> email in params: ', email);
  console.log('verify screen -> emailOtpType in params: ', emailOtpType);

  const verifyOtp = useAuthStore(state => state.verifyOtp);

  // We'll store each OTP digit separately for better control
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(RESEND_TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  const inputRefs = useRef<(RNTextInput | null)[]>([
    ...Array(6).map(() => null),
  ]);

  //todo: find alternate approach for following useEffect, as it is responsible for rendering this component more than 20 times
  // Timer logic for resend cooldown
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setTimer((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(interval);
  //         setCanResend(true);
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, []);

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

  const handleResend = () => {
    if (canResend) {
      // Reset the timer and resend flag
      setTimer(RESEND_TIMER_DURATION);
      setCanResend(false);
      // Here you would trigger your resend OTP logic
    }
  };

  const handleSubmit = async () => {
    // Check if OTP is complete
    // if (otp.every((digit) => digit.length === 1)) {
    //   router.push("/(authenticated)/(tabs)/");
    // }

    try {
      console.log('Initializing verifyOtp');
      setIsSubmitting(true);
      // if (typeof email === "string") {
      await verifyOtp({ email, token: otp.join(''), type: emailOtpType });
      // } else {
      //   console.error("Email is not a string");
      //   throw Error("Email is not a string");
      // }
      console.log(
        'successfully verified the otp.... now redirecting to resetPassword page',
      );
      if (emailOtpType === 'recovery') {
        router.push('/resetPassword');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Verification Failed',
        getErrorMessage(error) || 'Invalid OTP. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              setOtp(['', '', '', '', '', '']); // Clear the OTP input fields
              inputRefs.current[0]?.focus(); // Refocus on the first input field
            },
          },
        ],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background decorative elements */}
      <View
        style={[
          styles.mainGlow,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />
      <View
        style={[
          styles.accentCircle,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />

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
            {/* <Text style={styles.subHeader}>
              Enter the 6-digit code sent to your mail
            </Text> */}
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
                  { backgroundColor: theme.colors.surfaceVariant },
                  { borderColor: theme.colors.inversePrimary },
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
          {/* <TouchableOpacity
            style={[
              styles.submitButton,
              otp.every((digit) => digit.length === 1)
                ? styles.enabled
                : styles.disabled,
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity> */}

          <Button
            labelStyle={Pdstyles.buttonLabelStyle}
            // style=
            theme={{ roundness: 10 }}
            mode="contained"
            onPress={handleSubmit}
            disabled={!otp.every(digit => digit.length === 1)}
            // loading={formState.isSubmitting}
          >
            {/* {formState.isSubmitting ? "Signing in..." : "Continue"} */}
            Submit
          </Button>

          {/* Resend section */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive the code?{' '}
              {canResend ? (
                <Text style={styles.resendLink} onPress={handleResend}>
                  Resend
                </Text>
              ) : (
                <Text style={{ color: theme.colors.error }}>Wait {timer}s</Text>
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
    // backgroundColor: "#1A1A1A",
    overflow: 'hidden',
  },
  mainGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    // backgroundColor: "#FD356D",
    top: -width * 0.5,
    left: -width * 0.25,
    opacity: 0.08,
  },
  accentCircle: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    // backgroundColor: "#FD356D",
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
  mainHeader: {
    fontSize: 32,
    color: '#FD356D',
    fontWeight: 'bold',
    marginBottom: 12,
    textShadowColor: 'rgba(253, 53, 109, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subHeader: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
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
    // backgroundColor: "rgba(69, 14, 30, 0.75)",
    borderWidth: 1,
    // borderColor: "rgba(253, 53, 109, 0.2)",
    // color: "#ffffff",
    fontSize: 24,
    textAlign: 'center',
    // shadowColor: "#FD356D",
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
  enabled: {
    backgroundColor: '#FD356D',
    shadowColor: '#FD356D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabled: {
    backgroundColor: 'rgba(161, 34, 69, 0.7)',
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
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    lineHeight: 24,
  },
  resendLink: {
    color: '#FD356D',
    fontWeight: '600',
  },
});

export default Page;
