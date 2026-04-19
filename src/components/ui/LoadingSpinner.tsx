import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from './Text';

interface Props {
  message?: string;
}

export function LoadingSpinner({ message }: Props) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#1a8af7" />
      {message && <Text color="muted" className="mt-3">{message}</Text>}
    </View>
  );
}
