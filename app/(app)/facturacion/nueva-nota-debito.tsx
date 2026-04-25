import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
  TextInput, ActivityIndicator, Picker
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotaDebitoForm } from '../../../src/hooks/useNotaDebitoForm';
import { Text } from '../../../src/components/ui/Text';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { StatusModal } from '../../../src/components/ui/StatusModal';

export default function NuevaNotaDebitoScreen() {
  const router = useRouter();
  const form = useNotaDebitoForm(() => {});
  const {
    comprobanteReferencia, busquedaComprobante, setBusquedaComprobante,
    buscarComprobante, buscando,
    items, toggleItemSeleccion, updateItemCantidad,
    tipoNota, setTipoNota,
    motivo, setMotivo,
    descripcion, setDescripcion,
    anulacionTotal, toggleAnulacionTotal,
    calcularTotal,
    saving, formError, save,
    motivosNotaDebito, cargandoMotivos
  } = form;

  const [status, setStatus] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: ''
  });

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-azul-oscuro px-4 pt-14 pb-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="caption" className="text-white/60">Facturación</Text>
          <Text variant="h4" color="white">Nota de Débito</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="p-4 gap-4">

            {/* Info */}
            <Card className="p-4 bg-orange-50 border border-orange-200">
              <View className="flex-row gap-2">
                <Ionicons name="information-circle" size={20} color="#ea580c" />
                <Text variant="bodySmall" className="flex-1 text-orange-700">
                  Busca la factura o boleta para crear una nota de débito por cobros adicionales.
                </Text>
              </View>
            </Card>

            {/* Búsqueda de Comprobante */}
            <Card className="p-4 gap-3">
              <Text variant="label" className="mb-2">Buscar Comprobante *</Text>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ej: F001-00000001"
                  value={busquedaComprobante}
                  onChangeText={setBusquedaComprobante}
                  editable={!buscando}
                />
                <TouchableOpacity
                  onPress={buscarComprobante}
                  disabled={buscando}
                  className="bg-azul-oscuro rounded-lg px-4 justify-center"
                >
                  {buscando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Ionicons name="search" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </Card>

            {/* Comprobante Encontrado */}
            {comprobanteReferencia && (
              <Card className="p-4 bg-green-50 border border-green-200">
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text variant="label" color="success">Comprobante Encontrado</Text>
                    <Text variant="label" className="font-bold">{comprobanteReferencia.numero_completo}</Text>
                  </View>
                  <Text variant="caption" color="muted">{comprobanteReferencia.cliente_nombre}</Text>
                  <Text variant="label" className="text-green-700">Total: S/ {comprobanteReferencia.total.toFixed(2)}</Text>
                </View>
              </Card>
            )}

            {/* Tipo de Nota */}
            {comprobanteReferencia && (
              <Card className="p-4 gap-3">
                <Text variant="label" className="mb-2">Tipo de Nota de Débito *</Text>
                <View className="border border-gray-300 rounded-lg overflow-hidden">
                  {cargandoMotivos ? (
                    <View className="p-4 items-center">
                      <ActivityIndicator color="#458EFF" />
                    </View>
                  ) : (
                    <Picker
                      selectedValue={tipoNota}
                      onValueChange={setTipoNota}
                      style={{ height: 50 }}
                    >
                      {motivosNotaDebito.map((m: any) => (
                        <Picker.Item key={m.codigo} label={`${m.codigo} - ${m.descripcion}`} value={m.codigo} />
                      ))}
                    </Picker>
                  )}
                </View>
              </Card>
            )}

            {/* Motivo */}
            {comprobanteReferencia && (
              <Card className="p-4 gap-3">
                <Text variant="label" className="mb-2">Motivo del Cobro Adicional *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 h-20"
                  placeholder="Describe el motivo..."
                  value={motivo}
                  onChangeText={setMotivo}
                  multiline
                  textAlignVertical="top"
                />
              </Card>
            )}

            {/* Items */}
            {comprobanteReferencia && items.length > 0 && (
              <Card className="p-4 gap-3">
                <View className="flex-row items-center justify-between mb-3">
                  <Text variant="label">Productos/Servicios a Cobrar</Text>
                  <TouchableOpacity onPress={toggleAnulacionTotal} className="flex-row items-center gap-1">
                    <View className={`w-5 h-5 rounded border-2 items-center justify-center ${anulacionTotal ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                      {anulacionTotal && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text variant="caption">Todos</Text>
                  </TouchableOpacity>
                </View>

                {items.map((item, idx) => (
                  <View key={idx} className="bg-white border border-gray-200 rounded-lg p-3 gap-2">
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => toggleItemSeleccion(idx)}
                        className={`w-5 h-5 rounded border-2 items-center justify-center ${item.seleccionado ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}
                      >
                        {item.seleccionado && <Ionicons name="checkmark" size={14} color="white" />}
                      </TouchableOpacity>
                      <View className="flex-1">
                        <Text variant="body" className="font-medium">{item.nombre}</Text>
                        <Text variant="caption" color="muted">{item.codigo}</Text>
                      </View>
                      <Text variant="label" className="text-primary-600">S/ {item.precio_unitario.toFixed(2)}</Text>
                    </View>

                    {item.seleccionado && (
                      <View className="flex-row items-center gap-2 mt-2 pl-7">
                        <Text variant="caption" color="muted">Cantidad:</Text>
                        <TextInput
                          className="border border-gray-300 rounded px-2 py-1 w-16 text-center"
                          value={String(item.cantidad)}
                          onChangeText={(v) => updateItemCantidad(idx, parseInt(v) || 0)}
                          keyboardType="number-pad"
                        />
                        <Text variant="caption" color="muted">/ {item.cantidad_original}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </Card>
            )}

            {/* Resumen */}
            {comprobanteReferencia && items.filter(i => i.seleccionado).length > 0 && (
              <Card className="p-4 bg-gray-50">
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text variant="body" color="muted">Total a Cobrar</Text>
                    <Text variant="h4" className="font-bold text-orange-600">S/ {calcularTotal().toFixed(2)}</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Descripción */}
            {comprobanteReferencia && (
              <Card className="p-4 gap-3">
                <Text variant="label" className="mb-2">Descripción Adicional (Opcional)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 h-20"
                  placeholder="Notas adicionales..."
                  value={descripcion}
                  onChangeText={setDescripcion}
                  multiline
                  textAlignVertical="top"
                />
              </Card>
            )}

            {formError ? (
              <View className="flex-row items-center gap-2 px-2">
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text variant="caption" color="error">{formError}</Text>
              </View>
            ) : null}

            {comprobanteReferencia && (
              <Button
                onPress={async () => {
                  const ok = await save();
                  if (ok) {
                    setStatus({ visible: true, type: 'success', title: 'Nota Creada', message: 'La nota de débito se ha registrado correctamente.' });
                  }
                }}
                disabled={saving}
                loading={saving}
                variant="primary"
                fullWidth
                className="py-4"
              >
                Crear Nota de Débito
              </Button>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusModal
        visible={status.visible}
        type={status.type}
        title={status.title}
        message={status.message}
        onClose={() => {
          setStatus(prev => ({ ...prev, visible: false }));
          if (status.type === 'success') router.back();
        }}
      />
    </View>
  );
}
