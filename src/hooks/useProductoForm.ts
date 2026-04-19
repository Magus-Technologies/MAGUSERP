import { useState } from 'react';
import { productoService, ProductoPayload } from '../services/producto.service';
import { Producto } from '../types/almacen.types';

const EMPTY: ProductoPayload = {
  nombre: '', descripcion: null, codigo_producto: '',
  precio_venta: 0, precio_compra: 0,
  stock: 0, stock_minimo: 5, categoria_id: 0, marca_id: null, activo: true,
};

export function useProductoForm(onSuccess: () => void) {
  const [form,    setForm]    = useState<ProductoPayload>(EMPTY);
  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);

  const open = (producto?: Producto) => {
    setEditing(producto ?? null);
    setForm(producto ? {
      nombre:          producto.nombre,
      descripcion:     producto.descripcion,
      codigo_producto: (producto as any).codigo_producto ?? '',
      precio_venta:    producto.precio_venta ?? producto.precio,
      precio_compra:   producto.precio_compra,
      stock:           producto.stock,
      stock_minimo:    producto.stock_minimo,
      categoria_id:    producto.categoria_id,
      marca_id:        producto.marca_id,
      activo:          (producto as any).activo ?? true,
    } : EMPTY);
    setError('');
  };

  const reset = () => {
    setEditing(null);
    setForm(EMPTY);
    setError('');
  };

  const setField = (key: keyof ProductoPayload, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const validate = (): string => {
    if (!form.nombre.trim())         return 'El nombre es requerido';
    if (!form.categoria_id)          return 'Selecciona una categoría';
    if (Number(form.precio_venta) <= 0) return 'El precio debe ser mayor a 0';
    return '';
  };

  const save = async () => {
    const msg = validate();
    if (msg) { setError(msg); return false; }

    setSaving(true);
    try {
      const payload: ProductoPayload = {
        ...form,
        nombre:        form.nombre.trim(),
        precio_venta:  Number(form.precio_venta),
        precio_compra: Number(form.precio_compra),
        stock:         Number(form.stock),
        stock_minimo:  Number(form.stock_minimo),
      };
      if (editing) {
        await productoService.update(editing.id, payload);
      } else {
        await productoService.create(payload);
      }
      onSuccess();
      return true;
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { form, error, saving, editing, open, reset, setField, save };
}
