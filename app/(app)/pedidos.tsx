import React, { useState, useEffect, useCallback } from 'react';
import {
  View, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/src/api/client';
import { Text }        from '@/src/components/ui/Text';
import { Card }        from '@/src/components/ui/Card';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface Pedido {
  id:            number;
  codigo_pedido: string;
  fecha_pedido:  string;
  total:         number;
  metodo_pago:   string;
  estado_pedido?: { nombre: string; color?: string };
  cliente?:       { nombres: string; apellidos: string };
  cliente_email?: string;
  numero_documento?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const ESTADOS = ['Todos','Pendiente','Procesando','Enviado','Entregado','Cancelado'];

const badgeColor: Record<string, string> = {
  Pendiente:   '#F59E0B',
  Procesando:  '#3B82F6',
  Enviado:     '#8B5CF6',
  Entregado:   '#10B981',
  Cancelado:   '#EF4444',
};

function getBadge(nombre?: string) {
  if (!nombre) return '#9CA3AF';
  const key = Object.keys(badgeColor).find(k => nombre.toLowerCase().includes(k.toLowerCase()));
  return key ? badgeColor[key] : '#9CA3AF';
}

function formatFecha(iso: string) {
  try { return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

// ── Card de pedido ─────────────────────────────────────────────────────────────
function PedidoCard({ item }: { item: Pedido }) {
  const estadoNombre = item.estado_pedido?.nombre ?? 'Sin estado';
  const color        = getBadge(estadoNombre);
  const clienteNombre = item.cliente
    ? `${item.cliente.nombres} ${item.cliente.apellidos}`
    : item.cliente_email ?? item.numero_documento ?? '—';

  return (
    <Card className="p-4 mb-3">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text variant="label" style={{ color: '#458EFF' }}>{item.codigo_pedido}</Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ marginTop: 2 }}>{clienteNombre}</Text>
          <Text variant="caption" color="muted" style={{ marginTop: 1 }}>{formatFecha(item.fecha_pedido)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Text variant="label" style={{ fontWeight: '800' }}>S/ {Number(item.total).toFixed(2)}</Text>
          <View style={{ backgroundColor: color + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
            <Text style={{ fontSize: 10, color, fontWeight: '700' }}>{estadoNombre}</Text>
          </View>
        </View>
      </View>
      {item.metodo_pago && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 }}>
          <Ionicons name="card-outline" size={12} color="#9CA3AF" />
          <Text variant="caption" color="muted">{item.metodo_pago}</Text>
        </View>
      )}
    </Card>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function PedidosScreen() {
  const router = useRouter();

  const [pedidos,    setPedidos]    = useState<Pedido[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore,setLoadingMore]= useState(false);
  const [search,     setSearch]     = useState('');
  const [estado,     setEstado]     = useState('Todos');
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(true);
  const [error,      setError]      = useState('');

  const fetchPedidos = useCallback(async (p = 1, reset = false) => {
    if (p === 1) reset ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      let url = `/pedidos?page=${p}&per_page=15`;
      if (search.trim())          url += `&search=${encodeURIComponent(search.trim())}`;
      if (estado !== 'Todos')     url += `&estado=${encodeURIComponent(estado)}`;

      const res: any = await apiClient.get(url);
      const items: Pedido[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.pedidos)
        ? res.pedidos
        : Array.isArray(res)
        ? res
        : [];

      setPedidos(prev => p === 1 ? items : [...prev, ...items]);
      setHasMore(items.length === 15);
      setPage(p);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search, estado]);

  useEffect(() => { fetchPedidos(1); }, [fetchPedidos]);

  const onRefresh   = () => fetchPedidos(1, true);
  const onLoadMore  = () => { if (hasMore && !loadingMore) fetchPedidos(page + 1); };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScreenHeader title="Pedidos" subtitle="Listado" onBack={() => router.canGoBack() ? router.back() : router.replace('/(app)')} />

      {/* Búsqueda */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, gap: 8 }}>
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: '#1F2937' }}
            placeholder="Buscar pedido o cliente..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtro estado */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
          {ESTADOS.map(e => (
            <TouchableOpacity
              key={e}
              onPress={() => setEstado(e)}
              style={{
                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
                backgroundColor: estado === e ? '#458EFF' : '#F3F4F6',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: estado === e ? '#fff' : '#6B7280' }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#458EFF" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text variant="body" color="error" style={{ marginTop: 12, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={() => fetchPedidos(1)} style={{ marginTop: 16, backgroundColor: '#458EFF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <PedidoCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#458EFF" />}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color="#458EFF" style={{ marginVertical: 12 }} /> : null}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="receipt-outline" size={56} color="#D1D5DB" />
              <Text variant="body" color="muted" style={{ marginTop: 12 }}>No se encontraron pedidos</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
