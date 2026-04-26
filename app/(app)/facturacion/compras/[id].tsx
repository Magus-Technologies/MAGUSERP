import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { facturacionService } from '@/src/services/facturacion.service';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';

export default function CompraDetalleScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id } = useLocalSearchParams();
  const [compra, setCompra] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  useEffect(() => {
    cargarCompra();
  }, [id]);

  const cargarCompra = async () => {
    try {
      setLoading(true);
      const res = await facturacionService.getCompra(Number(id));
      setCompra(res.compra || res.data);
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cargar la compra');
    } finally {
      setLoading(false);
    }
  };

  const cancelarCompra = async () => {
    if (!motivoCancelacion.trim()) {
      Alert.alert('Error', 'Ingresa el motivo de cancelación');
      return;
    }

    setProcesando(true);
    try {
      await facturacionService.cancelarCompra(Number(id), { motivo: motivoCancelacion });
      Alert.alert('Éxito', 'Compra cancelada correctamente');
      setMostrarModalCancelar(false);
      setMotivoCancelacion('');
      cargarCompra();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al cancelar la compra');
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#458EFF" />
      </View>
    );
  }

  if (!compra) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Compra no encontrada</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={compra.codigo_compra} subtitle="Detalle de Compra" onMenu={() => navigation.openDrawer()} />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Estado */}
        <Card className="mb-4 p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text variant="subtitle2" className="font-semibold">Estado Actual</Text>
            <Badge label={compra.estadoCompra?.nombre || 'Desconocido'} />
          </View>
          <Text variant="caption" className="text-gray-500">
            Fecha: {new Date(compra.fecha_compra).toLocaleDateString('es-PE')}
          </Text>
        </Card>

        {/* Información del Cliente */}
        <Card className="mb-4 p-4">
          <Text variant="subtitle2" className="font-semibold mb-3">Información del Cliente</Text>
          <View className="mb-2">
            <Text variant="caption" className="text-gray-500">Nombre</Text>
            <Text variant="body2" className="font-medium">{compra.cliente_nombre}</Text>
          </View>
          <View className="mb-2">
            <Text variant="caption" className="text-gray-500">Email</Text>
            <Text variant="body2" className="font-medium">{compra.cliente_email}</Text>
          </View>
          <View className="mb-2">
            <Text variant="caption" className="text-gray-500">Teléfono</Text>
            <Text variant="body2" className="font-medium">{compra.telefono_contacto}</Text>
          </View>
          <View>
            <Text variant="caption" className="text-gray-500">Dirección</Text>
            <Text variant="body2" className="font-medium">{compra.direccion_envio}</Text>
          </View>
        </Card>

        {/* Detalles de Envío */}
        <Card className="mb-4 p-4">
          <Text variant="subtitle2" className="font-semibold mb-3">Detalles de Envío</Text>
          <View className="mb-2">
            <Text variant="caption" className="text-gray-500">Forma de Envío</Text>
            <Text variant="body2" className="font-medium capitalize">{compra.forma_envio?.replace('_', ' ')}</Text>
          </View>
          <View className="mb-2">
            <Text variant="caption" className="text-gray-500">Método de Pago</Text>
            <Text variant="body2" className="font-medium">{compra.metodo_pago}</Text>
          </View>
          <View>
            <Text variant="caption" className="text-gray-500">Costo de Envío</Text>
            <Text variant="body2" className="font-medium">S/ {compra.costo_envio?.toFixed(2) || '0.00'}</Text>
          </View>
        </Card>

        {/* Productos */}
        <Card className="mb-4 p-4">
          <Text variant="subtitle2" className="font-semibold mb-3">Productos ({compra.detalles?.length || 0})</Text>
          {compra.detalles?.map((detalle: any, idx: number) => (
            <View key={idx} className="mb-3 pb-3 border-b border-gray-100">
              <View className="flex-row justify-between mb-1">
                <Text variant="body2" className="font-medium flex-1">{detalle.nombre_producto}</Text>
                <Text variant="body2" className="font-semibold">S/ {detalle.subtotal_linea?.toFixed(2)}</Text>
              </View>
              <Text variant="caption" className="text-gray-500">
                {detalle.cantidad} x S/ {detalle.precio_unitario?.toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Resumen de Totales */}
        <Card className="mb-4 p-4 bg-azul-oscuro/5">
          <View className="mb-2 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between">
              <Text variant="body2" className="text-gray-600">Subtotal</Text>
              <Text variant="body2" className="font-medium">S/ {compra.subtotal?.toFixed(2)}</Text>
            </View>
          </View>
          <View className="mb-2 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between">
              <Text variant="body2" className="text-gray-600">IGV (18%)</Text>
              <Text variant="body2" className="font-medium">S/ {compra.igv?.toFixed(2)}</Text>
            </View>
          </View>
          <View className="mb-3 pb-3 border-b border-gray-200">
            <View className="flex-row justify-between">
              <Text variant="body2" className="text-gray-600">Costo de Envío</Text>
              <Text variant="body2" className="font-medium">S/ {compra.costo_envio?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            <Text variant="subtitle2" className="font-bold">Total</Text>
            <Text variant="subtitle2" className="font-bold text-azul-oscuro">S/ {compra.total?.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Botones de Acción */}
        {compra.puede_cancelarse && (
          <TouchableOpacity
            onPress={() => setMostrarModalCancelar(true)}
            disabled={procesando}
            className="bg-red-600 rounded-lg p-4 mb-4"
          >
            {procesando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text variant="subtitle2" className="text-white text-center font-semibold">
                Cancelar Compra
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-300 rounded-lg p-4 mb-8"
        >
          <Text variant="subtitle2" className="text-gray-700 text-center font-semibold">
            Volver
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Cancelar Compra */}
      <Modal
        visible={mostrarModalCancelar}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalCancelar(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text variant="h5" className="font-bold">Cancelar Compra</Text>
              <TouchableOpacity onPress={() => setMostrarModalCancelar(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text variant="body2" className="text-gray-600 mb-4">
              Ingresa el motivo de cancelación:
            </Text>

            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4 h-24"
              placeholder="Motivo de cancelación..."
              value={motivoCancelacion}
              onChangeText={setMotivoCancelacion}
              multiline
              textAlignVertical="top"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setMostrarModalCancelar(false)}
                className="flex-1 bg-gray-200 rounded-lg p-3"
              >
                <Text variant="subtitle2" className="text-gray-700 text-center font-semibold">
                  Cerrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={cancelarCompra}
                disabled={procesando}
                className="flex-1 bg-red-600 rounded-lg p-3"
              >
                {procesando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text variant="subtitle2" className="text-white text-center font-semibold">
                    Cancelar Compra
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
