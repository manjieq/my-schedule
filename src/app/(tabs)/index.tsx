import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ClassList } from '@/components/classes/ClassList';
import { ErrorState } from '@/components/common/ErrorState';
import { useAppState } from '@/lib/app-state';

export default function ClassesScreen() {
  const { state, dispatch } = useAppState();
  const router = useRouter();

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

      <Pressable
        onPress={() => router.push('/class-form')}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg active:opacity-90"
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}
