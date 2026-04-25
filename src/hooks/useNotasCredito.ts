import { useState, useCallback, useEffect, useRef } from 'react';
import { facturacionService } from '../services/facturacion.service';

export interface NotaCredito {
  id: number;
  numero: string;
  serie: string;
  correlativo: number;
  venta_id: number;
  cliente_id: number;
  cliente?: {
    id: number;
    nombre: string;
    ruc: string;
  };
  motivo: string;
  descripcion?: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: 'BORRADOR' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO';
  fecha_emision: string;
  created_at: string;
}

export function useNotasCredito() {
  const [notas, setNotas] = useState<NotaCredito[]>([]);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef(search);
  searchRef.current = search;
  const estadoRef = useRef(estado);
  estadoRef.current = estado;
  const mountedRef = useRef(false);

  const load = useCallback(async (q: string, est: string, p: number, append = false) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const raw: any = await facturacionService.getNotasCredito({
        search: q || undefined,
        estado: est || undefined,
        page: p,
      });

      if (!raw) {
        setError('Error al cargar notas de crédito');
        return;
      }

      const list: NotaCredito[] = Array.isArray(raw?.data) ? raw.data : [];
      setNotas(prev => (append ? [...prev, ...list] : list));
      setLastPage(raw?.last_page ?? 1);
      setTotal(raw?.total ?? list.length);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load('', '', 1);
  }, [load]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      setPage(1);
      load(search, estadoRef.current, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const applyEstado = (est: string) => {
    setEstado(est);
    setPage(1);
    load(searchRef.current, est, 1);
  };

  const loadMore = () => {
    if (loadingMore || page >= lastPage) return;
    const next = page + 1;
    setPage(next);
    load(searchRef.current, estadoRef.current, next, true);
  };

  const refresh = () => {
    setPage(1);
    load(searchRef.current, estadoRef.current, 1);
  };

  return {
    notas,
    search,
    setSearch,
    estado,
    applyEstado,
    total,
    loading,
    loadingMore,
    error,
    loadMore,
    refresh
  };
}
