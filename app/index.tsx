import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import React from "react";
import { Pdstyles } from "@/constants/Styles";
import { Link } from "expo-router";

const { width, height } = Dimensions.get("window");

const Page = () => {
  return (
    <View style={styles.container}>
      {/* Background elements that create depth and visual interest */}
      <View style={styles.mainGlow} />
      <View style={styles.topDecoration} />
      <View style={styles.bottomDecoration} />
      <View style={styles.accentLine} />

      {/* Content container */}
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>From mess to bless</Text>
          <Text style={styles.headerSecondary}>your meals, sorted</Text>
        </View>
      </View>

      {/* Button container with enhanced styling */}
      <View style={styles.buttonContainer}>
        <Link href={"/signin"} asChild>
          <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.buttonText}>Sign in</Text>
          </TouchableOpacity>
        </Link>
        <Link href={"/signup"} asChild>
          <TouchableOpacity style={styles.signUpButton}>
            <Text style={styles.buttonText}>Sign up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#202024",
    overflow: "hidden", // Important for containing background elements
  },
  // Background decorative elements
  mainGlow: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: "#FD356D",
    top: -width * 0.75,
    left: -width * 0.25,
    opacity: 0.08,
    transform: [{ scale: 1.2 }],
  },
  topDecoration: {
    position: "absolute",
    width: width,
    height: height * 0.3,
    backgroundColor: "#FD356D",
    top: 0,
    right: -width * 0.5,
    opacity: 0.05,
    transform: [{ rotate: "-45deg" }, { scale: 1.5 }],
  },
  bottomDecoration: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "#FD356D",
    bottom: -width * 0.4,
    right: -width * 0.2,
    opacity: 0.06,
  },
  accentLine: {
    position: "absolute",
    width: width * 2,
    height: 2,
    backgroundColor: "#FD356D",
    top: height * 0.3,
    left: -width * 0.5,
    opacity: 0.1,
    transform: [{ rotate: "-15deg" }],
  },
  // Content styling
  contentContainer: {
    flex: 4,
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: 40,
  },
  headerContainer: {
    width: "100%",
  },
  header: {
    fontSize: 42,
    color: "#FD356D",
    textTransform: "uppercase",
    fontFamily: "PlayRegular",
    lineHeight: 48,
    textShadowColor: "rgba(253, 53, 109, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSecondary: {
    fontSize: 36,
    color: "#FD356D",
    textTransform: "uppercase",
    fontFamily: "PlayRegular",
    opacity: 0.9,
    marginTop: 8,
  },
  // Button container and buttons
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  signInButton: {
    flex: 1,
    backgroundColor: "#FD356D",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FD356D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpButton: {
    flex: 1,
    backgroundColor: "#FD356D",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FD356D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

export default Page;
