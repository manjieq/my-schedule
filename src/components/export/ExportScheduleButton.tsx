import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';

import { getErrorMessage } from '@/lib/errors';
import { saveImageToGallery, shareImage } from '@/lib/export-image';
import { ACCENT, useRipple } from '@/lib/theme';
import type { ClassEntry, ConflictPair } from '@/lib/models';

import { ScheduleGrid } from '../schedule/ScheduleGrid';

interface ExportScheduleButtonProps {
  classes: ClassEntry[];
  colorFor: (classId: string) => string;
  conflicts?: ConflictPair[];
}

// Wide enough that ScheduleGrid never needs to shrink columns or scroll
// horizontally to fit all 5-7 days — the on-screen grid is deliberately
// narrower to fit a phone, but the exported image should show the whole
// week at a comfortable size regardless of what the phone had room for.
const EXPORT_WIDTH = 900;

/** Captures the (hidden, full-width) schedule grid as a PNG and offers to
 *  save it to the photo gallery or share it. Both are local device APIs —
 *  no cloud upload involved. */
export function ExportScheduleButton({ classes, colorFor, conflicts }: ExportScheduleButtonProps) {
  const shotRef = useRef<ViewShotRef>(null);
  const [isBusy, setIsBusy] = useState<'save' | 'share' | null>(null);

  async function handleExport(action: 'save' | 'share') {
    if (classes.length === 0 || !shotRef.current) return;
    setIsBusy(action);
    try {
      const uri = await shotRef.current.capture();
      if (action === 'save') {
        await saveImageToGallery(uri);
        Alert.alert('Saved', 'Your schedule was saved to your photos.');
      } else {
        await shareImage(uri);
      }
    } catch (err) {
      Alert.alert('Couldn’t export', getErrorMessage(err));
    } finally {
      setIsBusy(null);
    }
  }

  return (
    <View className="mx-4 flex-row gap-3">
      <ExportButton
        label="Save image"
        busy={isBusy === 'save'}
        disabled={classes.length === 0 || isBusy !== null}
        onPress={() => handleExport('save')}
      />
      <ExportButton
        label="Share"
        busy={isBusy === 'share'}
        disabled={classes.length === 0 || isBusy !== null}
        onPress={() => handleExport('share')}
      />

      {/* Off-screen full-width render used only as the capture source. */}
      <View pointerEvents="none" style={{ position: 'absolute', left: -9999, top: 0, width: EXPORT_WIDTH }}>
        <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
          <View className="bg-white p-4 dark:bg-black" style={{ width: EXPORT_WIDTH }}>
            <ScheduleGrid classes={classes} colorFor={colorFor} conflicts={conflicts} />
          </View>
        </ViewShot>
      </View>
    </View>
  );
}

function ExportButton({
  label,
  busy,
  disabled,
  onPress,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const ripple = useRipple();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={ripple}
      className="flex-1 items-center rounded-xl border border-neutral-300 bg-white py-2.5 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900"
    >
      {busy ? (
        <ActivityIndicator color={ACCENT} />
      ) : (
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</Text>
      )}
    </Pressable>
  );
}
