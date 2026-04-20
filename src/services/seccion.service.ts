import { apiClient } from '../api/client';

export interface Seccion {
  id:     number;
  nombre: string;
}

export const seccionService = {
  getAll(): Promise<Seccion[]> {
    return apiClient.get('/secciones');
  },
};
