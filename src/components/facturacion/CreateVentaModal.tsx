import React, { useState } from 'react';
import {
  Modal, View, ScrollView, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVentaForm, VentaItem } from '../../hooks/useVentaForm';
import { apiClient } from '../../api/client';
import { formatCurrency } from '../../utils/formatters';
import { Text }   from '../ui/Text';
import { Input }  from '../ui/Input';
import { Button } from '../ui/Button';
import { Card }   from '../ui/Card';

interface Props {
  visible:   boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

const TIPO_DOC = [
  { key: '1', label: 'DNI'      },
  { key: '6', label: 'RUC'      },
  { key: '4', label: 'CE'       },
  { key: '7', label: 'Pasaporte'},
];

const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE', 'PLIN'];

interface ProductoResult { id: number; codigo: string; nombre: string; precio_venta: number }

export function CreateVentaModal({ visible, onClose, onSuccess }: Props) {
  const form = useVentaForm(onSuccess);

  const [productoQuery,   setProductoQuery]   = useState('');
  const [productoResults, setProductoResults] = useState<ProductoResult[]>([]);
  const [searchingProd,   setSearchingProd]   = useState(false);
  const [cantidades,      setCantidades]      = useState<Record<number, string>>({});

  const handleClose = () => { form.reset(); setProductoQuery(''); setProductoResults([]); onClose(); };

  const searchProducto = async (q: string) => {
    setProductoQuery(q);
    if (q.length < 2) { setProductoResults([]); return; }
    setSearchingProd(true);
    try {
      const res: any = await apiClient.get(
        `/productos/listar?search=${encodeURIComponent(q)}&page=1`
      );
      const list = Array.isArray(res?.data) ? res.data : [];
      setProductoResults(list.slice(0, 10).map((p: any) => ({
        id:          p.id,
        codigo:      p.codigo_producto ?? '',
        nombre:      p.nombre,
        precio_venta: p.precio_venta ?? 0,
      })));
    } catch { setProductoResults([]); }
    finally { setSearchingProd(false); }
  };

  const addProducto = (p: ProductoResult) => {
    const cant = parseFloat(cantidades[p.id] ?? '1') || 1;
    form.addItem({ producto_id: p.id, nombre: p.nombre, codigo: p.codigo, cantidad: cant, precio_unitario: p.precio_venta });
    setProductoQuery('');
    setProductoResults([]);
    setCantidades(prev => ({ ...prev, [p.id]: '1' }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 bg-gray-50">

          {/* Header */}
          <View className="bg-azul-oscuro px-4 pt-14 pb-4 flex-row items-center">
            <TouchableOpacity onPress={handleClose} className="mr-3">
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text variant="caption" className="text-white/60">Facturación</Text>
              <Text variant="h4" color="white">Nueva Venta</Text>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View className="px-4 py-4 gap-4">

              {/* ── CLIENTE ── */}
              <Card className="p-4">
                <Text variant="label" className="mb-3">Cliente</Text>

                {/* Tipo documento */}
                <View className="flex-row gap-2 mb-3">
                  {TIPO_DOC.map(t => (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => form.setClienteData(prev => ({ ...prev, tipo_documento: t.key }))}
                      className={`px-3 py-1.5 rounded-full border ${form.clienteData.tipo_documento === t.key ? 'bg-azul-oscuro border-azul-oscuro' : 'bg-white border-gray-200'}`}
                    >
                      <Text variant="caption" className={form.clienteData.tipo_documento === t.key ? 'text-white' : 'text-gray-600'}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Nro documento + buscar */}
                <View className="flex-row items-end gap-2 mb-2">
                  <View className="flex-1">
                    <Input
                      label="N° Documento"
                      value={form.clienteData.numero_documento}
                      onChangeText={v => form.setClienteData(prev => ({ ...prev, numero_documento: v }))}
                      placeholder="Ej: 12345678"
                      keyboardType="numeric"
                      leftIcon="card-outline"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={form.buscarCliente}
                    disabled={form.searchingCliente}
                    className="bg-primary-500 px-4 py-3.5 rounded-xl items-center justify-center mb-1"
                  >
                    {form.searchingCliente
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Ionicons name="search" size={20} color="#fff" />
                    }
                  </TouchableOpacity>
                </View>

                {form.clienteError ? (
                  <Text variant="caption" color="muted" className="mb-2">{form.clienteError}</Text>
                ) : null}

                {form.clienteId && (
                  <View className="flex-row items-center gap-1 mb-2">
                    <Ionicons name="checkmark-circle" size={14} color="#2ABC79" />
                    <Text variant="caption" className="text-green-600">Cliente encontrado en el sistema</Text>
                  </View>
                )}

                <Input
                  label="Razón Social / Nombre"
                  value={form.clienteData.razon_social}
                  onChangeText={v => form.setClienteData(prev => ({ ...prev, razon_social: v }))}
                  placeholder="Nombre del cliente"
                  leftIcon="person-outline"
                />
              </Card>

              {/* ── PRODUCTOS ── */}
              <Card className="p-4">
                <Text variant="label" className="mb-3">Productos</Text>

                <Input
                  label="Buscar producto"
                  value={productoQuery}
                  onChangeText={searchProducto}
                  placeholder="Nombre o código..."
                  leftIcon="search-outline"
                  rightIcon={searchingProd ? undefined : undefined}
                />

                {searchingProd && (
                  <View className="py-2 items-center">
                    <ActivityIndicator size="small" color="#458EFF" />
                  </View>
                )}

                {productoResults.length > 0 && (
                  <View className="border border-gray-100 rounded-xl overflow-hidden mt-1 mb-3">
                    {productoResults.map((p, i) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => addProducto(p)}
                        className={`flex-row items-center px-3 py-2.5 bg-white ${i > 0 ? 'border-t border-gray-50' : ''}`}
                      >
                        <View className="flex-1">
                          <Text variant="bodySmall">{p.nombre}</Text>
                          <Text variant="caption" color="muted">{p.codigo}</Text>
                        </View>
                        <Text variant="label" className="text-primary-600">{formatCurrency(p.precio_venta)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Items agregados */}
                {form.items.map((item, idx) => (
                  <View key={idx} className="flex-row items-center gap-2 py-2 border-t border-gray-50">
                    <View className="flex-1">
                      <Text variant="bodySmall" numberOfLines={1}>{item.nombre}</Text>
                      <Text variant="caption" color="muted">{formatCurrency(item.precio_unitario)} c/u</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <TouchableOpacity
                        onPress={() => form.updateItem(idx, 'cantidad', Math.max(1, item.cantidad - 1))}
                        className="w-7 h-7 bg-gray-100 rounded-full items-center justify-center"
                      >
                        <Ionicons name="remove" size={14} color="#374151" />
                      </TouchableOpacity>
                      <Text variant="label" className="w-8 text-center">{item.cantidad}</Text>
                      <TouchableOpacity
                        onPress={() => form.updateItem(idx, 'cantidad', item.cantidad + 1)}
                        className="w-7 h-7 bg-gray-100 rounded-full items-center justify-center"
                      >
                        <Ionicons name="add" size={14} color="#374151" />
                      </TouchableOpacity>
                    </View>
                    <Text variant="label" className="w-20 text-right">
                      {formatCurrency(item.precio_unitario * item.cantidad)}
                    </Text>
                    <TouchableOpacity onPress={() => form.removeItem(idx)}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                {form.items.length === 0 && (
                  <Text variant="caption" color="muted" className="text-center py-3">
                    Busca y agrega productos
                  </Text>
                )}
              </Card>

              {/* ── TOTALES ── */}
              {form.items.length > 0 && (
                <Card className="p-4">
                  <View className="flex-row justify-between py-1">
                    <Text variant="bodySmall" color="muted">Subtotal</Text>
                    <Text variant="bodySmall">{formatCurrency(form.subtotal)}</Text>
                  </View>
                  <View className="flex-row justify-between py-1">
                    <Text variant="bodySmall" color="muted">IGV (18%)</Text>
                    <Text variant="bodySmall">{formatCurrency(form.igv)}</Text>
                  </View>
                  <View className="flex-row justify-between py-2 border-t border-gray-100 mt-1">
                    <Text variant="label">Total</Text>
                    <Text variant="h4" className="text-green-600">{formatCurrency(form.total)}</Text>
                  </View>
                </Card>
              )}

              {/* ── MÉTODO DE PAGO ── */}
              <Card className="p-4">
                <Text variant="label" className="mb-3">Método de Pago</Text>
                <View className="flex-row flex-wrap gap-2">
                  {METODOS_PAGO.map(m => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => form.setMetodoPago(m)}
                      className={`px-3 py-1.5 rounded-full border ${form.metodoPago === m ? 'bg-azul-oscuro border-azul-oscuro' : 'bg-white border-gray-200'}`}
                    >
                      <Text variant="caption" className={form.metodoPago === m ? 'text-white' : 'text-gray-600'}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>

              {/* ── OPCIONES ── */}
              <Card className="p-4">
                <Input
                  label="Observaciones (opcional)"
                  value={form.observaciones}
                  onChangeText={form.setObservaciones}
                  placeholder="Notas sobre la venta..."
                  leftIcon="chatbubble-outline"
                  multiline
                />
                <TouchableOpacity
                  onPress={() => form.setRequiereFactura(!form.requiereFactura)}
                  className="flex-row items-center gap-2 mt-2"
                >
                  <View className={`w-5 h-5 rounded border-2 items-center justify-center ${form.requiereFactura ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                    {form.requiereFactura && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text variant="bodySmall">Requiere factura (RUC)</Text>
                </TouchableOpacity>
              </Card>

              {/* Error */}
              {form.formError ? (
                <View className="flex-row items-center gap-2 px-1">
                  <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                  <Text variant="caption" color="error">{form.formError}</Text>
                </View>
              ) : null}

              {/* Guardar */}
              <Button
                onPress={form.save}
                disabled={form.saving}
                loading={form.saving}
                variant="primary"
                fullWidth
              >
                Registrar Venta
              </Button>

            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
