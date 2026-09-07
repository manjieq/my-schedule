import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { useColorScheme } from '@/lib/theme';

/** Settings-gear button shown in every tab's header — reaches the Settings
 *  modal from anywhere, matching the reference app's persistent-header
 *  pattern (nothing here is a full custom header bar; expo-router's Tabs
 *  already renders the per-screen title, this just adds the one shared
 *  action every tab needs). */
export function SettingsHeaderButton() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  return (
    <Pressable onPress={() => router.push('/settings')} hitSlop={12} className="mr-4 active:opacity-60">
      <Ionicons name="settings-outline" size={22} color={colorScheme === 'dark' ? '#e5e5e5' : '#404040'} />
    </Pressable>
  );
}
