/* eslint-disable react/no-unstable-nested-components */
// This screen manages the mess administrator's profile and business settings.
// It serves as a central hub for configuring mess operations and managing
// administrator preferences. The design follows a hierarchical organization
// of settings, making it intuitive for administrators to find and modify
// specific aspects of their mess management system.

import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Surface,
  Card,
  Button,
  List,
  Switch,
  Portal,
  Modal,
  useTheme,
  Avatar,
  Divider,
  IconButton,
} from 'react-native-paper';
// import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../../../src/components/common/Text';

// Define comprehensive types for mess profile management
interface MessProfile {
  name: string;
  description: string;
  type: 'veg' | 'non-veg' | 'both';
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
  contact: {
    phone: string;
    alternatePhone?: string;
    email: string;
  };
  operatingHours: {
    lunch: { start: string; end: string };
    dinner: { start: string; end: string };
  };
  capacity: {
    total: number;
    current: number;
  };
  pricing: {
    monthly: number;
    security: number;
  };
  features: {
    autoApproveMembers: boolean;
    allowPartialMonthPayments: boolean;
    sendReminders: boolean;
    requireAttendancePhoto: boolean;
  };
}

// Mock data for development purposes
const mockMessProfile: MessProfile = {
  name: 'Ganesh Mess',
  description: 'Serving authentic home-style meals since 2020',
  type: 'both',
  address: {
    street: '123 Main Street',
    area: 'Koregaon Park',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
  },
  contact: {
    phone: '9876543210',
    email: 'ganesh.mess@example.com',
  },
  operatingHours: {
    lunch: { start: '12:30', end: '15:30' },
    dinner: { start: '19:30', end: '22:30' },
  },
  capacity: {
    total: 50,
    current: 35,
  },
  pricing: {
    monthly: 3000,
    security: 1000,
  },
  features: {
    autoApproveMembers: false,
    allowPartialMonthPayments: true,
    sendReminders: true,
    requireAttendancePhoto: false,
  },
};

export default function ProfileScreen() {
  const theme = useTheme();
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Generate QR code data - in a real app, this would be more secure
  const qrData = JSON.stringify({
    messId: '123',
    name: mockMessProfile.name,
    timestamp: Date.now(),
  });

  // Format currency for Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle business hour updates
  const handleHoursUpdate = () => {
    // Implement business hours update logic
    router.push('/(admin)/update-hours');
  };

  // Handle mess profile updates
  const handleProfileUpdate = () => {
    // Implement profile update logic
    router.push('/(admin)/update-profile');
  };

  // Render the mess information section
  const renderMessInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={64}
            label={mockMessProfile.name.charAt(0)}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text variant="titleLarge">{mockMessProfile.name}</Text>
            <Text variant="bodyMedium" style={styles.description}>
              {mockMessProfile.description}
            </Text>
          </View>
        </View>

        <Button
          mode="contained-tonal"
          onPress={handleProfileUpdate}
          style={styles.editButton}
        >
          Edit Business Profile
        </Button>
      </Card.Content>
    </Card>
  );

  // Render the business statistics section
  const renderBusinessStats = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Business Overview
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">
              {mockMessProfile.capacity.current}
            </Text>
            <Text variant="bodySmall">Active Members</Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="headlineMedium">
              {formatCurrency(mockMessProfile.pricing.monthly)}
            </Text>
            <Text variant="bodySmall">Monthly Rate</Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="headlineMedium">
              {(
                (mockMessProfile.capacity.current /
                  mockMessProfile.capacity.total) *
                100
              ).toFixed(0)}
              %
            </Text>
            <Text variant="bodySmall">Capacity Used</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // Render the quick actions section
  const renderQuickActions = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.quickActions}>
          <Button
            mode="contained-tonal"
            icon="qrcode"
            onPress={() => setQrModalVisible(true)}
          >
            View QR Code
          </Button>

          <Button
            mode="contained-tonal"
            icon="clock"
            onPress={handleHoursUpdate}
          >
            Update Hours
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  // Render the settings section
  const renderSettings = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Settings
        </Text>

        <List.Section>
          <List.Item
            title="Auto-approve New Members"
            description="Automatically approve membership requests"
            left={props => <List.Icon {...props} icon="account-check" />}
            right={() => (
              <Switch
                value={mockMessProfile.features.autoApproveMembers}
                onValueChange={() => {}}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Partial Month Payments"
            description="Allow members to pay for partial months"
            left={props => <List.Icon {...props} icon="calendar-clock" />}
            right={() => (
              <Switch
                value={mockMessProfile.features.allowPartialMonthPayments}
                onValueChange={() => {}}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Attendance Reminders"
            description="Send notifications to mark attendance"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={mockMessProfile.features.sendReminders}
                onValueChange={() => {}}
              />
            )}
          />
        </List.Section>
      </Card.Content>
    </Card>
  );

  return (
    <Surface style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {renderMessInfo()}
          {renderBusinessStats()}
          {renderQuickActions()}
          {renderSettings()}

          <Button
            mode="contained"
            onPress={() => setLogoutModalVisible(true)}
            style={styles.logoutButton}
            buttonColor={theme.colors.error}
          >
            Log Out
          </Button>
        </ScrollView>
      </SafeAreaView>

      {/* QR Code Modal */}
      <Portal>
        <Modal
          visible={qrModalVisible}
          onDismiss={() => setQrModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.qrContainer}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Attendance QR Code
            </Text>
            {/* <QRCode value={qrData} size={200} backgroundColor="white" /> */}
            <Text variant="bodyMedium" style={styles.qrNote}>
              Members can scan this QR code to mark their attendance
            </Text>
            <Button
              mode="contained"
              onPress={() => setQrModalVisible(false)}
              style={styles.modalButton}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Logout Confirmation Modal */}
      <Portal>
        <Modal
          visible={logoutModalVisible}
          onDismiss={() => setLogoutModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Confirm Logout
          </Text>
          <Text variant="bodyMedium" style={styles.modalText}>
            Are you sure you want to log out?
          </Text>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setLogoutModalVisible(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setLogoutModalVisible(false);
                // Implement logout logic
                router.replace('/(auth)/login');
              }}
            >
              Log Out
            </Button>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  description: {
    marginTop: 4,
    opacity: 0.7,
  },
  editButton: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  logoutButton: {
    marginVertical: 24,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  qrContainer: {
    alignItems: 'center',
  },
  modalTitle: {
    marginBottom: 24,
  },
  modalText: {
    marginBottom: 24,
  },
  qrNote: {
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  modalButton: {
    minWidth: 120,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
