import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?:            string;
  error?:            string;
  leftIcon?:         keyof typeof Ionicons.glyphMap;
  rightIcon?:        keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  className?:        string;
  size?:             'sm' | 'md';
}

export function Input({ label, error, leftIcon, rightIcon, onRightIconPress, secureTextEntry, className = '', size = 'md', ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [secure,  setSecure]  = useState(secureTextEntry ?? false);
  const isPassword = secureTextEntry === true;
  const height = size === 'sm' ? 'h-9' : 'h-12';

  return (
    <View className="mb-4">
      {label && <Text variant="label" className="mb-1">{label}</Text>}

      <View className={`flex-row items-center bg-white border rounded-xl px-3 ${focused ? 'border-primary-500 border-2' : 'border-gray-300'} ${error ? 'border-red-500' : ''}`}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color="#9ca3af" style={{ marginRight: 8 }} />
        )}

        <TextInput
          className={`flex-1 ${height} text-sm text-gray-800 ${className}`}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity onPress={() => setSecure(s => !s)} className="p-1">
            <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} className="p-1">
            <Ionicons name={rightIcon} size={20} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      {error && <Text variant="caption" color="error" className="mt-1">{error}</Text>}
    </View>
  );
}
