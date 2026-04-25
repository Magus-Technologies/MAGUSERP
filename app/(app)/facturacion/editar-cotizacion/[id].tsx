import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../../../src/api/client';
import { useSunatSearch } from '../../../../src/hooks/useSunatSearch';
import { Text }   from '../../../../src/components/ui/Text';
import { Button } from '../../../../src/components/ui/Button';
import { Card }   from '../../../../src/components/ui/Card';
import { Input }  from '../../../../src/components/ui/Input';
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner';
import { StatusModal } from '../../../../src/components/ui/StatusModal';

// Componentes Compartidos
import { ProductSelector } from '../../../../src/components/shared/ProductSelector';
import { VentaItemCard }   from '../../../../src/components/facturacion/VentaItemCard';
import { VentaSummary }    from '../../../../src/components/facturacion/VentaSummary';

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

export default function EditarCotizacionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Estado del formulario
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [formaEnvio, setFormaEnvio] = useState('');
  const [costoEnvio, setCostoEnvio] = useState('0');

  const [items, setItems] = useState<CotizacionItem[]>([]);
  const [productoQuery, setProductoQuery] = useState('');
  const [productoResults, setProductoResults] = useState<ProductoResult[]>([]);
  const [searchingProd, setSearchingProd] = useState(false);

  const [descuentoTotal, setDescuentoTotal] = useState(0);
  const [metodoPago, setMetodoPago] = useState('001');
  const [observaciones, setObservaciones] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: ''
  });

  // Hook de SUNAT
  const { search: searchSunat, loading: loadingSunat, error: sunatError } = useSunatSearch();

  // Función para buscar en SUNAT
  const handleBuscarSunat = async () => {
    if (!numeroDocumento.trim()) {
      setError('Ingresa un número de documento');
      return;
    }

    const resultado = await searchSunat(numeroDocumento);
    
    if (resultado) {
      setClienteNombre(resultado.nombre);
      setClienteEmail(resultado.email || clienteEmail);
      setTelefonoContacto(resultado.telefono || telefonoContacto);
      setDireccionEnvio(resultado.direccion || direccionEnvio);
      setError('');
    } else {
      setError(sunatError || 'No se encontraron datos');
    }
  };

  // Cálculos
  const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv + Number(costoEnvio) - descuentoTotal;

  useEffect(() => {
    loadCotizacion();
  }, [id]);

  const loadCotizacion = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await apiClient.get(`/cotizaciones/${id}`);
      if (response?.cotizacion) {
        const cot = response.cotizacion;
        setClienteNombre(cot.cliente_nombre || '');
        setClienteEmail(cot.cliente_email || '');
        setTelefonoContacto(cot.telefono_contacto || '');
        setNumeroDocumento(cot.numero_documento || '');
        setDireccionEnvio(cot.direccion_envio || '');
        setFormaEnvio(cot.forma_envio || '');
        setCostoEnvio(String(cot.costo_envio || 0));
        setDescuentoTotal(cot.descuento_total || 0);
        setMetodoPago(cot.metodo_pago_preferido || '001');
        setObservaciones(cot.observaciones || '');
        
        // Cargar detalles
        if (cot.detalles && Array.isArray(cot.detalles)) {
          setItems(cot.detalles.map((d: any) => ({
            producto_id: d.producto_id,
            nombre: d.nombre_producto,
            codigo: d.codigo_producto || '',
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
          })));
        }
      } else if (response?.data) {
        const cot = response.data;
        setClienteNombre(cot.cliente_nombre || '');
        setClienteEmail(cot.cliente_email || '');
        setTelefonoContacto(cot.telefono_contacto || '');
        setNumeroDocumento(cot.numero_documento || '');
        setDireccionEnvio(cot.direccion_envio || '');
        setFormaEnvio(cot.forma_envio || '');
        setCostoEnvio(String(cot.costo_envio || 0));
        setDescuentoTotal(cot.descuento_total || 0);
        setMetodoPago(cot.metodo_pago_preferido || '001');
        setObservaciones(cot.observaciones || '');
        
        if (cot.detalles && Array.isArray(cot.detalles)) {
          setItems(cot.detalles.map((d: any) => ({
            producto_id: d.producto_id,
            nombre: d.nombre_producto,
            codigo: d.codigo_producto || '',
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
          })));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la cotización');
    } finally {
      setLoading(false);
    }
  };

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
    setError('');
    
    if (!clienteNombre.trim()) {
      setError('El nombre del cliente es requerido');
      return;
    }

    if (items.length === 0) {
      setError('Debes agregar al menos un producto');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        cliente_nombre: clienteNombre,
        cliente_email: clienteEmail,
        telefono_contacto: telefonoContacto,
        numero_documento: numeroDocumento,
        direccion_envio: direccionEnvio,
        forma_envio: formaEnvio,
        costo_envio: Number(costoEnvio),
        metodo_pago_preferido: metodoPago,
        observaciones: observaciones || null,
        descuento_total: descuentoTotal,
        detalles: items.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        })),
      };

      const response: any = await apiClient.patch(`/cotizaciones/${id}`, payload);

      if (response?.status === 'success' || response?.success) {
        setStatus({
          visible: true,
          type: 'success',
          title: 'Cotización Actualizada',
          message: 'La cotización se ha actualizado exitosamente.',
        });
      } else {
        throw new Error(response?.message || 'Error al actualizar cotización');
      }
    } catch (error: any) {
      setStatus({
        visible: true,
        type: 'error',
        title: 'Error',
        message: error?.message || 'No se pudo actualizar la cotización',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando cotización..." />;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-azul-oscuro px-4 pt-14 pb-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.push('/(app)/facturacion/cotizaciones' as any)} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="caption" className="text-white/60">Facturación</Text>
          <Text variant="h4" color="white">Editar Cotización</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                    value={numeroDocumento}
                    onChangeText={setNumeroDocumento}
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

              <Input
                label="Nombre"
                value={clienteNombre}
                onChangeText={setClienteNombre}
                placeholder="Nombre del cliente"
              />
              
              <Input
                label="Email"
                value={clienteEmail}
                onChangeText={setClienteEmail}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
              />
              
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    label="Teléfono"
                    value={telefonoContacto}
                    onChangeText={setTelefonoContacto}
                    placeholder="999888777"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </Card>

            {/* Dirección de Envío */}
            <Card className="p-4 gap-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="location-outline" size={18} color="#458EFF" />
                <Text variant="label">Dirección de Envío</Text>
              </View>
              
              <Input
                label="Dirección"
                value={direccionEnvio}
                onChangeText={setDireccionEnvio}
                placeholder="Dirección completa"
              />
              
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    label="Forma de Envío"
                    value={formaEnvio}
                    onChangeText={setFormaEnvio}
                    placeholder="Delivery, Recojo, etc"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Costo Envío"
                    value={costoEnvio}
                    onChangeText={setCostoEnvio}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
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

            {/* Error */}
            {error ? (
              <View className="flex-row items-center gap-2 px-2">
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text variant="caption" color="error">{error}</Text>
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
              {saving ? 'Guardando...' : 'Guardar Cambios'}
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
