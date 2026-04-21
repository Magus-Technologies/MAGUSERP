import { apiClient } from '../api/client';
import { Marca } from '../types/almacen.types';

export const marcaService = {
  getAll(): Promise<Marca[]> {
    return apiClient.get('/marcas');
  },

  create(data: Pick<Marca, 'nombre' | 'descripcion' | 'activo' | 'imagen'>): Promise<Marca> {
    if (data.imagen?.startsWith('file://')) {
      const formData = new FormData();
      formData.append('nombre', data.nombre);
      formData.append('activo', data.activo ? '1' : '0');
      if (data.descripcion) formData.append('descripcion', data.descripcion);
      
      const filename = data.imagen.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';
      formData.append('imagen', { uri: data.imagen, name: filename, type } as any);

      return apiClient.postForm('/marcas', formData);
    }
    
    const { imagen, ...jsonData } = data;
    return apiClient.post('/marcas', {
      ...jsonData,
      activo: data.activo ? 1 : 0
    });
  },

  update(id: number, data: Pick<Marca, 'nombre' | 'descripcion' | 'activo' | 'imagen'>): Promise<Marca> {
    if (data.imagen?.startsWith('file://')) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('nombre', data.nombre);
      formData.append('activo', data.activo ? '1' : '0');
      if (data.descripcion) formData.append('descripcion', data.descripcion);

      const filename = data.imagen.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';
      formData.append('imagen', { uri: data.imagen, name: filename, type } as any);

      return apiClient.postForm(`/marcas/${id}`, formData);
    }
    
    const { imagen, ...jsonData } = data;
    return apiClient.put(`/marcas/${id}`, {
      ...jsonData,
      activo: data.activo ? 1 : 0
    });
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/marcas/${id}`);
  },
};
