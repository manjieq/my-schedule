import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { AppStateProvider } from '@/lib/app-state';
import { FONTS, panelColors, useThemeRestore } from '@/lib/theme';

import '@/global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isThemeReady = useThemeRestore();
  const [areFontsReady] = useFonts(FONTS);

  useEffect(() => {
    if (isThemeReady && areFontsReady) SplashScreen.hideAsync();
  }, [isThemeReady, areFontsReady]);

  // React Navigation paints the gap between screens with its own theme colors,
  // so they have to be the chassis, not the stock light/dark defaults —
  // otherwise every push flashes a white or near-black card edge that belongs
  // to no part of this design.
  const navTheme: Theme = useMemo(() => {
    const c = panelColors(colorScheme === 'dark' ? 'dark' : 'light');
    const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: c.stock,
        card: c.stock,
        text: c.ink,
        border: c.edge,
        primary: c.accent,
        notification: c.alert,
      },
    };
  }, [colorScheme]);

  // Holds the splash screen up until the saved theme preference has been
  // read and applied, and the bundled faces are in memory — otherwise a user
  // who picked "dark" would see a flash of the system/light theme for one
  // frame on every launch, and every screen would render once in the platform
  // font before swapping to Chivo.
  if (!isThemeReady || !areFontsReady) return null;

  const c = panelColors(colorScheme === 'dark' ? 'dark' : 'light');

  return (
    <ThemeProvider value={navTheme}>
      {/* The status bar sits directly on the chassis now — there is no filled
          bar under it — so its icons follow the body: light icons on the
          near-black instrument, dark icons on the silver one. */}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AppStateProvider>
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            // A pushed screen keeps the chassis running under its header, so
            // the body reads as one continuous piece from the nameplate down.
            // The title is engraved in the trim, matching the tab screens' own
            // nameplate in components/layout/Masthead.
            headerStyle: { backgroundColor: c.stock },
            headerTintColor: c.accentHi,
            // headerTitleStyle only accepts fontFamily/fontSize/fontWeight/color
            // — tracking has to ride in the title string's own casing instead,
            // which is why these titles are set in caps.
            headerTitleStyle: { fontFamily: 'Chivo-Bold', fontSize: 15 },
            contentStyle: { backgroundColor: c.stock },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="class-form" options={{ presentation: 'modal', title: 'CLASS' }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal', title: 'SETTINGS' }} />
          <Stack.Screen name="save-loadout" options={{ presentation: 'modal', title: 'SAVE LOADOUT' }} />
          <Stack.Screen name="loadout-compare" options={{ title: 'COMPARE REVISIONS' }} />
        </Stack>
      </AppStateProvider>
    </ThemeProvider>
  );
}
