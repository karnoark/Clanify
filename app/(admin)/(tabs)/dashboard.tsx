// This is the main dashboard screen for mess administrators.
// It provides a comprehensive overview of the mess operations including:
// - Attendance and rating trends
// - Member management
// - Financial insights
// - Quick actions for common tasks

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import {
  Surface,
  Card,
  Button,
  useTheme,
  Portal,
  Modal,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { LineChart } from 'recharts';

import { Text } from '../../../src/components/common/Text';

// Let's define our data structures to ensure type safety throughout the component
interface AttendanceData {
  date: string;
  lunch: number;
  dinner: number;
}

interface RatingData {
  date: string;
  rating: number;
}

interface MemberDetail {
  id: string;
  name: string;
  joinDate: Date;
  membershipEnds: Date;
  attendance: {
    total: number;
    lastThirtyDays: number;
  };
  payments: {
    status: 'paid' | 'pending' | 'overdue';
    dueAmount?: number;
    dueDate?: Date;
  };
  points: number;
  nextMeal?: {
    attending: boolean;
    meal: 'lunch' | 'dinner';
  };
}

interface DashboardData {
  attendance: AttendanceData[];
  ratings: RatingData[];
  members: MemberDetail[];
  summary: {
    totalMembers: number;
    activeMembers: number;
    averageRating: number;
    monthlyRevenue: number;
  };
}

// Mock data for development - In production, this would come from your backend
const mockDashboardData: DashboardData = {
  attendance: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lunch: Math.floor(Math.random() * 30) + 20,
    dinner: Math.floor(Math.random() * 30) + 20,
  })),
  ratings: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    rating: Math.random() * 2 + 3, // Random rating between 3 and 5
  })),
  members: [
    {
      id: '1',
      name: 'John Doe',
      joinDate: new Date('2024-01-01'),
      membershipEnds: new Date('2024-02-01'),
      attendance: {
        total: 45,
        lastThirtyDays: 25,
      },
      payments: {
        status: 'paid',
      },
      points: 120,
      nextMeal: {
        attending: true,
        meal: 'lunch',
      },
    },
    // Add more mock members here
  ],
  summary: {
    totalMembers: 35,
    activeMembers: 32,
    averageRating: 4.2,
    monthlyRevenue: 105000,
  },
};

export default function DashboardScreen() {
  const theme = useTheme();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedChart, setSelectedChart] = useState('attendance');
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(
    null,
  );

  // Format currency for Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Render the summary cards at the top of the dashboard
  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <Card
        style={[
          styles.summaryCard,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <Card.Content>
          <Text variant="titleLarge">
            {mockDashboardData.summary.totalMembers}
          </Text>
          <Text variant="bodyMedium">Total Members</Text>
        </Card.Content>
      </Card>

      <Card
        style={[
          styles.summaryCard,
          { backgroundColor: theme.colors.secondaryContainer },
        ]}
      >
        <Card.Content>
          <Text variant="titleLarge">
            {mockDashboardData.summary.averageRating.toFixed(1)}
          </Text>
          <Text variant="bodyMedium">Avg. Rating</Text>
        </Card.Content>
      </Card>

      <Card
        style={[
          styles.summaryCard,
          { backgroundColor: theme.colors.tertiaryContainer },
        ]}
      >
        <Card.Content>
          <Text variant="titleLarge">
            {formatCurrency(mockDashboardData.summary.monthlyRevenue)}
          </Text>
          <Text variant="bodyMedium">Monthly Revenue</Text>
        </Card.Content>
      </Card>
    </View>
  );

  // Render the trend chart (attendance or ratings)
  const renderTrendChart = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <View style={styles.chartHeader}>
          <Text variant="titleMedium">Trends</Text>
          <SegmentedButtons
            value={selectedChart}
            onValueChange={setSelectedChart}
            buttons={[
              { value: 'attendance', label: 'Attendance' },
              { value: 'ratings', label: 'Ratings' },
            ]}
            style={styles.chartToggle}
          />
        </View>

        {/* We'll implement the actual chart visualization here */}
        <View style={styles.chartContainer}>
          {/* Chart placeholder - Replace with actual chart component */}
          <View style={styles.chartPlaceholder} />
        </View>
      </Card.Content>
    </Card>
  );

  // Render the member management section
  const renderMemberList = () => (
    <Card style={styles.membersCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Member Management
        </Text>

        {mockDashboardData.members.map(member => (
          <Card
            key={member.id}
            style={[
              styles.memberCard,
              member.payments.status === 'overdue' && styles.overdueCard,
            ]}
            onPress={() => setSelectedMember(member)}
          >
            <Card.Content>
              <View style={styles.memberHeader}>
                <View>
                  <Text variant="titleSmall">{member.name}</Text>
                  <Text variant="bodySmall" style={styles.memberSubtitle}>
                    Membership ends:{' '}
                    {member.membershipEnds.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.memberStatus}>
                  {member.nextMeal && (
                    <Text
                      variant="labelSmall"
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: member.nextMeal.attending
                            ? theme.colors.primaryContainer
                            : theme.colors.errorContainer,
                        },
                      ]}
                    >
                      {member.nextMeal.attending ? 'Coming' : 'Not Coming'}
                    </Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
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
          {/* Summary Statistics */}
          {renderSummaryCards()}

          {/* Trend Charts */}
          {renderTrendChart()}

          {/* Member Management */}
          {renderMemberList()}
        </ScrollView>
      </SafeAreaView>

      {/* Member Details Modal */}
      <Portal>
        <Modal
          visible={!!selectedMember}
          onDismiss={() => setSelectedMember(null)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {selectedMember && (
            <View>
              <Text variant="titleLarge" style={styles.modalTitle}>
                {selectedMember.name}
              </Text>
              {/* Add more member details here */}
              <Button
                mode="contained"
                onPress={() => setSelectedMember(null)}
                style={styles.modalButton}
              >
                Close
              </Button>
            </View>
          )}
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartToggle: {
    maxWidth: 200,
  },
  chartContainer: {
    height: 200,
    marginTop: 16,
  },
  chartPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  membersCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  memberCard: {
    marginBottom: 8,
  },
  overdueCard: {
    borderColor: 'red',
    borderWidth: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  memberStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
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
});
