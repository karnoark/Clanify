import React from "react";
import { StyleSheet } from "react-native";
import { Text as RNText, useTheme } from "react-native-paper";
import type { Props } from "react-native-paper/lib/typescript/components/Typography/Text";

export const Text: React.FC<Props<Text>> = ({ children, style, ...props }) => {
  const theme = useTheme();

  return (
    <RNText
      style={[
        styles.defaultText,
        { fontFamily: "PlayRegular", color: theme.colors.onBackground },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    // Any other default text styles
    // color: '#000000',
  },
});
