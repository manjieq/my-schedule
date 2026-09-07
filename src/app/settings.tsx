import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { CreditCapEditor } from '@/components/settings/CreditCapEditor';
import { ThemePicker } from '@/components/settings/ThemePicker';
import { ErrorState } from '@/components/common/ErrorState';
import { useAppState } from '@/lib/app-state';

export default function SettingsScreen() {
  const { state, dispatch } = useAppState();

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
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-black" contentContainerClassName="gap-6 p-4 pb-10">
      {state.saveError ? (
        <ErrorState message={state.saveError} onDismiss={() => dispatch({ type: 'DISMISS_SAVE_ERROR' })} />
      ) : null}

      <Section title="Appearance">
        <ThemePicker />
      </Section>

      <Section title="Schedule">
        <CreditCapEditor creditCap={state.creditCap} onSave={(creditCap) => dispatch({ type: 'SET_CREDIT_CAP', creditCap })} />
      </Section>

      <Section title="About">
        <View className="gap-1 rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-900">
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            Everything you enter stays only on this device — there&apos;s no account and nothing is sent anywhere.
          </Text>
        </View>
      </Section>

      <Section title="Danger zone">
        <Pressable
          onPress={handleResetAll}
          className="items-center rounded-xl border border-red-200 bg-red-50 py-3 active:opacity-70 dark:border-red-900 dark:bg-red-950"
        >
          <Text className="text-sm font-semibold text-red-600 dark:text-red-400">Erase all data</Text>
        </Pressable>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </Text>
      {children}
    </View>
  );
}
