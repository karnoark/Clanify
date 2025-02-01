// This screen handles user profile management for mess members.
// It allows users to view and update their profile information, manage preferences,
// and access various account-related features.

import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Surface,
  Card,
  Button,
  Avatar,
  List,
  useTheme,
  Divider,
  Portal,
  Dialog,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/src/store/auth';

import { Text } from '../../../src/components/common/Text';

// Interface for user profile data
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dateJoined: Date;
  preferences: {
    dietaryRestrictions: string[];
    notificationsEnabled: boolean;
    language: 'english' | 'hindi';
  };
  currentMess: {
    name: string;
    memberSince: Date;
  } | null;
}

// Mock user data - In a real app, this would come from your authentication context
const mockUser: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+91 9876543210',
  dateJoined: new Date('2024-01-01'),
  preferences: {
    dietaryRestrictions: ['No onion', 'Low spice'],
    notificationsEnabled: true,
    language: 'english',
  },
  currentMess: {
    name: 'Ganesh Mess',
    memberSince: new Date('2024-01-15'),
  },
};

export default function ProfileScreen() {
  const theme = useTheme();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const signout = useAuthStore(state => state.signOut);

  // Format dates for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      setLogoutDialogVisible(false);
      // Implement your logout logic here
      // This would typically clear auth tokens and navigate to the login screen
      await signout();
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Surface style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Header */}
          <Card style={styles.profileCard}>
            <Card.Content>
              <View style={styles.profileHeader}>
                <Avatar.Text
                  size={80}
                  label={mockUser.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                  style={styles.avatar}
                />
                <View style={styles.profileInfo}>
                  <Text variant="titleLarge">{mockUser.name}</Text>
                  <Text variant="bodyMedium" style={styles.memberSince}>
                    Member since {formatDate(mockUser.dateJoined)}
                  </Text>
                </View>
              </View>

              <Button
                mode="outlined"
                onPress={() => {
                  /* Navigate to edit profile */
                }}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </Card.Content>
          </Card>

          {/* Current Mess Section */}
          {mockUser.currentMess && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Current Mess Membership
                </Text>
                <Text variant="bodyLarge">{mockUser.currentMess.name}</Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Member since {formatDate(mockUser.currentMess.memberSince)}
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Settings & Preferences */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Settings & Preferences
              </Text>

              <List.Section style={styles.listSection}>
                <List.Item
                  title="Dietary Restrictions"
                  description={mockUser.preferences.dietaryRestrictions.join(
                    ', ',
                  )}
                  left={props => <List.Icon {...props} icon="food" />}
                  onPress={() => {
                    /* Navigate to dietary preferences */
                  }}
                />
                <Divider />
                <List.Item
                  title="Notifications"
                  description={
                    mockUser.preferences.notificationsEnabled
                      ? 'Enabled'
                      : 'Disabled'
                  }
                  left={props => <List.Icon {...props} icon="bell" />}
                  onPress={() => {
                    /* Navigate to notification settings */
                  }}
                />
                <Divider />
                <List.Item
                  title="Language"
                  description={
                    mockUser.preferences.language.charAt(0).toUpperCase() +
                    mockUser.preferences.language.slice(1)
                  }
                  left={props => <List.Icon {...props} icon="translate" />}
                  onPress={() => {
                    /* Navigate to language settings */
                  }}
                />
              </List.Section>
            </Card.Content>
          </Card>

          {/* Account Actions */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Account
              </Text>

              <List.Section style={styles.listSection}>
                <List.Item
                  title="Contact Information"
                  description={mockUser.phone}
                  left={props => <List.Icon {...props} icon="phone" />}
                  onPress={() => {
                    /* Navigate to contact info */
                  }}
                />
                <Divider />
                <List.Item
                  title="Email Address"
                  description={mockUser.email}
                  left={props => <List.Icon {...props} icon="email" />}
                  onPress={() => {
                    /* Navigate to email settings */
                  }}
                />
                <Divider />
                <List.Item
                  title="Privacy Settings"
                  left={props => <List.Icon {...props} icon="shield-account" />}
                  onPress={() => {
                    /* Navigate to privacy settings */
                  }}
                />
                <Divider />
                <List.Item
                  title="Help & Support"
                  left={props => <List.Icon {...props} icon="help-circle" />}
                  onPress={() => {
                    /* Navigate to help section */
                  }}
                />
              </List.Section>
            </Card.Content>
          </Card>

          {/* Logout Button */}
          <Button
            mode="contained"
            onPress={() => setLogoutDialogVisible(true)}
            style={styles.logoutButton}
            buttonColor={theme.colors.error}
          >
            Log Out
          </Button>
        </ScrollView>
      </SafeAreaView>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
          style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
        >
          <Dialog.Title>Log Out</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleLogout}>Log Out</Button>
          </Dialog.Actions>
        </Dialog>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  memberSince: {
    opacity: 0.7,
    marginTop: 4,
  },
  editButton: {
    marginTop: 8,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  listSection: {
    marginHorizontal: -16, // Compensate for Card padding
  },
  logoutButton: {
    marginVertical: 24,
  },
  dialog: {
    borderRadius: 12,
    marginHorizontal: 16,
  },
});
