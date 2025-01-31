//todo add something like toast notification for messages like "invalid login credentials"

import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, HelperText, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/src/components/common/Text';
import { Pdstyles } from '@/src/constants/Styles';
import { useAuthStore } from '@/src/store/auth';
import type { CustomTheme } from '@/src/types/theme';
import {
  hasErrorsInEmail,
  hasErrorsInPassword,
} from '@/src/utils/InputValidation';
import { getErrorMessage } from '@/src/utils/errorUtils';

interface FormState {
  email: string;
  password: string;
  isSubmitting: boolean;
  touched: {
    email: boolean;
    password: boolean;
  };
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Page = () => {
  const { top } = useSafeAreaInsets();
  const theme = useTheme<CustomTheme>();
  const signIn = useAuthStore(state => state.signIn);
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    isSubmitting: false,
    touched: {
      email: false,
      password: false,
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Determine platform-specific keyboard behavior
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';

  // Reference to ScrollView for programmatic scrolling
  const scrollViewRef = useRef(null);

  //input handler that tracks when fields are touched and validates in real-time
  const handleInputChange = (field: keyof FormState) => (value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      touched: {
        ...prev.touched,
        [field]: true,
      },
    }));
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
  }, [formState.email, formState.password, formState.touched]);

  const handleSubmit = async () => {
    const formErrors: FormErrors = {};
    if (hasErrorsInEmail(formState.email)) {
      formErrors.email = 'Please enter a valid email address';
    }
    if (hasErrorsInPassword(formState.password)) {
      formErrors.password = 'Invalid password format';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));
    console.log('Attempting signin submission...');

    // TODO remove following line later, the purpose of the following line was to have isSubmitting to be true for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Supabase sign-in logic here
      console.log('Initializing signIn');
      await signIn({ email: formState.email, password: formState.password });
      // router.push('/');
    } catch (error) {
      console.error(error);
      Alert.alert('not able to login: ', getErrorMessage(error));
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const backgroundBlogColor = 'black';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: top }]}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {/* These circles create a soft, glowing background effect */}
      {/* <View
        style={[styles.topRightBlob, { backgroundColor: backgroundBlogColor }]}
      />
      <View
        style={[
          styles.bottomLeftBlob,
          { backgroundColor: backgroundBlogColor },
        ]}
      />
      <View style={styles.gradientOverlay} />
      <View
        style={[styles.centerGlow, { backgroundColor: backgroundBlogColor }]}
      />
      <View
        style={[styles.accentDot1, { backgroundColor: backgroundBlogColor }]}
      />
      <View
        style={[styles.accentDot2, { backgroundColor: backgroundBlogColor }]}
      /> */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.glassCard}>
          <View style={styles.cardContent}>
            <View style={{}}>
              <View
                style={{
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="leaf"
                  size={48}
                  color={theme.colors.primary}
                  style={{
                    backgroundColor: theme.colors.pr100,
                    // borderWidth: StyleSheet.hairlineWidth,
                    padding: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 40,
                  }}
                />
              </View>
              <Text variant="displayMedium" style={{ textAlign: 'center' }}>
                Clanify
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  opacity: 0.7,
                  margin: 10,
                }}
              >
                Your Mess. Our Problem. (Kinda).
              </Text>
            </View>
            <View style={{ width: '100%', margin: 10 }}>
              <TextInput
                label="Email"
                value={formState.email}
                onChangeText={handleInputChange('email')}
                error={!!errors.email}
                disabled={formState.isSubmitting}
                autoCapitalize="none"
                left={
                  <TextInput.Icon icon="email" color={theme.colors.primary} />
                }
                underlineColor="transparent"
                style={styles.inputContainer}
              />
              <HelperText
                type="error"
                // visible={hasErrorsInEmail(formState.email)}
                visible={errors.email !== undefined}
              >
                Email address is invalid!
              </HelperText>
            </View>
            <View style={{ width: '100%' }}>
              <TextInput
                label={'password'}
                value={formState.password}
                onChangeText={handleInputChange('password')}
                secureTextEntry={!passwordVisible}
                error={!!errors.password}
                disabled={formState.isSubmitting}
                style={styles.inputContainer}
                underlineColor="transparent"
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off' : 'eye'}
                    style={{ opacity: 0.7 }}
                    onPress={() => {
                      setPasswordVisible(prev => !prev);
                    }}
                  />
                }
                left={
                  <TextInput.Icon icon="lock" color={theme.colors.primary} />
                }
              />
              <HelperText
                type="error"
                // visible={hasErrorsInPassword(formState.password)}
                visible={errors.password !== undefined}
              >
                Password must be at least 8 characters and contain uppercase,
                lowercase, number and special character
              </HelperText>
            </View>

            <View
              style={{
                marginLeft: 10,
                marginBottom: 10,
                width: '100%',
                alignItems: 'flex-end',
              }}
            >
              <Link href={'/forgotPassword'}>
                <Text
                  style={[
                    styles.forgotPasswordText,
                    { color: theme.colors.primary },
                  ]}
                >
                  forgot password ?
                </Text>
              </Link>
            </View>

            <View
              style={{
                width: '100%',
                margin: 10,
              }}
            >
              <Button
                labelStyle={Pdstyles.buttonLabelStyle}
                mode="contained"
                onPress={handleSubmit}
                disabled={
                  formState.isSubmitting ||
                  errors.password !== undefined ||
                  errors.email !== undefined ||
                  formState.email === '' ||
                  formState.password === ''
                }
                loading={formState.isSubmitting}
              >
                {formState.isSubmitting ? 'Signing in...' : 'Continue'}
              </Button>
            </View>
            <View
              style={{
                margin: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant, // Slightly muted white for the main text
                  fontSize: 16,
                  textAlign: 'center',
                  opacity: 0.7,
                }}
              >
                Don't have an account?{'  '}
              </Text>
              <Link href={'/signup'}>
                <Text
                  style={{
                    color: theme.colors.primary, // Your accent color
                    fontSize: 16,
                    // opacity: 0,
                  }}
                >
                  Sign Up
                </Text>
              </Link>
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
                marginTop: 20,
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

