import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '../../../src/api/client';
import { useSunatSearch } from '../../../src/hooks/useSunatSearch';
import { Text }   from '../../../src/components/ui/Text';
import { Button } from '../../../src/components/ui/Button';
import { Card }   from '../../../src/components/ui/Card';
import { Input }  from '../../../src/components/ui/Input';
import { DatePicker } from '../../../src/components/ui/DatePicker';
import { StatusModal }  from '../../../src/components/ui/StatusModal';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Cliente } from '../../../src/types/cliente.types';

// Componentes Compartidos
import { ProductSelector } from '../../../src/components/shared/ProductSelector';
import { VentaItemCard }   from '../../../src/components/facturacion/VentaItemCard';
import { VentaSummary }    from '../../../src/components/facturacion/VentaSummary';

interface ProductoResult { 
  id: number; 
  codigo: string; 
  nombre: string; 
  precio_venta: number; 
  stock: number 
}

interface CotizacionItem {
  producto_id: number;
  nombre: string;
  codigo: string;
  cantidad: number;
  precio_unitario: number;
}

export default function NuevaCotizacionScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  // Estado del formulario
  const [clienteData, setClienteData] = useState<Cliente>({
    tipo_documento: '1',
    numero_documento: '',
    razon_social: '',
    direccion: '',
    email: '',
    telefono: '',
  });
  const [clienteError, setClienteError] = useState('');

  // Hook de SUNAT
  const { search: searchSunat, loading: loadingSunat, error: sunatError } = useSunatSearch();

  // Función para buscar en SUNAT
  const handleBuscarSunat = async () => {
    if (!clienteData.numero_documento.trim()) {
      setClienteError('Ingresa un número de documento');
      return;
    }

    const resultado = await searchSunat(clienteData.numero_documento, clienteData.tipo_documento);
    
    if (resultado) {
      setClienteData(prev => ({
        tipo_documento: prev.tipo_documento,
        numero_documento: resultado.documento || prev.numero_documento,
        razon_social: resultado.nombre,
        email: resultado.email || prev.email,
        telefono: resultado.telefono || prev.telefono,
        direccion: resultado.direccion || prev.direccion,
      }));
      setClienteError('');
    } else {
      setClienteError(sunatError || 'No se encontraron datos');
    }
  };

  const [items, setItems] = useState<CotizacionItem[]>([]);
  const [productoQuery, setProductoQuery] = useState('');
  const [productoResults, setProductoResults] = useState<ProductoResult[]>([]);
  const [searchingProd, setSearchingProd] = useState(false);

  const [descuentoTotal, setDescuentoTotal] = useState(0);
  const [metodoPago, setMetodoPago] = useState('001');
  const [observaciones, setObservaciones] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: ''
  });

  // Cálculos
  const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv - descuentoTotal;

  const handleSearchProducto = async (q: string) => {
    setProductoQuery(q);
    if (q.length < 2) { setProductoResults([]); return; }
    setSearchingProd(true);
    try {
      const res: any = await apiClient.get(`/productos/listar?search=${encodeURIComponent(q)}&page=1`);
      setProductoResults((Array.isArray(res?.data) ? res.data : []).slice(0, 10).map((p: any) => ({
        id: p.id, 
        codigo: p.codigo_producto ?? '', 
        nombre: p.nombre, 
        precio_venta: p.precio_venta ?? 0, 
        stock: p.stock ?? 0,
      })));
    } catch { 
      setProductoResults([]); 
    } finally { 
      setSearchingProd(false); 
    }
  };

  const handleAddProducto = (p: ProductoResult) => {
    const exists = items.find(i => i.producto_id === p.id);
    if (exists) {
      setItems(items.filter(i => i.producto_id !== p.id));
    } else {
      setItems([...items, {
        producto_id: p.id,
        nombre: p.nombre,
        codigo: p.codigo,
        cantidad: 1,
        precio_unitario: p.precio_venta,
      }]);
    }
    // NO limpiar el query para permitir agregar más productos
    // El usuario puede seguir buscando y seleccionando
  };

  const updateItem = (idx: number, field: keyof CotizacionItem, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setFormError('');
    
    if (!clienteData.razon_social.trim()) {
      setFormError('El nombre del cliente es requerido');
      return;
    }

    if (items.length === 0) {
      setFormError('Debes agregar al menos un producto');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        cliente_nombre: clienteData.razon_social,
        cliente_email: clienteData.email,
        telefono_contacto: clienteData.telefono,
        numero_documento: clienteData.numero_documento,
        productos: items.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),
        direccion_envio: clienteData.direccion || 'No especificada',
        forma_envio: 'Retiro en tienda',
        costo_envio: 0,
        metodo_pago_preferido: metodoPago,
        observaciones: observaciones || null,
      };

      const response: any = await apiClient.post('/cotizaciones/ecommerce', payload);

      if (response?.status === 'success' || response?.success) {
        setStatus({
          visible: true,
          type: 'success',
          title: 'Cotización Creada',
          message: `Cotización ${response?.codigo_cotizacion || 'registrada'} creada exitosamente.`,
        });
      } else {
        throw new Error(response?.message || 'Error al crear cotización');
      }
    } catch (error: any) {
      setStatus({
        visible: true,
        type: 'error',
        title: 'Error',
        message: error?.message || 'No se pudo crear la cotización',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Nueva Cotización" subtitle="Facturación" onBack={() => router.push('/(app)/facturacion/cotizaciones' as any)} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: Math.max(bottom, 16) + 24 }}>
          <View className="p-4 gap-4">
            
            {/* Información del Cliente */}
            <Card className="p-4 gap-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="person-outline" size={18} color="#458EFF" />
                <Text variant="label">Información del Cliente</Text>
              </View>
              
              <View className="flex-row items-end gap-2">
                <View className="flex-1">
                  <Input
                    label="Número de Documento"
                    value={clienteData.numero_documento}
                    onChangeText={(v) => setClienteData({...clienteData, numero_documento: v})}
                    placeholder="Ej: 12345678"
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity
                  onPress={handleBuscarSunat}
                  disabled={loadingSunat}
                  className="bg-primary-500 px-4 py-3.5 rounded-xl items-center justify-center mb-1"
                >
                  {loadingSunat
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Ionicons name="search" size={20} color="#fff" />
                  }
                </TouchableOpacity>
              </View>

              {clienteError && <Text variant="caption" color="error">{clienteError}</Text>}

              <Input
                label="Razón Social / Nombre"
                value={clienteData.razon_social}
                onChangeText={(v) => setClienteData({...clienteData, razon_social: v})}
                placeholder="Nombre completo"
              />

              <Input
                label="Dirección"
                value={clienteData.direccion}
                onChangeText={(v) => setClienteData({...clienteData, direccion: v})}
                placeholder="Dirección del cliente"
                leftIcon="location-outline"
              />

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    label="Email"
                    value={clienteData.email}
                    onChangeText={(v) => setClienteData({...clienteData, email: v})}
                    placeholder="correo@ejemplo.com"
                    keyboardType="email-address"
                    leftIcon="mail-outline"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Teléfono"
                    value={clienteData.telefono}
                    onChangeText={(v) => setClienteData({...clienteData, telefono: v})}
                    placeholder="999888777"
                    keyboardType="phone-pad"
                    leftIcon="call-outline"
                  />
                </View>
              </View>
            </Card>

            {/* Productos */}
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
                onSelect={(p) => handleAddProducto(p)}
                selectedIds={items.map(i => i.producto_id)}
              />

              {items.map((item, idx) => (
                <VentaItemCard 
                  key={idx}
                  item={item as any}
                  onUpdate={(f: any, v: any) => updateItem(idx, f, v)}
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

            {/* Resumen */}
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

            {/* Fecha de Vencimiento */}
            <Card className="p-4">
              <DatePicker
                label="Fecha de Vencimiento (Opcional)"
                value={fechaVencimiento}
                onChange={setFechaVencimiento}
                placeholder="Selecciona una fecha"
                minDate={new Date()}
              />
            </Card>

            {/* Error */}
            {formError ? (
              <View className="flex-row items-center gap-2 px-2">
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text variant="caption" color="error">{formError}</Text>
              </View>
            ) : null}

            {/* Botón Guardar */}
            <Button
              onPress={handleSave}
              disabled={saving}
              loading={saving}
              variant="primary"
              fullWidth
              className="py-4"
            >
              {saving ? 'Creando...' : 'Crear Cotización'}
            </Button>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Estado */}
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
