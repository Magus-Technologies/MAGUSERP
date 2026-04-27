import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';

export interface NotaCardAction {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  loading?: boolean;
}

interface NotaCardProps {
  item: {
    id: number;
    numero: string;
    serie: string;
    cliente?: { razon_social?: string; nombre_comercial?: string };
    cliente_info?: { nombre_completo: string; numero_documento: string };
    total: number;
    estado: string;
    fecha_emision: string;
    tipo: 'credito' | 'debito';
    motivo?: string;
    xml?: string | null;
    pdf?: string | null;
    cdr?: string | null;
  };
  onPress?: () => void;
  actions?: NotaCardAction[];
}

const ESTADO_CONFIG: Record<string, { bg: string; text: string; iconColor: string; icon: string; label: string }> = {
  pendiente: { bg: 'bg-amber-100',  text: 'text-amber-700',  iconColor: '#b45309', icon: 'time-outline',             label: 'Pendiente' },
  generado:  { bg: 'bg-blue-100',   text: 'text-blue-700',   iconColor: '#1d4ed8', icon: 'document-text-outline',    label: 'Generado'  },
  aceptado:  { bg: 'bg-green-100',  text: 'text-green-700',  iconColor: '#15803d', icon: 'checkmark-circle-outline', label: 'Aceptado'  },
  rechazado: { bg: 'bg-red-100',    text: 'text-red-700',    iconColor: '#b91c1c', icon: 'close-circle-outline',     label: 'Rechazado' },
  anulado:   { bg: 'bg-gray-100',   text: 'text-gray-500',   iconColor: '#6b7280', icon: 'ban-outline',              label: 'Anulado'   },
};

const FALLBACK = { bg: 'bg-gray-100', text: 'text-gray-600', iconColor: '#9ca3af', icon: 'document-outline', label: 'Sin estado' };

export function NotaCard({ item, onPress, actions }: NotaCardProps) {
  const cfg = ESTADO_CONFIG[item.estado] ?? FALLBACK;
  const tipo = item.tipo === 'credito' ? 'Nota de Crédito' : 'Nota de Débito';
  const totalNum = typeof item.total === 'number' ? item.total : parseFloat(String(item.total)) || 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <Card className="mx-4 mb-3 p-4">

        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text variant="body" className="font-semibold">
              {item.serie}-{String(item.numero).padStart(8, '0')}
            </Text>
            <Text variant="caption" className="text-gray-500 mt-1">{tipo}</Text>
          </View>
          <View className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${cfg.bg}`}>
            <Ionicons name={cfg.icon as any} size={11} color={cfg.iconColor} />
            <Text variant="caption" className={cfg.text}>{cfg.label}</Text>
          </View>
        </View>

        {/* Cliente */}
        <View className="mb-3 pb-3 border-b border-gray-100">
          <Text variant="caption" className="text-gray-500">Cliente</Text>
          <Text variant="body" className="font-medium mt-1">
            {item.cliente_info?.nombre_completo || item.cliente?.razon_social || item.cliente?.nombre_comercial || 'Sin cliente'}
          </Text>
        </View>

        {/* Motivo */}
        <View className="mb-3">
          <Text variant="caption" className="text-gray-500">Motivo</Text>
          <Text variant="caption" className="text-gray-700 mt-0.5" numberOfLines={2}>
            {item.motivo || 'No especificado'}
          </Text>
        </View>

        {/* Total + fecha */}
        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
          <View>
            <Text variant="caption" className="text-gray-500">Total</Text>
            <Text variant="body" className="font-bold text-azul-oscuro mt-1">
              S/ {totalNum.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text variant="caption" className="text-gray-500">
              {new Date(item.fecha_emision).toLocaleDateString('es-PE')}
            </Text>
            {onPress && <Ionicons name="chevron-forward" size={20} color="#999" />}
          </View>
        </View>

        {/* Action buttons */}
        {actions && actions.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            {actions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={action.onPress}
                disabled={action.loading}
                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 active:bg-gray-200"
              >
                {action.loading ? (
                  <ActivityIndicator size={12} color={action.color || '#555'} />
                ) : (
                  <Ionicons name={action.icon as any} size={13} color={action.color || '#555'} />
                )}
                <Text variant="caption" style={{ color: action.color || '#555', fontSize: 11 }}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </Card>
    </TouchableOpacity>
  );
}
