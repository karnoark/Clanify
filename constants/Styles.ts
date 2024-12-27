import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const Pdstyles = StyleSheet.create({
  buttonLabelStyle: {
    fontSize: 20,
    marginVertical: 15,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    // fontSize: 40,
    // fontWeight: '700',
    fontFamily: "PlayRegular",
    textAlign: "center",
    fontSize: 32,
    color: "#FD356D",
    // fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "rgba(253, 53, 109, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  pillButton: {
    margin: 20,
    padding: 10,
    paddingHorizontal: 40,
    height: 60,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  textLink: {
    // color: Colors.primary,
    fontSize: 18,
    fontWeight: "500",
  },
  descriptionText: {
    fontFamily: "PlayRegular",
    fontSize: 18,
    marginTop: 20,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    // color: Colors.gray,
  },
  buttonText: {
    color: "#fff",
    // color: '#A64D79',
    fontSize: 22,
    fontWeight: "500",
    fontFamily: "PlayRegular",
  },
  pillButtonSmall: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTextSmall: {
    // color: '#fff',
    fontSize: 16,
    fontWeight: "500",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 20,
    marginBottom: 10,
  },
  block: {
    marginHorizontal: 20,
    padding: 14,
    // backgroundColor: '#fff',
    borderRadius: 16,
    gap: 20,
  },
  border: {
    borderColor: "magenta",
    borderWidth: StyleSheet.hairlineWidth,
  },
});

// Same grays with hint of #FD356D
const accentedGrays = {
  gray100: "#F4F1F2", // Very subtle pink tint
  gray200: "#E4E1E2",
  gray300: "#D4D1D2",
  gray400: "#A4A1A2",
  gray500: "#848182",
  gray600: "#646162",
  gray700: "#444142",
  gray800: "#242122",
  gray900: "#141112",
};

const plainGrays = {
  gray100: "#F4F4F4", // Lightest
  gray200: "#E4E4E4",
  gray300: "#D4D4D4",
  gray400: "#A4A4A4",
  gray500: "#848484", // Mid
  gray600: "#646464",
  gray700: "#444444",
  gray800: "#242424",
  gray900: "#141414", // Darkest
};
