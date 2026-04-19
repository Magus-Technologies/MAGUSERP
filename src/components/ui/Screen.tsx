import React from 'react';
import { View, ScrollView, RefreshControl, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props extends ViewProps {
  children:    React.ReactNode;
  scroll?:     boolean;
  refreshing?: boolean;
  onRefresh?:  () => void;
  className?:  string;
}

export function Screen({ children, scroll = false, refreshing, onRefresh, className = '', style, ...rest }: Props) {
  const inner = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} /> : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1" style={style} {...rest}>{children}</View>
  );

  return (
    <SafeAreaView className={`flex-1 bg-gray-50 ${className}`}>
      {inner}
    </SafeAreaView>
  );
}
