import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../utils/formatters';

export interface ProductSummary { id: number; codigo: string; nombre: string; precio_venta: number; stock: number }

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  isSearching: boolean;
  results: ProductSummary[];
  onSelect: (p: ProductSummary) => void;
}

export function ProductSelector({ query, onQueryChange, isSearching, results, onSelect }: Props) {
  return (
    <View className="gap-3">
      <Input
        label="Buscar producto"
        value={query}
        onChangeText={onQueryChange}
        placeholder="Nombre o código..."
        leftIcon="search-outline"
      />

      {isSearching && <ActivityIndicator className="py-2" color="#458EFF" />}

      {results.length > 0 && (
        <View className="border border-gray-100 rounded-xl overflow-hidden mb-3">
          {results.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => onSelect(p)}
              className={`flex-row items-center px-3 py-2.5 bg-white ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <View className="flex-1">
                <Text variant="bodySmall" numberOfLines={1}>{p.nombre}</Text>
                <View className="flex-row items-center gap-2">
                  <Text variant="caption" color="muted">{p.codigo}</Text>
                  <Text variant="caption" className={p.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    Stock: {p.stock}
                  </Text>
                </View>
              </View>
              <Text variant="label" className="text-primary-600">{formatCurrency(p.precio_venta)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
