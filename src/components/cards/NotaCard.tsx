import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';

interface NotaCardProps {
  item: {
    id: number;
    numero: string;
    serie: string;
    cliente?: { nombre: string };
    total: number;
    estado: string;
    fecha_emision: string;
    tipo: 'credito' | 'debito';
  };
}

const ESTADO_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  BORRADOR: { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'document-outline' },
  ENVIADO: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'send-outline' },
  ACEPTADO: { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle-outline' },
  RECHAZADO: { bg: 'bg-red-100', text: 'text-red-700', icon: 'close-circle-outline' },
};

export function NotaCard({ item }: NotaCardProps) {
  const estadoConfig = ESTADO_COLORS[item.estado] || ESTADO_COLORS.BORRADOR;
  const tipo = item.tipo === 'credito' ? 'Nota de Crédito' : 'Nota de Débito';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/facturacion/${item.tipo === 'credito' ? 'notas-credito' : 'notas-debito'}/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <Card className="mx-4 mb-3 p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text variant="subtitle2" className="font-semibold">
              {item.serie}-{String(item.numero).padStart(8, '0')}
            </Text>
            <Text variant="caption" className="text-gray-500 mt-1">
              {tipo}
            </Text>
          </View>
          <Badge
            label={item.estado}
            className={`${estadoConfig.bg} ${estadoConfig.text}`}
            icon={estadoConfig.icon}
          />
        </View>

        <View className="mb-3 pb-3 border-b border-gray-100">
          <Text variant="caption" className="text-gray-500">Cliente</Text>
          <Text variant="body2" className="font-medium mt-1">
            {item.cliente?.nombre || 'Sin cliente'}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View>
            <Text variant="caption" className="text-gray-500">Total</Text>
            <Text variant="subtitle2" className="font-bold text-azul-oscuro mt-1">
              S/ {item.total.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text variant="caption" className="text-gray-500">
              {new Date(item.fecha_emision).toLocaleDateString('es-PE')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
