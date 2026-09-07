import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AppStateProvider } from '@/lib/app-state';
import { useThemeRestore } from '@/lib/theme';

import '@/global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isThemeReady = useThemeRestore();

  useEffect(() => {
    if (isThemeReady) SplashScreen.hideAsync();
  }, [isThemeReady]);

  // Holds the splash screen up until the saved theme preference has been
  // read and applied — otherwise a user who picked "dark" would see a
  // flash of the system/light theme for one frame on every launch.
  if (!isThemeReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppStateProvider>
        <Stack screenOptions={{ headerShadowVisible: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="class-form" options={{ presentation: 'modal', title: 'Class' }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal', title: 'Settings' }} />
          <Stack.Screen name="loadout-compare" options={{ title: 'Compare loadouts' }} />
        </Stack>
      </AppStateProvider>
    </ThemeProvider>
  );
}
