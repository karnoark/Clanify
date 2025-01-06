// This screen handles communication between mess members and administrators.
// It provides a platform for announcements and important updates.

import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Surface, Card, Avatar, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../../../src/components/common/Text';

// Types for chat messages
interface Message {
  id: string;
  text: string;
  timestamp: number;
  isAnnouncement: boolean;
  sender: {
    name: string;
    role: 'admin' | 'member';
  };
}

export default function ChatScreen() {
  const theme = useTheme();

  // Mock messages - would come from your chat backend in a real app
  const messages: Message[] = [
    {
      id: '1',
      text: "'Tomorrow's menu has been updated. Check the home screen for details",
      timestamp: Date.now() - 3600000, // 1 hour ago
      isAnnouncement: true,
      sender: {
        name: 'Mess Admin',
        role: 'admin',
      },
    },
    // Add more mock messages
  ];

  const renderMessage = ({ item }: { item: Message }) => (
    <Card
      style={[
        styles.messageCard,
        item.isAnnouncement && {
          backgroundColor: theme.colors.primaryContainer,
        },
      ]}
    >
      <Card.Content>
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            <Avatar.Text
              size={32}
              label={item.sender.name.charAt(0)}
              color={
                item.sender.role === 'admin'
                  ? theme.colors.primary
                  : theme.colors.secondary
              }
            />
            <View style={styles.senderDetails}>
              <Text variant="titleSmall">{item.sender.name}</Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>
          {item.isAnnouncement && (
            <Text variant="labelSmall" style={styles.announcementBadge}>
              Announcement
            </Text>
          )}
        </View>
        <Text variant="bodyMedium" style={styles.messageText}>
          {item.text}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <Surface style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
  messageList: {
    padding: 16,
  },
  messageCard: {
    marginBottom: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderDetails: {
    marginLeft: 8,
  },
  timestamp: {
    opacity: 0.7,
  },
  messageText: {
    marginTop: 4,
  },
  announcementBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  separator: {
    height: 8,
  },
});
