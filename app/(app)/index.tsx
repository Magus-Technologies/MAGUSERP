import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/store/AuthContext';
import { dashboardService } from '@/src/services/dashboard.service';
import { DashboardStats, StockCritico } from '@/src/types/dashboard.types';
import { formatCurrency } from '@/src/utils/formatters';
import { StatCard }         from '@/src/components/ui/StatCard';
import { SectionHeader }    from '@/src/components/ui/SectionHeader';
import { Card }             from '@/src/components/ui/Card';
import { Text }             from '@/src/components/ui/Text';
import { LoadingSpinner }   from '@/src/components/ui/LoadingSpinner';
import { EmptyState }       from '@/src/components/ui/EmptyState';
import { StockCriticoItem } from '@/src/components/dashboard/StockCriticoItem';
import { ScreenHeader }     from '@/src/components/ui/ScreenHeader';

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [stats,         setStats]         = useState<DashboardStats | null>(null);
  const [stockCritico,  setStockCritico]  = useState<StockCritico[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [statsData, stockData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getStockCritico(),
      ]);
      setStats(statsData);
      setStockCritico(Array.isArray(stockData) ? stockData.slice(0, 5) : []);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) return <LoadingSpinner message="Cargando dashboard..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title={user?.name ?? 'Usuario'}
        subtitle="Bienvenido,"
        onMenu={() => navigation.openDrawer()}
        right={
          <Image
            source={require('@/assets/images/logo3.png')}
            style={{ width: 90, height: 30 }}
            resizeMode="contain"
          />
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="px-4 py-4 gap-4">

          {/* Error state */}
          {error && (
            <Card className="p-4 border border-red-100">
              <View className="flex-row items-center gap-2">
                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                <Text variant="bodySmall" color="error">{error}</Text>
              </View>
            </Card>
          )}

          {/* ── KPIs principales ── */}
          <View>
            <SectionHeader title="Resumen General" />
            <View className="flex-row flex-wrap gap-3">
              <StatCard
                title="Pedidos"
                value={stats?.total_pedidos ?? 0}
                icon="cart-outline"
                color="primary"
              />
              <StatCard
                title="Clientes"
                value={stats?.total_clientes ?? 0}
                icon="people-outline"
                color="info"
              />
              <StatCard
                title="Ingresos"
                value={formatCurrency(stats?.total_ingresos)}
                icon="cash-outline"
                color="success"
              />
              <StatCard
                title="Productos"
                value={stats?.total_productos ?? 0}
                icon="cube-outline"
                color="warning"
              />
            </View>
          </View>

          {/* ── Ganancia del mes ── */}
          {stats?.ganancias_mes_actual !== undefined && (
            <Card className="p-4 flex-row items-center gap-4">
              <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center">
                <Ionicons name="trending-up" size={24} color="#2ABC79" />
              </View>
              <View className="flex-1">
                <Text variant="caption" color="muted">Ganancia del mes</Text>
                <Text variant="h3" className="text-green-600">
                  {formatCurrency(stats.ganancias_mes_actual)}
                </Text>
              </View>
            </Card>
          )}

          {/* ── Producto del mes ── */}
          {stats?.producto_del_mes && (
            <Card className="p-4">
              <SectionHeader
                title="Producto del mes"
                subtitle={stats.producto_del_mes.periodo.nombre_mes}
              />
              <View className="flex-row items-center gap-3">
                <View className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden">
                  {stats.producto_del_mes.imagen_principal ? (
                    <Image
                      source={{ uri: stats.producto_del_mes.imagen_principal }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Ionicons name="cube-outline" size={24} color="#9ca3af" />
                    </View>
                  )}
                </View>
                <View className="flex-1">
                  <Text variant="label" numberOfLines={2}>
                    {stats.producto_del_mes.nombre}
                  </Text>
                  <Text variant="caption" color="muted" className="mt-0.5">
                    {stats.producto_del_mes.ventas_cantidad} ventas ·{' '}
                    {formatCurrency(stats.producto_del_mes.ventas_total)}
                  </Text>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                    <Ionicons name="trending-up" size={12} color="#2ABC79" />
                    <Text className="text-[10px] text-green-600 font-semibold ml-1">
                      +{stats.producto_del_mes.crecimiento_porcentaje.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* ── Stock crítico ── */}
          <Card className="p-4">
            <SectionHeader
              title="Stock Crítico"
              subtitle={`${stockCritico.length} productos`}
            />
            {stockCritico.length === 0 ? (
              <EmptyState
                icon="checkmark-circle-outline"
                title="Sin alertas de stock"
                message="Todos los productos tienen stock suficiente"
              />
            ) : (
              stockCritico.map((item, i) => (
                <StockCriticoItem
                  key={item.id}
                  item={item}
                  last={i === stockCritico.length - 1}
                />
              ))
            )}
          </Card>

        </View>
      </ScrollView>
    </View>
  );
}
