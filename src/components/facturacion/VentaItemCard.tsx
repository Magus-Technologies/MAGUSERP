import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Input } from '../ui/Input';
import { VentaItem } from '../../hooks/useVentaForm';

interface Props {
  item: VentaItem;
  onUpdate: (field: keyof VentaItem, value: any) => void;
  onRemove: () => void;
}

const AFECTACIONES = [
  { id: '10', nombre: '10 - Gravado' },
  { id: '20', nombre: '20 - Exonerado' },
  { id: '30', nombre: '30 - Inafecto' },
  { id: '40', nombre: '40 - Exportación' },
];

export function VentaItemCard({ item, onUpdate, onRemove }: Props) {
  return (
    <View className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 mb-2">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text variant="label" numberOfLines={2}>{item.nombre}</Text>
          <Text variant="caption" color="muted">{item.codigo}</Text>
        </View>
        <TouchableOpacity onPress={onRemove} className="p-1">
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-3 items-end">
        <View className="flex-1">
          <Input
            label="Precio"
            value={String(item.precio_unitario)}
            onChangeText={v => onUpdate('precio_unitario', parseFloat(v) || 0)}
            keyboardType="numeric"
            size="sm"
            textAlign="center"
          />
        </View>
        <View className="flex-1">
          <Input
            label="Cantidad"
            value={String(item.cantidad)}
            onChangeText={v => onUpdate('cantidad', parseFloat(v) || 0)}
            keyboardType="numeric"
            size="sm"
            textAlign="center"
          />
        </View>
        <View className="flex-1 items-end">
          <Text variant="caption" color="muted" className="mb-1">Total</Text>
          <Text variant="label" className="text-primary-600">
            {((item.precio_unitario) * item.cantidad).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
