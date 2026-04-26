import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
  Text as NativeText, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEditarVenta, VentaItem } from '@/src/hooks/useEditarVenta';
import { apiClient } from '@/src/api/client';
import { Text }   from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { Card }   from '@/src/components/ui/Card';
import { StatusModal }  from '@/src/components/ui/StatusModal';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';

// Componentes Compartidos
import { ClienteForm }     from '@/src/components/shared/ClienteForm';
import { ProductSelector } from '@/src/components/shared/ProductSelector';
import { VentaItemCard }   from '@/src/components/facturacion/VentaItemCard';
import { VentaSummary }    from '@/src/components/facturacion/VentaSummary';

interface ProductoResult { id: number; codigo: string; nombre: string; precio_venta: number; stock: number }

export default function EditarVentaScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const ventaId = Number(id);

  const form = useEditarVenta(ventaId, () => {
    setStatus({ visible: true, type: 'success', title: 'Venta Actualizada', message: 'Los cambios se han guardado correctamente.' });
  });

  const { 
    loading, venta,
    tipoComprobante, setTipoComprobante, series, serieId, setSerieId, loadSeries,
    subtotal, igv, total, descuentoTotal, setDescuentoTotal,
    metodoPago, setMetodoPago, observaciones, setObservaciones,
    clienteData, setClienteData, buscarCliente, searchingCliente, clienteError,
    items, updateItem, removeItem, addItem, saving, formError, cargarVenta, save
  } = form;

  const [productoQuery,   setProductoQuery]   = useState('');
  const [productoResults, setProductoResults] = useState<ProductoResult[]>([]);
  const [searchingProd,   setSearchingProd]   = useState(false);

  const [status, setStatus] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: ''
  });

  useEffect(() => {
    loadSeries();
    cargarVenta();
  }, []);

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
       descuento_unitario: 0, tipo_afectacion_igv: '10', unidad_medida: 'NIU'
    });
    setProductoQuery('');
    setProductoResults([]);
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

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Editar Venta" subtitle="Facturación" onBack={() => router.push('/facturacion/ventas' as any)} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: Math.max(bottom, 16) + 24 }}>
          <View className="p-4 gap-4">
            
            {/* SECCION DE CONFIGURACION DE DOCUMENTO */}
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Text variant="label" className="mb-1 ml-1">Tipo de Comprobante</Text>
                  <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 4, borderRadius: 8, gap: 4 }}>
                    
                    <TouchableOpacity
                      onPress={() => setTipoComprobante('03')}
                      style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, backgroundColor: tipoComprobante === '03' ? '#458EFF' : 'transparent' }}
                    >
                      <NativeText style={{ fontSize: 12, color: tipoComprobante === '03' ? '#fff' : '#4b5563', fontWeight: '700' }}>
                        Boleta
                      </NativeText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setTipoComprobante('01')}
                      style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, backgroundColor: tipoComprobante === '01' ? '#458EFF' : 'transparent' }}
                    >
                      <NativeText style={{ fontSize: 12, color: tipoComprobante === '01' ? '#fff' : '#4b5563', fontWeight: '700' }}>
                        Factura
                      </NativeText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setTipoComprobante('99')}
                      style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, backgroundColor: tipoComprobante === '99' ? '#458EFF' : 'transparent' }}
                    >
                      <NativeText style={{ fontSize: 12, color: tipoComprobante === '99' ? '#fff' : '#4b5563', fontWeight: '700' }}>
                        Nota
                      </NativeText>
                    </TouchableOpacity>

                  </View>
                </View>

                {tipoComprobante !== '99' && (
                  <View className="flex-1">
                    <Text variant="label" className="mb-1 ml-1">Serie</Text>
                    <View style={{ backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4, height: 40, justifyContent: 'center' }}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {series
                          .filter((s: any) => s.tipo_comprobante === tipoComprobante)
                          .map((s: any) => (
                            <TouchableOpacity
                              key={s.id}
                              onPress={() => setSerieId(s.id)}
                              style={{ 
                                paddingHorizontal: 12, 
                                paddingVertical: 4, 
                                marginRight: 8, 
                                borderRadius: 6, 
                                backgroundColor: serieId === s.id ? '#2563eb' : '#e5e7eb' 
                              }}
                            >
                              <NativeText style={{ fontSize: 12, color: serieId === s.id ? '#fff' : '#374151', fontWeight: '700' }}>
                                {s.serie}
                              </NativeText>
                            </TouchableOpacity>
                          ))
                        }
                      </ScrollView>
                    </View>
                  </View>
                )}
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

              {items.map((item: VentaItem, idx: number) => (
                <VentaItemCard 
                  key={idx}
                  item={item}
                  onUpdate={(f: keyof VentaItem, v: any) => updateItem(idx, f, v)}
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
              onPress={save}
              disabled={saving}
              loading={saving}
              variant="primary"
              fullWidth
              className="py-4"
            >
              Guardar Cambios
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
