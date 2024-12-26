import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useRef, useState } from "react";
import { Pdstyles } from "@/constants/Styles";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// We'll use this type to manage different states of the verification process
type VerificationStatus = "idle" | "sending" | "success" | "error";

// Validation rules using regular expressions and constraints
const VALIDATION_RULES = {
  email: {
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Please enter a valid email address",
  },
  password: {
    minLength: 8,
    pattern:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message:
      "Password must be at least 8 characters and contain uppercase, lowercase, number and special character",
  },
  firstName: {
    minLength: 2,
    pattern: /^[a-zA-Z\s-']+$/,
    message:
      "First name must be at least 2 characters and contain only letters, spaces, hyphens and apostrophes",
  },
  lastName: {
    minLength: 2,
    pattern: /^[a-zA-Z\s-']+$/,
    message:
      "Last name must be at least 2 characters and contain only letters, spaces, hyphens and apostrophes",
  },
};

interface ValidationErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Determine platform-specific keyboard behavior
  const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;
  const keyboardBehavior = Platform.OS === "ios" ? "padding" : "height";

  // Verification process state
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Validate a single field
  const validateField = (name: string, value: string): string => {
    const rules = VALIDATION_RULES[name];
    if (!value)
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;

    if (rules.minLength && value.length < rules.minLength) {
      return `${
        name.charAt(0).toUpperCase() + name.slice(1)
      } must be at least ${rules.minLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message;
    }

    return "";
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate each field
    newErrors.email = validateField("email", email);
    newErrors.password = validateField("password", password);
    newErrors.firstName = validateField("firstName", firstName);
    newErrors.lastName = validateField("lastName", lastName);

    // Update errors state
    setErrors(newErrors);

    // Form is valid if there are no error messages
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Handle field blur events
  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    const error = validateField(
      fieldName,
      fieldName === "email"
        ? email
        : fieldName === "password"
        ? password
        : fieldName === "firstName"
        ? firstName
        : lastName
    );

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  // Show error for a field if it's been touched
  const showError = (fieldName: string): boolean => {
    return touched[fieldName] && !!errors[fieldName];
  };

  // Reference to ScrollView for programmatic scrolling
  const scrollViewRef = useRef(null);

  // Simulate sending verification email
  // In production, this would connect to your backend API
  const sendVerificationEmail = async (email: string) => {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        if (email.includes("@")) {
          resolve(true);
        } else {
          reject(new Error("Invalid email format"));
        }
      }, 1500);
    });
  };

  const handleVerify = async () => {
    console.log("handleVerify");
    if (!termsAccepted) {
      setErrorMessage("Please accept the Terms and Privacy Policy to continue");
      setVerificationStatus("error");
      return;
    }

    try {
      setVerificationStatus("sending");
      await sendVerificationEmail(email);
      setVerificationStatus("success");

      // Wait for 2 seconds to show success message before navigation
      setTimeout(() => {
        // router.push("/verify");
        console.log("Verification mail sent");
      }, 2000);
    } catch (error) {
      setVerificationStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to send verification email"
      );
    }
  };

  // Render input field with error message
  const renderInput = (
    fieldName: string,
    value: string,
    onChange: (text: string) => void,
    placeholder: string,
    keyboardType: "default" | "email-address" = "default",
    secureTextEntry: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          styles.phoneInput,
          showError(fieldName) && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={"rgba(245, 169, 178, 0.7)"}
        value={value}
        onChangeText={(text) => {
          onChange(text);
          if (verificationStatus !== "idle") {
            setVerificationStatus("idle");
            setErrorMessage("");
          }
        }}
        onBlur={() => handleBlur(fieldName)}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        // keyboardType={keyboardType }
        secureTextEntry={secureTextEntry}
        editable={verificationStatus !== "sending"}
      />
      {showError(fieldName) && (
        <Text style={styles.errorText}>{errors[fieldName]}</Text>
      )}
    </View>
  );

  // Helper function to render verification status message
  const renderVerificationMessage = () => {
    const renderIconAndText = (iconName, iconColor, message, textColor) => (
      <View style={styles.messageContainer}>
        <Ionicons
          name={iconName}
          size={24}
          color={iconColor}
          // style={styles.icon}
        />
        <Text style={[styles.messageText, { color: textColor }]}>
          {message}
        </Text>
      </View>
    );

    switch (verificationStatus) {
      case "sending":
        return (
          <View style={styles.messageContainer}>
            <ActivityIndicator color="#FD356D" />
            <Text style={styles.messageText}>
              Sending verification email...
            </Text>
          </View>
        );
      case "success":
        return renderIconAndText(
          "checkmark-circle",
          "#4CAF50",
          "Verification email sent! Please check your inbox.",
          "#4CAF50"
        );
      case "error":
        return renderIconAndText(
          "alert-circle",
          "#FD356D",
          errorMessage || "An error occurred. Please try again.",
          "#FD356D"
        );
      default:
        return null;
    }
  };

  // checkbox component

  const Checkbox = ({ checked, onPress }) => (
    <Pressable
      onPress={onPress}
      style={[styles.checkbox, checked && styles.checkboxChecked]}
    >
      {checked && <Ionicons name="checkmark" size={16} color="#FFF" />}
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {/* Background elements for visual depth */}
      <View style={styles.mainGlow} />
      <View style={styles.topAccent} />
      <View style={styles.bottomAccent} />

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
            <Text style={styles.mainHeader}>Join Our Community</Text>
            <Text style={Pdstyles.descriptionText}>
              Where every meal tells a story
            </Text>
          </View>

          {/* Form section with enhanced visual hierarchy */}
          <View style={styles.formSection}>
            {renderInput("email", email, setEmail, "Email", "email-address")}

            {renderInput(
              "password",
              password,
              setPassword,
              "Password",
              "default",
              true
            )}

            <View style={styles.nameInputContainer}>
              {renderInput("firstName", firstName, setFirstName, "First name")}
              {renderInput("lastName", lastName, setLastName, "Last name")}
            </View>
            {/* Email input */}
            {/* <View style={styles.phoneInputContainer}>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="Email"
                placeholderTextColor={"rgba(245, 169, 178, 0.7)"}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  // Reset verification status when email changes
                  if (verificationStatus !== "idle") {
                    setVerificationStatus("idle");
                    setErrorMessage("");
                  }
                }}
                autoCapitalize="none"
                // keyboardType="email-address"
                editable={verificationStatus !== "sending"}
              />
            </View> */}

            {/* <View style={styles.phoneInputContainer}>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="Password"
                placeholderTextColor={"rgba(245, 169, 178, 0.7)"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={verificationStatus !== "sending"}
              />
            </View> */}

            {/* Name input fields */}
            {/* <View style={styles.nameInputContainer}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="First name"
                placeholderTextColor={"rgba(245, 169, 178, 0.7)"}
                value={firstName}
                onChangeText={setFirstName}
                editable={verificationStatus !== "sending"}
              />
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="Last name"
                placeholderTextColor={"rgba(245, 169, 178, 0.7)"}
                value={lastName}
                onChangeText={setLastName}
                editable={verificationStatus !== "sending"}
              />
            </View> */}

            {/* Terms and services */}
            <View style={styles.termsContainer}>
              <Checkbox
                checked={termsAccepted}
                onPress={() => setTermsAccepted(!termsAccepted)}
              />
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text
                  style={styles.termsLink}
                  // onPress={() => router.push("/terms")}
                >
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text
                  style={styles.termsLink}
                  // onPress={() => router.push("/privacy")}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>

            {/* Verification status message */}
            {renderVerificationMessage()}

            {/* Verify button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                email && firstName && lastName && termsAccepted
                  ? // && verificationStatus !== "sending"
                    styles.enabled
                  : styles.disabled,
              ]}
              onPress={handleVerify}
              // disabled={
              //   !email ||
              //   !firstName ||
              //   !lastName ||
              //   !termsAccepted ||
              //   verificationStatus !== "sending"
              // }
            >
              {verificationStatus === "sending" ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>

            {/* Sign in prompt */}
            <View style={styles.signinPromptContainer}>
              <Text style={styles.promptText}>
                Already have an account?{"  "}
                <Text
                  style={styles.signInLink}
                  onPress={() => router.push("/signin")}
                >
                  Sign In
                </Text>
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            {/* Google sign in */}
            <TouchableOpacity
              onPress={() => {}}
              style={[Pdstyles.pillButton, styles.googleButton]}
            >
              <Ionicons name="logo-google" size={24} color={"#FD356D"} />
              <Text style={[styles.buttonText, styles.googleButtonText]}>
                Continue with Google{" "}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    overflow: "hidden",
  },
  mainGlow: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: "#FD356D",
    top: -width * 0.5,
    left: -width * 0.25,
    opacity: 0.08,
  },
  topAccent: {
    position: "absolute",
    width: width,
    height: width,
    transform: [{ rotate: "-45deg" }],
    backgroundColor: "#FD356D",
    top: -width * 0.7,
    right: -width * 0.5,
    opacity: 0.05,
  },
  bottomAccent: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "#FD356D",
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
    padding: 24,
    justifyContent: "center",
  },
  headerSection: {
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  mainHeader: {
    fontSize: 32,
    color: "#FD356D",
    // fontWeight: "bold",
    fontFamily: "PlayRegular",
    marginBottom: 8,
    textShadowColor: "rgba(253, 53, 109, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subHeader: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 20,
    fontFamily: "PlayRegular",
  },
  formSection: {
    gap: 24,
  },
  phoneInputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  nameInputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    // backgroundColor: "rgba(69, 14, 30, 0.75)",
    padding: 16,
    borderRadius: 16,
    fontSize: 18,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(253, 53, 109, 0.2)",
  },
  countryCode: {
    width: 70,
  },
  phoneInput: {
    flex: 1,
  },
  nameInput: {
    flex: 1,
  },
  verifyButton: {
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  enabled: {
    backgroundColor: "#FD356D",
    shadowColor: "#FD356D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabled: {
    backgroundColor: "rgba(161, 34, 69, 0.7)",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  signinPromptContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  promptText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    lineHeight: 24,
  },
  signInLink: {
    color: "#FD356D",
    fontWeight: "600",
  },
  // New styles for Terms and Privacy section
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(253, 53, 109, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FD356D",
    borderColor: "#FD356D",
  },
  termsText: {
    flex: 1,
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: "#FD356D",
    textDecorationLine: "underline",
  },

  // New styles for verification messages
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: "rgba(253, 53, 109, 0.1)",
    borderRadius: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.9)",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#f5a9b2",
  },
  dividerText: {
    color: "#f5a9b2",
    fontSize: 20,
  },
  googleButton: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
    backgroundColor: "#2E0A14",
    borderWidth: 1,
    borderColor: "rgba(253, 53, 109, 0.5)",
  },
  googleButtonText: {
    color: "#FD356D",
    fontSize: 20,
  },
  // New styles for validation
  inputContainer: {
    marginBottom: 8,
  },
  inputError: {
    borderColor: "#FD356D",
    borderWidth: 1,
  },
  errorText: {
    color: "#FD356D",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Page;
