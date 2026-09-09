import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { CreditCapEditor } from '@/components/settings/CreditCapEditor';
import { ThemePicker } from '@/components/settings/ThemePicker';
import { ErrorState } from '@/components/common/ErrorState';
import { useAppState } from '@/lib/app-state';
import { useRipple } from '@/lib/theme';

export default function SettingsScreen() {
  const { state, dispatch } = useAppState();
  const ripple = useRipple();

  function handleResetAll() {
    Alert.alert(
      'Erase all data?',
      'This deletes every class and loadout stored on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase everything',
          style: 'destructive',
          onPress: () => {
            state.classes.forEach((c) => dispatch({ type: 'DELETE_CLASS', id: c.id }));
            state.loadouts.forEach((l) => dispatch({ type: 'DELETE_LOADOUT', id: l.id }));
          },
        },
      ]
    );
  }

  return (
    <ScrollView className="flex-1 bg-stock" contentContainerClassName="gap-6 p-4 pb-12">
      {state.saveError ? (
        <ErrorState message={state.saveError} onDismiss={() => dispatch({ type: 'DISMISS_SAVE_ERROR' })} />
      ) : null}

      <Section title="Stock">
        <ThemePicker />
      </Section>

      <Section title="Credit cap">
        <CreditCapEditor
          creditCap={state.creditCap}
          onSave={(creditCap) => dispatch({ type: 'SET_CREDIT_CAP', creditCap })}
        />
      </Section>

      <Section title="Filed on this device">
        <View className="rounded-key border border-edge bg-key px-3 py-3">
          <Text className="text-meta text-ink-2">
            Everything you enter stays on this phone. There is no account, no server, and nothing is
            sent anywhere — the app has no network permission at all.
          </Text>
          <Text className="mt-2 font-panel-semi text-code uppercase text-ink-3">
            {state.classes.length} classes · {state.loadouts.length} loadouts
          </Text>
        </View>
      </Section>

      <Section title="Danger">
        <Pressable
          onPress={handleResetAll}
          android_ripple={ripple}
          accessibilityRole="button"
          className="min-h-12 items-center justify-center rounded-key border border-alert bg-alert-wash"
        >
          <Text className="font-panel-semi text-code uppercase text-alert">Erase all data</Text>
        </Pressable>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="mb-1.5 border-b border-edge pb-1 font-panel-semi text-micro uppercase text-ink-2">
        {title}
      </Text>
      {children}
    </View>
  );
}
