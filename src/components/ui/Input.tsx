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
  textAlign?:        'left' | 'center';
}

export function Input({ label, error, leftIcon, rightIcon, onRightIconPress, secureTextEntry, className = '', size = 'md', textAlign = 'left', ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [secure,  setSecure]  = useState(secureTextEntry ?? false);
  const isPassword = secureTextEntry === true;
  const inputHeight = size === 'sm' ? 36 : 48;

  // Extraer textAlign del rest para evitar duplicados
  const { textAlign: _, ...cleanRest } = rest as any;

  return (
    <View className="mb-4">
      {label && <Text variant="label" className="mb-1">{label}</Text>}

      <View className={`flex-row items-center bg-white border rounded-xl px-3 ${focused ? 'border-primary-500 border-2' : 'border-gray-300'} ${error ? 'border-red-500' : ''}`}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color="#9ca3af" style={{ marginRight: 8 }} />
        )}

        <TextInput
          style={{
            flex: 1,
            height: inputHeight,
            fontSize: 14,
            color: '#1f2937',
            textAlign: textAlign as any,
            textAlignVertical: 'center',
            paddingVertical: 0,
          }}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...cleanRest}
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