export default Page;

const styles = StyleSheet.create({
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
  forgotPasswordText: {
    fontSize: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden', // This ensures our background elements don't spill out
  },
  topRightBlob: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -200,
    right: -100,
    opacity: 0.08,
    transform: [{ scale: 1.2 }],
  },
  // Medium accent circle in bottom-left
  bottomLeftBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -150,
    left: -50,
    opacity: 0.05,
    transform: [{ scale: 1.1 }],
  },
  // Subtle gradient overlay to add depth
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 150,
    borderColor: 'rgba(253, 53, 109, 0.02)',
    transform: [{ rotate: '45deg' }],
  },
  // Additional decorative elements
  accentDot1: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: '30%',
    left: '20%',
    opacity: 0.2,
  },
  accentDot2: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    top: '60%',
    right: '25%',
    opacity: 0.15,
  },
  // Soft glow in the center
  centerGlow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -300 }, { translateY: -300 }, { scale: 1.2 }],
    opacity: 0.03,
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  scrollContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  glassCard: {
    width: '100%',
    // backgroundColor: "rgba(255, 255, 255, 0.05)", // Very subtle white for glass effect
    borderRadius: 24,
    // borderWidth: 1,
    // borderColor: "rgba(255, 255, 255, 0.1)", // Subtle border
    overflow: 'hidden',
  },
  cardContent: {
    padding: 24,
    // backgroundColor: "rgba(253, 53, 109, 0.03)", // Very subtle accent color
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 8,
    borderRadius: 12,
    borderTopStartRadius: 12,
    borderTopEndRadius: 12,
  },
});
