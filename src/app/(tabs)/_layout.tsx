import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { SettingsHeaderButton } from '@/components/layout/AppHeader';
import { ACCENT } from '@/lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerRight: () => <SettingsHeaderButton />,
        tabBarActiveTintColor: ACCENT,
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
