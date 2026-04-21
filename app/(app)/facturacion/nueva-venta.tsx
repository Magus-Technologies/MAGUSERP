import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVentaForm, VentaItem } from '../../../src/hooks/useVentaForm';
import { apiClient } from '../../../src/api/client';
import { Text }   from '../../../src/components/ui/Text';
import { Button } from '../../../src/components/ui/Button';
import { Card }   from '../../../src/components/ui/Card';
import { StatusModal } from '../../../src/components/ui/StatusModal';

// Componentes Compartidos (Reusable)
import { ClienteForm }     from '../../../src/components/shared/ClienteForm';
import { ProductSelector } from '../../../src/components/shared/ProductSelector';
import { VentaItemCard }   from '../../../src/components/facturacion/VentaItemCard';
import { VentaSummary }    from '../../../src/components/facturacion/VentaSummary';

interface ProductoResult { id: number; codigo: string; nombre: string; precio_venta: number; stock: number }

export default function NuevaVentaScreen() {
  const form = useVentaForm(() => {});

  React.useEffect(() => {
    form.loadSeries();
  }, []);

  const [productoQuery,   setProductoQuery]   = useState('');
  const [productoResults, setProductoResults] = useState<ProductoResult[]>([]);
  const [searchingProd,   setSearchingProd]   = useState(false);

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
    form.addItem({ 
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
          <Text variant="h4" color="white">Registrar Venta</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="p-4 gap-4">
            
            <ClienteForm 
               data={form.clienteData} 
               onChange={form.setClienteData} 
               onSearch={form.buscarCliente} 
               isSearching={form.searchingCliente} 
               error={form.clienteError} 
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
                onSelect={handleAddProducto}
              />

              {form.items.map((item: VentaItem, idx: number) => (
                <VentaItemCard 
                  key={idx}
                  item={item}
                  onUpdate={(f: keyof VentaItem, v: any) => form.updateItem(idx, f, v)}
                  onRemove={() => form.removeItem(idx)}
                />
              ))}

              {form.items.length === 0 && (
                <View className="py-8 items-center border border-dashed border-gray-200 rounded-xl">
                  <Ionicons name="cart-outline" size={32} color="#D1D5DB" />
                  <Text variant="caption" color="muted">Busca y agrega productos</Text>
                </View>
              )}
            </Card>

            <VentaSummary 
              subtotal={form.subtotal}
              igv={form.igv}
              total={form.total}
              descuentoTotal={form.descuentoTotal}
              onDescuentoChange={form.setDescuentoTotal}
              metodoPago={form.metodoPago}
              onMetodoChange={form.setMetodoPago}
              observaciones={form.observaciones}
              onObservacionesChange={form.setObservaciones}
              tipoComprobante={form.tipoComprobante}
              onTipoComprobanteChange={form.setTipoComprobante}
              series={form.series}
              serieId={form.serieId}
              onSerieChange={form.setSerieId}
            />

            {form.formError ? (
              <View className="flex-row items-center gap-2 px-2">
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text variant="caption" color="error">{form.formError}</Text>
              </View>
            ) : null}

            <Button
              onPress={async () => {
                const ok = await form.save();
                if (ok) {
                  setStatus({ visible: true, type: 'success', title: 'Venta Registrada', message: 'La venta se ha procesado correctamente.' });
                }
              }}
              disabled={form.saving}
              loading={form.saving}
              variant="primary"
              fullWidth
              className="py-4"
            >
              Registrar Venta
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
