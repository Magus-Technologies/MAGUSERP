import { useState, useCallback, useEffect } from 'react';
import { categoriaService } from '../services/categoria.service';
import { Categoria } from '../types/almacen.types';

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filtered,   setFiltered]   = useState<Categoria[]>([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriaService.getAll();
      const list: Categoria[] = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
      setCategorias(list);
      setFiltered(list);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? categorias.filter(c => c.nombre.toLowerCase().includes(q)) : categorias);
  }, [search, categorias]);

  const create = async (nombre: string, descripcion: string | null, id_seccion: number, activo: boolean) => {
    setSaving(true);
    try {
      await categoriaService.create({ nombre, descripcion, id_seccion, activo });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: number, nombre: string, descripcion: string | null, id_seccion: number, activo: boolean) => {
    setSaving(true);
    try {
      await categoriaService.update(id, {
        nombre,
        descripcion,
        id_seccion,
        activo,
      });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    setDeleting(true);
    try {
      await categoriaService.delete(id);
      await load();
    } catch (e) {
      throw e;
    } finally {
      setDeleting(false);
    }
  };

  return { categorias, filtered, search, setSearch, loading, saving, deleting, error, create, update, remove };
}
