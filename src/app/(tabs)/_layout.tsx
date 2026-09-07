import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { SettingsHeaderButton } from '@/components/layout/AppHeader';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerRight: () => <SettingsHeaderButton />,
        tabBarActiveTintColor: '#2563eb',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, size }) => <Ionicons name="school-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="loadouts"
        options={{
          title: 'Loadouts',
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
