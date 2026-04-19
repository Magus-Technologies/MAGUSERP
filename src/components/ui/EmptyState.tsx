import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';

interface Props {
  icon?:    keyof typeof Ionicons.glyphMap;
  title:    string;
  message?: string;
}

export function EmptyState({ icon = 'alert-circle-outline', title, message }: Props) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <Ionicons name={icon} size={56} color="#d1d5db" />
      <Text variant="h4" color="muted" className="mt-4 text-center">{title}</Text>
      {message && <Text variant="bodySmall" color="muted" className="mt-2 text-center">{message}</Text>}
    </View>
  );
}
