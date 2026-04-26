import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useVentas }             from '@/src/hooks/useVentas';
import { VentaCard }             from '@/src/components/cards/VentaCard';
import { SearchBar }             from '@/src/components/ui/SearchBar';
import { FAB }                   from '@/src/components/ui/FAB';
import { LoadingSpinner }        from '@/src/components/ui/LoadingSpinner';
import { EmptyState }            from '@/src/components/ui/EmptyState';
import { Text }                  from '@/src/components/ui/Text';
import { Card }                  from '@/src/components/ui/Card';
import { Venta }                 from '@/src/types/facturacion.types';
import { ScreenHeader }          from '@/src/components/ui/ScreenHeader';

const ESTADOS = [
  { key: '',           label: 'Todos'     },
  { key: 'PENDIENTE',  label: 'Pendiente' },
  { key: 'FACTURADO',  label: 'Facturado' },
];

export default function VentasScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { ventas, search, setSearch, estado, applyEstado, total, loading, loadingMore, error, loadMore, refresh } = useVentas();

  const handleEdit = (venta: Venta) => {
    router.push(`/facturacion/editar-venta/${venta.id}` as any);
  };

  const handleFacturar = (venta: Venta) => {
    Alert.alert(
      'Generar Comprobante',
      `¿Deseas generar el comprobante para la venta ${venta.codigo_venta}?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        { 
          text: 'Generar', 
          onPress: async () => {
            try {
              await facturacionService.facturarVenta(venta.id);
              Alert.alert('Éxito', 'Comprobante generado correctamente');
              refresh();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al generar comprobante');
            }
          }
        },
      ]
    );
  };

  const handleEnviarSunat = (venta: Venta) => {
    Alert.alert('Enviar a SUNAT', 'Esta funcionalidad se implementará pronto');
  };

  const handleVerFirma = (venta: Venta) => {
    Alert.alert('Ver XML y Firma', 'Esta funcionalidad se implementará pronto');
  };

  const handleGenerarPdf = (venta: Venta) => {
    Alert.alert('Generar PDF', 'Esta funcionalidad se implementará pronto');
  };

  const handleDescargarPdf = (ventaId: number) => {
    Alert.alert('Descargar PDF', 'Esta funcionalidad se implementará pronto');
  };

  const handleDescargarCdr = (ventaId: number) => {
    Alert.alert('Descargar CDR', 'Esta funcionalidad se implementará pronto');
  };

  const handleEnviarPor = (venta: Venta) => {
    Alert.alert('Enviar por Email/WhatsApp', 'Esta funcionalidad se implementará pronto');
  };

  const handleConsultarSunat = (venta: Venta) => {
    Alert.alert('Consultar en SUNAT', 'Esta funcionalidad se implementará pronto');
  };

  const handleAnular = (venta: Venta) => {
    Alert.alert(
      'Anular Venta',
      `¿Estás seguro de que deseas anular la venta ${venta.codigo_venta}?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        { text: 'Anular', onPress: () => {
          Alert.alert('Venta anulada', 'La venta ha sido anulada correctamente');
        }, style: 'destructive' },
      ]
    );
  };

  const handleVerDetalle = (venta: Venta) => {
    router.push(`/facturacion/ventas/${venta.id}` as any);
  };

  if (loading) return <LoadingSpinner message="Cargando ventas..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Ventas"
        subtitle="Facturación"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/(app)')}
        right={<Text variant="caption" className="text-white/60">{total} registros</Text>}
      />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar venta, cliente..." />

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
        data={ventas}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Sin ventas"
            message={search ? 'No hay resultados para tu búsqueda' : 'No hay ventas registradas'}
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
          <VentaCard 
            item={item}
            onPress={() => handleVerDetalle(item)}
            onEdit={handleEdit}
            onFacturar={handleFacturar}
            onEnviarSunat={handleEnviarSunat}
            onVerFirma={handleVerFirma}
            onGenerarPdf={handleGenerarPdf}
            onDescargarPdf={handleDescargarPdf}
            onDescargarCdr={handleDescargarCdr}
            onEnviarPor={handleEnviarPor}
            onConsultarSunat={handleConsultarSunat}
            onAnular={handleAnular}
          />
        )}
      />

      <FAB onPress={() => router.push('/facturacion/nueva-venta' as any)} />
    </View>
  );
}
