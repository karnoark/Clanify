import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Pdstyles } from "@/constants/Styles";
import { router, useLocalSearchParams } from "expo-router";
import {
  useTheme,
  TextInput,
  HelperText,
  Button,
  Portal,
  Dialog,
} from "react-native-paper";
import { Text } from "@/components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hasErrorsInPassword } from "@/components/InputValidation";

const { width } = Dimensions.get("window");

// We'll track different states of the reset process
type ResetStatus = "validating" | "ready" | "resetting" | "success" | "error";

// We'll use this to show password requirements to users
const PASSWORD_REQUIREMENTS = [
  { id: 1, text: "At least 8 characters long" },
  { id: 2, text: "Contains uppercase letter" },
  { id: 3, text: "Contains lowercase letter" },
  { id: 4, text: "Contains a number" },
  { id: 5, text: "Contains a special character" },
];

const Page = () => {
  const { top } = useSafeAreaInsets();
  const theme = useTheme();
  // Get the token from the URL params
  const { token } = useLocalSearchParams();

  // State management for the form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStatus, setResetStatus] = useState<ResetStatus>("validating");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Platform-specific keyboard behavior
  const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;
  const keyboardBehavior = Platform.OS === "ios" ? "padding" : "height";

  // Validate the reset token when the component mounts
  useEffect(() => {
    validateResetToken();
  }, [token]);

  // Function to validate the reset token
  const validateResetToken = async () => {
    try {
      console.log("token: ", token);
      // In production, you would verify the token with your backend
      // For now, we'll simulate a delay and success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!token) {
        throw new Error("Invalid or expired reset link");
      }

      setResetStatus("ready");
    } catch (error) {
      setResetStatus("error");
      setErrorMessage(
        "This password reset link is invalid or has expired. Please request a new one."
      );
    }
  };

  // Function to handle password reset
  const handleResetPassword = async () => {
    try {
      // First, validate passwords match
      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords don't match");
        return;
      }

      // Validate password strength
      if (hasErrorsInPassword(newPassword)) {
        setErrorMessage("Password doesn't meet the requirements");
        return;
      }

      setResetStatus("resetting");

      // In production, you would call your API here
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setResetStatus("success");
      setNewPassword("");
      setConfirmPassword("");
      setShowSuccessDialog(true);
    } catch (error) {
      setResetStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    }
  };

  // If we're still validating the token or there's an error, show appropriate UI
  if (resetStatus === "validating") {
    return (
      <View style={styles.centerContainer}>
        <Text>Validating reset link...</Text>
      </View>
    );
  }

  if (resetStatus === "error" && !token) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errorMessage}
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push("/forgotPassword")}
          style={styles.button}
        >
          Request New Reset Link
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: top }]}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {/* Background elements */}
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
            <Text variant="headlineLarge" style={styles.title}>
              Create New Password
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.subtitle, { color: theme.colors.primary }]}
            >
              Please choose a strong password for your account
            </Text>
          </View>

          {/* Form section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                left={<TextInput.Icon icon="lock" />}
              />
              <HelperText
                type="error"
                visible={hasErrorsInPassword(newPassword)}
              >
                Password must meet all requirements
              </HelperText>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                error={
                  confirmPassword !== "" && newPassword !== confirmPassword
                }
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                left={<TextInput.Icon icon="lock-check" />}
              />
              <HelperText
                type="error"
                visible={
                  confirmPassword !== "" && newPassword !== confirmPassword
                }
              >
                Passwords don't match
              </HelperText>
            </View>

            {/* Password requirements section */}
            <View style={styles.requirementsContainer}>
              <Text variant="bodyMedium" style={styles.requirementsTitle}>
                Password Requirements:
              </Text>
              {PASSWORD_REQUIREMENTS.map((requirement) => (
                <Text
                  key={requirement.id}
                  variant="bodySmall"
                  style={[
                    styles.requirementText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  • {requirement.text}
                </Text>
              ))}
            </View>

            {/* Reset button */}
            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={resetStatus === "resetting"}
              disabled={
                hasErrorsInPassword(newPassword) ||
                newPassword !== confirmPassword ||
                resetStatus === "resetting"
              }
              style={styles.button}
              labelStyle={Pdstyles.buttonLabelStyle}
            >
              Reset Password
            </Button>

            {/* Error message */}
            {errorMessage && (
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
          visible={showSuccessDialog}
          onDismiss={() => {
            setShowSuccessDialog(false);
            router.push("/signin");
          }}
        >
          <Dialog.Title>Password Reset Successful</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Your password has been successfully reset. You can now sign in
              with your new password.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowSuccessDialog(false);
                router.push("/signin");
              }}
            >
              Sign In
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
    overflow: "hidden",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mainGlow: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    top: -width * 0.5,
    left: -width * 0.25,
    opacity: 0.08,
  },
  bottomAccent: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    bottom: -width * 0.4,
    left: -width * 0.2,
    opacity: 0.06,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  headerSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginHorizontal: 20,
  },
  formSection: {
    gap: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  requirementsContainer: {
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  requirementsTitle: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  requirementText: {
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
  },
  errorText: {
    textAlign: "center",
    marginTop: 8,
  },
});

export default Page;
