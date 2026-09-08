import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ClassList } from '@/components/classes/ClassList';
import { ErrorState } from '@/components/common/ErrorState';
import { useAppState } from '@/lib/app-state';
import { useRipple } from '@/lib/theme';

export default function ClassesScreen() {
  const { state, dispatch } = useAppState();
  const router = useRouter();
  const ripple = useRipple(true);

  // The FAB's one authored press moment — a quick spring squeeze standing
  // in for Android's usual ripple-plus-elevation feedback on a primary
  // action, on top of the ripple itself.
  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }));

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-black">
      {state.saveError ? (
        <ErrorState message={state.saveError} onDismiss={() => dispatch({ type: 'DISMISS_SAVE_ERROR' })} />
      ) : null}

      <ClassList
        classes={state.classes}
        includedIds={state.includedIds}
        onToggleIncluded={(id) => dispatch({ type: 'TOGGLE_INCLUDED', id })}
        onPressClass={(id) => router.push({ pathname: '/class-form', params: { id } })}
        onDeleteClass={(id) => dispatch({ type: 'DELETE_CLASS', id })}
      />

      <Animated.View className="absolute bottom-6 right-6" style={fabStyle}>
        <Pressable
          onPress={() => router.push('/class-form')}
          onPressIn={() => {
            // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutated by design, not React state
            fabScale.value = withSpring(0.9, { damping: 14, stiffness: 260 });
          }}
          onPressOut={() => {
            // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutated by design, not React state
            fabScale.value = withSpring(1, { damping: 14, stiffness: 260 });
          }}
          android_ripple={ripple}
          className="h-14 w-14 items-center justify-center rounded-full bg-violet-600 shadow-lg"
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      </Animated.View>
    </View>
  );
}
