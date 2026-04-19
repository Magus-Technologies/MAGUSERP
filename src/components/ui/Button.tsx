import React from 'react';
import { TouchableOpacity, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary:   'bg-primary-500 active:bg-primary-600',
  secondary: 'bg-gray-100 border border-gray-300 active:bg-gray-200',
  ghost:     'bg-transparent active:bg-gray-100',
  danger:    'bg-red-500 active:bg-red-600',
};

const sizeClass: Record<Size, string> = {
  sm: 'py-1 px-3',
  md: 'py-3 px-5',
  lg: 'py-4 px-6',
};

const labelVariant: Record<Variant, string> = {
  primary:   'text-white',
  secondary: 'text-gray-700',
  ghost:     'text-primary-500',
  danger:    'text-white',
};

const labelSize: Record<Size, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

interface Props {
  onPress:   () => void;
  children:  string;
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?:    StyleProp<ViewStyle>;
}

export function Button({
  onPress, children, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false, style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`flex-row items-center justify-center rounded-xl ${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' || variant === 'secondary' ? '#1a8af7' : '#fff'} size="small" />
      ) : (
        <Text className={`font-semibold ${labelVariant[variant]} ${labelSize[size]}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
