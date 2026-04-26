import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPress: () => void;
  icon?:   keyof typeof Ionicons.glyphMap;
}

export function FAB({ onPress, icon = 'add' }: Props) {
  const { bottom } = useSafeAreaInsets();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="absolute right-5 w-14 h-14 bg-primary-500 rounded-full items-center justify-center shadow-lg"
      style={{ bottom: Math.max(bottom, 16) + 8, elevation: 6 }}
    >
      <Ionicons name={icon} size={28} color="#fff" />
    </TouchableOpacity>
  );
}
