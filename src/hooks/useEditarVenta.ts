import { useState, useCallback } from 'react';
import { facturacionService } from '../services/facturacion.service';
import { apiClient } from '../api/client';
import { Cliente } from '../types/cliente.types';

export interface VentaItem {
  producto_id: number;
  nombre: string;
  codigo: string;
  cantidad: number;
  precio_unitario: number;
  tipo_afectacion_igv: string;
  unidad_medida: string;
  descuento?: number;
}

export function useEditarVenta(ventaId: number, onSuccess?: () => void) {
  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [tipoComprobante, setTipoComprobante] = useState('03');
  const [series, setSeries] = useState<any[]>([]);
  const [serieId, setSerieId] = useState<number | null>(null);
  const [clienteData, setClienteData] = useState<Cliente | null>(null);
  const [items, setItems] = useState<VentaItem[]>([]);
  const [descuentoTotal, setDescuentoTotal] = useState(0);
  const [metodoPago, setMetodoPago] = useState('CONTADO');
  const [observaciones, setObservaciones] = useState('');
  const [searchingCliente, setSearchingCliente] = useState(false);
  const [clienteError, setClienteError] = useState('');

  // Cargar venta existente
  const cargarVenta = useCallback(async () => {
    try {
      setLoading(true);
      const res = await facturacionService.getVenta(ventaId);
      const ventaData = res.venta || res.data;
      
      console.log('Venta cargada:', ventaData);
      
      setVenta(ventaData);
      setTipoComprobante(ventaData.tipo_comprobante || '03');
      setSerieId(ventaData.serie_id);
      
      // Mapear datos del cliente correctamente - usar cliente_contacto del backend
      const clienteInfo = ventaData.cliente_contacto || ventaData.cliente_info || {};
      setClienteData({
        id: ventaData.cliente_id,
        tipo_documento: ventaData.tipo_documento_cliente || '1',
        numero_documento: clienteInfo.numero_documento || '',
        razon_social: clienteInfo.nombre_completo || '',
        direccion: ventaData.direccion_envio || '',
        email: clienteInfo.email || '',
        telefono: clienteInfo.telefono || '',
      });
      
      setItems(ventaData.detalles?.map((d: any) => ({
        producto_id: d.producto_id,
        nombre: d.producto?.nombre || d.nombre_producto,
        codigo: d.producto?.codigo_producto || d.codigo_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        tipo_afectacion_igv: d.tipo_afectacion_igv || '10',
        unidad_medida: d.unidad_medida || 'NIU',
        descuento: d.descuento || 0,
      })) || []);
      setDescuentoTotal(ventaData.descuento_total || 0);
      setMetodoPago(ventaData.metodo_pago || 'CONTADO');
      setObservaciones(ventaData.observaciones || '');
    } catch (err: any) {
      console.error('Error al cargar venta:', err);
      setFormError('Error al cargar la venta');
    } finally {
      setLoading(false);
    }
  }, [ventaId]);

  // Cargar series disponibles
  const loadSeries = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/series');
      setSeries(res.data || []);
    } catch (err) {
      console.error('Error cargando series:', err);
    }
  }, []);

  // Buscar cliente
  const buscarCliente = useCallback(async (query?: string) => {
    if (!query || !query.trim()) {
      setClienteData(null);
      setClienteError('');
      return;
    }

    setSearchingCliente(true);
    setClienteError('');
    try {
      const res: any = await apiClient.get(`/clientes/buscar?q=${encodeURIComponent(query)}`);
      const cliente = res.data?.[0];
      if (cliente) {
        setClienteData({
          id: cliente.id,
          tipo_documento: cliente.tipo_documento || '1',
          numero_documento: cliente.numero_documento || '',
          razon_social: cliente.nombre_completo || cliente.razon_social || '',
          direccion: cliente.direccion || '',
          email: cliente.email || '',
          telefono: cliente.telefono || '',
        });
      } else {
        setClienteError('Cliente no encontrado');
      }
    } catch (err: any) {
      setClienteError(err.message || 'Error al buscar cliente');
    } finally {
      setSearchingCliente(false);
    }
  }, []);

  // Actualizar item
  const updateItem = useCallback((index: number, field: keyof VentaItem, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  }, []);

  // Remover item
  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Agregar item
  const addItem = useCallback((item: VentaItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv - descuentoTotal;

  // Guardar cambios
  const save = useCallback(async () => {
    setFormError('');

    if (!clienteData?.id) {
      setFormError('Selecciona un cliente');
      return false;
    }

    if (items.length === 0) {
      setFormError('Agrega al menos un producto');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        cliente_id: clienteData.id,
        productos: items.map(item => ({
          producto_id: item.producto_id,
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
          descuento_unitario: Number(item.descuento || 0),
        })),
        descuento_total: Number(descuentoTotal),
        metodo_pago: metodoPago,
        observaciones: observaciones,
      };

      console.log('Payload enviado:', JSON.stringify(payload, null, 2));
      await apiClient.put(`/ventas/${ventaId}`, payload);
      
      // Recargar la venta después de guardar para mostrar los cambios
      await cargarVenta();
      
      onSuccess?.();
      return true;
    } catch (err: any) {
      console.error('Error al guardar:', err);
      setFormError(err.message || 'Error al guardar la venta');
      return false;
    } finally {
      setSaving(false);
    }
  }, [ventaId, clienteData, items, descuentoTotal, metodoPago, observaciones, onSuccess, cargarVenta]);

  return {
    venta,
    loading,
    saving,
    formError,
    tipoComprobante,
    setTipoComprobante,
    series,
    serieId,
    setSerieId,
    loadSeries,
    clienteData,
    setClienteData,
    buscarCliente,
    searchingCliente,
    clienteError,
    items,
    updateItem,
    removeItem,
    addItem,
    descuentoTotal,
    setDescuentoTotal,
    metodoPago,
    setMetodoPago,
    observaciones,
    setObservaciones,
    subtotal,
    igv,
    total,
    cargarVenta,
    save,
  };
}
