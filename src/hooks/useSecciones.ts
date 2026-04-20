import { useState, useCallback, useEffect } from 'react';
import { seccionService, Seccion } from '../services/seccion.service';

export function useSecciones() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await seccionService.getAll();
      const list = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
      setSecciones(list);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar secciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { secciones, loading, error, refresh: load };
}
