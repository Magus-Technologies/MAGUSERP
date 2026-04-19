import { apiClient } from '../api/client';
import { Producto, PaginatedResponse } from '../types/almacen.types';

export interface ProductoFilters {
  search?:      string;
  categoria_id?: number;
  marca_id?:    number;
  page?:        number;
}

export interface ProductoPayload {
  nombre:        string;
  descripcion:   string | null;
  precio:        number;
  precio_compra: number;
  stock:         number;
  stock_minimo:  number;
  categoria_id:  number;
  marca_id:      number | null;
}

export const productoService = {
  getAll(filters: ProductoFilters = {}): Promise<PaginatedResponse<Producto>> {
    const params = new URLSearchParams();
    if (filters.search)       params.set('search',       filters.search);
    if (filters.categoria_id) params.set('categoria_id', String(filters.categoria_id));
    if (filters.marca_id)     params.set('marca_id',     String(filters.marca_id));
    if (filters.page)         params.set('page',         String(filters.page));
    const qs = params.toString();
    return apiClient.get(`/productos${qs ? `?${qs}` : ''}`);
  },

  create(data: ProductoPayload): Promise<Producto> {
    return apiClient.post('/productos', data);
  },

  update(id: number, data: ProductoPayload): Promise<Producto> {
    return apiClient.put(`/productos/${id}`, data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/productos/${id}`);
  },
};
