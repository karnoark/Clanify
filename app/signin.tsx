import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Pdstyles } from "@/constants/Styles";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Page = () => {
  //   const [countryCode, setCountryCode] = useState("+91");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const keyboardVerticalOffset = Platform.OS === "ios" ? 80 : 0;

  const onSignin = async () => {};

  return (
    <View style={styles.container}>
      {/* These circles create a soft, glowing background effect */}
      {/* <View style={[styles.glowCircle, styles.topCircle]} /> */}
      <View style={[styles.glowCircle, styles.bottomCircle]} />
      <View style={styles.topRightBlob} />
      <View style={styles.bottomLeftBlob} />
      <View style={styles.gradientOverlay} />
      <View style={styles.centerGlow} />
      <View style={styles.accentDot1} />
      <View style={styles.accentDot2} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {/* The glass-like card container */}
        <View style={styles.glassCard}>
          <View style={styles.cardContent}>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={[Pdstyles.header, styles.enhancedHeader]}>
                Welcome Back
              </Text>
              <Text
                style={[Pdstyles.descriptionText, styles.enhancedDescription]}
              >
                Enter the Email & password associated with your account
              </Text>
            </View>
            <View style={styles.inputContainer}>
              {/* <TextInput
                style={[styles.input, styles.countryInput]}
                placeholder="Country code"
                // placeholderTextColor={"#f5a9b2"}
                placeholderTextColor={"rgba(253, 53, 109, 0.6)"}
                value={countryCode}
              /> */}
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Email"
                placeholderTextColor={"#f5a9b2"}
                keyboardType="numeric"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={"#f5a9b2"}
                value={password}
                onChangeText={setPassword}
                style={[styles.input]}
                secureTextEntry
              />
            </View>
            <View style={{ marginLeft: 10, marginVertical: 6 }}>
              <Link href={"/signup"}>
                <Text style={styles.forgotPasswordText}>forgot password ?</Text>
              </Link>
            </View>

            <TouchableOpacity
              style={[
                Pdstyles.pillButton,
                email !== "" ? styles.enabled : styles.disabled,
                styles.enhancedButton,
              ]}
            >
              <Text style={[Pdstyles.buttonText, styles.buttonText]}>
                Continue
              </Text>
            </TouchableOpacity>
            <View style={styles.signupPromptContainer}>
              <Text style={styles.signupPromptText}>
                Don't have an account?{"  "}
                <Link href={"/signup"}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </Link>{" "}
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <View
                style={{
                  flex: 1,
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: "#f5a9b2",
                }}
              />
              <Text style={{ color: "#f5a9b2", fontSize: 20 }}>or</Text>
              <View
                style={{
                  flex: 1,
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: "#f5a9b2",
                }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {}}
              style={[
                Pdstyles.pillButton,
                {
                  flexDirection: "row",
                  gap: 16,
                  marginTop: 20,
                  backgroundColor: "#2E0A14",
                  borderWidth: 1,
                  borderColor: "rgba(253, 53, 109, 0.5)",
                  //   backgroundColor: "#fff",
                },
              ]}
            >
              <Ionicons name="logo-google" size={24} color={"#FD356D"} />
              <Text
                style={[styles.buttonText, { color: "#FD356D", fontSize: 20 }]}
              >
                Continue with Google{" "}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  forgotPasswordText: {
    fontSize: 16,
    textAlign: "center",
    color: "#FD356D", // Your accent color
  },
  signupPromptContainer: {
    alignItems: "center",
    padding: 16,
    justifyContent: "center",
    // backgroundColor: "rgba(253, 53, 109, 0.03)", // Very subtle accent color background
    // borderRadius: 12,
  },
  signupPromptText: {
    color: "rgba(255, 255, 255, 0.7)", // Slightly muted white for the main text
    fontSize: 16,
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
  },
  signupLink: {
    color: "#FD356D", // Your accent color
    fontWeight: "600",
    textDecorationLine: "none", // Removes default underline
  },
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A", // Dark background for contrast
    position: "relative",
    overflow: "hidden", // This ensures our background elements don't spill out
  },
  topRightBlob: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#FD356D",
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
    backgroundColor: "#FD356D",
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
    backgroundColor: "#FD356D",
    top: "30%",
    left: "20%",
    opacity: 0.2,
  },
  accentDot2: {
    position: "absolute",
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#FD356D",
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
    backgroundColor: "#FD356D",
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
  topCircle: {
    backgroundColor: "#FD356D",
    top: -50,
    left: -50,
  },
  bottomCircle: {
    backgroundColor: "#FD356D",
    bottom: -50,
    right: -50,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },
  glassCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)", // Very subtle white for glass effect
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)", // Subtle border
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#FD356D",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        // elevation: 8,
      },
    }),
  },
  cardContent: {
    padding: 24,
    backgroundColor: "rgba(253, 53, 109, 0.03)", // Very subtle accent color
  },
  inputContainer: {
    marginVertical: 40,
    flexDirection: "row",
    gap: 10,
  },
  passwordContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    // backgroundColor: "rgba(69, 14, 30, 0.75)",
    // backgroundColor: "#17050A",
    padding: 20,
    borderRadius: 16,
    fontSize: 20,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(253, 53, 109, 0.2)",
  },
  countryInput: {
    width: 120,
  },
  enabled: {
    backgroundColor: "rgba(207, 43, 89, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(253, 53, 109, 0.5)",
  },
  disabled: {
    backgroundColor: "rgba(161, 34, 69, 0.7)",
  },
  enhancedHeader: {
    fontSize: 32,
    color: "#FD356D",
    // fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "rgba(253, 53, 109, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(253, 53, 109, 0.5)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 10,
      },
    }),
  },
  enhancedDescription: {
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  enhancedButton: {
    ...Platform.select({
      ios: {
        shadowColor: "#FD356D",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  buttonText: {
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },

  // inputContainer: {
  //     marginVertical: 40,
  //     flexDirection: 'row',
  //   },
  //   input: {
  //     backgroundColor: '#450E1E',
  //     padding: 20,
  //     borderRadius: 16,
  //     fontSize: 20,
  //     marginRight: 10,
  //   },
  //   enabled: {
  //     backgroundColor:    "#CF2B59",
  //   },
  //   disabled: {
  //     backgroundColor: "#A12245",
  //   },
});
