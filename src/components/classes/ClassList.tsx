import { FlatList } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { buildColorMap } from '@/lib/color';
import type { ClassEntry } from '@/lib/models';

import { ClassCard } from './ClassCard';

interface ClassListProps {
  classes: ClassEntry[];
  includedIds: string[];
  onToggleIncluded: (id: string) => void;
  onPressClass: (id: string) => void;
  onDeleteClass: (id: string) => void;
}

export function ClassList({ classes, includedIds, onToggleIncluded, onPressClass, onDeleteClass }: ClassListProps) {
  const colorMap = buildColorMap(classes);

  if (classes.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="No classes yet"
        message="Tap the + button to add your first class — name, place, and when it meets."
      />
    );
  }

  return (
    <FlatList
      data={classes}
      keyExtractor={(item) => item.id}
      contentContainerClassName="py-3"
      renderItem={({ item, index }) => (
        <ClassCard
          classEntry={item}
          color={colorMap.get(item.id) ?? '#9ca3af'}
          included={includedIds.includes(item.id)}
          index={index}
          onToggleIncluded={() => onToggleIncluded(item.id)}
          onPress={() => onPressClass(item.id)}
          onDelete={() => onDeleteClass(item.id)}
        />
      )}
    />
  );
}
