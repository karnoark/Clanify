/* eslint-disable react/no-unstable-nested-components */
// This file defines the bottom tab navigation for mess members.
// It creates a consistent navigation structure across the member section of the app.

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

// Define icons for each tab to maintain consistency
const TAB_ICONS = {
  home: { focused: 'home', unfocused: 'home-outline' },
  explore: { focused: 'compass', unfocused: 'compass-outline' },
  chat: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  profile: { focused: 'account', unfocused: 'account-outline' },
} as const;

export default function TabLayout() {
  const theme = useTheme();

  // Calculate bottom padding based on platform to account for safe areas
  const bottomPadding = Platform.OS === 'ios' ? 28 : 8;

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        // Configure tab bar appearance
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: `${theme.colors.outline}40`, // 40% opacity for subtle line
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          borderTopWidth: 0.5,
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
        tabBarLabelStyle: {
          fontFamily: 'PlayRegular',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? TAB_ICONS.home.focused : TAB_ICONS.home.unfocused}
              size={28}
              color={color}
            />
          ),
          // Home screen has its own header implementation
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={
                focused
                  ? TAB_ICONS.explore.focused
                  : TAB_ICONS.explore.unfocused
              }
              size={28}
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
            // <MaterialCommunityIcons
            //   name={focused ? TAB_ICONS.chat.focused : TAB_ICONS.chat.unfocused}
            //   size={28}
            //   color={color}
            // />
            <Ionicons
              name={focused ? TAB_ICONS.chat.focused : TAB_ICONS.chat.unfocused}
              size={28}
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
              size={28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
