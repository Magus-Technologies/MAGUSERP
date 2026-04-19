import { apiClient } from '../api/client';
import { Categoria } from '../types/almacen.types';

export const categoriaService = {
  getAll(): Promise<Categoria[]> {
    return apiClient.get('/categorias');
  },

  create(data: Pick<Categoria, 'nombre' | 'descripcion'>): Promise<Categoria> {
    return apiClient.post('/categorias', data);
  },

  update(id: number, data: Pick<Categoria, 'nombre' | 'descripcion'>): Promise<Categoria> {
    return apiClient.put(`/categorias/${id}`, data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/categorias/${id}`);
  },
};
