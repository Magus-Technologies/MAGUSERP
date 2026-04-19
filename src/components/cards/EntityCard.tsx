import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

interface Props {
  title:      string;
  subtitle?:  string | null;
  icon:       string;
  iconColor?: string;
  imagen?:    string | null;
  onEdit:     () => void;
  onDelete:   () => void;
}

export function EntityCard({ title, subtitle, icon, iconColor = '#458EFF', imagen, onEdit, onDelete }: Props) {
  return (
    <Card className="flex-1 m-1.5 overflow-hidden">
      {/* Imagen / ícono */}
      <View className="w-full aspect-square bg-gray-100 items-center justify-center">
        {imagen ? (
          <Image source={{ uri: imagen }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Ionicons name={icon as any} size={40} color={iconColor} />
        )}
      </View>

      {/* Info */}
      <View className="p-3 flex-1">
        <Text variant="label" numberOfLines={2} className="mb-1">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="muted" numberOfLines={2}>{subtitle}</Text>
        ) : null}
      </View>

      {/* Acciones */}
      <View className="flex-row border-t border-gray-100">
        <TouchableOpacity
          onPress={onEdit}
          className="flex-1 py-2.5 items-center justify-center"
        >
          <Ionicons name="pencil-outline" size={16} color="#458EFF" />
        </TouchableOpacity>
        <View className="w-px bg-gray-100" />
        <TouchableOpacity
          onPress={onDelete}
          className="flex-1 py-2.5 items-center justify-center"
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Card>
  );
}
