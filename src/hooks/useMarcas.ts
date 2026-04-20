import { useState, useCallback, useEffect } from 'react';
import { marcaService } from '../services/marca.service';
import { Marca } from '../types/almacen.types';

export function useMarcas() {
  const [marcas,   setMarcas]   = useState<Marca[]>([]);
  const [filtered, setFiltered] = useState<Marca[]>([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await marcaService.getAll();
      const list: Marca[] = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
      setMarcas(list);
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
    setFiltered(q ? marcas.filter(m => m.nombre.toLowerCase().includes(q)) : marcas);
  }, [search, marcas]);

  const create = async (nombre: string, descripcion: string | null, activo: boolean) => {
    setSaving(true);
    try {
      await marcaService.create({ nombre, descripcion, activo });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: number, nombre: string, descripcion: string | null, activo: boolean) => {
    setSaving(true);
    try {
      await marcaService.update(id, { nombre, descripcion, activo });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    setDeleting(true);
    try {
      await marcaService.delete(id);
      await load();
    } catch (e) {
      throw e;
    } finally {
      setDeleting(false);
    }
  };

  return { marcas, filtered, search, setSearch, loading, saving, deleting, error, create, update, remove };
}
