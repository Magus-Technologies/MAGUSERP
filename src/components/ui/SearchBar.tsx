import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value:         string;
  onChangeText:  (text: string) => void;
  placeholder?:  string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Buscar...' }: Props) {
  return (
    <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11 mx-4 mt-3 mb-3">
      <Ionicons name="search-outline" size={18} color="#9ca3af" />
      <TextInput
        className="flex-1 ml-2 text-sm text-gray-800"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} className="p-1">
          <Ionicons name="close-circle" size={16} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
}
