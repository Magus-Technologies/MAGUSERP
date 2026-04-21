import { apiClient } from '../api/client';
import { Categoria } from '../types/almacen.types';

export interface CategoriaPayload {
  nombre:      string;
  descripcion: string | null;
  id_seccion:  number;
  activo:      boolean;
  imagen?:      string | null;
}

export const categoriaService = {
  getAll(): Promise<Categoria[]> {
    return apiClient.get('/categorias');
  },

  create(data: CategoriaPayload): Promise<Categoria> {
    if (data.imagen?.startsWith('file://')) {
      const formData = new FormData();
      formData.append('nombre',      data.nombre);
      formData.append('id_seccion',  String(data.id_seccion));
      formData.append('activo',      data.activo ? '1' : '0');
      if (data.descripcion) formData.append('descripcion', data.descripcion);
      
      const filename = data.imagen.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';
      formData.append('imagen', { uri: data.imagen, name: filename, type } as any);

      return apiClient.postForm('/categorias', formData);
    }
    return apiClient.post('/categorias', data);
  },

  update(id: number, data: CategoriaPayload): Promise<Categoria> {
    if (data.imagen?.startsWith('file://')) {
      const formData = new FormData();
      formData.append('_method',     'PUT');
      formData.append('nombre',      data.nombre);
      formData.append('id_seccion',  String(data.id_seccion));
      formData.append('activo',      data.activo ? '1' : '0');
      if (data.descripcion) formData.append('descripcion', data.descripcion);

      const filename = data.imagen.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';
      formData.append('imagen', { uri: data.imagen, name: filename, type } as any);

      return apiClient.postForm(`/categorias/${id}`, formData);
    }
    return apiClient.put(`/categorias/${id}`, data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/categorias/${id}`);
  },
};
