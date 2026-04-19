import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card }           from '../ui/Card';
import { Badge }          from '../ui/Badge';
import { Text }           from '../ui/Text';
import { Producto }       from '../../types/almacen.types';
import { formatCurrency } from '../../utils/formatters';

function stockBadge(p: Producto) {
  if (p.stock === 0)             return <Badge label="Sin stock" variant="error" />;
  if (p.stock <= p.stock_minimo) return <Badge label="Crítico"   variant="warning" />;
  return                                <Badge label="OK"         variant="success" />;
}

interface Props {
  item:     Producto;
  onEdit:   (p: Producto) => void;
  onDelete: (p: Producto) => void;
}

export function ProductoCard({ item, onEdit, onDelete }: Props) {
  return (
    <Card className="flex-1 m-1.5 overflow-hidden">
      {/* Imagen */}
      <View className="w-full aspect-square bg-gray-100">
        {(item.imagen_url ?? item.imagen_principal) ? (
          <Image
            source={{ uri: (item.imagen_url ?? item.imagen_principal)! }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="cube-outline" size={36} color="#9ca3af" />
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-3">
        <Text variant="label" numberOfLines={2} className="mb-1">{item.nombre}</Text>

        <Text variant="caption" color="muted" numberOfLines={1}>
          {item.categoria?.nombre ?? '—'}
          {item.marca ? ` · ${item.marca.nombre}` : ''}
        </Text>

        <View className="flex-row items-center justify-between mt-2">
          <Text variant="caption" className="text-primary-500 font-semibold">
            {formatCurrency(item.precio_venta ?? item.precio)}
          </Text>
          <Text variant="caption" color="muted">Stock: {item.stock}</Text>
        </View>

        <View className="mt-2">{stockBadge(item)}</View>
      </View>

      {/* Acciones */}
      <View className="flex-row border-t border-gray-100">
        <TouchableOpacity
          onPress={() => onEdit(item)}
          className="flex-1 py-2.5 items-center justify-center"
        >
          <Ionicons name="pencil-outline" size={16} color="#458EFF" />
        </TouchableOpacity>
        <View className="w-px bg-gray-100" />
        <TouchableOpacity
          onPress={() => onDelete(item)}
          className="flex-1 py-2.5 items-center justify-center"
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Card>
  );
}
