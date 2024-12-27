import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Pdstyles } from "@/constants/Styles";
import { Link } from "expo-router";
import { Button, HelperText, TextInput, useTheme } from "react-native-paper";
import { Text } from "@/components/Text";

const Page = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const keyboardVerticalOffset = Platform.OS === "ios" ? 80 : 0;

  const hasErrorsInEmail = () => {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const noError = pattern.test(email);
    return !noError;
  };

  const hasErrorsInPassword = () => {
    const minLength = 8;
    const pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const noError = password.length > minLength && pattern.test(password);
    return !noError;
  };

  return (
    <View style={styles.container}>
      {/* These circles create a soft, glowing background effect */}
      <View
        style={[
          styles.topRightBlob,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />
      <View
        style={[
          styles.bottomLeftBlob,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />
      <View style={styles.gradientOverlay} />
      <View
        style={[
          styles.centerGlow,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />
      <View
        style={[
          styles.accentDot1,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />
      <View
        style={[
          styles.accentDot2,
          { backgroundColor: theme.colors.onBackground },
        ]}
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <View style={styles.glassCard}>
          <View style={styles.cardContent}>
            <View style={{}}>
              <Text variant="displayMedium" style={{ textAlign: "center" }}>
                Welcome Back
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  color: theme.colors.primary,
                  margin: 10,
                }}
              >
                Enter the Email & password associated with your account
              </Text>
            </View>
            <View style={{ width: "100%", margin: 10 }}>
              <TextInput label="Email" value={email} onChangeText={setEmail} />
              <HelperText type="error" visible={hasErrorsInEmail()}>
                Email address is invalid!
              </HelperText>
            </View>
            <View style={{ width: "100%", margin: 10 }}>
              <TextInput
                label={"password"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <HelperText type="error" visible={hasErrorsInPassword()}>
                Password must be at least 8 characters and contain uppercase,
                lowercase, number and special character
              </HelperText>
            </View>

            <View
              style={{
                marginLeft: 10,
                width: "100%",
              }}
            >
              <Link href={"/signup"}>
                <Text
                  style={[
                    styles.forgotPasswordText,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  forgot password ?
                </Text>
              </Link>
            </View>

            <View
              style={{
                width: "40%",
                margin: 10,
              }}
            >
              <Button
                labelStyle={Pdstyles.buttonLabelStyle}
                mode="contained"
                onPress={() => {}}
              >
                Continue
              </Button>
            </View>
            <View style={{ margin: 10 }}>
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant, // Slightly muted white for the main text
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Don't have an account?{"  "}
                <Link href={"/signup"}>
                  <Text
                    style={{
                      color: theme.colors.onBackground, // Your accent color
                    }}
                  >
                    Sign Up
                  </Text>
                </Link>{" "}
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
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
            </View>

            <View
              style={{
                marginTop: 20,
                width: "80%",
              }}
            >
              <Button
                labelStyle={Pdstyles.buttonLabelStyle}
                icon={"google"}
                mode="contained"
                onPress={() => {}}
              >
                Continue with Google
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    textAlign: "center",
  },
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden", // This ensures our background elements don't spill out
  },
  topRightBlob: {
    position: "absolute",
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
    position: "absolute",
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    borderWidth: 150,
    borderColor: "rgba(253, 53, 109, 0.02)",
    transform: [{ rotate: "45deg" }],
  },
  // Additional decorative elements
  accentDot1: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    top: "30%",
    left: "20%",
    opacity: 0.2,
  },
  accentDot2: {
    position: "absolute",
    width: 15,
    height: 15,
    borderRadius: 7.5,
    top: "60%",
    right: "25%",
    opacity: 0.15,
  },
  // Soft glow in the center
  centerGlow: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: 300,
    top: "50%",
    left: "50%",
    transform: [{ translateX: -300 }, { translateY: -300 }, { scale: 1.2 }],
    opacity: 0.03,
  },
  glowCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },
  glassCard: {
    width: "100%",
    // backgroundColor: "rgba(255, 255, 255, 0.05)", // Very subtle white for glass effect
    borderRadius: 24,
    // borderWidth: 1,
    // borderColor: "rgba(255, 255, 255, 0.1)", // Subtle border
    overflow: "hidden",
  },
  cardContent: {
    padding: 24,
    // backgroundColor: "rgba(253, 53, 109, 0.03)", // Very subtle accent color
    justifyContent: "center",
    alignItems: "center",
  },
});
