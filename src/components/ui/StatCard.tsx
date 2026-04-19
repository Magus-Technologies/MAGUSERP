import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Card } from './Card';

type Color = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const colorMap: Record<Color, { bg: string; icon: string; text: string }> = {
  primary: { bg: 'bg-primary-50',  icon: '#458EFF', text: 'text-primary-600' },
  success: { bg: 'bg-green-50',    icon: '#2ABC79', text: 'text-green-600'   },
  warning: { bg: 'bg-orange-50',   icon: '#FF9F29', text: 'text-orange-600'  },
  danger:  { bg: 'bg-red-50',      icon: '#EF4444', text: 'text-red-600'     },
  info:    { bg: 'bg-blue-50',     icon: '#3B82F6', text: 'text-blue-600'    },
};

interface Props {
  title:       string;
  value:       string | number;
  icon:        keyof typeof Ionicons.glyphMap;
  color?:      Color;
  growth?:     number;   // porcentaje de crecimiento, positivo o negativo
  className?:  string;
}

export function StatCard({ title, value, icon, color = 'primary', growth, className = '' }: Props) {
  const { bg, icon: iconColor, text } = colorMap[color];

  return (
    <Card className={`p-4 flex-1 min-w-[45%] ${className}`}>
      {/* Icon */}
      <View className={`w-10 h-10 rounded-xl ${bg} items-center justify-center mb-3`}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      {/* Value */}
      <Text variant="h3" className="mb-0.5">{String(value)}</Text>

      {/* Title */}
      <Text variant="caption" color="muted">{title}</Text>

      {/* Growth badge */}
      {growth !== undefined && (
        <View className="flex-row items-center mt-2">
          <Ionicons
            name={growth >= 0 ? 'trending-up' : 'trending-down'}
            size={12}
            color={growth >= 0 ? '#2ABC79' : '#EF4444'}
          />
          <Text
            variant="caption"
            className={`ml-1 ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}
          >
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </Text>
        </View>
      )}
    </Card>
  );
}
