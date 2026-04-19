import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label';
type Color   = 'default' | 'muted' | 'primary' | 'success' | 'error' | 'warning' | 'white';

const variantClass: Record<Variant, string> = {
  h1:        'text-3xl font-bold',
  h2:        'text-2xl font-bold',
  h3:        'text-xl font-semibold',
  h4:        'text-lg font-semibold',
  body:      'text-sm font-normal',
  bodySmall: 'text-xs font-normal',
  caption:   'text-[10px] font-normal',
  label:     'text-xs font-medium',
};

const colorClass: Record<Color, string> = {
  default: 'text-gray-800',
  muted:   'text-gray-500',
  primary: 'text-primary-500',
  success: 'text-green-600',
  error:   'text-red-500',
  warning: 'text-orange-500',
  white:   'text-white',
};

interface Props extends TextProps {
  variant?: Variant;
  color?:   Color;
  children: React.ReactNode;
}

export function Text({ variant = 'body', color = 'default', className = '', children, ...rest }: Props) {
  return (
    <RNText className={`${variantClass[variant]} ${colorClass[color]} ${className}`} {...rest}>
      {children}
    </RNText>
  );
}
