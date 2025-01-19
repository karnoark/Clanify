import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

const QRScanner = ({ onScan, onClose }) => {
  return (
    <View>
      <Text>QRScanner</Text>
      <Button
        onPress={() => {
          onScan();
        }}
      >
        Press here
      </Button>
    </View>
  );
};

export default QRScanner;

const styles = StyleSheet.create({});
