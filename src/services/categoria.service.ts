import { apiClient } from '../api/client';
import { Categoria } from '../types/almacen.types';

export interface CategoriaPayload {
  nombre:      string;
  descripcion: string | null;
  id_seccion:  number;
  activo:      boolean;
}

export const categoriaService = {
  getAll(): Promise<Categoria[]> {
    return apiClient.get('/categorias');
  },

  create(data: CategoriaPayload): Promise<Categoria> {
    return apiClient.post('/categorias', data);
  },

  update(id: number, data: CategoriaPayload): Promise<Categoria> {
    return apiClient.put(`/categorias/${id}`, data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/categorias/${id}`);
  },
};
