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
      const raw = await productoService.getAll({ search: q || undefined, page: p });
      console.log('[useProductos] tipo:', typeof raw, '| isArray:', Array.isArray(raw), '| keys(5):', Object.keys(raw as any).slice(0, 5));

      let list: Producto[];
      let lp  = 1;
      let tot = 0;

      if (Array.isArray(raw)) {
        // Array plano
        list = raw;
      } else if (raw && Array.isArray((raw as any).data)) {
        // Paginado { data: [], last_page, total }
        list = (raw as any).data;
        lp   = (raw as any).last_page ?? 1;
        tot  = (raw as any).total ?? list.length;
      } else if (raw && typeof raw === 'object') {
        // Objeto con IDs como claves: { "123": {...}, "124": {...} }
        list = Object.values(raw as unknown as Record<string, Producto>);
      } else {
        list = [];
      }

      tot = tot || list.length;
      console.log('[useProductos] items:', list.length, '| lastPage:', lp, '| total:', tot);
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
