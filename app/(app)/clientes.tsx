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
interface Cliente {
  id_cliente:       number;
  nombre_completo:  string;
  nombres?:         string;
  apellidos?:       string;
  email:            string;
  telefono?:        string;
  numero_documento?: string;
  tipo_documento?:  string;
  estado:           string;
  fecha_registro?:  string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function iniciales(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function formatFecha(iso?: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

const AVATAR_COLORS = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#EC4899','#14B8A6'];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

// ── Card de cliente ────────────────────────────────────────────────────────────
function ClienteCard({ item }: { item: Cliente }) {
  const nombre = item.nombre_completo || `${item.nombres ?? ''} ${item.apellidos ?? ''}`.trim() || '—';
  const activo = item.estado?.toLowerCase() === 'activo' || item.estado === '1' || item.estado === 'true';
  const color  = avatarColor(item.id_cliente);

  return (
    <Card className="p-4 mb-3">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Avatar */}
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color }}>{iniciales(nombre)}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="label" numberOfLines={1} style={{ flex: 1 }}>{nombre}</Text>
            <View style={{ backgroundColor: activo ? '#DCFCE7' : '#FEE2E2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 }}>
              <Text style={{ fontSize: 9, color: activo ? '#16A34A' : '#DC2626', fontWeight: '700' }}>
                {activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>

          <Text variant="caption" color="muted" numberOfLines={1} style={{ marginTop: 2 }}>{item.email}</Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
            {item.telefono && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="call-outline" size={11} color="#9CA3AF" />
                <Text variant="caption" color="muted">{item.telefono}</Text>
              </View>
            )}
            {item.numero_documento && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="id-card-outline" size={11} color="#9CA3AF" />
                <Text variant="caption" color="muted">{item.tipo_documento ?? 'DOC'}: {item.numero_documento}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {item.fecha_registro && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 }}>
          <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
          <Text variant="caption" color="muted">Registrado: {formatFecha(item.fecha_registro)}</Text>
        </View>
      )}
    </Card>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function ClientesScreen() {
  const router = useRouter();

  const [clientes,   setClientes]   = useState<Cliente[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore,setLoadingMore]= useState(false);
  const [search,     setSearch]     = useState('');
  const [soloActivos,setSoloActivos]= useState(false);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(true);
  const [error,      setError]      = useState('');
  const [total,      setTotal]      = useState(0);

  const fetchClientes = useCallback(async (p = 1, reset = false) => {
    if (p === 1) reset ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      let url = `/clientes?page=${p}&per_page=15`;
      if (search.trim())  url += `&search=${encodeURIComponent(search.trim())}`;
      if (soloActivos)    url += `&estado=activo`;

      const res: any = await apiClient.get(url);
      const items: Cliente[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.clientes)
        ? res.clientes
        : Array.isArray(res)
        ? res
        : [];

      if (res?.total) setTotal(res.total);
      setClientes(prev => p === 1 ? items : [...prev, ...items]);
      setHasMore(items.length === 15);
      setPage(p);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search, soloActivos]);

  useEffect(() => { fetchClientes(1); }, [fetchClientes]);

  const onRefresh  = () => fetchClientes(1, true);
  const onLoadMore = () => { if (hasMore && !loadingMore) fetchClientes(page + 1); };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScreenHeader
        title="Clientes"
        subtitle={total > 0 ? `${total} registrados` : 'Listado'}
        onBack={() => router.canGoBack() ? router.back() : router.replace('/(app)')}
      />

      {/* Búsqueda + filtro */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, gap: 8 }}>
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: '#1F2937' }}
            placeholder="Buscar por nombre, email o documento..."
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

        <TouchableOpacity
          onPress={() => setSoloActivos(v => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}
        >
          <View style={{
            width: 20, height: 20, borderRadius: 6, borderWidth: 2,
            borderColor: soloActivos ? '#10B981' : '#D1D5DB',
            backgroundColor: soloActivos ? '#10B981' : 'transparent',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {soloActivos && <Ionicons name="checkmark" size={12} color="#fff" />}
          </View>
          <Text variant="caption" style={{ color: '#6B7280' }}>Solo clientes activos</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#458EFF" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text variant="body" color="error" style={{ marginTop: 12, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={() => fetchClientes(1)} style={{ marginTop: 16, backgroundColor: '#458EFF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={item => String(item.id_cliente)}
          renderItem={({ item }) => <ClienteCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#458EFF" />}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color="#458EFF" style={{ marginVertical: 12 }} /> : null}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="people-outline" size={56} color="#D1D5DB" />
              <Text variant="body" color="muted" style={{ marginTop: 12 }}>No se encontraron clientes</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
