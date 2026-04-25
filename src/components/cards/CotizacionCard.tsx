import React from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Cotizacion } from '@/src/types/facturacion.types';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';

interface CotizacionCardProps {
  item: Cotizacion;
}

export function CotizacionCard({ item }: CotizacionCardProps) {
  const handlePress = () => {
    router.push(`/(app)/facturacion/cotizacion-detalle/${item.id}` as any);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'ACEPTADA':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'RECHAZADA':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      case 'EXPIRADA':
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
      default:
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    }
  };

  const estadoNombre = item.estado_cotizacion?.nombre || 'Desconocido';
  const estadoColor = getEstadoColor(estadoNombre);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card className="mx-4 mb-3 p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text variant="subtitle2" className="font-semibold text-neutral">
              {item.codigo_cotizacion}
            </Text>
            <Text variant="caption" className="text-gray-500 mt-1">
              {new Date(item.fecha_cotizacion).toLocaleDateString('es-PE')}
            </Text>
          </View>
          <View className={`px-3 py-1.5 rounded-full border ${estadoColor.bg} ${estadoColor.border}`}>
            <Text variant="caption" className={`font-medium ${estadoColor.text}`}>
              {estadoNombre}
            </Text>
          </View>
        </View>

        <View className="border-t border-gray-100 pt-3 mb-3">
          <Text variant="caption" className="text-gray-600">
            Cliente: {item.cliente_nombre || 'N/A'}
          </Text>
          <Text variant="caption" className="text-gray-600 mt-1">
            Doc: {item.numero_documento || 'N/A'}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text variant="subtitle2" className="font-bold text-azul-oscuro">
            S/ {Number(item.total).toFixed(2) || '0.00'}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              onPress={handlePress}
              className="p-2 bg-blue-50 rounded-lg"
            >
              <Ionicons name="eye-outline" size={16} color="#458EFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                const mensaje = `Hola, me interesa la cotización ${item.codigo_cotizacion}. Total: S/ ${Number(item.total).toFixed(2)}`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
                Linking.openURL(whatsappUrl).catch(() => {
                  // Si WhatsApp no está instalado, intenta abrir en navegador
                  Linking.openURL(`https://web.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`);
                });
              }}
              className="p-2 bg-green-50 rounded-lg"
            >
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
