// This screen handles all meal-related operations for mess administrators.
// It provides functionality for menu management, meal schedules, and inventory tracking.
// The screen is designed to make daily meal operations as efficient as possible.

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Surface,
  Card,
  Button,
  List,
  useTheme,
  Portal,
  Modal,
  SegmentedButtons,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../../../src/components/common/Text';

// Define comprehensive types for meal management
interface MenuItem {
  id: string;
  name: string;
  type: 'veg' | 'non-veg';
  category: 'main' | 'side' | 'dessert' | 'drink';
  description?: string;
  ingredients: string[];
  preparationTime: number; // in minutes
  costPerServing: number;
}

interface MealSchedule {
  id: string;
  date: string;
  type: 'lunch' | 'dinner';
  menu: MenuItem[];
  timing: {
    start: string;
    end: string;
  };
  expectedAttendance: number;
  specialNotes?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pieces';
  minimumRequired: number;
  lastRestocked: string;
  category: 'vegetables' | 'grains' | 'spices' | 'dairy' | 'meat' | 'others';
}

// Example data - In a real app, this would come from your backend
const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Dal Tadka',
    type: 'veg',
    category: 'main',
    description: 'Yellow lentils tempered with cumin and garlic',
    ingredients: ['Yellow Dal', 'Cumin', 'Garlic', 'Onion', 'Tomato'],
    preparationTime: 45,
    costPerServing: 25,
  },
  // Add more menu items...
];

export default function MealsScreen() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'menu' | 'schedule' | 'inventory'>(
    'menu',
  );
  const [addMenuItemVisible, setAddMenuItemVisible] = useState(false);

  // Render the menu management section
  const renderMenuSection = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium">Menu Items</Text>
          <Button
            mode="contained"
            onPress={() => setAddMenuItemVisible(true)}
            icon="plus"
          >
            Add Item
          </Button>
        </View>

        <List.Section>
          {mockMenuItems.map(item => (
            <List.Accordion
              key={item.id}
              title={item.name}
              description={item.description}
              left={props => (
                <List.Icon
                  {...props}
                  icon={item.type === 'veg' ? 'leaf' : 'food'}
                  color={
                    item.type === 'veg'
                      ? theme.colors.primary
                      : theme.colors.error
                  }
                />
              )}
            >
              <View style={styles.menuItemDetails}>
                <Text variant="bodyMedium">
                  Category:{' '}
                  {item.category.charAt(0).toUpperCase() +
                    item.category.slice(1)}
                </Text>
                <Text variant="bodyMedium">
                  Preparation Time: {item.preparationTime} minutes
                </Text>
                <Text variant="bodyMedium">
                  Cost per Serving: ₹{item.costPerServing}
                </Text>
                <Text variant="bodyMedium">Ingredients:</Text>
                {item.ingredients.map((ingredient, index) => (
                  <Text
                    key={index}
                    variant="bodyMedium"
                    style={styles.ingredient}
                  >
                    • {ingredient}
                  </Text>
                ))}
                <View style={styles.menuItemActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      /* Handle edit */
                    }}
                    style={styles.actionButton}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      /* Handle delete */
                    }}
                    style={styles.actionButton}
                    textColor={theme.colors.error}
                  >
                    Delete
                  </Button>
                </View>
              </View>
            </List.Accordion>
          ))}
        </List.Section>
      </Card.Content>
    </Card>
  );

  // Render the meal schedule section
  const renderScheduleSection = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium">Weekly Schedule</Text>
          <IconButton
            icon="calendar"
            onPress={() => {
              /* Handle schedule view */
            }}
          />
        </View>

        {/* Week view implementation */}
        <View style={styles.scheduleContainer}>
          {/* We'll implement a calendar view here */}
          <Text variant="bodyMedium">
            Calendar implementation coming soon...
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  // Render the inventory management section
  const renderInventorySection = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium">Inventory Management</Text>
          <Button
            mode="contained"
            onPress={() => {
              /* Handle add inventory */
            }}
            icon="plus"
          >
            Add Item
          </Button>
        </View>

        {/* Inventory tracking implementation */}
        <View style={styles.inventoryContainer}>
          <Text variant="bodyMedium">Inventory tracking coming soon...</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <Surface style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Tab selection */}
        <SegmentedButtons
          value={activeTab}
          onValueChange={value => setActiveTab(value as typeof activeTab)}
          buttons={[
            { value: 'menu', label: 'Menu' },
            { value: 'schedule', label: 'Schedule' },
            { value: 'inventory', label: 'Inventory' },
          ]}
          style={styles.tabButtons}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'menu' && renderMenuSection()}
          {activeTab === 'schedule' && renderScheduleSection()}
          {activeTab === 'inventory' && renderInventorySection()}
        </ScrollView>
      </SafeAreaView>

      {/* Add Menu Item Modal */}
      <Portal>
        <Modal
          visible={addMenuItemVisible}
          onDismiss={() => setAddMenuItemVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Add Menu Item
          </Text>
          {/* We'll implement the add menu item form here */}
          <Text variant="bodyMedium">Menu item form coming soon...</Text>
          <Button
            mode="contained"
            onPress={() => setAddMenuItemVisible(false)}
            style={styles.modalButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>
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
  tabButtons: {
    margin: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuItemDetails: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  ingredient: {
    marginLeft: 16,
    opacity: 0.7,
  },
  menuItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    minWidth: 100,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 16,
  },
  scheduleContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
