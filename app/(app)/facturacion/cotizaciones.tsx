import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useCotizaciones }       from '@/src/hooks/useCotizaciones';
import { CotizacionCard }        from '@/src/components/cards/CotizacionCard';
import { SearchBar }             from '@/src/components/ui/SearchBar';
import { FAB }                   from '@/src/components/ui/FAB';
import { LoadingSpinner }        from '@/src/components/ui/LoadingSpinner';
import { EmptyState }            from '@/src/components/ui/EmptyState';
import { Text }                  from '@/src/components/ui/Text';
import { Card }                  from '@/src/components/ui/Card';
import { ScreenHeader }          from '@/src/components/ui/ScreenHeader';

const ESTADOS = [
  { key: '',          label: 'Todos'      },
  { key: 'PENDIENTE', label: 'Pendiente'  },
  { key: 'ACEPTADA',  label: 'Aceptada'   },
  { key: 'RECHAZADA', label: 'Rechazada'  },
  { key: 'EXPIRADA',  label: 'Expirada'   },
];

export default function CotizacionesScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { cotizaciones, search, setSearch, estado, applyEstado, total, loading, loadingMore, error, loadMore, refresh } = useCotizaciones();

  if (loading) return <LoadingSpinner message="Cargando cotizaciones..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Cotizaciones"
        subtitle="Facturación"
        onMenu={() => navigation.openDrawer()}
        right={<Text variant="caption" className="text-white/60">{total} registros</Text>}
      />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar cotización, cliente..." />

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
        data={cotizaciones}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="document-outline"
            title="Sin cotizaciones"
            message={search ? 'No hay resultados para tu búsqueda' : 'No hay cotizaciones registradas'}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#458EFF" />
            </View>
          ) : null
        }
        renderItem={({ item }) => <CotizacionCard item={item} />}
      />

      <FAB onPress={() => router.push('/facturacion/nueva-cotizacion' as any)} />
    </View>
  );
}
