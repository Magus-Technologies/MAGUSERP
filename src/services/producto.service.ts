import { apiClient } from '../api/client';
import { Producto, PaginatedResponse } from '../types/almacen.types';

export interface ProductoFilters {
  search?:      string;
  categoria_id?: number;
  marca_id?:    number;
  page?:        number;
}

export interface ProductoPayload {
  nombre:          string;
  descripcion:     string | null;
  codigo_producto: string;
  precio_venta:    number;
  precio_compra:   number;
  stock:           number;
  stock_minimo:    number;
  categoria_id:    number;
  marca_id:        number | null;
  activo:          boolean;
  destacado:       boolean;
  mostrar_igv:     boolean;
  imagen?:         string | null;
}

export const productoService = {
  getAll(filters: ProductoFilters = {}): Promise<PaginatedResponse<Producto>> {
    const params = new URLSearchParams();
    if (filters.search)       params.set('search',       filters.search);
    if (filters.categoria_id) params.set('categoria_id', String(filters.categoria_id));
    if (filters.marca_id)     params.set('marca_id',     String(filters.marca_id));
    if (filters.page)         params.set('page',         String(filters.page));
    const qs = params.toString();
    return apiClient.get(`/productos/listar${qs ? `?${qs}` : ''}`);
  },

  create(data: ProductoPayload): Promise<Producto> {
    if (data.imagen?.startsWith('file://')) {
      const formData = new FormData();
      formData.append('nombre',          data.nombre);
      formData.append('codigo_producto', data.codigo_producto);
      formData.append('categoria_id',    String(data.categoria_id));
      formData.append('precio_compra',   String(data.precio_compra));
      formData.append('precio_venta',    String(data.precio_venta));
      formData.append('stock',           String(data.stock));
      formData.append('stock_minimo',    String(data.stock_minimo));
      formData.append('activo',          data.activo ? '1' : '0');
      formData.append('destacado',       data.destacado ? '1' : '0');
      formData.append('mostrar_igv',     data.mostrar_igv ? '1' : '0');
      if (data.descripcion) formData.append('descripcion', data.descripcion);
      if (data.marca_id)    formData.append('marca_id',     String(data.marca_id));

      const filename = data.imagen.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';
      formData.append('imagen', { uri: data.imagen, name: filename, type } as any);

      return apiClient.postForm('/productos', formData);
    }
    
    // JSON Version
    const { imagen, ...jsonData } = data;
    return apiClient.post('/productos', {
      ...jsonData,
      activo:      data.activo ? 1 : 0,
      destacado:   data.destacado ? 1 : 0,
      mostrar_igv: data.mostrar_igv ? 1 : 0
    });
  },

  update(id: number, data: ProductoPayload): Promise<Producto> {
    if (data.imagen?.startsWith('file://')) {
      const formData = new FormData();
      formData.append('_method',         'PUT');
      formData.append('nombre',          data.nombre);
      formData.append('codigo_producto', data.codigo_producto);
      formData.append('categoria_id',    String(data.categoria_id));
      formData.append('precio_compra',   String(data.precio_compra));
      formData.append('precio_venta',    String(data.precio_venta));
      formData.append('stock',           String(data.stock));
      formData.append('stock_minimo',    String(data.stock_minimo));
      formData.append('activo',          data.activo ? '1' : '0');
      formData.append('destacado',       data.destacado ? '1' : '0');
      formData.append('mostrar_igv',     data.mostrar_igv ? '1' : '0');
      if (data.descripcion) formData.append('descripcion', data.descripcion);
      if (data.marca_id)    formData.append('marca_id',     String(data.marca_id));

      const filename = data.imagen.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';
      formData.append('imagen', { uri: data.imagen, name: filename, type } as any);

      return apiClient.postForm(`/productos/${id}`, formData);
    }
    
    // JSON Version
    const { imagen, ...jsonData } = data;
    return apiClient.put(`/productos/${id}`, {
      ...jsonData,
      activo:      data.activo ? 1 : 0,
      destacado:   data.destacado ? 1 : 0,
      mostrar_igv: data.mostrar_igv ? 1 : 0
    });
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/productos/${id}`);
  },
};
