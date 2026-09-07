import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formatTime } from '@/lib/time';
import { DAYS_OF_WEEK, DAY_LABELS, type DayOfWeek, type TimeSlot } from '@/lib/models';

interface TimeSlotEditorProps {
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

const DEFAULT_SLOT: TimeSlot = { day: 'MON', start: '09:00', end: '10:00' };

/** Editor for a class's weekly meeting times — supports zero slots (an
 *  async/TBD class), and more than one (e.g. a lecture plus a separate
 *  lab day), across the full Mon-Sun week. */
export function TimeSlotEditor({ slots, onChange }: TimeSlotEditorProps) {
  function updateSlot(index: number, patch: Partial<TimeSlot>) {
    onChange(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  function removeSlot(index: number) {
    onChange(slots.filter((_, i) => i !== index));
  }

  function addSlot() {
    onChange([...slots, { ...DEFAULT_SLOT }]);
  }

  return (
    <View className="gap-3">
      {slots.map((slot, index) => (
        <SlotRow
          key={index}
          slot={slot}
          onChange={(patch) => updateSlot(index, patch)}
          onRemove={() => removeSlot(index)}
        />
      ))}
      <Pressable
        onPress={addSlot}
        className="items-center rounded-xl border border-dashed border-neutral-300 py-3 active:opacity-70 dark:border-neutral-700"
      >
        <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400">+ Add meeting time</Text>
      </Pressable>
    </View>
  );
}

function SlotRow({
  slot,
  onChange,
  onRemove,
}: {
  slot: TimeSlot;
  onChange: (patch: Partial<TimeSlot>) => void;
  onRemove: () => void;
}) {
  const [openPicker, setOpenPicker] = useState<'start' | 'end' | null>(null);

  function handlePickerChange(field: 'start' | 'end', event: { type: string }, date?: Date) {
    setOpenPicker(null);
    if (event.type !== 'set' || !date) return;
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    onChange({ [field]: `${hh}:${mm}` });
  }

  return (
    <View className="gap-2 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
      <View className="flex-row flex-wrap gap-1.5">
        {DAYS_OF_WEEK.map((day) => (
          <DayChip key={day} day={day} selected={slot.day === day} onPress={() => onChange({ day })} />
        ))}
      </View>

      <View className="flex-row items-center gap-2">
        <TimeButton label="Start" value={slot.start} onPress={() => setOpenPicker('start')} />
        <Text className="text-neutral-400">–</Text>
        <TimeButton label="End" value={slot.end} onPress={() => setOpenPicker('end')} />
        <Pressable onPress={onRemove} hitSlop={8} className="ml-auto p-1">
          <Text className="text-sm font-medium text-red-600 dark:text-red-400">Remove</Text>
        </Pressable>
      </View>

      {openPicker ? (
        <DateTimePicker
          value={timeStringToDate(slot[openPicker])}
          mode="time"
          is24Hour={false}
          onChange={(event, date) => handlePickerChange(openPicker, event, date)}
        />
      ) : null}
    </View>
  );
}

function DayChip({ day, selected, onPress }: { day: DayOfWeek; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3 py-1.5 active:opacity-70 ${
        selected ? 'bg-blue-600' : 'bg-white dark:bg-neutral-800'
      }`}
    >
      <Text className={`text-xs font-semibold ${selected ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
        {DAY_LABELS[day].slice(0, 3)}
      </Text>
    </Pressable>
  );
}

function TimeButton({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 active:opacity-70 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <Text className="text-[10px] uppercase text-neutral-400">{label}</Text>
      <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{formatTime(value)}</Text>
    </Pressable>
  );
}

function timeStringToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}
