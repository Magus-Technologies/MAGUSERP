import { apiClient } from '../api/client';
import { Marca } from '../types/almacen.types';

export const marcaService = {
  getAll(): Promise<Marca[]> {
    return apiClient.get('/marcas');
  },

  create(data: Pick<Marca, 'nombre' | 'descripcion' | 'activo'>): Promise<Marca> {
    return apiClient.post('/marcas', data);
  },

  update(id: number, data: Pick<Marca, 'nombre' | 'descripcion' | 'activo'>): Promise<Marca> {
    return apiClient.put(`/marcas/${id}`, data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/marcas/${id}`);
  },
};
