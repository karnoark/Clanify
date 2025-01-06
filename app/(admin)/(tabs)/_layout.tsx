/* eslint-disable react/no-unstable-nested-components */
// This file defines the bottom tab navigation for mess administrators.
// It provides a specialized navigation structure for managing the mess business.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

// Define icons for each tab to maintain consistency
const TAB_ICONS = {
  dashboard: { focused: 'view-dashboard', unfocused: 'view-dashboard-outline' },
  meals: { focused: 'food', unfocused: 'food-outline' },
  chat: { focused: 'chat', unfocused: 'chat-outline' },
  profile: { focused: 'account', unfocused: 'account-outline' },
} as const;

export default function AdminTabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        // Configure tab bar appearance
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        // Configure header appearance
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerShadowVisible: false,
        // Tab bar visual feedback
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'PlayRegular',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={
                focused
                  ? TAB_ICONS.dashboard.focused
                  : TAB_ICONS.dashboard.unfocused
              }
              size={24}
              color={color}
            />
          ),
          // Dashboard has its own header implementation
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="meals"
        options={{
          title: 'Meals',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={
                focused ? TAB_ICONS.meals.focused : TAB_ICONS.meals.unfocused
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? TAB_ICONS.chat.focused : TAB_ICONS.chat.unfocused}
              size={24}
              color={color}
            />
          ),
          // Optional: Add badge for unread messages
          tabBarBadge: undefined,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={
                focused
                  ? TAB_ICONS.profile.focused
                  : TAB_ICONS.profile.unfocused
              }
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
