// Form primitives.
//
// The input class string was copy-pasted into six places and had already
// drifted into three different dark backgrounds; the field label was duplicated
// as a local helper in both class-form.tsx and settings.tsx. Both live here now.
//
// A field on a call sheet is a ruled box you type into, so: square, hairline
// border, plate ground, label set small in the typewriter above it.
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { usePanelColors } from '@/lib/theme';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text className="font-panel-semi text-micro uppercase text-ink-2">{label}</Text>
      {hint ? <Text className="mt-0.5 font-panel-semi text-code text-ink-3">{hint}</Text> : null}
      <View className="mt-1.5">{children}</View>
    </View>
  );
}

/** The one text input in the app. Never set a sheet face on it — what gets
 *  typed here is the user's Korean class and instructor names, which the
 *  bundled Latin faces do not carry (PRODUCT.md). */
export function SheetInput(props: TextInputProps) {
  const c = usePanelColors();
  return (
    <TextInput
      placeholderTextColor={c.ink3}
      {...props}
      className={`min-h-12 border border-edge bg-key px-3 py-3 text-item text-ink ${props.className ?? ''}`}
    />
  );
}
