import { useState, useCallback, useEffect, useRef } from 'react';
import { productoService } from '../services/producto.service';
import { Producto } from '../types/almacen.types';

export function useProductos() {
  const [productos,   setProductos]   = useState<Producto[]>([]);
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [lastPage,    setLastPage]    = useState(1);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const searchRef = useRef(search);
  searchRef.current = search;

  const load = useCallback(async (q: string, p: number, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    setError(null);
    try {
      const raw: any = await productoService.getAll({ search: q || undefined, page: p });

      const list: Producto[] = Array.isArray(raw?.data) ? raw.data : [];
      const lp  = raw?.last_page ?? 1;
      const tot = raw?.total ?? list.length;
      setProductos(prev => append ? [...prev, ...list] : list);
      setLastPage(lp);
      setTotal(tot);
    } catch (e: any) {
      console.error('[useProductos] ERROR:', e.message);
      setError(e.message ?? 'Error al cargar');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load('', 1); }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load(search, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadMore = () => {
    if (loadingMore || page >= lastPage) return;
    const next = page + 1;
    setPage(next);
    load(searchRef.current, next, true);
  };

  const refresh = () => {
    setPage(1);
    load(searchRef.current, 1);
  };

  const remove = async (id: number) => {
    setDeleting(true);
    try {
      await productoService.delete(id);
      refresh();
    } finally {
      setDeleting(false);
    }
  };

  return { productos, search, setSearch, total, loading, loadingMore, deleting, error, loadMore, refresh, remove };
}
