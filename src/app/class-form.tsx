import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text } from 'react-native';

import { TimeSlotEditor } from '@/components/classes/TimeSlotEditor';
import { Field, SheetInput } from '@/components/common/SheetField';
import { useAppState } from '@/lib/app-state';
import { useRipple } from '@/lib/theme';
import type { TimeSlot } from '@/lib/models';

export default function ClassFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, dispatch } = useAppState();
  const router = useRouter();
  const ripple = useRipple();
  const rippleOnFill = useRipple(true);

  const existing = useMemo(() => state.classes.find((c) => c.id === id), [state.classes, id]);
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? '');
  const [code, setCode] = useState(existing?.code ?? '');
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
      code: code.trim() || undefined,
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
    Alert.alert('Delete class?', `This removes “${existing.name}” from your list.`, [
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
    // Without this the keyboard covers the credits field and the meeting-time
    // editor on a short phone. The app had no keyboard handling at all before.
    <KeyboardAvoidingView
      className="flex-1 bg-stock"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-4 pb-16"
        keyboardShouldPersistTaps="handled"
      >
        <Field label="Class name">
          <SheetInput value={name} onChangeText={setName} placeholder="암호학" />
        </Field>

        <Field label="Short code" hint="optional — what the board prints">
          <SheetInput
            value={code}
            onChangeText={setCode}
            placeholder="CSE3007"
            autoCapitalize="characters"
            maxLength={12}
          />
        </Field>

        <Field label="Location">
          <SheetInput value={location} onChangeText={setLocation} placeholder="Y317-0406 ERICA" />
        </Field>

        <Field label="Instructor" hint="optional">
          <SheetInput value={instructor} onChangeText={setInstructor} placeholder="오희국" />
        </Field>

        <Field label="Credits">
          <SheetInput
            value={creditsText}
            onChangeText={setCreditsText}
            keyboardType="decimal-pad"
            placeholder="3"
          />
        </Field>

        <Field label="Meeting times" hint="a class can meet more than once a week">
          <TimeSlotEditor slots={schedule} onChange={setSchedule} />
        </Field>

        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          android_ripple={rippleOnFill}
          accessibilityRole="button"
          className="mt-1 min-h-12 items-center justify-center rounded-key bg-accent disabled:opacity-40"
        >
          <Text className="font-panel-bold text-meta uppercase text-accent-on">
            {isEditing ? 'Save changes' : 'Add class'}
          </Text>
        </Pressable>

        {isEditing ? (
          <Pressable
            onPress={handleDelete}
            android_ripple={ripple}
            accessibilityRole="button"
            className="min-h-12 items-center justify-center rounded-key border border-alert"
          >
            <Text className="font-panel-semi text-code uppercase text-alert">Delete class</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
