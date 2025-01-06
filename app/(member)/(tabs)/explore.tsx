// This screen allows members to discover and explore other mess services.
// It shows a list of nearby mess services with ratings and details.

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Card, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../../../src/components/common/Text';

// Interface for mess data
interface MessData {
  id: string;
  name: string;
  rating: number;
  type: 'veg' | 'non-veg' | 'both';
  monthlyPrice: number;
  distance: number;
  address: string;
}

export default function ExploreScreen() {
  const theme = useTheme();

  // This would come from your backend in a real app
  const mockMessList: MessData[] = [
    {
      id: '1',
      name: 'Ganesh Mess',
      rating: 4.5,
      type: 'veg',
      monthlyPrice: 3000,
      distance: 0.5,
      address: 'Near City Hospital, Main Road',
    },
    // Add more mock data as needed
  ];

  const renderMessCard = (mess: MessData) => (
    <Card key={mess.id} style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium">{mess.name}</Text>
          <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
            ★ {mess.rating.toFixed(1)}
          </Text>
        </View>

        <Text variant="bodyMedium" style={styles.type}>
          {mess.type.charAt(0).toUpperCase() + mess.type.slice(1)}
        </Text>

        <Text variant="bodySmall" style={styles.address}>
          {mess.address}
        </Text>

        <View style={styles.details}>
          <Text variant="bodyMedium">₹{mess.monthlyPrice}/month</Text>
          <Text variant="bodyMedium">{mess.distance} km away</Text>
        </View>
      </Card.Content>

      <Card.Actions>
        <Button mode="outlined" onPress={() => {}}>
          View Details
        </Button>
        <Button mode="contained" onPress={() => {}}>
          Request Join
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <Surface style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {mockMessList.map(renderMessCard)}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    marginBottom: 4,
  },
  address: {
    marginBottom: 8,
    opacity: 0.7,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
