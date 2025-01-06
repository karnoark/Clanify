// This screen handles all communication between mess administrators and members.
// It supports both mass announcements and individual conversations, making it a central
// hub for all mess-related communications. The design prioritizes clarity and efficiency,
// ensuring important messages reach their intended audience effectively.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import {
  Surface,
  Card,
  Button,
  TextInput,
  Avatar,
  Chip,
  IconButton,
  Portal,
  Modal,
  useTheme,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../../../src/components/common/Text';

// Define our data structures for messages and conversations
interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    role: 'admin' | 'member';
  };
  type: 'announcement' | 'direct';
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
}

interface Conversation {
  id: string;
  member: {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    lastActive: Date;
  };
  lastMessage?: Message;
  unreadCount: number;
}

// Mock data for development
const mockConversations: Conversation[] = [
  {
    id: '1',
    member: {
      id: 'm1',
      name: 'John Doe',
      status: 'active',
      lastActive: new Date(),
    },
    lastMessage: {
      id: 'msg1',
      text: "Will there be any special items for tomorrow's lunch?",
      timestamp: new Date(Date.now() - 3600000),
      sender: {
        id: 'm1',
        name: 'John Doe',
        role: 'member',
      },
      type: 'direct',
      status: 'read',
    },
    unreadCount: 0,
  },
  // Add more conversations...
];

const mockAnnouncements: Message[] = [
  {
    id: 'a1',
    text: "Tomorrow's menu has been updated with special Panjabi thali for lunch",
    timestamp: new Date(Date.now() - 7200000),
    sender: {
      id: 'admin1',
      name: 'Mess Admin',
      role: 'admin',
    },
    type: 'announcement',
    status: 'delivered',
  },
  // Add more announcements...
];

export default function ChatScreen() {
  const theme = useTheme();
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isAnnouncementModalVisible, setAnnouncementModalVisible] =
    useState(false);

  // Function to create and send a new announcement
  const handleSendAnnouncement = () => {
    if (!newAnnouncement.trim()) return;

    // In a real app, this would be handled by your backend
    const announcement: Message = {
      id: Date.now().toString(),
      text: newAnnouncement,
      timestamp: new Date(),
      sender: {
        id: 'admin1',
        name: 'Mess Admin',
        role: 'admin',
      },
      type: 'announcement',
      status: 'sent',
    };

    // Here you would send the announcement to your backend
    console.log('Sending announcement:', announcement);

    setNewAnnouncement('');
    setAnnouncementModalVisible(false);
  };

  // Function to format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Render an individual conversation item
  const renderConversationItem = (conversation: Conversation) => (
    <Pressable
      key={conversation.id}
      onPress={() => setSelectedConversation(conversation)}
      style={({ pressed }) => [
        styles.conversationItem,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Avatar.Text
        size={40}
        label={conversation.member.name.charAt(0)}
        style={styles.avatar}
      />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text variant="titleSmall">{conversation.member.name}</Text>
          {conversation.lastMessage && (
            <Text variant="bodySmall" style={styles.timestamp}>
              {formatTimestamp(conversation.lastMessage.timestamp)}
            </Text>
          )}
        </View>
        {conversation.lastMessage && (
          <Text
            variant="bodyMedium"
            numberOfLines={1}
            style={styles.lastMessage}
          >
            {conversation.lastMessage.text}
          </Text>
        )}
      </View>
      {conversation.unreadCount > 0 && (
        <Chip compact mode="flat" style={styles.unreadBadge}>
          {conversation.unreadCount}
        </Chip>
      )}
    </Pressable>
  );

  // Render the conversation list
  const renderConversationList = () => (
    <Card style={styles.conversationsCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium">Recent Conversations</Text>
          <IconButton
            icon="magnify"
            onPress={() => {
              /* Implement search */
            }}
          />
        </View>
        <View style={styles.conversationsList}>
          {mockConversations.map(renderConversationItem)}
        </View>
      </Card.Content>
    </Card>
  );

  // Render the announcements section
  const renderAnnouncements = () => (
    <Card style={styles.announcementsCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium">Announcements</Text>
          <Button
            mode="contained"
            onPress={() => setAnnouncementModalVisible(true)}
            icon="plus"
          >
            New
          </Button>
        </View>
        <View style={styles.announcementsList}>
          {mockAnnouncements.map(announcement => (
            <View key={announcement.id} style={styles.announcement}>
              <Text variant="bodyMedium">{announcement.text}</Text>
              <Text variant="bodySmall" style={styles.announcementTime}>
                {formatTimestamp(announcement.timestamp)}
              </Text>
              <View style={styles.announcementStatus}>
                <MaterialCommunityIcons
                  name={announcement.status === 'read' ? 'check-all' : 'check'}
                  size={16}
                  color={
                    announcement.status === 'read'
                      ? theme.colors.primary
                      : theme.colors.outline
                  }
                />
              </View>
            </View>
          ))}
        </View>
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
          {renderAnnouncements()}
          {renderConversationList()}
        </ScrollView>
      </SafeAreaView>

      {/* New Announcement Modal */}
      <Portal>
        <Modal
          visible={isAnnouncementModalVisible}
          onDismiss={() => setAnnouncementModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            New Announcement
          </Text>
          <TextInput
            mode="outlined"
            value={newAnnouncement}
            onChangeText={setNewAnnouncement}
            placeholder="Type your announcement..."
            multiline
            numberOfLines={4}
            style={styles.announcementInput}
          />
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setAnnouncementModalVisible(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSendAnnouncement}
              disabled={!newAnnouncement.trim()}
            >
              Send
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  announcementsCard: {
    marginBottom: 16,
  },
  announcementsList: {
    gap: 12,
  },
  announcement: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: 12,
    borderRadius: 8,
  },
  announcementTime: {
    marginTop: 8,
    opacity: 0.7,
  },
  announcementStatus: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  conversationsCard: {
    flex: 1,
  },
  conversationsList: {
    gap: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  avatar: {
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timestamp: {
    opacity: 0.7,
  },
  lastMessage: {
    opacity: 0.7,
  },
  unreadBadge: {
    marginLeft: 8,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
  },
  announcementInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
