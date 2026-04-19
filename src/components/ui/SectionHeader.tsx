import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './Text';

interface Props {
  title:         string;
  subtitle?:     string;
  actionLabel?:  string;
  onAction?:     () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-1">
        <Text variant="h4">{title}</Text>
        {subtitle && <Text variant="caption" color="muted" className="mt-0.5">{subtitle}</Text>}
      </View>

      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} className="ml-4">
          <Text variant="label" color="primary">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
