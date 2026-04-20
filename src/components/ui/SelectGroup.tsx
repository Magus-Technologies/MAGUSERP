import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from './Text';

interface Option {
  id:     number | string;
  nombre: string;
}

interface Props {
  label:      string;
  options:    Option[];
  selectedId: number | string | null;
  onSelect:   (id: any) => void;
  required?:  boolean;
  allowNull?: boolean;
  nullLabel?: string;
}

export function SelectGroup({
  label, options, selectedId, onSelect,
  required = false, allowNull = false, nullLabel = 'Ninguno'
}: Props) {
  return (
    <View className="mb-4">
      <Text variant="label" className="mb-2">
        {label} {required ? '*' : ''}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {allowNull && (
          <TouchableOpacity
            onPress={() => onSelect(null)}
            className={`px-3 py-1.5 rounded-lg border ${selectedId === null ? 'bg-gray-700 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <Text className={`text-xs font-medium ${selectedId === null ? 'text-white' : 'text-gray-700'}`}>
              {nullLabel}
            </Text>
          </TouchableOpacity>
        )}
        {options.map(opt => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onSelect(opt.id)}
            className={`px-3 py-1.5 rounded-lg border ${selectedId === opt.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'}`}
          >
            <Text className={`text-xs font-medium ${selectedId === opt.id ? 'text-white' : 'text-gray-700'}`}>
              {opt.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
