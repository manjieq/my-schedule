import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ClassList } from '@/components/classes/ClassList';
import { ErrorState } from '@/components/common/ErrorState';
import { Masthead } from '@/components/layout/Masthead';
import { useAppState } from '@/lib/app-state';
import { useRipple } from '@/lib/theme';

export default function ClassesScreen() {
  const { state, dispatch } = useAppState();
  const router = useRouter();
  const ripple = useRipple(true);

  // Delete mode. Off on every visit — it is a thing you turn on to tidy up,
  // never a state the screen sits in.
  const [deleting, setDeleting] = useState(false);

  // The app's one authored press moment: the add bar takes a shallow squeeze,
  // the way a rubber stamp gives before it prints. Kept on the primary action
  // only — scattering this onto every pressable is what the ripple is for.
  const addScale = useSharedValue(1);
  const addStyle = useAnimatedStyle(() => ({ transform: [{ scale: addScale.value }] }));


  // Deleting is one tap away from the row people press constantly, and a

  // class carries every time slot the user typed by hand. Confirm first:

  // there is no undo, and nothing about the schedule is recoverable once a

  // class is gone.

  function handleDeleteClass(id: string) {

    const target = state.classes.find((cl) => cl.id === id);

    Alert.alert(

      'Delete this class?',

      target ? `"${target.name}" and its meeting times will be removed. This cannot be undone.` : undefined,

      [

        { text: 'Cancel', style: 'cancel' },

        { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_CLASS', id }) },

      ]

    );

  }


  return (
    <View className="flex-1">
      <Masthead
        title="CLASSES"
        actions={[
          {
            icon: deleting ? 'close-outline' : 'trash-outline',
            label: deleting ? 'Done deleting' : 'Delete classes',
            onPress: () => setDeleting((v) => !v),
            active: deleting,
          },
        ]}
      />

      {state.saveError ? (
        <View className="pt-2">
          <ErrorState message={state.saveError} onDismiss={() => dispatch({ type: 'DISMISS_SAVE_ERROR' })} />
        </View>
      ) : null}

      <ClassList
        classes={state.classes}
        includedIds={state.includedIds}
        onToggleIncluded={(id) => dispatch({ type: 'TOGGLE_INCLUDED', id })}
        onPressClass={(id) => router.push({ pathname: '/class-form', params: { id } })}
        deletable={deleting}
        onDeleteClass={handleDeleteClass}
      />

      {/* A stamped action bar rather than a floating circle: this world has no
          round corners and no drop shadows, and a full-width bar is a larger
          target than a 56dp FAB besides. */}
      <Animated.View className="absolute bottom-0 left-0 right-0" style={addStyle}>
        <Pressable
          onPress={() => router.push('/class-form')}
          onPressIn={() => {
            // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutated by design, not React state
            addScale.value = withSpring(0.985, { damping: 18, stiffness: 320 });
          }}
          onPressOut={() => {
            // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutated by design, not React state
            addScale.value = withSpring(1, { damping: 18, stiffness: 320 });
          }}
          android_ripple={ripple}
          accessibilityRole="button"
          accessibilityLabel="Add a class"
          className="mx-4 mb-2 min-h-14 items-center justify-center rounded-key bg-accent"
        >
          <Text className="font-panel-bold text-meta uppercase text-accent-on">+ Add class</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
