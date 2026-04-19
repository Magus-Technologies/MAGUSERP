import { useState } from 'react';
import { apiClient } from '../api/client';

export interface VentaItem {
  producto_id:      number;
  nombre:           string;
  codigo:           string;
  cantidad:         number;
  precio_unitario:  number;
  descuento_unitario: number;
}

export interface ClienteData {
  tipo_documento:   string;
  numero_documento: string;
  razon_social:     string;
  direccion:        string;
  email:            string;
}

const EMPTY_CLIENTE: ClienteData = {
  tipo_documento:   '1',
  numero_documento: '',
  razon_social:     '',
  direccion:        '',
  email:            '',
};

export function useVentaForm(onSuccess: () => void) {
  const [clienteId,    setClienteId]    = useState<number | null>(null);
  const [clienteData,  setClienteData]  = useState<ClienteData>({ ...EMPTY_CLIENTE });
  const [items,        setItems]        = useState<VentaItem[]>([]);
  const [metodoPago,   setMetodoPago]   = useState('EFECTIVO');
  const [observaciones, setObservaciones] = useState('');
  const [requiereFactura, setRequiereFactura] = useState(false);

  const [searchingCliente, setSearchingCliente] = useState(false);
  const [clienteError,     setClienteError]     = useState('');
  const [saving,           setSaving]           = useState(false);
  const [formError,        setFormError]        = useState('');

  const reset = () => {
    setClienteId(null);
    setClienteData({ ...EMPTY_CLIENTE });
    setItems([]);
    setMetodoPago('EFECTIVO');
    setObservaciones('');
    setRequiereFactura(false);
    setFormError('');
    setClienteError('');
  };

  const buscarCliente = async () => {
    const doc = clienteData.numero_documento.trim();
    if (!doc) return;
    setSearchingCliente(true);
    setClienteError('');
    try {
      const isRuc = clienteData.tipo_documento === '6';

      if (isRuc) {
        // SUNAT via APIPeru
        const res: any = await apiClient.post(`/utilidades/validar-ruc/${doc}`);
        if (res?.success && res?.data) {
          const d = res.data;
          setClienteId(null);
          setClienteData(prev => ({
            ...prev,
            razon_social: d.razon_social ?? '',
            direccion:    d.direccion ?? '',
          }));
          setClienteError('');
        } else {
          setClienteId(null);
          setClienteError(res?.message ?? 'RUC no encontrado en SUNAT');
        }
      } else {
        // RENIEC (DNI, CE, Pasaporte) — ruta pública
        const res: any = await apiClient.get(`/reniec/buscar/${doc}`);
        if (res?.success !== false && (res?.nombres || res?.nombre)) {
          const nombre = res.nombre
            ?? [res.nombres, res.apellidoPaterno, res.apellidoMaterno].filter(Boolean).join(' ');
          setClienteId(null);
          setClienteData(prev => ({ ...prev, razon_social: nombre }));
          setClienteError('');
        } else {
          setClienteId(null);
          setClienteError(res?.message ?? 'DNI no encontrado en RENIEC');
        }
      }
    } catch (e: any) {
      setClienteId(null);
      setClienteError(e?.message ?? 'No encontrado, completa los datos manualmente');
    } finally {
      setSearchingCliente(false);
    }
  };

  const addItem = (item: Omit<VentaItem, 'descuento_unitario'>) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.producto_id === item.producto_id);
      if (idx >= 0) {
        return prev.map((i, n) => n === idx ? { ...i, cantidad: i.cantidad + item.cantidad } : i);
      }
      return [...prev, { ...item, descuento_unitario: 0 }];
    });
  };

  const updateItem = (idx: number, field: keyof VentaItem, value: number) => {
    setItems(prev => prev.map((i, n) => n === idx ? { ...i, [field]: value } : i));
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, n) => n !== idx));
  };

  const subtotal = items.reduce((acc, i) => acc + (i.precio_unitario - i.descuento_unitario) * i.cantidad, 0);
  const igv      = subtotal * 0.18;
  const total    = subtotal + igv;

  const save = async () => {
    if (items.length === 0) { setFormError('Agrega al menos un producto'); return; }
    if (!clienteData.numero_documento.trim() && !clienteId) {
      setFormError('Ingresa los datos del cliente');
      return;
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
        })),
        metodo_pago:      metodoPago,
        observaciones:    observaciones || undefined,
        requiere_factura: requiereFactura,
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
        };
      }

      await apiClient.post('/ventas', payload);
      reset();
      onSuccess();
    } catch (e: any) {
      setFormError(e.message ?? 'Error al guardar la venta');
    } finally {
      setSaving(false);
    }
  };

  return {
    clienteId, clienteData, setClienteData,
    items, addItem, updateItem, removeItem,
    metodoPago, setMetodoPago,
    observaciones, setObservaciones,
    requiereFactura, setRequiereFactura,
    subtotal, igv, total,
    buscarCliente, searchingCliente, clienteError,
    saving, formError, save, reset,
  };
}
