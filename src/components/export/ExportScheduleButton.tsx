import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';

import { getErrorMessage } from '@/lib/errors';
import { saveImageToGallery, shareImage } from '@/lib/export-image';
import { useRipple, usePanelColors } from '@/lib/theme';
import type { ClassEntry, ConflictPair } from '@/lib/models';

import { ExportPlate } from './ExportPlate';

interface ExportScheduleButtonProps {
  classes: ClassEntry[];
  colorFor: (classId: string) => string;
  conflicts?: ConflictPair[];
  creditCap: number;
  total: number;
}

/** Captures the (hidden, off-screen) export plate as a PNG and offers to
 *  save it to the photo gallery or share it. Both are local device APIs —
 *  no cloud upload involved. The plate itself is ExportPlate; this file is
 *  only the two buttons and the capture. */
export function ExportScheduleButton({
  classes,
  colorFor,
  conflicts = [],
  creditCap,
  total,
}: ExportScheduleButtonProps) {
  const shotRef = useRef<ViewShotRef>(null);
  const [isBusy, setIsBusy] = useState<'save' | 'share' | null>(null);

  async function handleExport(action: 'save' | 'share') {
    if (classes.length === 0) return;
    if (!shotRef.current) {
      // The plate has not mounted. Rare, but a tap that does nothing at all
      // reads as the button being broken — say so instead.
      Alert.alert('Couldn’t export', 'The schedule image is not ready yet. Try again.');
      return;
    }
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
    <View className="mx-4 flex-row gap-2">
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

      {/* Off-screen render used only as the capture source. The plate draws
          itself in the live colour scheme, so the PNG comes out in whichever
          one the user is reading in — a dark-mode user exporting a blazing
          silver faceplate would be the surprise. */}
      <View pointerEvents="none" style={{ position: 'absolute', left: -9999, top: 0 }}>
        <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
          <ExportPlate
            classes={classes}
            colorFor={colorFor}
            conflicts={conflicts}
            creditCap={creditCap}
            total={total}
          />
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
  const c = usePanelColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={ripple}
      accessibilityRole="button"
      className="min-h-12 flex-1 items-center justify-center rounded-key border border-edge bg-key disabled:opacity-40"
    >
      {busy ? (
        <ActivityIndicator color={c.ink} />
      ) : (
        <Text className="font-panel-semi text-code uppercase text-ink">{label}</Text>
      )}
    </Pressable>
  );
}
