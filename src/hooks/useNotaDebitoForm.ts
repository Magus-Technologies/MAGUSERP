import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface NotaDebitoItem {
  producto_id: number;
  nombre: string;
  codigo: string;
  cantidad_original: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  tipo_afectacion_igv: string;
  seleccionado: boolean;
}

export interface ComprobanteReferencia {
  id: number;
  tipo: string;
  numero_completo: string;
  cliente_nombre: string;
  total: number;
  items: any[];
}

export function useNotaDebitoForm(onSuccess: () => void) {
  const [comprobanteReferencia, setComprobanteReferencia] = useState<ComprobanteReferencia | null>(null);
  const [busquedaComprobante, setBusquedaComprobante] = useState('');
  const [items, setItems] = useState<NotaDebitoItem[]>([]);
  const [tipoNota, setTipoNota] = useState('01');
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [anulacionTotal, setAnulacionTotal] = useState(false);

  const [buscando, setBuscando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [motivosNotaDebito, setMotivosNotaDebito] = useState<any[]>([]);
  const [cargandoMotivos, setCargandoMotivos] = useState(true);

  const reset = () => {
    setComprobanteReferencia(null);
    setBusquedaComprobante('');
    setItems([]);
    setTipoNota('01');
    setMotivo('');
    setDescripcion('');
    setAnulacionTotal(false);
    setFormError('');
  };

  useEffect(() => {
    cargarMotivos();
  }, []);

  const cargarMotivos = async () => {
    try {
      const res: any = await apiClient.get('/facturacion/catalogos/principales');
      if (res?.success && res?.data?.['motivo-nota-debito']) {
        setMotivosNotaDebito(res.data['motivo-nota-debito']);
      }
    } catch (e) {
      console.error('Error cargando motivos:', e);
    } finally {
      setCargandoMotivos(false);
    }
  };

  const buscarComprobante = async () => {
    if (!busquedaComprobante.trim()) {
      setFormError('Ingresa el número de comprobante');
      return;
    }

    setBuscando(true);
    setFormError('');
    try {
      const res: any = await apiClient.get(`/facturacion/comprobantes/buscar?numero=${encodeURIComponent(busquedaComprobante)}`);
      if (res?.success && res?.data) {
        const comp = res.data;
        setComprobanteReferencia({
          id: comp.id,
          tipo: comp.tipo_comprobante,
          numero_completo: comp.numero_completo,
          cliente_nombre: comp.cliente?.nombre || 'Sin cliente',
          total: parseFloat(comp.total),
          items: comp.detalles || []
        });
        inicializarItems(comp.detalles || []);
      } else {
        setFormError(res?.message || 'Comprobante no encontrado');
      }
    } catch (e: any) {
      setFormError('Error al buscar comprobante');
    } finally {
      setBuscando(false);
    }
  };

  const inicializarItems = (detalles: any[]) => {
    setItems(detalles.map(item => ({
      producto_id: item.producto_id,
      nombre: item.nombre_producto || item.descripcion,
      codigo: item.codigo_producto || '',
      cantidad_original: item.cantidad,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      descuento: item.descuento || 0,
      tipo_afectacion_igv: item.tipo_afectacion_igv || '10',
      seleccionado: false
    })));
  };

  const toggleItemSeleccion = (idx: number) => {
    setItems(prev => prev.map((i, n) => n === idx ? { ...i, seleccionado: !i.seleccionado } : i));
  };

  const updateItemCantidad = (idx: number, cantidad: number) => {
    setItems(prev => prev.map((i, n) => n === idx ? { ...i, cantidad: Math.min(cantidad, i.cantidad_original) } : i));
  };

  const toggleAnulacionTotal = () => {
    const nuevoAnulacion = !anulacionTotal;
    setAnulacionTotal(nuevoAnulacion);
    if (nuevoAnulacion) {
      setItems(prev => prev.map(i => ({ ...i, seleccionado: true, cantidad: i.cantidad_original })));
    }
  };

  const calcularTotal = () => {
    return items
      .filter(i => i.seleccionado)
      .reduce((sum, i) => sum + (i.cantidad * i.precio_unitario - i.descuento), 0);
  };

  const save = async () => {
    if (!comprobanteReferencia) { setFormError('Selecciona un comprobante'); return false; }
    if (!tipoNota) { setFormError('Selecciona el tipo de nota'); return false; }
    if (!motivo.trim()) { setFormError('Ingresa el motivo'); return false; }
    if (items.filter(i => i.seleccionado).length === 0) { setFormError('Selecciona al menos un item'); return false; }

    setSaving(true);
    setFormError('');
    try {
      const payload: any = {
        comprobante_referencia_id: comprobanteReferencia.id,
        motivo_nota: tipoNota,
        motivo_nota_descripcion: motivo,
        descripcion: descripcion || undefined,
        items: items
          .filter(i => i.seleccionado)
          .map(i => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario,
            descuento: i.descuento,
            tipo_afectacion_igv: i.tipo_afectacion_igv,
          }))
      };

      await apiClient.post('/notas-debito', payload);
      reset();
      onSuccess();
      return true;
    } catch (e: any) {
      setFormError(e.message ?? 'Error al guardar la nota de débito');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    comprobanteReferencia,
    busquedaComprobante, setBusquedaComprobante,
    buscarComprobante, buscando,
    items, toggleItemSeleccion, updateItemCantidad,
    tipoNota, setTipoNota,
    motivo, setMotivo,
    descripcion, setDescripcion,
    anulacionTotal, toggleAnulacionTotal,
    calcularTotal,
    saving, formError, save, reset,
    motivosNotaDebito, cargandoMotivos
  };
}
