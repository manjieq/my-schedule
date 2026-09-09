import { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';

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

export function ClassList({
  classes,
  includedIds,
  onToggleIncluded,
  onPressClass,
  onDeleteClass,
}: ClassListProps) {
  // Memoized — this used to rebuild the whole colour map on every render of
  // every keystroke-driven parent.
  const colorMap = useMemo(() => buildColorMap(classes), [classes]);

  if (classes.length === 0) {
    return (
      <EmptyState
        icon="document-outline"
        title="No classes entered"
        message="Add your first class — its name, where it meets, how many credits it carries, and the times it runs. A loadout is a saved combination of these you can compare against others."
      />
    );
  }

  return (
    <FlatList
      data={classes}
      keyExtractor={(item) => item.id}
      // No column headings: each class is its own key now, not a row in a
      // table, so there is nothing spanning the list to head.
      contentContainerClassName="px-4 pb-24 pt-1"
      renderItem={({ item, index }) => (
        <ClassCard
          classEntry={item}
          color={colorMap.get(item.id) ?? '#5c7f96'}
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
