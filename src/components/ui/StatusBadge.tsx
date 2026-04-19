import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';

type Preset = 'PENDIENTE' | 'FACTURADO' | 'ACEPTADO' | 'ENVIADO' | 'RECHAZADO' | 'ANULADO' | 'PAGADO' | string;

const presets: Record<string, { bg: string; text: string; dot: string }> = {
  PENDIENTE:  { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: '#F59E0B' },
  FACTURADO:  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: '#458EFF' },
  ACEPTADO:   { bg: 'bg-green-50',  text: 'text-green-700',  dot: '#2ABC79' },
  ENVIADO:    { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: '#6366F1' },
  RECHAZADO:  { bg: 'bg-red-50',    text: 'text-red-700',    dot: '#EF4444' },
  ANULADO:    { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: '#9CA3AF' },
  PAGADO:     { bg: 'bg-green-50',  text: 'text-green-700',  dot: '#2ABC79' },
};

const fallback = { bg: 'bg-gray-100', text: 'text-gray-500', dot: '#9CA3AF' };

interface Props {
  status: Preset;
  label?: string;
}

export function StatusBadge({ status, label }: Props) {
  const style = presets[status] ?? fallback;
  return (
    <View className={`flex-row items-center px-2 py-0.5 rounded-full ${style.bg}`}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: style.dot, marginRight: 4 }} />
      <Text variant="caption" className={style.text}>{label ?? status}</Text>
    </View>
  );
}
