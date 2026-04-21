import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Cliente }   from '../types/cliente.types';

export interface VentaItem {
  producto_id:      number;
  nombre:           string;
  codigo:           string;
  cantidad:         number;
  precio_unitario:  number;
  descuento_unitario: number;
  tipo_afectacion_igv: string;
  unidad_medida:    string;
}

export interface ClienteData extends Cliente {}

const EMPTY_CLIENTE: ClienteData = {
  tipo_documento:   '1',
  numero_documento: '',
  razon_social:     '',
  direccion:        '',
  email:            '',
  telefono:         '',
};

export function useVentaForm(onSuccess: () => void) {
  const [clienteId,    setClienteId]    = useState<number | null>(null);
  const [clienteData,  setClienteData]  = useState<ClienteData>({ ...EMPTY_CLIENTE });
  const [items,        setItems]        = useState<VentaItem[]>([]);
  const [tipoComprobante, setTipoComprobante] = useState<'01' | '03' | '99'>('03'); // 01: Factura, 03: Boleta, 99: Nota de Venta
  const [metodoPago,     setMetodoPago]     = useState('EFECTIVO');
  const [observaciones,  setObservaciones]  = useState('');
  const [descuentoTotal, setDescuentoTotal] = useState(0);

  const [series,         setSeries]         = useState<any[]>([]);
  const [serieId,        setSerieId]        = useState<number | null>(null);

  const [searchingCliente, setSearchingCliente] = useState(false);
  const [clienteError,     setClienteError]     = useState('');
  const [saving,           setSaving]           = useState(false);
  const [formError,        setFormError]        = useState('');

  const loadSeries = async () => {
    try {
      const res: any = await apiClient.get('/series');
      if (res?.success && Array.isArray(res?.data)) {
        setSeries(res.data);
      }
    } catch (e) {
      console.error('Error loading series', e);
    }
  };

  const reset = () => {
    setClienteId(null);
    setClienteData({ ...EMPTY_CLIENTE });
    setItems([]);
    setTipoComprobante('03');
    setMetodoPago('EFECTIVO');
    setObservaciones('');
    setDescuentoTotal(0);
    setFormError('');
    setClienteError('');
  };

  // Auto-seleccionar serie cuando cambia el tipo de comprobante
  useEffect(() => {
    if (series.length > 0) {
      const filtered = series.filter((s: any) => s.tipo_comprobante === tipoComprobante);
      if (filtered.length > 0) {
        setSerieId(filtered[0].id);
      } else {
        setSerieId(null);
      }
    }

    // Ajustar tipo de documento del cliente según comprobante
    if (tipoComprobante === '01') {
      setClienteData(prev => ({ ...prev, tipo_documento: '6' }));
    } else if (tipoComprobante === '03' && clienteData.tipo_documento === '6') {
      setClienteData(prev => ({ ...prev, tipo_documento: '1' }));
    }
  }, [tipoComprobante, series]);

  const buscarCliente = async () => {
    const doc = clienteData.numero_documento.trim();
    if (!doc) return;
    setSearchingCliente(true);
    setClienteError('');
    setClienteId(null);
    try {
      const typeMap: Record<string, string> = { '1': 'DNI', '6': 'RUC', '4': 'CE', '7': 'PASAPORTE' };
      const tipoTxt = typeMap[clienteData.tipo_documento] || 'DNI';

      // 1. Intentar buscar en la base de datos LOCAL primero
      try {
        const localRes: any = await apiClient.get(`/utilidades/clientes/buscar?tipo_documento=${tipoTxt}&numero_documento=${doc}`);
        if (localRes?.success && localRes?.data) {
          const c = localRes.data;
          setClienteId(c.id);
          setClienteData(prev => ({
            ...prev,
            razon_social: c.razon_social ?? c.nombre_comercial ?? '',
            direccion:    c.direccion ?? '',
            email:        c.email ?? '',
            telefono:     c.telefono ?? '',
          }));
          setSearchingCliente(false);
          return;
        }
      } catch (e) {
        // No encontrado localmente, continuamos con externos
      }

      // 2. Si no es local, buscar en externos (SUNAT/RENIEC)
      const isRuc = clienteData.tipo_documento === '6';
      if (isRuc) {
        const res: any = await apiClient.post(`/utilidades/validar-ruc/${doc}`);
        if (res?.success && res?.data) {
          setClienteData(prev => ({
            ...prev,
            razon_social: res.data.razon_social ?? '',
            direccion:    res.data.direccion ?? '',
          }));
        } else {
          setClienteError(res?.message ?? 'RUC no encontrado en SUNAT');
        }
      } else {
        const res: any = await apiClient.get(`/reniec/buscar/${doc}`);
        if (res?.success !== false && (res?.nombres || res?.nombre)) {
          const nombre = res.nombre
            ?? [res.nombres, res.apellidoPaterno, res.apellidoMaterno].filter(Boolean).join(' ');
          setClienteData(prev => ({ ...prev, razon_social: nombre }));
        } else {
          setClienteError(res?.message ?? 'Documento no encontrado');
        }
      }
    } catch (e: any) {
      setClienteError('No encontrado, completa los datos manualmente');
    } finally {
      setSearchingCliente(false);
    }
  };

  const addItem = (item: Omit<VentaItem, 'descuento_unitario' | 'tipo_afectacion_igv' | 'unidad_medida'> & { tipo_afectacion_igv?: string; unidad_medida?: string }) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.producto_id === item.producto_id);
      if (idx >= 0) {
        return prev.map((i, n) => n === idx ? { ...i, cantidad: i.cantidad + item.cantidad } : i);
      }
      return [...prev, { 
        ...item, 
        descuento_unitario: 0,
        tipo_afectacion_igv: item.tipo_afectacion_igv || '10',
        unidad_medida:    item.unidad_medida || 'NIU'
      }];
    });
  };

  const updateItem = (idx: number, field: keyof VentaItem, value: number) => {
    setItems(prev => prev.map((i, n) => n === idx ? { ...i, [field]: value } : i));
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, n) => n !== idx));
  };

  const subtotal = items.reduce((acc, i) => {
    const itemTotal = (i.precio_unitario - i.descuento_unitario) * i.cantidad;
    if (i.tipo_afectacion_igv === '10') {
      return acc + (itemTotal / 1.18);
    }
    return acc + itemTotal;
  }, 0);
  const totalItems = items.reduce((acc, i) => acc + (i.precio_unitario - i.descuento_unitario) * i.cantidad, 0);
  const total = Math.max(0, totalItems - descuentoTotal);
  const igv   = items.reduce((acc, i) => {
    if (i.tipo_afectacion_igv === '10') {
       const lineTotal = (i.precio_unitario - i.descuento_unitario) * i.cantidad;
       return acc + (lineTotal - (lineTotal / 1.18));
    }
    return acc;
  }, 0);

  const save = async () => {
    if (items.length === 0) { setFormError('Agrega al menos un producto'); return false; }
    if (!clienteData.numero_documento.trim() && !clienteId) {
      setFormError('Ingresa los datos del cliente');
      return false;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload: any = {
        items: items.map(i => ({
          tipo_item:        'PRODUCTO',
          producto_id:      i.producto_id,
          cantidad:         i.cantidad,
          precio_unitario:  i.precio_unitario,
          descuento_unitario: i.descuento_unitario,
          tipo_afectacion_igv: i.tipo_afectacion_igv,
          unidad_medida:    i.unidad_medida,
        })),
        metodo_pago:      metodoPago,
        observaciones:    observaciones || undefined,
        requiere_factura: tipoComprobante === '01',
        tipo_documento:   tipoComprobante,
        descuento_total:  descuentoTotal,
      };

      if (clienteId) {
        payload.cliente_id = clienteId;
      } else if (clienteData.numero_documento.trim()) {
        payload.cliente_datos = {
          tipo_documento:   clienteData.tipo_documento,
          numero_documento: clienteData.numero_documento.trim(),
          razon_social:     clienteData.razon_social.trim() || 'CLIENTE GENERAL',
          direccion:        clienteData.direccion.trim() || undefined,
          email:            clienteData.email.trim() || undefined,
          telefono:         clienteData.telefono.trim() || undefined,
        };
      }

      await apiClient.post('/ventas', payload);
      reset();
      onSuccess();
      return true;
    } catch (e: any) {
      setFormError(e.message ?? 'Error al guardar la venta');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    clienteId, clienteData, setClienteData,
    items, addItem, updateItem, removeItem,
    metodoPago, setMetodoPago,
    observaciones, setObservaciones,
    tipoComprobante, setTipoComprobante,
    descuentoTotal, setDescuentoTotal,
    series, serieId, setSerieId, loadSeries,
    subtotal, igv, total,
    buscarCliente, searchingCliente, clienteError,
    saving, formError, save, reset,
  };
}
