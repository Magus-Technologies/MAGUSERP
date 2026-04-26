import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { facturacionService } from '@/src/services/facturacion.service';
import {
  VentasEstadisticas,
  VentasEstadisticasSunat,
  ComprobantesEstadisticas,
} from '@/src/types/facturacion.types';
import { formatCurrency }  from '@/src/utils/formatters';
import { StatCard }        from '@/src/components/ui/StatCard';
import { SectionHeader }   from '@/src/components/ui/SectionHeader';
import { Card }            from '@/src/components/ui/Card';
import { Text }            from '@/src/components/ui/Text';
import { LoadingSpinner }  from '@/src/components/ui/LoadingSpinner';
import { ScreenHeader }    from '@/src/components/ui/ScreenHeader';

type EstadoBadgeProps = { label: string; count: number; color: string };
function EstadoBadge({ label, count, color }: EstadoBadgeProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center gap-2">
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text variant="bodySmall" color="muted">{label}</Text>
      </View>
      <Text variant="label" style={{ color }}>{count}</Text>
    </View>
  );
}

export default function FacturacionDashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [ventas,       setVentas]       = useState<VentasEstadisticas | null>(null);
  const [sunat,        setSunat]        = useState<VentasEstadisticasSunat | null>(null);
  const [comprobantes, setComprobantes] = useState<ComprobantesEstadisticas | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [v, s, c] = await Promise.all([
        facturacionService.getVentasEstadisticas(),
        facturacionService.getVentasEstadisticasSunat(),
        facturacionService.getComprobantesEstadisticas(),
      ]);
      setVentas(v);
      setSunat(s);
      setComprobantes((c as any)?.data ?? null);
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

  const sunatStates = sunat?.por_estado_sunat;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Dashboard"
        subtitle="Facturación"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/(app)')}
        right={<View className="bg-white/20 px-3 py-1 rounded-full"><Text variant="caption" color="white">Este mes</Text></View>}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="px-4 py-4 gap-4">

          {/* Error */}
          {error && (
            <Card className="p-4 border border-red-100">
              <View className="flex-row items-center gap-2">
                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                <Text variant="bodySmall" color="error">{error}</Text>
              </View>
            </Card>
          )}

          {/* ── KPIs Ventas ── */}
          <View>
            <SectionHeader title="Ventas del Mes" />
            <View className="flex-row flex-wrap gap-3">
              <StatCard
                title="Total Ventas"
                value={ventas?.total_ventas ?? 0}
                icon="cart-outline"
                color="primary"
              />
              <StatCard
                title="Monto Total"
                value={formatCurrency(ventas?.monto_total)}
                icon="cash-outline"
                color="success"
              />
              <StatCard
                title="Pendientes"
                value={ventas?.ventas_pendientes ?? 0}
                icon="time-outline"
                color="warning"
              />
              <StatCard
                title="Facturadas"
                value={ventas?.ventas_facturadas ?? 0}
                icon="checkmark-circle-outline"
                color="info"
              />
            </View>
          </View>

          {/* ── Monto aceptado SUNAT ── */}
          {sunat && (
            <Card className="p-4 flex-row items-center gap-4">
              <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center">
                <Ionicons name="shield-checkmark-outline" size={24} color="#2ABC79" />
              </View>
              <View className="flex-1">
                <Text variant="caption" color="muted">Aceptado por SUNAT</Text>
                <Text variant="h3" className="text-green-600">
                  {formatCurrency(sunat.monto_aceptado)}
                </Text>
              </View>
              <View className="items-end">
                <Text variant="caption" color="muted">de total</Text>
                <Text variant="label">{formatCurrency(sunat.monto_total)}</Text>
              </View>
            </Card>
          )}

          {/* ── Estado SUNAT ── */}
          {sunatStates && (
            <Card className="p-4">
              <SectionHeader
                title="Estado SUNAT"
                subtitle={`${sunat?.con_comprobante ?? 0} con comprobante`}
              />
              <EstadoBadge label="Aceptados"  count={sunatStates.ACEPTADO}  color="#2ABC79" />
              <EstadoBadge label="Pendientes" count={sunatStates.PENDIENTE}  color="#F59E0B" />
              <EstadoBadge label="Enviados"   count={sunatStates.ENVIADO}    color="#458EFF" />
              <EstadoBadge label="Rechazados" count={sunatStates.RECHAZADO}  color="#EF4444" />
              <EstadoBadge label="Anulados"   count={sunatStates.ANULADO}    color="#9CA3AF" />

              {sunat && sunat.sin_comprobante > 0 && (
                <View className="mt-3 p-3 bg-amber-50 rounded-xl flex-row items-center gap-2">
                  <Ionicons name="warning-outline" size={16} color="#F59E0B" />
                  <Text variant="bodySmall" className="text-amber-700 flex-1">
                    {sunat.sin_comprobante} venta{sunat.sin_comprobante !== 1 ? 's' : ''} sin comprobante electrónico
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* ── Comprobantes por tipo ── */}
          {comprobantes && comprobantes.por_tipo.length > 0 && (
            <Card className="p-4">
              <SectionHeader
                title="Comprobantes Emitidos"
                subtitle={`${comprobantes.total_comprobantes} total`}
              />
              {comprobantes.por_tipo.map((item, i) => (
                <View
                  key={item.tipo_comprobante}
                  className={`flex-row items-center justify-between py-2 ${i < comprobantes.por_tipo.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="document-text-outline" size={16} color="#458EFF" />
                    <Text variant="bodySmall">{item.tipo_comprobante}</Text>
                  </View>
                  <View className="items-end">
                    <Text variant="label">{item.cantidad}</Text>
                    <Text variant="caption" color="muted">{formatCurrency(item.monto)}</Text>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* ── Ecommerce ── */}
          {(ventas?.ventas_ecommerce ?? 0) > 0 && (
            <Card className="p-4 flex-row items-center gap-4">
              <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center">
                <Ionicons name="storefront-outline" size={24} color="#458EFF" />
              </View>
              <View className="flex-1">
                <Text variant="caption" color="muted">Ventas desde E-commerce</Text>
                <Text variant="h4">{ventas!.ventas_ecommerce}</Text>
              </View>
            </Card>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
