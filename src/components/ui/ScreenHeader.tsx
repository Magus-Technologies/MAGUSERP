import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';

interface Props {
  title:     string;
  subtitle?: string;
  onMenu?:   () => void;
  onBack?:   () => void;
  right?:    React.ReactNode;
}

export function ScreenHeader({ title, subtitle, onMenu, onBack, right }: Props) {
  const { top } = useSafeAreaInsets();

  return (
    <View
      className="bg-azul-oscuro px-4 pb-5 flex-row items-center"
      style={{ paddingTop: Math.max(top, 16) }}
    >
      {onMenu ? (
        <TouchableOpacity onPress={onMenu} className="mr-3">
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
      ) : onBack ? (
        <TouchableOpacity onPress={onBack} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ) : null}

      <View className="flex-1">
        {subtitle ? <Text variant="caption" className="text-white/60">{subtitle}</Text> : null}
        <Text variant="h4" color="white">{title}</Text>
      </View>

      {right}
    </View>
  );
}
