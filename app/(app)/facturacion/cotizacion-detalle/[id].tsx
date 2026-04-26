import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../../../src/api/client';
import { Text }   from '../../../../src/components/ui/Text';
import { Button } from '../../../../src/components/ui/Button';
import { Card }   from '../../../../src/components/ui/Card';
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner';
import { StatusModal }    from '../../../../src/components/ui/StatusModal';
import { ScreenHeader }  from '../../../../src/components/ui/ScreenHeader';

interface CotizacionDetalle {
  id: number;
  codigo_cotizacion: string;
  cliente_nombre: string;
  cliente_email: string;
  telefono_contacto: string;
  numero_documento: string;
  direccion_envio: string;
  forma_envio: string;
  costo_envio: number;
  subtotal: number;
  igv: number;
  descuento_total: number;
  total: number;
  metodo_pago_preferido: string;
  observaciones: string;
  estado_cotizacion: { id: number; nombre: string; color: string };
  detalles: Array<{
    id: number;
    producto_id: number;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal_linea: number;
  }>;
}

export default function CotizacionDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [cotizacion, setCotizacion] = useState<CotizacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: ''
  });

  useEffect(() => {
    loadCotizacion();
  }, [id]);

  const loadCotizacion = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await apiClient.get(`/cotizaciones/${id}`);
      if (response?.cotizacion) {
        setCotizacion(response.cotizacion);
      } else if (response?.data) {
        setCotizacion(response.data);
      } else {
        setError('No se encontró la cotización');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la cotización');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando cotización..." />;

  if (!cotizacion) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Cotización" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text variant="h4" className="mt-4 text-center">{error || 'No se encontró la cotización'}</Text>
          <Button onPress={() => router.back()} variant="primary" className="mt-6">
            Volver
          </Button>
        </View>
      </View>
    );
  }

  const getEstadoColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'EN REVISIÓN':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
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

  const estadoColor = getEstadoColor(cotizacion.estado_cotizacion?.nombre || '');

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title={cotizacion.codigo_cotizacion}
        subtitle="Facturación"
        onBack={() => router.push('/(app)/facturacion/cotizaciones' as any)}
        right={
          <TouchableOpacity
            onPress={() => router.push(`/(app)/facturacion/editar-cotizacion/${id}` as any)}
            className="p-2 bg-white/20 rounded-lg ml-3"
          >
            <Ionicons name="pencil-outline" size={20} color="#fff" />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4 gap-4">
            
            {/* Estado */}
            <Card className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text variant="label">Estado</Text>
                <View className={`px-3 py-1.5 rounded-full border ${estadoColor.bg} ${estadoColor.border}`}>
                  <Text variant="caption" className={`font-medium ${estadoColor.text}`}>
                    {cotizacion.estado_cotizacion?.nombre || 'Desconocido'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Información del Cliente */}
            <Card className="p-4 gap-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="person-outline" size={18} color="#458EFF" />
                <Text variant="label">Información del Cliente</Text>
              </View>
              
              <View className="gap-2">
                <View>
                  <Text variant="caption" className="text-gray-600">Nombre</Text>
                  <Text variant="h4" className="font-semibold">{cotizacion.cliente_nombre}</Text>
                </View>
                
                <View>
                  <Text variant="caption" className="text-gray-600">Email</Text>
                  <Text variant="h4" className="font-semibold">{cotizacion.cliente_email}</Text>
                </View>
                
                <View>
                  <Text variant="caption" className="text-gray-600">Teléfono</Text>
                  <Text variant="h4" className="font-semibold">{cotizacion.telefono_contacto}</Text>
                </View>

                {cotizacion.numero_documento && (
                  <View>
                    <Text variant="caption" className="text-gray-600">Documento</Text>
                    <Text variant="h4" className="font-semibold">{cotizacion.numero_documento}</Text>
                  </View>
                )}
              </View>
            </Card>

            {/* Dirección de Envío */}
            <Card className="p-4 gap-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="location-outline" size={18} color="#458EFF" />
                <Text variant="label">Dirección de Envío</Text>
              </View>
              
              <View className="gap-2">
                <View>
                  <Text variant="caption" className="text-gray-600">Dirección</Text>
                  <Text variant="h4" className="font-semibold">{cotizacion.direccion_envio}</Text>
                </View>
                
                <View>
                  <Text variant="caption" className="text-gray-600">Forma de Envío</Text>
                  <Text variant="h4" className="font-semibold">{cotizacion.forma_envio}</Text>
                </View>

                {cotizacion.costo_envio > 0 && (
                  <View>
                    <Text variant="caption" className="text-gray-600">Costo de Envío</Text>
                    <Text variant="h4" className="font-semibold">S/ {Number(cotizacion.costo_envio).toFixed(2)}</Text>
                  </View>
                )}
              </View>
            </Card>

            {/* Productos */}
            <Card className="p-4 gap-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="cube-outline" size={18} color="#458EFF" />
                <Text variant="label">Productos ({cotizacion.detalles.length})</Text>
              </View>
              
              {cotizacion.detalles.map((detalle, idx) => (
                <View key={idx} className="border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
                  <View className="flex-row justify-between mb-1">
                    <Text variant="h4" className="font-semibold flex-1">{detalle.nombre_producto}</Text>
                    <Text variant="h4" className="font-bold text-azul-oscuro">S/ {Number(detalle.subtotal_linea).toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text variant="caption" className="text-gray-600">
                      {detalle.cantidad} x S/ {Number(detalle.precio_unitario).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>

            {/* Resumen de Totales */}
            <Card className="p-4 gap-3 bg-blue-50">
              <View className="flex-row justify-between mb-2">
                <Text variant="label" className="text-gray-700">Subtotal</Text>
                <Text variant="label" className="font-semibold">S/ {Number(cotizacion.subtotal).toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text variant="label" className="text-gray-700">IGV (18%)</Text>
                <Text variant="label" className="font-semibold">S/ {Number(cotizacion.igv).toFixed(2)}</Text>
              </View>

              {cotizacion.descuento_total > 0 && (
                <View className="flex-row justify-between mb-2">
                  <Text variant="label" className="text-gray-700">Descuento</Text>
                  <Text variant="label" className="font-semibold text-red-600">-S/ {Number(cotizacion.descuento_total).toFixed(2)}</Text>
                </View>
              )}

              <View className="border-t border-blue-200 pt-3 flex-row justify-between">
                <Text variant="h4" className="font-bold">Total</Text>
                <Text variant="h4" className="font-bold text-azul-oscuro">S/ {Number(cotizacion.total).toFixed(2)}</Text>
              </View>
            </Card>

            {/* Método de Pago */}
            <Card className="p-4">
              <Text variant="label" className="mb-2">Método de Pago</Text>
              <Text variant="h4" className="font-semibold">{cotizacion.metodo_pago_preferido || 'No especificado'}</Text>
            </Card>

            {/* Observaciones */}
            {cotizacion.observaciones && (
              <Card className="p-4">
                <Text variant="label" className="mb-2">Observaciones</Text>
                <Text variant="h4">{cotizacion.observaciones}</Text>
              </Card>
            )}

            {/* Botones de Acción */}
            <View className="gap-3 pb-4">
              <Button
                onPress={() => router.push(`/(app)/facturacion/editar-cotizacion/${id}` as any)}
                variant="primary"
                fullWidth
                className="py-4"
              >
                Editar Cotización
              </Button>
              
              <Button
                onPress={() => router.back()}
                variant="secondary"
                fullWidth
                className="py-4"
              >
                Volver
              </Button>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusModal
        visible={status.visible}
        type={status.type}
        title={status.title}
        message={status.message}
        onClose={() => setStatus(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
