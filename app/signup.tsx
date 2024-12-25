import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { Pdstyles } from "@/constants/Styles";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const keyboardVerticalOffset = Platform.OS === "ios" ? 80 : 0;

  const handleVerify = () => {
    router.push("/verify");
  };

  return (
    <View style={styles.container}>
      {/* Background elements for visual depth */}
      <View style={styles.mainGlow} />
      <View style={styles.topAccent} />
      <View style={styles.bottomAccent} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <View style={styles.contentContainer}>
          {/* Engaging header section */}
          <View style={styles.headerSection}>
            <Text style={styles.mainHeader}>Join Our Community</Text>
            <Text style={styles.subHeader}>Where every meal tells a story</Text>
          </View>

          {/* Form section with enhanced visual hierarchy */}
          <View style={styles.formSection}>
            {/* Phone number input group */}
            <View style={styles.phoneInputContainer}>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="Email"
                placeholderTextColor={"rgba(253, 53, 109, 0.6)"}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.phoneInputContainer}>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="Password"
                placeholderTextColor={"rgba(253, 53, 109, 0.6)"}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Name input fields */}
            <View style={styles.nameInputContainer}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="First name"
                placeholderTextColor={"rgba(253, 53, 109, 0.6)"}
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="Last name"
                placeholderTextColor={"rgba(253, 53, 109, 0.6)"}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Verify button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                email && firstName && lastName
                  ? styles.enabled
                  : styles.disabled,
              ]}
              onPress={handleVerify}
              disabled={!email || !firstName || !lastName}
            >
              <Text style={styles.buttonText}>Verify</Text>
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
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
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
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  headerSection: {
    marginBottom: 40,
  },
  mainHeader: {
    fontSize: 32,
    color: "#FD356D",
    fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "rgba(253, 53, 109, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subHeader: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 20,
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
});

export default Page;
