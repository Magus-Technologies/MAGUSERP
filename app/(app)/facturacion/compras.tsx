import React from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useCompras } from '@/src/hooks/useCompras';
import { SearchBar } from '@/src/components/ui/SearchBar';
import { FAB } from '@/src/components/ui/FAB';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';

const ESTADOS = [
  { key: '', label: 'Todos' },
  { key: '1', label: 'Pendiente' },
  { key: '2', label: 'Aprobada' },
  { key: '3', label: 'Pagada' },
  { key: '4', label: 'En Preparación' },
  { key: '5', label: 'Enviada' },
  { key: '6', label: 'Entregada' },
  { key: '7', label: 'Cancelada' },
];

const ESTADO_COLORS: Record<string, { bg: string; text: string }> = {
  '1': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  '2': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '3': { bg: 'bg-purple-100', text: 'text-purple-700' },
  '4': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '5': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  '6': { bg: 'bg-green-100', text: 'text-green-700' },
  '7': { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function ComprasScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { compras, search, setSearch, estado, applyEstado, total, loading, loadingMore, error, loadMore, refresh } = useCompras();

  if (loading) return <LoadingSpinner message="Cargando compras..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Mis Compras"
        subtitle="Facturación"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/(app)')}
        right={<Text variant="caption" className="text-white/60">{total} registros</Text>}
      />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar compra, código..." />

      {/* Filtros de estado */}
      <View className="flex-row px-4 pb-2 gap-2">
        {ESTADOS.map(e => (
          <TouchableOpacity
            key={e.key}
            onPress={() => applyEstado(e.key)}
            className={`px-3 py-1.5 rounded-full border ${estado === e.key ? 'bg-azul-oscuro border-azul-oscuro' : 'bg-white border-gray-200'}`}
          >
            <Text variant="caption" className={estado === e.key ? 'text-white' : 'text-gray-600'}>
              {e.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Error */}
      {error && (
        <Card className="mx-4 mb-2 p-3 border border-red-100">
          <View className="flex-row items-center gap-2">
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text variant="caption" color="error">{error}</Text>
          </View>
        </Card>
      )}

      <FlatList
        data={compras}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title="Sin compras"
            message={search ? 'No hay resultados para tu búsqueda' : 'No tienes compras registradas'}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#458EFF" />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/facturacion/compras/${item.id}` as any)}
            activeOpacity={0.7}
          >
            <Card className="mx-4 mb-3 p-4">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text variant="h4" className="font-semibold">
                    {item.codigo_compra}
                  </Text>
                  <Text variant="caption" className="text-gray-500 mt-1">
                    {new Date(item.fecha_compra).toLocaleDateString('es-PE')}
                  </Text>
                </View>
                <Badge
                  label={ESTADOS.find(e => e.key === String(item.estado_compra_id))?.label || 'Desconocido'}
                  variant={item.estado_compra_id === 1 ? 'warning' : item.estado_compra_id === 6 ? 'success' : 'gray'}
                />
              </View>

              <View className="mb-3 pb-3 border-b border-gray-100">
                <Text variant="caption" className="text-gray-500">Cliente</Text>
                <Text variant="body" className="font-medium mt-1">
                  {item.cliente_nombre}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View>
                  <Text variant="caption" className="text-gray-500">Total</Text>
                  <Text variant="h4" className="font-bold text-azul-oscuro mt-1">
                    S/ {item.total.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text variant="caption" className="text-gray-500">
                    {item.detalles?.length || 0} productos
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      <FAB onPress={() => router.push('/facturacion/nueva-compra' as any)} />
    </View>
  );
}
