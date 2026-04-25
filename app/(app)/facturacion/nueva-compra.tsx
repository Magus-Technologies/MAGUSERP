import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
  Text as NativeText
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCompraForm, CompraItem } from '../../../src/hooks/useCompraForm';
import { apiClient } from '../../../src/api/client';
import { Text } from '../../../src/components/ui/Text';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { StatusModal } from '../../../src/components/ui/StatusModal';

// Componentes Compartidos (Reusable)
import { ClienteForm } from '../../../src/components/shared/ClienteForm';
import { ProductSelector } from '../../../src/components/shared/ProductSelector';
import { VentaItemCard } from '../../../src/components/facturacion/VentaItemCard';
import { VentaSummary } from '../../../src/components/facturacion/VentaSummary';

interface ProductoResult { id: number; codigo: string; nombre: string; precio_venta: number; stock: number }

export default function NuevaCompraScreen() {
  const router = useRouter();
  const form = useCompraForm(() => {});
  const {
    clienteData, setClienteData, buscarCliente, searchingCliente, clienteError,
    items, updateItem, removeItem, addItem, saving, formError, save,
    metodoPago, setMetodoPago, formaEnvio, setFormaEnvio,
    observaciones, setObservaciones, descuentoTotal, setDescuentoTotal,
    subtotal, igv, total
  } = form;

  const [productoQuery, setProductoQuery] = useState('');
  const [productoResults, setProductoResults] = useState<ProductoResult[]>([]);
  const [searchingProd, setSearchingProd] = useState(false);

  const [status, setStatus] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: ''
  });

  const handleSearchProducto = async (q: string) => {
    setProductoQuery(q);
    if (q.length < 2) { setProductoResults([]); return; }
    setSearchingProd(true);
    try {
      const res: any = await apiClient.get(`/productos/listar?search=${encodeURIComponent(q)}&page=1`);
      setProductoResults((Array.isArray(res?.data) ? res.data : []).slice(0, 10).map((p: any) => ({
        id: p.id, codigo: p.codigo_producto ?? '', nombre: p.nombre, precio_venta: p.precio_venta ?? 0, stock: p.stock ?? 0,
      })));
    } catch { setProductoResults([]); }
    finally { setSearchingProd(false); }
  };

  const handleAddProducto = (p: ProductoResult) => {
    addItem({
      producto_id: p.id, nombre: p.nombre, codigo: p.codigo, cantidad: 1, precio_unitario: p.precio_venta,
      tipo_afectacion_igv: '10', unidad_medida: 'NIU'
    });
    setProductoQuery('');
    setProductoResults([]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-azul-oscuro px-4 pt-14 pb-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="caption" className="text-white/60">Facturación</Text>
          <Text variant="h4" color="white">Registrar Compra</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="p-4 gap-4">

            {/* SECCION DE CONFIGURACION DE COMPRA */}
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <View className="gap-3">
                <View>
                  <Text variant="label" className="mb-1 ml-1">Método de Pago</Text>
                  <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 4, borderRadius: 8, gap: 4 }}>
                    {['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].map(metodo => (
                      <TouchableOpacity
                        key={metodo}
                        onPress={() => setMetodoPago(metodo)}
                        style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, backgroundColor: metodoPago === metodo ? '#458EFF' : 'transparent' }}
                      >
                        <NativeText style={{ fontSize: 12, color: metodoPago === metodo ? '#fff' : '#4b5563', fontWeight: '700' }}>
                          {metodo}
                        </NativeText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text variant="label" className="mb-1 ml-1">Forma de Envío</Text>
                  <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 4, borderRadius: 8, gap: 4 }}>
                    {['RECOJO', 'DELIVERY'].map(forma => (
                      <TouchableOpacity
                        key={forma}
                        onPress={() => setFormaEnvio(forma)}
                        style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, backgroundColor: formaEnvio === forma ? '#458EFF' : 'transparent' }}
                      >
                        <NativeText style={{ fontSize: 12, color: formaEnvio === forma ? '#fff' : '#4b5563', fontWeight: '700' }}>
                          {forma}
                        </NativeText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <ClienteForm
              data={clienteData}
              onChange={setClienteData}
              onSearch={buscarCliente}
              isSearching={searchingCliente}
              error={clienteError}
            />

            <Card className="p-4 gap-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="cube-outline" size={18} color="#458EFF" />
                <Text variant="label">Productos / Servicios</Text>
              </View>

              <ProductSelector
                query={productoQuery}
                onQueryChange={handleSearchProducto}
                isSearching={searchingProd}
                results={productoResults}
                onSelect={(p) => {
                  const exists = items.find(i => i.producto_id === p.id);
                  if (exists) {
                    const idx = items.findIndex(i => i.producto_id === p.id);
                    removeItem(idx);
                  } else {
                    handleAddProducto(p);
                  }
                }}
                selectedIds={items.map(i => i.producto_id)}
              />

              {items.map((item: CompraItem, idx: number) => (
                <VentaItemCard
                  key={idx}
                  item={item}
                  onUpdate={(f: keyof CompraItem, v: any) => updateItem(idx, f, v)}
                  onRemove={() => removeItem(idx)}
                />
              ))}

              {items.length === 0 && (
                <View className="py-8 items-center border border-dashed border-gray-200 rounded-xl">
                  <Ionicons name="cart-outline" size={32} color="#D1D5DB" />
                  <Text variant="caption" color="muted">Busca y agrega productos</Text>
                </View>
              )}
            </Card>

            <VentaSummary
              subtotal={subtotal}
              igv={igv}
              total={total}
              descuentoTotal={descuentoTotal}
              onDescuentoChange={setDescuentoTotal}
              metodoPago={metodoPago}
              onMetodoChange={setMetodoPago}
              observaciones={observaciones}
              onObservacionesChange={setObservaciones}
            />

            {formError ? (
              <View className="flex-row items-center gap-2 px-2">
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text variant="caption" color="error">{formError}</Text>
              </View>
            ) : null}

            <Button
              onPress={async () => {
                const ok = await save();
                if (ok) {
                  setStatus({ visible: true, type: 'success', title: 'Compra Registrada', message: 'La compra se ha procesado correctamente.' });
                }
              }}
              disabled={saving}
              loading={saving}
              variant="primary"
              fullWidth
              className="py-4"
            >
              Registrar Compra
            </Button>

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
