import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text }    from './Text';
import { Divider } from './Divider';

interface Props {
  title:      string;
  subtitle?:  string;
  icon?:      keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onEdit?:    () => void;
  onDelete?:  () => void;
  onPress?:   () => void;
  last?:      boolean;
  right?:     React.ReactNode;
}

export function RowItem({ title, subtitle, icon, iconColor = '#458EFF', onEdit, onDelete, onPress, last, right }: Props) {
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        className="flex-row items-center py-3 px-1"
      >
        {icon && (
          <View className="w-9 h-9 rounded-lg bg-gray-50 items-center justify-center mr-3">
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
        )}

        <View className="flex-1">
          <Text variant="label" numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text variant="caption" color="muted" className="mt-0.5" numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>

        {right}

        {(onEdit || onDelete) && (
          <View className="flex-row gap-1 ml-2">
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center"
              >
                <Ionicons name="pencil-outline" size={15} color="#458EFF" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                className="w-8 h-8 rounded-lg bg-red-50 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={15} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
      {!last && <Divider />}
    </>
  );
}
