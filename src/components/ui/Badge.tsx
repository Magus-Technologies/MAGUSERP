import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';

type Variant = 'primary' | 'success' | 'warning' | 'error' | 'gray';

const variantClass: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-50',  text: 'text-primary-700' },
  success: { bg: 'bg-green-50',    text: 'text-green-700'   },
  warning: { bg: 'bg-orange-50',   text: 'text-orange-700'  },
  error:   { bg: 'bg-red-50',      text: 'text-red-700'     },
  gray:    { bg: 'bg-gray-100',    text: 'text-gray-600'    },
};

interface Props {
  label:    string;
  variant?: Variant;
}

export function Badge({ label, variant = 'gray' }: Props) {
  const { bg, text } = variantClass[variant];
  return (
    <View className={`${bg} px-2 py-0.5 rounded-full self-start`}>
      <Text className={`text-[10px] font-medium ${text}`}>{label}</Text>
    </View>
  );
}
