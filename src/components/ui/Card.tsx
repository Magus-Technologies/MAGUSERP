import React from 'react';
import { View, ViewProps } from 'react-native';
import { shadows } from '../../styles/theme';

interface Props extends ViewProps {
  children:  React.ReactNode;
  shadow?:   keyof typeof shadows;
  className?: string;
}

export function Card({ children, shadow = 'base', className = '', style, ...rest }: Props) {
  return (
    <View
      className={`bg-white rounded-xl ${className}`}
      style={[shadows[shadow], style]}
      {...rest}
    >
      {children}
    </View>
  );
}
