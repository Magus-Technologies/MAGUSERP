import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Venta } from '../../types/facturacion.types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  item:     Venta;
  onPress?: () => void;
}

export function VentaCard({ item, onPress }: Props) {
  const comprobante = item.comprobante_info;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Card className="mx-4 mb-3 p-4">
        {/* Fila superior */}
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text variant="label" numberOfLines={1}>{item.cliente_info.nombre_completo}</Text>
            <Text variant="caption" color="muted">{item.cliente_info.numero_documento}</Text>
          </View>
          <StatusBadge status={item.estado} />
        </View>

        {/* Fila media: código + fecha */}
        <View className="flex-row items-center gap-3 mb-2">
          <View className="flex-row items-center gap-1">
            <Ionicons name="receipt-outline" size={13} color="#9CA3AF" />
            <Text variant="caption" color="muted">{item.codigo_venta}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
            <Text variant="caption" color="muted">{formatDate(item.fecha_venta)}</Text>
          </View>
        </View>

        {/* Fila inferior: comprobante + total */}
        <View className="flex-row items-center justify-between">
          {comprobante ? (
            <View className="flex-row items-center gap-2">
              <StatusBadge status={comprobante.estado} label={comprobante.numero_completo} />
            </View>
          ) : (
            <View className="flex-row items-center gap-1">
              <Ionicons name="document-outline" size={13} color="#9CA3AF" />
              <Text variant="caption" color="muted">Sin comprobante</Text>
            </View>
          )}
          <Text variant="label" className="text-green-600">{formatCurrency(item.total)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
