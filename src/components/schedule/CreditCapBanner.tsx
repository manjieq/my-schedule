import { Text, View } from 'react-native';

interface CreditCapBannerProps {
  totalCredits: number;
  creditCap: number;
}

/** Live credit readout for the included classes vs. the user's own credit
 *  cap (set in Settings) — styled differently once over the limit. There's
 *  no separate "which classes count" panel like the old app's cart/credit
 *  overflow selector: the included toggle on every ClassCard (and the
 *  strip below) already IS that mechanism, so going over just warns. */
export function CreditCapBanner({ totalCredits, creditCap }: CreditCapBannerProps) {
  const isOver = totalCredits > creditCap;

  return (
    <View
      className={`mx-4 flex-row items-center justify-between rounded-xl px-4 py-2.5 ${
        isOver ? 'bg-amber-50 dark:bg-amber-950' : 'bg-neutral-100 dark:bg-neutral-900'
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          isOver ? 'text-amber-800 dark:text-amber-300' : 'text-neutral-600 dark:text-neutral-400'
        }`}
      >
        {totalCredits} / {creditCap} credits
      </Text>
      {isOver ? (
        <Text className="text-xs font-semibold text-amber-700 dark:text-amber-400">Over your cap</Text>
      ) : null}
    </View>
  );
}
