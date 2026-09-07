import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { TimeSlotEditor } from '@/components/classes/TimeSlotEditor';
import { useAppState } from '@/lib/app-state';
import type { TimeSlot } from '@/lib/models';

export default function ClassFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, dispatch } = useAppState();
  const router = useRouter();

  const existing = useMemo(() => state.classes.find((c) => c.id === id), [state.classes, id]);
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [instructor, setInstructor] = useState(existing?.instructor ?? '');
  const [creditsText, setCreditsText] = useState(existing ? String(existing.credits) : '3');
  const [schedule, setSchedule] = useState<TimeSlot[]>(existing?.schedule ?? []);

  const credits = Number(creditsText);
  const canSave = name.trim().length > 0 && Number.isFinite(credits) && credits >= 0;

  function handleSave() {
    if (!canSave) return;
    const payload = {
      name: name.trim(),
      location: location.trim() || undefined,
      instructor: instructor.trim() || undefined,
      credits,
      schedule,
    };
    if (isEditing && existing) {
      dispatch({ type: 'UPDATE_CLASS', id: existing.id, ...payload });
    } else {
      dispatch({ type: 'ADD_CLASS', ...payload });
    }
    router.back();
  }

  function handleDelete() {
    if (!existing) return;
    Alert.alert('Delete class?', `This removes "${existing.name}" from your list.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'DELETE_CLASS', id: existing.id });
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-black" contentContainerClassName="gap-4 p-4 pb-10">
      <Field label="Class name">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Intro to Psychology"
          placeholderTextColor="#9ca3af"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
        />
      </Field>

      <Field label="Location">
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Building 4, Room 201"
          placeholderTextColor="#9ca3af"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
        />
      </Field>

      <Field label="Instructor (optional)">
        <TextInput
          value={instructor}
          onChangeText={setInstructor}
          placeholder="e.g. Dr. Smith"
          placeholderTextColor="#9ca3af"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
        />
      </Field>

      <Field label="Credits">
        <TextInput
          value={creditsText}
          onChangeText={setCreditsText}
          keyboardType="decimal-pad"
          placeholder="3"
          placeholderTextColor="#9ca3af"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
        />
      </Field>

      <Field label="Meeting times">
        <TimeSlotEditor slots={schedule} onChange={setSchedule} />
      </Field>

      <Pressable
        onPress={handleSave}
        disabled={!canSave}
        className="mt-2 items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40 active:opacity-90"
      >
        <Text className="text-base font-semibold text-white">{isEditing ? 'Save changes' : 'Add class'}</Text>
      </Pressable>

      {isEditing ? (
        <Pressable onPress={handleDelete} className="items-center py-2 active:opacity-70">
          <Text className="text-sm font-medium text-red-600 dark:text-red-400">Delete class</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</Text>
      {children}
    </View>
  );
}
