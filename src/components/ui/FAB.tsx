import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPress: () => void;
  icon?:   keyof typeof Ionicons.glyphMap;
}

export function FAB({ onPress, icon = 'add' }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="absolute bottom-6 right-5 w-14 h-14 bg-primary-500 rounded-full items-center justify-center shadow-lg"
      style={{ elevation: 6 }}
    >
      <Ionicons name={icon} size={28} color="#fff" />
    </TouchableOpacity>
  );
}
