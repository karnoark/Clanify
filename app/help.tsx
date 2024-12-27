import { StyleSheet, View } from "react-native";
import React from "react";
import { Button } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { Text } from "@/components/Text";

const Page = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: Colors.light.backdrop,
      }}
    >
      <Button
        icon={"camera"}
        mode="contained"
        onPress={() => console.log("help? what's that?")}
      >
        Press me
      </Button>
      <Text>Do Not. For Love of Good</Text>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({});
