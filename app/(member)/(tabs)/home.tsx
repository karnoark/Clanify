// This is the main home screen for mess members.
// It displays important information like meal schedules, attendance, and points.

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/src/components/common/Text';

// import { HomeScreen } from '../../../src/screens/claude/HomeScreen';

export default function MemberHomeScreen() {
  const theme = useTheme();

  return (
    <Surface style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* <HomeScreen /> */}
        <Text>Home Screen</Text>
      </SafeAreaView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
