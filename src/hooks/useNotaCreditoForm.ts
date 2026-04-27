import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

// Catálogo 09 SUNAT — valores fijos, no cambian
export const MOTIVOS_NOTA_CREDITO = [
  { codigo: '01', descripcion: 'Anulación de la operación' },
  { codigo: '02', descripcion: 'Anulación por error en el RUC' },
  { codigo: '03', descripcion: 'Corrección por error en la descripción' },
  { codigo: '04', descripcion: 'Descuento global' },
  { codigo: '05', descripcion: 'Descuento por ítem' },
  { codigo: '06', descripcion: 'Devolución total' },
  { codigo: '07', descripcion: 'Devolución por ítem' },
  { codigo: '08', descripcion: 'Bonificación' },
  { codigo: '09', descripcion: 'Disminución en el valor' },
  { codigo: '13', descripcion: 'Otros' },
];

export interface NotaCreditoItem {
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

export function useNotaCreditoForm(
  onSuccess: () => void,
  initialComprobante?: string,
  initialTipoNota?: string,
  initialVentaId?: string,
) {
  const [comprobanteReferencia, setComprobanteReferencia] = useState<ComprobanteReferencia | null>(null);
  const [busquedaComprobante, setBusquedaComprobante] = useState(initialComprobante ?? '');
  const [items, setItems] = useState<NotaCreditoItem[]>([]);
  const [tipoNota, setTipoNota] = useState(initialTipoNota ?? '01');
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [anulacionTotal, setAnulacionTotal] = useState(false);

  const [buscando, setBuscando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

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

  const inicializarItems = (detalles: any[], seleccionarTodo = false) => {
    setItems(detalles.map(item => ({
      producto_id:        item.producto_id,
      nombre:             item.nombre_producto || item.descripcion || item.nombre || '',
      codigo:             item.codigo_producto || item.codigo || '',
      cantidad_original:  parseFloat(item.cantidad) || 0,
      cantidad:           parseFloat(item.cantidad) || 0,
      precio_unitario:    parseFloat(item.precio_unitario) || 0,
      descuento:          parseFloat(item.descuento_unitario ?? item.descuento ?? 0),
      tipo_afectacion_igv: item.tipo_afectacion_igv || '10',
      seleccionado:       seleccionarTodo,
    })));
  };

  const buscarComprobanteConNumero = async (numero: string, seleccionarTodo = false) => {
    setBuscando(true);
    setFormError('');
    try {
      const res: any = await apiClient.get(`/facturacion/comprobantes/buscar?numero=${encodeURIComponent(numero)}`);
      if (res?.success && res?.data) {
        const comp = res.data;
        setComprobanteReferencia({
          id:              comp.id,
          tipo:            comp.tipo_comprobante,
          numero_completo: comp.numero_completo,
          cliente_nombre:  comp.cliente?.nombre || 'Sin cliente',
          total:           parseFloat(comp.total),
          items:           comp.detalles || [],
        });
        inicializarItems(comp.detalles || [], seleccionarTodo);
        if (seleccionarTodo) setAnulacionTotal(true);
      } else {
        setFormError(res?.message || 'Comprobante no encontrado');
      }
    } catch (e: any) {
      setFormError('Error al buscar comprobante');
    } finally {
      setBuscando(false);
    }
  };

  const buscarComprobante = async () => {
    if (!busquedaComprobante.trim()) {
      setFormError('Ingresa el número de comprobante');
      return;
    }
    await buscarComprobanteConNumero(busquedaComprobante.trim());
  };

  const cargarDesdeVenta = async (ventaId: string) => {
    setBuscando(true);
    setFormError('');
    try {
      const res: any = await apiClient.get(`/ventas/${ventaId}`);
      if (!res?.success || !res?.data) {
        setFormError('No se pudo cargar la venta');
        return;
      }
      const venta = res.data;
      const comp  = venta.comprobante_info;
      if (!comp) {
        setFormError('Esta venta no tiene comprobante electrónico');
        return;
      }
      setComprobanteReferencia({
        id:              comp.id,
        tipo:            comp.tipo_comprobante,
        numero_completo: comp.numero_completo,
        cliente_nombre:  venta.cliente_contacto?.nombre_completo ||
                         venta.cliente_info?.nombre_completo || 'Sin cliente',
        total:           parseFloat(String(venta.total ?? comp.importe_total ?? 0)),
        items:           venta.detalles || [],
      });
      setBusquedaComprobante(comp.numero_completo);
      inicializarItems(venta.detalles || [], false);
    } catch (e: any) {
      setFormError('Error al cargar la venta');
    } finally {
      setBuscando(false);
    }
  };

  useEffect(() => {
    if (initialVentaId) {
      cargarDesdeVenta(initialVentaId);
    } else if (initialComprobante?.trim()) {
      buscarComprobanteConNumero(initialComprobante.trim(), !!initialTipoNota);
    }
  }, []);

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

      await apiClient.post('/notas-credito', payload);
      reset();
      onSuccess();
      return true;
    } catch (e: any) {
      setFormError(e.message ?? 'Error al guardar la nota de crédito');
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
    motivosNotaCredito: MOTIVOS_NOTA_CREDITO, cargandoMotivos: false
  };
}
