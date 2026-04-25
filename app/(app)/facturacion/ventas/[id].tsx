import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { facturacionService } from '@/src/services/facturacion.service';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { formatCurrency, formatDate } from '@/src/utils/formatters';

export default function VentaDetalleScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id } = useLocalSearchParams();
  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarVenta();
  }, [id]);

  const cargarVenta = async () => {
    try {
      setLoading(true);
      const res = await facturacionService.getVenta(Number(id));
      setVenta(res.venta || res.data);
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cargar la venta');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#458EFF" />
      </View>
    );
  }

  if (!venta) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Venta no encontrada</Text>
      </View>
    );
  }

  const comprobante = venta.comprobante_info;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-azul-oscuro px-4 pt-14 pb-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.push('/facturacion/ventas' as any)} className="mr-3">
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="caption" className="text-white/60">Detalle de Venta</Text>
          <Text variant="h4" color="white">{venta.codigo_venta}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Estado */}
        <Card className="mb-4 p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text variant="label" className="font-semibold">Estado Actual</Text>
            <Badge label={venta.estado} />
          </View>
          <Text variant="caption" className="text-gray-500">
            Fecha: {formatDate(venta.fecha_venta)}
          </Text>
        </Card>

        {/* Información del Cliente */}
        <Card className="mb-4 p-4">
          <Text variant="label" className="font-semibold mb-3">Información del Cliente</Text>
          <View className="mb-2">
            <Text variant="caption" className="text-gray-500">Nombre</Text>
            <Text variant="body" className="font-medium">{venta.cliente_info?.nombre_completo}</Text>
          </View>
          <View className="mb-2">
            <Text variant="caption" className="text-gray-500">Documento</Text>
            <Text variant="body" className="font-medium">{venta.cliente_info?.numero_documento}</Text>
          </View>
          <View className="mb-2">
            <Text variant="caption" className="text-gray-500">Email</Text>
            <Text variant="body" className="font-medium">{venta.cliente_info?.email}</Text>
          </View>
          <View>
            <Text variant="caption" className="text-gray-500">Teléfono</Text>
            <Text variant="body" className="font-medium">{venta.cliente_info?.telefono}</Text>
          </View>
        </Card>

        {/* Información del Comprobante */}
        {comprobante && (
          <Card className="mb-4 p-4 border border-blue-200">
            <Text variant="label" className="font-semibold mb-3">Información del Comprobante</Text>
            <View className="mb-2">
              <Text variant="caption" className="text-gray-500">Número</Text>
              <Text variant="body" className="font-medium">{comprobante.numero_completo}</Text>
            </View>
            <View className="mb-2">
              <Text variant="caption" className="text-gray-500">Tipo</Text>
              <Text variant="body" className="font-medium capitalize">{comprobante.tipo_comprobante}</Text>
            </View>
            <View className="mb-2">
              <Text variant="caption" className="text-gray-500">Estado SUNAT</Text>
              <Badge label={comprobante.estado} />
            </View>
            {comprobante.fecha_emision && (
              <View>
                <Text variant="caption" className="text-gray-500">Fecha de Emisión</Text>
                <Text variant="body" className="font-medium">{formatDate(comprobante.fecha_emision)}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Productos */}
        <Card className="mb-4 p-4">
          <Text variant="label" className="font-semibold mb-3">Productos ({venta.detalles?.length || 0})</Text>
          {venta.detalles?.map((detalle: any, idx: number) => (
            <View key={idx} className="mb-3 pb-3 border-b border-gray-100">
              <View className="flex-row justify-between mb-1">
                <Text variant="body" className="font-medium flex-1">{detalle.nombre_producto}</Text>
                <Text variant="body" className="font-semibold">{formatCurrency(detalle.subtotal_linea)}</Text>
              </View>
              <Text variant="caption" className="text-gray-500">
                {detalle.cantidad} x {formatCurrency(detalle.precio_unitario)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Resumen de Totales */}
        <Card className="mb-4 p-4 bg-azul-oscuro/5">
          <View className="mb-2 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between">
              <Text variant="body" className="text-gray-600">Subtotal</Text>
              <Text variant="body" className="font-medium">{formatCurrency(venta.subtotal)}</Text>
            </View>
          </View>
          <View className="mb-2 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between">
              <Text variant="body" className="text-gray-600">IGV (18%)</Text>
              <Text variant="body" className="font-medium">{formatCurrency(venta.igv)}</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            <Text variant="label" className="font-bold">Total</Text>
            <Text variant="label" className="font-bold text-green-600">{formatCurrency(venta.total)}</Text>
          </View>
        </Card>

        {/* Botón Volver */}
        <TouchableOpacity
          onPress={() => router.push('/facturacion/ventas' as any)}
          className="bg-gray-300 rounded-lg p-4 mb-8"
        >
          <Text variant="label" className="text-gray-700 text-center font-semibold">
            Volver
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
