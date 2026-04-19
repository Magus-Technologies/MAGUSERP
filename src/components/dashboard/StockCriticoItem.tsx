import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text }   from '../ui/Text';
import { Divider } from '../ui/Divider';
import { StockCritico } from '../../types/dashboard.types';

interface Props {
  item:  StockCritico;
  last?: boolean;
}

export function StockCriticoItem({ item, last }: Props) {
  const pct = Math.min((item.stock / item.stock_minimo) * 100, 100);
  const isZero = item.stock === 0;

  return (
    <>
      <View className="flex-row items-center py-3">
        {/* Icono */}
        <View className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${isZero ? 'bg-red-50' : 'bg-orange-50'}`}>
          <Ionicons
            name={isZero ? 'close-circle-outline' : 'warning-outline'}
            size={18}
            color={isZero ? '#EF4444' : '#FF9F29'}
          />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text variant="label" className="mb-0.5" numberOfLines={1}>{item.nombre}</Text>
          <View className="flex-row items-center gap-2">
            {/* Barra de progreso */}
            <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${isZero ? 'bg-red-400' : 'bg-orange-400'}`}
                style={{ width: `${pct}%` }}
              />
            </View>
            <Text variant="caption" color="muted">
              {item.stock}/{item.stock_minimo}
            </Text>
          </View>
        </View>

        {/* Badge */}
        <View className={`ml-3 px-2 py-0.5 rounded-full ${isZero ? 'bg-red-50' : 'bg-orange-50'}`}>
          <Text className={`text-[10px] font-semibold ${isZero ? 'text-red-600' : 'text-orange-600'}`}>
            {isZero ? 'Sin stock' : 'Crítico'}
          </Text>
        </View>
      </View>
      {!last && <Divider />}
    </>
  );
}
