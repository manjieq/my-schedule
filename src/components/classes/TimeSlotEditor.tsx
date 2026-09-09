import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formatTime } from '@/lib/time';
import { useRipple, usePanelColors } from '@/lib/theme';
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
  const ripple = useRipple();
  const c = usePanelColors();

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
    <View className="gap-2">
      {slots.map((slot, index) => (
        <SlotRow
          key={index}
          index={index}
          slot={slot}
          onChange={(patch) => updateSlot(index, patch)}
          onRemove={() => removeSlot(index)}
        />
      ))}
      <Pressable
        onPress={addSlot}
        android_ripple={ripple}
        accessibilityRole="button"
        className="min-h-12 flex-row items-center justify-center gap-1.5 rounded-key border border-dashed border-edge"
      >
        <Ionicons name="add" size={14} color={c.ink2} />
        <Text className="font-panel-semi text-code uppercase text-ink-2">Add meeting time</Text>
      </Pressable>
    </View>
  );
}

function SlotRow({
  index,
  slot,
  onChange,
  onRemove,
}: {
  index: number;
  slot: TimeSlot;
  onChange: (patch: Partial<TimeSlot>) => void;
  onRemove: () => void;
}) {
  const ripple = useRipple();
  const [openPicker, setOpenPicker] = useState<'start' | 'end' | null>(null);

  function handlePickerChange(field: 'start' | 'end', event: { type: string }, date?: Date) {
    setOpenPicker(null);
    if (event.type !== 'set' || !date) return;
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    onChange({ [field]: `${hh}:${mm}` });
  }

  return (
    <View className="rounded-key border border-edge bg-key">
      <View className="flex-row items-center justify-between border-b border-hair px-2 py-1">
        <Text className="font-panel-semi text-micro uppercase text-ink-2">Meeting {index + 1}</Text>
        <Pressable
          onPress={onRemove}
          hitSlop={12}
          android_ripple={ripple}
          accessibilityRole="button"
          accessibilityLabel={`Remove meeting ${index + 1}`}
          className="px-1 py-1"
        >
          <Text className="font-panel-semi text-code uppercase text-alert">Remove</Text>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap gap-1 p-2">
        {DAYS_OF_WEEK.map((day) => (
          <DayChip key={day} day={day} selected={slot.day === day} onPress={() => onChange({ day })} />
        ))}
      </View>

      <View className="flex-row items-stretch border-t border-hair">
        <TimeButton label="Start" value={slot.start} onPress={() => setOpenPicker('start')} />
        <View className="w-px bg-hair" />
        <TimeButton label="End" value={slot.end} onPress={() => setOpenPicker('end')} />
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
  const ripple = useRipple(selected);
  return (
    <Pressable
      onPress={onPress}
      android_ripple={ripple}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={DAY_LABELS[day]}
      // 44px wide x 44px tall keeps every day inside the touch-target floor
      // while still fitting all seven across a phone.
      className={`h-11 w-11 items-center justify-center rounded-key ${
        selected ? 'bg-accent' : 'bg-key'
      }`}
    >
      <Text className={`font-panel-semi text-code uppercase ${selected ? 'text-accent-on' : 'text-ink-2'}`}>
        {day}
      </Text>
    </Pressable>
  );
}

function TimeButton({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const ripple = useRipple();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={ripple}
      accessibilityRole="button"
      accessibilityLabel={`${label} time, currently ${formatTime(value)}`}
      className="min-h-12 flex-1 justify-center px-3 py-2"
    >
      <Text className="font-panel-semi text-micro uppercase text-ink-3">{label}</Text>
      <Text className="font-panel-bold text-item text-ink">{formatTime(value)}</Text>
    </Pressable>
  );
}

function timeStringToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}
